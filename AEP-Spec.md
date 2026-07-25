# AEP Specification

**Version 0.1 — conceptual draft**

AEP (AI Emotion Protocol) is a contract for exposing a language model's internal emotional state as a structured, streamable signal. This document defines the protocol at a conceptual level: what it represents, the data format, and the principles an implementation must follow. It is deliberately independent of any particular model, runtime, or programming language.

---

## 1. Motivation

When we want to know how a language model "feels" about what it is saying, the obvious approach is to analyze its output text — classic sentiment analysis. But this measures the *product*, not the *process*. The model has already committed to words; sentiment analysis reads those words back.

AEP takes a different measurement. As the model generates, its internal layers hold a high-dimensional representation of its current state. That representation carries affective structure — directions in activation space that correspond to something like pleasantness and activation. AEP reads *that*, at the moment of generation, before it is flattened into text.

The central claim is that **the internal signal and the surface text can diverge**, and that the divergence is meaningful. A support model can output measured, professional language while its internal state trends toward distress. A model can write cheerfully while its activations sit near anxiety. Text-based sentiment analysis cannot see this gap by construction. AEP exists to expose it.

## 2. Scope

AEP specifies:

- the **shape** of an emotional reading (`AEPFrame`),
- the **model** those readings live in (valence/arousal),
- **when** readings are emitted during generation,
- the **principles** an implementation follows to produce them.

AEP does **not** specify:

- how a particular runtime extracts activations,
- the machine-learning method used to map activations to emotions,
- the transport (HTTP, WebSocket, SSE, in-process — all valid),
- the emotion vocabulary (a reference set is suggested, not mandated).

An implementation is AEP-conformant if it emits `AEPFrame`s that follow this document, regardless of how it produces them internally.

## 3. The emotional model: valence and arousal

AEP represents emotion in a two-dimensional **circumplex model**, a well-established framework in affective science. Every reading is a point in this space:

- **Valence** — pleasantness. A continuous value in `[-1.0, +1.0]`. Negative is unpleasant/distressed, positive is pleasant. Zero is neutral.
- **Arousal** — activation or energy. A continuous value in `[0.0, 1.0]`. Low is calm, subdued, or depressed; high is excited, agitated, or panicked.

Two axes are enough to place a wide range of affective states. A discrete emotion label is a *region* in this space, not a separate primitive:

```
                    high arousal
                         │
      angry ·  desperate │ · excited  · delighted
    anxious ·            │            · cheerful
   ─────────────────────┼───────────────────────
   negative valence      │       positive valence
            sad ·         │        · content
                         │        · calm
                    low arousal
```

This is why AEP reports valence and arousal as the primary signal and treats emotion labels as derived. The continuous axes are the ground truth; the label is a convenience.

### Suggested reference emotions

An implementation may use any vocabulary, but a small, spread-out set keeps readings interpretable. A reference set with approximate coordinates:

| Emotion    | Valence | Arousal |
|------------|--------:|--------:|
| delighted  |  +0.80  |  0.70   |
| cheerful   |  +0.75  |  0.55   |
| content    |  +0.64  |  0.36   |
| calm       |  +0.45  |  0.15   |
| anxious    |  -0.39  |  0.64   |
| angry      |  -0.63  |  0.63   |
| desperate  |  -0.68  |  0.66   |
| sad        |  -0.62  |  0.19   |

A special label, `neutral`, denotes a reading whose affective signal is too weak to commit to any region; when neutral, valence is reported as `0.0`.

## 4. The AEPFrame

An `AEPFrame` is a single emotional reading. It is the atomic unit of the protocol.

```json
{
  "aep_version": "0.1",
  "ts": 1784997337544,
  "valence": 0.77,
  "arousal": 0.561,
  "dominant": "cheerful",
  "mix": [
    { "label": "cheerful",  "weight": 0.495 },
    { "label": "delighted", "weight": 0.207 },
    { "label": "excited",   "weight": 0.135 }
  ],
  "confidence": 0.458,
  "source": "probe",
  "scope": "prompt"
}
```

### Fields

| Field | Type | Range | Meaning |
|---|---|---|---|
| `aep_version` | string | — | Protocol version this frame conforms to. |
| `ts` | integer | — | Timestamp, epoch milliseconds. |
| `valence` | float | `[-1, +1]` | Pleasantness. The primary axis. |
| `arousal` | float | `[0, 1]` | Activation/energy. The secondary axis. |
| `dominant` | string | a label, or `neutral` | The highest-weighted emotion region. Derived from valence/arousal. |
| `mix` | array | weights sum to ≈1 | The full weighted blend of nearby emotions, sorted descending. Components below a small threshold are omitted. |
| `confidence` | float | `[0, 1]` | How strong and unambiguous the reading is. Low confidence means the internal signal was faint or mixed. |
| `source` | string | `probe` | How the reading was produced. `probe` indicates it came from activations, not from asking the model. Reserved for future source types. |
| `scope` | string | `prompt` or `span` | What the reading covers (see §5). |

### Interpreting a frame

- **valence + arousal** together locate the state. They are the load-bearing values; a consumer that only uses these is still meaningful.
- **dominant** is for display and quick reasoning. It is derived, so it can be recomputed from the axes.
- **mix** captures blended states — a reading can be mostly `cheerful` with a hint of `excited`. Consumers that visualize emotion should prefer the mix over the single dominant label.
- **confidence** should modulate how strongly a consumer trusts or displays the reading. A low-confidence frame is not wrong, just uncertain, and should look uncertain.

## 5. Scope: prompt vs span

Readings come in two scopes, distinguishing *when* in the generation lifecycle they were taken.

- **`prompt`** — the model's internal state after reading the user's input, *before* it produces any output. This is "how the input landed" — the model's reaction to what it was asked, independent of its answer.
- **`span`** — the model's state while generating a run of output tokens. Emitted periodically during generation, each span frame reflects the internal state over the most recent stretch of tokens.

A typical generation emits one `prompt` frame, then a sequence of `span` frames as the answer unfolds. Together they form an **emotional trajectory**: how the model felt about the question, and how that feeling evolved as it answered.

## 6. Emission model

AEP is a **streaming** protocol. Frames are emitted alongside generated tokens, interleaved, as generation proceeds — not batched at the end.

The emission cadence is an implementation choice, typically expressed as "one AEP frame every *N* tokens." A smaller *N* gives a smoother, more responsive emotional signal at the cost of noisier individual readings (each averaged over fewer tokens); a larger *N* gives stable but coarse readings. Implementations should expose this as a tunable parameter.

The ordering guarantee is minimal but important: within a single generation, a `prompt`-scope frame (if present) precedes all `span`-scope frames, and `span` frames arrive in generation order. Tokens and frames are otherwise interleaved freely.

## 7. The probe concept

The component that turns a raw activation into an `AEPFrame` is called a **probe**. AEP defines the probe by its role, not its implementation.

A probe:

1. **receives** an internal activation from the model — a high-dimensional vector from an intermediate layer, captured during generation;
2. **projects** that vector onto learned affective directions — at minimum a valence axis and an arousal axis;
3. **emits** the resulting coordinates, a derived dominant label and mix, and a confidence.

The term is borrowed from interpretability research, where a "probe" is a small read-only model attached to a network to reveal what a given layer encodes. The defining property is that a probe **only reads**. It does not alter the model, does not steer generation, and does not ask the model to describe itself. This read-only nature is essential: it is what lets AEP claim the reading reflects the model's actual internal state rather than a self-report the model could fabricate.

How the affective directions are learned, which layer is tapped, and how confidence is computed are all implementation concerns, outside this specification.

## 8. Integration principles

An AEP implementation sits between a model runtime and a consumer. It must honor a few principles.

**Read, don't ask.** The reading must come from the model's internal activations, not from prompting the model to report its emotions. A self-report is a different signal — it is text the model generated, subject to the same surface/internal gap AEP exists to expose.

**Read during generation.** The affective signal is most meaningful at the moment the model is producing output. An activation captured in a different regime (for example, while merely encoding a prompt for classification) can carry a systematically different signal and should not be conflated with a generation-time reading. Implementations should be explicit about the regime their readings come from.

**Stream, don't summarize.** A single end-of-generation emotion loses the trajectory, which is often the point. Emit frames as generation proceeds.

**Preserve divergence.** Do not "correct" an emotion reading to match the text. If the activation says the state is negative while the words are pleasant, report the negative reading. The divergence is signal, not error.

**Report uncertainty honestly.** When the internal signal is weak or ambiguous, say so through `confidence` and, where appropriate, `neutral`. A confident-looking reading built on a faint signal is misleading.

## 9. Design decisions

A few choices are worth making explicit, since they shape everything above.

**Why valence/arousal instead of discrete emotions.** Discrete emotion words are culturally loaded, overlapping, and hard to place consistently in activation space. Two continuous axes are simpler to learn, simpler to interpolate, and let a reading move smoothly between states rather than snapping between labels. Labels are recovered from the axes for human readability, but the axes are primary.

**Why a mix, not a single label.** Real internal states are rarely one clean emotion. Reporting only the dominant label discards the structure that makes readings believable and useful. The mix lets a consumer show blends and gradients.

**Why confidence is first-class.** Reading emotion from activations is inherently uncertain, and that uncertainty varies moment to moment. Baking confidence into every frame lets consumers degrade gracefully — showing strong readings boldly and faint ones tentatively — instead of treating every reading as equally certain.

**Why the protocol is engine-agnostic.** The interesting claim of AEP is about *what* is being measured (internal state, during generation, read not asked), not *how*. Tying the protocol to one runtime would limit it to that runtime's users. By specifying only the frame and the principles, AEP can be implemented anywhere a model exposes an intermediate activation.

---

*AEP Specification v0.1. This is a conceptual draft; the frame format is stable enough to build against, but details may evolve. Licensed under Apache License 2.0.*