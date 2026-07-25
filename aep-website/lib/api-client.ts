import { User } from "./auth-context";

export interface AEPFrame {
  aep_version?: string;
  ts?: number;
  valence: number;
  arousal: number;
  dominant: string;
  mix?: Array<{ label: string; weight: number }>;
  confidence?: number;
  source?: string;
  scope?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://aep-api.yakupkahraman.com";

export async function registerApi(email: string, password: string): Promise<RegisterResponse> {
  const firstName = email.split("@")[0] || "User";
  const lastName = "User";

  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.message || data.error || `Registration failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return data as RegisterResponse;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.message || data.error || `Sign in failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return data as LoginResponse;
}

export interface StreamChatOptions {
  prompt: string;
  token: string;
  onToken: (text: string) => void;
  onAEP: (frame: AEPFrame) => void;
  onDone: () => void;
  onError: (errorMsg: string) => void;
  signal?: AbortSignal;
}

export async function streamChat({
  prompt,
  token,
  onToken,
  onAEP,
  onDone,
  onError,
  signal,
}: StreamChatOptions): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/llm/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 400,
        aep_every: 6,
      }),
      signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.message || errData.error || `Stream failed with status ${res.status}`;
      onError(msg);
      return;
    }

    if (!res.body) {
      onError("No response stream body returned");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finished = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by double newline "\n\n"
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        if (!part.trim()) continue;
        const lines = part.split("\n");
        const dataLine = lines.find((l) => l.startsWith("data: "));
        if (!dataLine) continue;

        try {
          const jsonStr = dataLine.slice(6);
          const ev = JSON.parse(jsonStr);

          if (ev.type === "token" && typeof ev.text === "string") {
            onToken(ev.text);
          } else if (ev.type === "aep" && ev.frame) {
            onAEP(ev.frame as AEPFrame);
          } else if (ev.type === "done") {
            finished = true;
            onDone();
            return;
          } else if (ev.type === "error") {
            onError(ev.message || "An error occurred during streaming");
          }
        } catch (parseErr) {
          console.error("Failed to parse SSE JSON frame", parseErr, part);
        }
      }
    }

    if (!finished) {
      onDone();
    }
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.log("Stream generation aborted by user");
      return;
    }
    onError(err.message || "Network error during streaming");
  }
}
