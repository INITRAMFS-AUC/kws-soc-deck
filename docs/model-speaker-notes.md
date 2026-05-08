# Model Section · Speaker Notes

Slides **10 → 16** of the deck. Mirrors the `notes` field of each entry in
`src/content.js` — if the slides drift, this file is regenerated, not edited
by hand.

Slide ordering and labels match the deployed deck (`src/slides/index.js`).

---

## Slide 10 · Standard MFCC vs Mel Compact

Eight-phase walk on one slide. The whole architecture story lives here — each
press of → advances a phase. Take it slowly; the packet animation does most
of the work for you on the early phases.

**P0 — Industry baseline.** Three boxes: Input (raw PCM, 8 000 samples at
8 kHz), MFCC pipeline (six rows: Frame + Hamming, FFT 512-pt, Power spectrum,
Mel filterbank, log compression, DCT-II), and DS-CNN body. The dark "packet"
walks through each step in turn so the audience sees the dataflow, not just
the boxes. This is Zhang et al.'s *Hello Edge* pipeline (arXiv:1711.07128,
2017) — MFCC at ~1.6 M ops feeding a depthwise-separable 2-D CNN at ~5.4 M
MACs. ~7 M total system ops. Reference number on Speech Commands: 94.4 %
(DS-CNN-S).

**P1 — Side by side.** Both stacks reduced to big-number summary cards.
Standard approach: ~7 M ops total, two stages, MFCC + DS-CNN. Our approach
(Mel Compact): 0.97 M MACs total, unified Conv1D pipeline. The point of the
slide: roughly an order of magnitude less compute, one acceleratable op
throughout.

**P2 — Our model takes over.** Three component cards: Front-end · Body ·
Head. Each card carries its share of the MAC budget (~516 K · 53 % / ~451 K
· 47 % / ~656 · <0.1 %). Structural overview before we zoom into each one.

**P3 — Front-end zoom.** The Conv1D mel front-end rendered as 16
sinc-bandpass kernel waveforms, plus the sliding window viz: 8 000 samples
in, 496 frames out, 124 after 4× pool. K=65, stride 16, 1 056 params.
~516 K MACs — 53 % of the total. **This is the layer the accelerator
targets.**

**P4 — Back to the three-component overview.** Brief re-orient before the
next zoom.

**P5 — Body zoom.** Three plain Conv1D blocks (NOT depthwise-separable —
deliberately simpler than DS-CNN). 36 channels each, K=3, BN + ReLU +
MaxPool. Output shapes 31×36 → 15×36 → 15×36. Pool 4× then 2× then ×1
(block 3 is two stacked convs, no pool). ~451 K MACs.

**P6 — Back to overview.** Same re-orient beat.

**P7 — Head zoom.** GAP collapses the time axis (15×36 → 36). Dense 16
with ReLU + dropout p=0.3 (L2 = 1e-4). Softmax to 11 classes: *yes, no, up,
down, left, right, on, off, stop, go, _unknown_*. Argmax → keyword. Whole
head is ~16 K params total but only ~656 MACs (<0.1 %).

**Bridge to next slide:** with our model defined, time to place it against
the literature. Closest related work — sinc-based and raw-waveform
classifiers — is next.

---

## Slide 11 · vs Literature (sinc / raw-waveform papers)

Bridge slide — big numbers on screen, prose in the talk. Don't re-read the
cards; explain what each paper does and what we change.

The standard-KWS comparison (DS-CNN, MobileNet on log-mel spectrograms) is
already covered by the previous slide. Here we narrow in on the
**learnable-front-end family on raw audio** — three closely related papers,
then ours.

**SincNet (Ravanelli & Bengio, 2018).** Sinc bandpass filters as the first
conv layer — only two learnable cutoffs per filter. Built for speaker ID,
runs at full waveform resolution and pools downstream. ~22 M total
parameters in the standard config. Float throughout, no stride fusion, no
INT8 deployment story. Same idea as us at the front-end, very different
deployment target.

**LEAF (Zeghidour et al., Google, 2021).** Gabor filters with learnable
centre and bandwidth, plus a fully learnable per-channel pooling layer
(PCEN-style). Aimed at general audio understanding. ~80 K front-end
parameters alone. Heavier compute and float-only — the learnable pooling is
not cleanly INT8-quantisable, which kills it for our chip.

**M5 / M11 (Dai et al., 2017).** Pure 1D conv stack on raw audio — no fixed
front-end at all, the model learns the whole thing from scratch. K=80
first-layer kernels, 5–11 conv blocks. ~558 K parameters for M5, ~1.79 M
for M11. No INT8 deployment story. We give the same family a strong
inductive bias (sinc init) and end up two orders of magnitude smaller.

**Ours (the orange strip at the bottom).** Stride 16 fused into the sinc
kernel — one op gives both the bandpass *and* the 16× downsample, hence the
"16× compute saving up front" claim. Plain MaxPool, plain BN,
NNoM-quantisable INT8 end-to-end. ~16 K total parameters — ~35× smaller
than M5, three orders of magnitude smaller than SincNet. Built for a 36 MHz
RV32IMAC.

**Bridge to next slide:** enough qualitative comparison. Next: how we score
against the general KWS leaderboard quantitatively — accuracy, params, MACs.

---

## Slide 12 · vs Other Models (leaderboard)

Mel Compact at **93.5 % float on Google Speech Commands**, at a fraction of
the params and MACs of the published baselines. Bars animate on entry,
staggered top-down (140 ms per row, +60 ms between columns within a row) —
let the animation finish before you start talking, the eye reads it
left-to-right.

The leaderboard, in descending accuracy:

- **MatchboxNet** · Majumdar 2020 — 97.5 % · ~140 K params · 7.4 M MACs
- **TC-ResNet8** · Choi 2019 — 96.6 % · ~66 K params · 6.0 M MACs
- **DS-CNN small** · Zhang 2018 — 94.4 % · ~38 K params · 5.4 M MACs
- ★ **Mel Compact · ours** — **93.5 %** · ~16 K params · 0.97 M MACs (float baseline on GSC)

The accent divider between DS-CNN and us is deliberate: **DS-CNN is the
anchor**. We sit immediately under it, 0.9 pts behind, with 2.4× fewer
parameters and 5.6× fewer MACs. That is the headline — sub-one-point
accuracy delta for half the model and a fifth of the compute.

Banbury *TinyConv* 2021 was previously here at 87.6 % but was removed; it
sat far below the cluster and the comparison read as "we beat the smallest
one" instead of the more honest "we land just under the strongest small
model."

**Callouts on the slide:**

- vs MatchboxNet — 8.8× fewer params, 7.6× fewer MACs, **−4.0 pts** accuracy
- vs DS-CNN — 2.4× fewer params, 5.6× fewer MACs, **−0.9 pts** accuracy
- Footprint — ~16 K params · 0.97 M MACs · runs on a 36 MHz RV32IMAC

**Bridge to next slide:** 93.5 % is FLOAT on GSC. Everything past this
slide is int8 on our chip, and the question is what runtime executes that
int8. Next: NNoM.

---

## Slide 13 · Why NNoM

NNoM stands for **Neural Network on Microcontroller** — a lightweight,
high-level inference library for MCUs. We hand it a trained Keras model,
one Python call (`nnom_generate_model`) emits a single `weights.h`, and we
link that straight into `kws_nnom_main.c`. Same source compiles for the
host harness and for the SoC firmware — bit-identical inference both
places.

The slide answers one question: of all the embedded inference runtimes out
there, why this one for our chip? Three properties matter, one per card.

**INT8 only.** Hazard3 has no FPU. Every float op would be a soft-float
helper call into libgcc — large, slow, hard to reason about cycle-wise.
NNoM does everything in int8 weights, int8 activations, int32 accumulators,
and constrains the requantization scale per layer to a power of two. So
requantize collapses to a single arithmetic shift instead of an idiv. No
FPU, no soft-float, no surprise division latency. *(NNoM can also
accelerate on top of ARM CMSIS-NN for Cortex-M cores. We are RISC-V so we
don't use that path, but it is part of the runtime's reputation.)*

**Ping-pong buffer.** This is the property that lets NNoM live in 64 KB.
At codegen time NNoM analyses the network, finds the largest activation
pair, and allocates exactly **two** static buffers sized for that worst
case. Every layer reads from one and writes the other, then swaps. No
malloc, no C runtime, no tensor-arena to grow at runtime. What the linker
reports is exactly what runs — no surprise OOM mid-inference, no
fragmentation. Weights live in XIP flash and are streamed by the cache
prefetcher (covered later).

**Codegen, not interpret.** NNoM does not parse a model file at boot. The
model topology is baked into C at build time, so there is zero interpreter
overhead at runtime and timing is deterministic. NNoM also natively
supports more complex topologies — Inception, ResNet, DenseNet, RNN / GRU /
LSTM — which we don't use for our plain Conv1D Mel Compact, but means the
runtime is not the constraint if the model ever grows.

**Why NNoM and not CMSIS-NN, TFLite-Micro, X-CUBE-AI?** Open source. Small
enough that we could read every line. No Cortex-M dependencies (we are
RISC-V). And we needed to patch the cache prefetcher to know about NNoM's
exact weight layout — not something a closed runtime would let us do.

**Bridge to next slide:** NNoM gives us the runtime. But the model is only
as good as the data it trains on — and Google Speech Commands alone is
studio audio. Next: the dataset we recorded ourselves on the real mic.

---

## Slide 14 · Our Dataset (4 000 samples on the real mic)

NNoM gives us the runtime. The model that runs on it is only as good as the
data it trained on — and Google Speech Commands alone is studio audio:
clean headset mic, controlled levels, near-field, no ambient noise. Real
deployment is none of those. So we recorded our own.

**4 000 samples on the INMP441 we ship** — same mic, same PCB, same analog
path the firmware reads from. Whatever distortion, noise floor, or DC bias
that path adds, the model already sees in training and learns to live with.

We diversified on three axes deliberately, one per card on screen.

**Different people.** Multiple speakers, different voices, accents, ages,
distances from the mic. No single-speaker overfit; the model has to handle
the next person walking up to the mic, not just whoever recorded most of
the corpus.

**Different environments.** Quiet rooms, noisy rooms, near-field, far-field.
The acoustics in training span the conditions the model will hear in the
field. We weren't trying to be exhaustive, just diverse enough that no
specific room is the dominant signal.

**Same hardware path.** Every sample comes through the deployed INMP441 and
PCB, not a high-quality reference mic. Whatever the analog path adds is
already in training, not a surprise on deployment.

**Note for the audience:** we are not quantifying the diversity. No "10
speakers, 5 rooms" claim on the slide. The point is the principle, not the
count — without diverse training data, the int8 model that NNoM runs can't
generalize past the conditions it saw, and on-device accuracy collapses.
The Data Gap slide later shows what that collapse looks like when we
deliberately skip the diverse-data step.

**Bridge to next slide:** this richer dataset is what we calibrate the int8
quantization on. Post-training quantization, KL-divergence calibrated — no
QAT, no fine-tune — is next.

---

## Slide 15 · Quantization (PTQ · KL-divergence)

Post-training quantization, KL-divergence calibrated. **11 classes** — same
Mel Compact head we just walked through. No QAT, no fine-tune. Train
float32, calibrate on a held-out batch of 1 024 samples drawn from the
dataset on the previous slide, ship int8.

**Five-step pipeline (left of the slide), in order:**

1. Train the float32 model in Keras.
2. Collect activation histograms on calibration samples.
3. For each tensor, **KL-divergence threshold search** — sweep candidate
   clip thresholds and pick the one that minimises *D_KL* between the
   float histogram and the int8 requantised histogram.
4. Per-tensor int8 quantization with power-of-2 scales, BN folded into the
   preceding conv, bias kept int32.
5. Emit `weights.h` via `nnom_generate_model` and link it into firmware.

**The why-KLD callout:** min-max calibration is the naive baseline — pick
min and max as the int8 endpoints. One fat outlier collapses the dynamic
range for everyone else. KLD finds the threshold that preserves the SHAPE
of the distribution and accepts saturation on the tail, which is the right
trade for activation distributions that are roughly bell-shaped.

**GSC test top-1 numbers (the bars on the right):**

| Calibration         | GSC top-1 |
| ------------------- | --------- |
| float32 baseline    | **93.5 %** |
| int8 min-max (naive) | 84.0 %    |
| int8 KLD (we ship)   | **90.0 %** |

KLD recovers ~6 pts over naive min-max for free — no retraining, no
fine-tune, just a better calibration heuristic. **Net float→int8 drop is
3.5 pts.** That is the price of running on int8 silicon with no FP unit.

The takeaway box at the bottom-right makes that explicit: 3.5 pts is the
cost of int8 on a no-FP chip, and KLD pays for ~6 of the pts that a naive
quantizer would have lost.

**Bridge to next slide:** 90 % int8 KLD is what the model scores on GSC.
The next slide is what happens when we run that same int8 model on a real
INMP441.

---

## Slide 16 · Data Gap (INMP441 transfer + frequency response)

Three-phase reveal — each press of → advances a phase. **Every accuracy on
this slide is INT8** (the deployed model). Bar labels say *"GSC int8"* /
*"INMP441 int8"* explicitly so the audience never confuses these with the
float baseline on the leaderboard slide.

### P0 (default view) — just the top two before/after panels, BIG

Bars animate left→right on slide entry, staggered by ~180 ms.

- **Before** panel: GSC int8 = 90 %, **INMP441 int8 = 62 %**. The deployed
  int8 model loses 28 pts when we drop it onto a real INMP441 —
  distribution shift the model never saw on GSC.
- **After** panel: GSC int8 = 90 %, INMP441 int8 = 90 %. Same int8 weights,
  just calibrated to the new audio source. Zero degradation between
  domains.

### P1 (press →) — top panels shrink; two fix specimen cards fade in

The top panels transition smoothly down to a compact size to make room.

- **Fix 01 — peak normalization.** Divide every waveform by its peak
  absolute value before training and on device. Removes microphone gain
  variation. Free — no extra params, no extra ops. Implementation is one
  line: `x ← x / max(|x|)`.
- **Fix 02 — domain fine-tuning.** Record ~50 utterances per class with
  the INMP441 through our own PCB, mix 10 % into the training set, three
  fine-tune epochs on the blended corpus. Int8 accuracy recovers to the
  GSC baseline of 90 %.

### P2 (press → again) — fix cards cross-fade out, frequency-response box takes their place

The right side of that box shows the actual measured INMP441 frequency-
response curve from the datasheet — flat to **±2 dB across the speech
band**, well past our 4 kHz Nyquist.

The point of P2: the deeper reason the gap closes so cleanly is **hardware
choice**. The INMP441 is well-behaved across our 8 kHz operating band —
there is no spectral distortion to fix. What the two fixes above actually
patch is a **level shift** (gain mismatch between corpora), not a
frequency-dependent one. The mic isn't doing anything weird to the
spectrum, so peak-norm + a tiny fine-tune is enough.

**Bridge to next section:** the model side is done. Same int8 weights,
same NNoM runtime, working on real audio at 90 %. The remaining slides are
about the firmware, the accelerator, and the cache that keep this running
at 30 ms inference on a 36 MHz core.

---

*Generated from `src/content.js` notes blocks for the seven model-section
entries (`standard-mfcc`, `lit-comparison`, `vs-models`, `why-nnom`,
`our-data`, `quantization`, `data-gap`). If you change either, regenerate
this file from content.js — content.js is the source of truth.*
