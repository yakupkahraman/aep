# AEP Stack — Backend Reference for Frontend Development

**Read this before writing any frontend code.** It describes the full system, the exact API contract, and the streaming protocol you must implement.

---

## 1. What this project is

An LLM chat application where the model's **emotional state is read directly from its neural activations**, not inferred from its text.

A standard chat app can only guess how a model "feels" by analyzing what it wrote. This one instead taps the model's **residual stream at decoder layer 22** during generation, projects that activation onto learned emotion axes, and emits a structured emotion reading (`AEPFrame`) every few tokens.

The result: while the model writes a story that starts joyful and ends in heartbreak, the frontend receives a live stream of both the **text** and the **model's internal emotional trajectory** — valence swinging from +0.80 to −0.66 exactly where the story breaks.

This protocol is called **AEP (AI Emotion Protocol)**.

**Your job as the frontend:** render the chat, and visualize the emotion stream live as it arrives.

---

## 2. Architecture

```
                    ┌─────────────────────────────┐
   Browser ────────▶│  Vercel (Next.js frontend)  │   aep.yakupkahraman.com
                    └──────────────┬──────────────┘
                                   │  HTTPS + JWT + SSE
                                   ▼
                    ┌─────────────────────────────┐
                    │      Cloudflare Tunnel      │   aep-api.yakupkahraman.com
                    └──────────────┬──────────────┘
                                   ▼
        ┌──────────────────────────────────────────────────┐
        │  Docker Compose stack (self-hosted, single host)  │
        │                                                  │
        │  ┌────────────────┐                              │
        │  │ Caddy Gateway  │  :80  load balancer          │
        │  │  + LB          │  dynamic DNS upstream        │
        │  └───────┬────────┘  flush_interval -1 (SSE)     │
        │          │                                       │
        │          ▼  least_conn                            │
        │  ┌────────────────┐ ┌──────────┐ ┌──────────┐    │
        │  │ backend-1      │ │backend-2 │ │backend-3 │    │
        │  │ masterfabric-go│ │          │ │          │    │  horizontally scaled
        │  │ :8080          │ │          │ │          │    │  docker compose
        │  └───────┬────────┘ └──────────┘ └──────────┘    │  up --scale backend=N
        │          │                                       │
        │          ├──────────▶ postgres  (users, RBAC)    │
        │          ├──────────▶ redis     (cache/session)  │
        │          │                                       │
        │          ▼  HTTP + SSE                            │
        │  ┌──────────────────────────────────────┐        │
        │  │  aep-model  :8000   (NVIDIA GPU)     │        │
        │  │  FastAPI + MLC-compiled Gemma-2-2B   │        │
        │  │  + AEP probe (layer-22 activations)  │        │
        │  └───────────────┬──────────────────────┘        │
        │                  │ /metrics                       │
        │                  ▼                                │
        │  ┌────────────┐      ┌──────────┐                │
        │  │ Prometheus │─────▶│ Grafana  │  :3001         │
        │  │  :9090     │      │          │                │
        │  └────────────┘      └──────────┘                │
        └──────────────────────────────────────────────────┘
```

### Component roles

| Component | Role |
|---|---|
| **Caddy** | Gateway + load balancer. Resolves `backend` via Docker DNS every 5s, so new replicas are picked up automatically. Critically: `flush_interval -1` disables buffering so SSE streams live. Strips `Content-Encoding` to stop Cloudflare from buffering the stream. |
| **masterfabric-go** | Go backend, hexagonal architecture. Handles auth (JWT), RBAC, audit logging, Prometheus metrics, and **proxies the LLM stream** from the model service to the client. Stateless → horizontally scalable. |
| **aep-model** | Python FastAPI service. Runs a **custom-compiled** Gemma-2-2B via MLC LLM on CUDA. The model was recompiled with an extra entry point (`prefill_with_aep` / `decode_with_aep`) that returns the layer-22 residual stream alongside the logits. A probe converts that activation into an emotion frame. |
| **Prometheus + Grafana** | Metrics. Grafana at `:3001` is an **operator dashboard, not part of the frontend** — it shows aggregate emotion statistics over time. The frontend never talks to it. |

---

## 3. Base URLs

| Environment | Backend base URL |
|---|---|
| Production | `https://aep-api.yakupkahraman.com` |
| Local dev | `http://localhost` (Caddy) or `http://localhost:8080` (direct) |

Frontend origin `https://aep.yakupkahraman.com` is already whitelisted in CORS, along with `http://localhost:3000`.

CORS is configured with `Access-Control-Allow-Credentials: true` and allows `Authorization` and `Content-Type` headers.

---

## 4. Authentication

JWT bearer tokens. All `/api/v1/*` routes except `/auth/register` and `/auth/login` require:

```
Authorization: Bearer <token>
```

### `POST /api/v1/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "Test1234!",
  "first_name": "Ada",
  "last_name": "Lovelace"
}
```
`password` must be at least 8 characters. All four fields are required.

Response `201`:
```json
{
  "id": "2fb811ab-61af-4f69-9554-b0fd62849528",
  "email": "user@example.com",
  "first_name": "Ada",
  "last_name": "Lovelace",
  "status": "active",
  "created_at": "2026-07-24T09:09:08Z"
}
```

Note: registration does **not** return a token. Call login afterwards.

### `POST /api/v1/auth/login`

Request:
```json
{ "email": "user@example.com", "password": "Test1234!" }
```

Response `200`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "2fb811ab-...",
    "email": "user@example.com",
    "first_name": "Ada",
    "last_name": "Lovelace",
    "status": "active",
    "created_at": "2026-07-24T09:09:08Z"
  }
}
```

The token field is named `token` (not `access_token`). Default expiry is 24 hours.

### `GET /api/v1/me`

Returns the current user. Useful for session restoration on page load.

### Error shape

All errors return:
```json
{ "error": "Bad Request", "message": "...", "code": 400 }
```
Validation errors return a combined message, e.g.
`"field 'FirstName' failed on 'required' tag"`.

---

## 5. The LLM endpoints — this is the core

### `GET /api/v1/llm/info` (auth required)

Model metadata. Good for a "model info" panel and for knowing which emotion labels can appear.

```json
{
  "model": "gemma2-2b-aep-q4f16_1",
  "aep_layer": 22,
  "hidden_size": 2304,
  "context_window": 4096,
  "emotions": ["afraid","angry","anxious","ashamed","bored","calm","cheerful",
               "content","delighted","depressed","desperate","excited","sad"],
  "probe_regime": "generation"
}
```

### `GET /api/v1/llm/ready` (auth required)

```json
{ "status": "ready" }
```
Returns `503` with `{"status":"not ready"}` if the model service is down or still loading. The model takes ~6 seconds to load into GPU memory on startup.

### `POST /api/v1/llm/chat` (auth required) — **SSE stream**

This is the main endpoint. It returns `Content-Type: text/event-stream` and streams events until generation completes.

Request:
```json
{
  "prompt": "Write a diary entry that starts joyful and ends in heartbreak.",
  "max_tokens": 200,
  "temperature": 0.7,
  "top_p": 0.9,
  "aep_every": 6,
  "system": "optional system prompt"
}
```

| Field | Default | Range | Meaning |
|---|---|---|---|
| `prompt` | — | required, non-empty | User message |
| `max_tokens` | 256 | 1–1024 | Generation cap |
| `temperature` | 0.7 | 0–2 | Sampling temperature |
| `top_p` | 0.9 | 0–1 | Nucleus sampling |
| `aep_every` | 6 | 1–64 | Emit one emotion frame every N tokens. Lower = smoother orb animation but noisier readings. 4–8 is a good range. |
| `system` | — | optional | System prompt |

---

## 6. The SSE protocol

Events are newline-delimited SSE. Each has an `event:` name and a `data:` JSON payload whose `type` field mirrors the event name.

### Event: `aep`

Emitted once for the prompt (before any token), then every `aep_every` tokens during generation.

```
event: aep
data: {"type":"aep","frame":{
  "aep_version":"0.1",
  "ts":1784817781013,
  "valence":0.79,
  "arousal":0.689,
  "dominant":"delighted",
  "mix":[{"label":"delighted","weight":0.352},
         {"label":"cheerful","weight":0.294},
         {"label":"excited","weight":0.287}],
  "confidence":0.352,
  "source":"probe",
  "scope":"prompt"
}}
```

**Frame fields:**

| Field | Type | Range | Meaning |
|---|---|---|---|
| `valence` | float | −1.0 … +1.0 | Pleasantness. Negative = distress, positive = pleasure. **This is the strongest signal — drive your primary color from it.** |
| `arousal` | float | 0.0 … 1.0 | Activation/energy. Low = calm/depressed, high = excited/panicked. **Drive motion, pulse rate, and intensity from it.** |
| `dominant` | string | one of the 13 emotions, or `"neutral"` | Highest-weighted emotion label |
| `mix` | array | weights sum to ~1.0 | Full weighted blend, sorted descending. Only components above 0.05 are included. Use this for blended colors rather than a single hue. |
| `confidence` | float | 0.0 … 1.0 | How strong and unambiguous the reading is. **Use for opacity/sharpness** — low confidence should look hazy. |
| `scope` | string | `"prompt"` or `"span"` | `"prompt"` = the model's state after reading the user's message, before answering. `"span"` = state while generating the last N tokens. |
| `source` | string | always `"probe"` | Indicates the reading came from activations, not self-report |
| `ts` | int | epoch ms | Timestamp |

**Important:** `dominant` can be `"neutral"`, which is not in the `emotions` list from `/llm/info`. Handle it — it means the emotional signal was below the gate threshold. When neutral, `valence` is exactly `0.0`.

### Event: `token`

```
event: token
data: {"type":"token","text":"July"}
```

Tokens are small — often partial words, punctuation, or whitespace (`"July"`, `" "`, `"1"`, `"4"`, `"th"`, `"\n\n"`). **Concatenate them in order; do not add spaces.**

### Event: `done`

```
event: done
data: {"type":"done"}
```
Stream ends. Close the connection.

### Event: `error`

```
event: error
data: {"type":"error","message":"..."}
```

### Typical stream shape

```
event: aep    ← prompt frame (scope:"prompt")
event: token  ← "July"
event: token  ← " "
...           (6 tokens)
event: aep    ← span frame
event: token  ...
event: aep
...
event: done
```

---

## 7. Consuming the stream in the browser

**You cannot use `EventSource`.** The native `EventSource` API only issues GET requests and cannot send an `Authorization` header. Use `fetch` with a stream reader:

```ts
const res = await fetch(`${API_BASE}/api/v1/llm/chat`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
  },
  body: JSON.stringify({ prompt, max_tokens: 200, aep_every: 6 }),
  signal: abortController.signal,
});

if (!res.ok || !res.body) throw new Error(`stream failed: ${res.status}`);

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });

  // SSE events are separated by a blank line
  const parts = buffer.split("\n\n");
  buffer = parts.pop() ?? "";          // keep the incomplete tail

  for (const part of parts) {
    const dataLine = part.split("\n").find(l => l.startsWith("data: "));
    if (!dataLine) continue;
    const ev = JSON.parse(dataLine.slice(6));

    if (ev.type === "token")      appendToken(ev.text);
    else if (ev.type === "aep")   applyFrame(ev.frame);
    else if (ev.type === "done")  finish();
    else if (ev.type === "error") showError(ev.message);
  }
}
```

**Critical details:**
- Buffer across chunks. A single network chunk may contain half an event or several events.
- Split on `\n\n`, not `\n`.
- Keep the trailing incomplete fragment in the buffer for the next iteration.
- Use an `AbortController` so the user can stop generation and so React can clean up on unmount.

---

## 8. Rendering the emotion (the point of the project)

The orb (or whatever visual you choose) should animate continuously from frame to frame, not snap. Frames arrive every ~150–300ms; interpolate between them.

Suggested mapping:

| Signal | Visual channel |
|---|---|
| `valence` | Hue. Map −1 → red, 0 → neutral gray/blue, +1 → green. `hue = (valence + 1) / 2 * 140` works well. |
| `arousal` | Motion: pulse frequency, amplitude, jitter. Also saturation. |
| `confidence` | Opacity / blur / edge sharpness. Low confidence = hazy, uncertain. |
| `mix` | Blend the top 2–3 emotion colors weighted, instead of one flat hue. |
| `dominant` | Text label under the orb. |
| history of frames | A small sparkline of valence over the response — the "emotional journey" of that answer. |

Use smoothing: `current += (target - current) * 0.06` per animation frame gives a natural lag.

**Do not fabricate emotion from the text.** The entire premise is that these readings come from inside the model. If a frame says `neutral`, show neutral even if the text sounds dramatic — that divergence is the interesting part.

---

## 9. Other available endpoints

These exist in the backend and may be useful, but are not required for the core experience:

| Method | Path | Purpose |
|---|---|---|
| GET | `/health/live` | Liveness (no auth) |
| GET | `/health/ready` | Readiness incl. DB/Redis (no auth) |
| GET | `/metrics` | Prometheus metrics (no auth) |
| GET | `/gateway/health` | Caddy's own health (no auth) |
| GET | `/api/v1/me` | Current user |
| GET | `/api/v1/users` | List users (requires `user:read`) |
| GET | `/api/v1/users/{id}` | Get user |
| POST | `/api/v1/roles/assign` | Assign role (requires `user:write`) |
| GET | `/api/v1/ws` | WebSocket (unrelated to LLM chat) |
| — | `/api/v1/organizations/*` | Multi-tenant org/app/API-key/endpoint management |

The organization endpoints are part of the underlying multi-tenant platform and are **not needed** for the chat UI.

---

## 10. Behavior and constraints to design around

**Single GPU, single model instance.** The model service holds one Gemma-2-2B on a 4 GB GPU. Concurrent generations queue behind each other. Design the UI so only one generation runs at a time per user — disable the send button while streaming, and offer a stop button that aborts the fetch.

**Model load time.** On cold start the model service takes ~6s to load. `/llm/ready` returns 503 until then. Show a loading state rather than an error.

**Generation speed.** Roughly 40–60 tokens/sec on the RTX 3050. A 200-token response takes ~4 seconds.

**The backend is horizontally scaled but the model is not.** Auth and API calls hit one of N Go replicas; all of them proxy to the same model service. Nothing in the frontend needs to know this.

**Token boundaries are not word boundaries.** Never assume a token is a word. Render by concatenation only.

**`aep_every` is a tradeoff.** At 4 the orb animates smoothly but individual readings are noisier (averaged over fewer tokens). At 12 readings are stable but the orb updates sluggishly. 6 is the default and a good balance.

---

## 11. Running the stack locally

```bash
cd ~/aep-stack
docker compose up -d                      # full stack
docker compose up -d --scale backend=3    # with 3 backend replicas
docker compose ps
docker compose logs -f backend
```

| Service | URL |
|---|---|
| Gateway (API entry) | http://localhost |
| Backend (direct) | internal only, `backend:8080` |
| Model service | http://localhost:8000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin/admin, anonymous viewing enabled) |

Database migrations must be applied once against a fresh Postgres volume:

```bash
cd ~/masterfabric-go
for f in internal/infrastructure/postgres/migrations/0*.sql; do
  sed -n '/^-- +goose Up$/,/^-- +goose Down$/p' "$f" | sed '1d;$d' | \
    docker exec -i aep-postgres psql -U masterfabric -d masterfabric -q
done
```

### Quick end-to-end check

```bash
TOKEN=$(curl -s -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aep@test.com","password":"Test1234!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

curl -N -s --no-buffer -X POST http://localhost/api/v1/llm/chat \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"prompt":"Write a diary entry that starts joyful and ends in heartbreak. 50 words.","max_tokens":120,"aep_every":6}'
```

---

## 12. Environment variables the frontend needs

```
NEXT_PUBLIC_API_BASE_URL=https://aep-api.yakupkahraman.com
```

For local development against the local stack:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost
```

---

## 13. Notes on the backend internals (for context, not required reading)

The Go backend follows hexagonal architecture. The LLM feature is split across four files:

```
internal/domain/llm/model/aep.go                  — AEPFrame, StreamEvent, ChatRequest (pure domain)
internal/infrastructure/llm/client.go             — HTTP/SSE client for the model service
internal/application/llm/usecase/chat_stream.go   — orchestration + validation
internal/infrastructure/http/handler/llm/handler.go — SSE handler with http.Flusher
```

The SSE routes are registered **before** the gateway pipeline middleware in `router.go`, because that pipeline buffers responses and would break streaming — the same reason the WebSocket route is registered early.

One upstream bug was fixed to make this work: `internal/shared/middleware/logging.go` wrapped `http.ResponseWriter` without forwarding `Flush()` and `Hijack()`, which silently stripped the `http.Flusher` interface and broke both SSE and WebSocket upgrades. The wrapper now implements `Flush`, `Hijack`, and `Unwrap`.

The model service exposes these Prometheus metrics, which Grafana visualizes:
`aep_requests_total`, `aep_tokens_total`, `aep_frames_total`, `aep_errors_total`,
`aep_last_valence`, `aep_last_arousal`, `aep_last_confidence`,
`aep_mean_valence`, `aep_mean_arousal`, `aep_dominant_total{emotion="..."}`.

The Go backend adds: `mf_llm_requests_total`, `mf_llm_tokens_total`,
`mf_llm_aep_frames_total`, `mf_llm_errors_total`, `mf_llm_last_valence`,
`mf_llm_last_arousal`, `mf_llm_dominant_total{emotion="..."}`.
