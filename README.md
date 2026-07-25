# AEP — AI Emotion Protocol

**A protocol for exposing a language model's internal emotional state, read directly from its neural activations rather than inferred from its text.**

---

Sentiment analysis reads what a model *wrote* and guesses how it "feels." AEP reads the model's *internal representation* — the activation in an intermediate layer of the network, while it generates — and projects it onto interpretable emotion axes.

The two can disagree. A model can produce calm, clinical prose while its internal state trends negative and agitated; it can write an upbeat sentence while its activations sit closer to anxiety. That gap — between the surface text and the internal signal — is the thing AEP makes visible.

AEP defines a small, engine-agnostic contract: a stream of **emotion frames** (`AEPFrame`) emitted alongside generated tokens, each carrying a valence/arousal reading, a dominant emotion, a weighted mix, and a confidence. Any model runtime that can expose an intermediate activation can implement it.

## What's in this repository

- **[`AEP-Spec.md`](./AEP-Spec.md)** — the protocol specification. What AEP is, the `AEPFrame` format, the valence/arousal model, the probe concept, and the principles for integrating it into a model runtime. Engine-agnostic and conceptual.
- **[`aep-website/`](./aep-website/)** — a small Next.js site that introduces the protocol, with a live particle visualization that reacts to emotion values. This is a showcase, not a reference implementation of the protocol itself.

## The core idea in one picture

```
   generated text:   "I understand. Let me help you with that."
                                    │
   what sentiment analysis sees:    │  → "neutral / positive"
                                    │
   what AEP reads (layer activation, same moment):
                                    │  → valence -0.4, arousal 0.6  (anxious)
```

AEP is the second reading — taken from inside the model, not from its output.

## Status

AEP is a working protocol with a reference implementation (probe + model service + streaming backend) that is not part of this repository. This repo hosts the **specification** and a **public showcase**. The spec is stable enough to build against; details may evolve.

## License

Licensed under the [Apache License 2.0](./LICENSE).

## Author

Yakup Kahraman — [github.com/yakupkahraman](https://github.com/yakupkahraman)