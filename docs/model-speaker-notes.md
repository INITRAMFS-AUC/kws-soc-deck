# Model Section · Speaker Notes & Backup Detail

Slides 11 → 20 of the deck. Each entry contains the on-screen content, the
script to deliver, and **deep detail** to keep here when content gets pulled
off the slide later. When you trim a slide, lift the trimmed material into the
"Deep detail" or "If asked" sections below — nothing should be lost.

Numbers are normative — if a slide ever drifts, this file is the source of
truth and the slide is wrong.

---

## Slide 11 — Standard MFCC Pipeline (industry baseline)

**topLeft:** `11 · Model` · file: `src/slides/StandardMFCC.jsx`

### What's on screen
A 3-panel pipeline: `Raw PCM` → `Stage 1: MFCC` → `Stage 2: DS-CNN`. Six MFCC
steps with their op counts. Three framing cards beneath. Citation footer to
Zhang et al., 2017.

### Script (≈ 60–75 s)
> "Before I tell you what *we* did, here is what almost everyone else does on
> Google Speech Commands — including the paper most embedded-KWS work cites,
> *Hello Edge* by Zhang et al. in 2017."
>
> "The standard pipeline is two stages. Stage one is a fixed front-end called
> MFCC — Mel-frequency cepstral coefficients. You take a 1-second audio
> window, slice it into 25-millisecond frames every 10 milliseconds, run an
> FFT on each frame, take the power spectrum, project that onto a 40-band
> Mel filterbank, take a log, and finally a discrete cosine transform. That
> gives you a 100-by-40 feature matrix per second. Stage two is a small
> convolutional network — DS-CNN-S — that consumes those features and
> classifies the keyword."
>
> "Add up the front-end work: about 1.6 million ops per inference. The
> network on top is around 5.4 million MACs. Together, ~7 million ops per
> second of audio. The network number is what gets reported in the paper.
> The 1.6 million for MFCC is preprocessing — usually counted separately or
> not at all."
>
> "This is a *good* design. MFCC has decades of speech-processing research
> behind it; on chips with a dedicated DSP it runs in parallel for free. I'm
> not here to call it bad. I'm here to explain why we chose differently —
> because on a bare RV32IMAC core without DSP extensions, both stages share
> the same CPU."

### Key facts (memorize)
| Step | Cost |
|------|------|
| Frame · 25 ms / 10 ms hop | 100 frames per 1-s window |
| FFT 512-pt | ~460 K mults |
| Power spectrum |·|² | ~26 K ops |
| Mel filterbank · 40 bands | ~1.0 M MACs |
| log compression | ~4 K ops |
| DCT-II → MFCCs | ~130 K ops |
| **MFCC subtotal** | **~1.6 M ops** |
| DS-CNN-S body | ~5.4 M MACs · 94.4% top-1 |
| **Total system** | **~7.0 M ops** |

Citation: **Y. Zhang et al., "Hello Edge: Keyword Spotting on Microcontrollers,"** arXiv:1711.07128, 2017.

### Deep detail (move material here when slimming the slide)
- MFCC is float by default. Fixed-point implementations exist (e.g.
  CMSIS-DSP `arm_mfcc_q15`) but trade accuracy for area.
- The "40 Mel bands" choice is conventional after Davis & Mermelstein 1980;
  Hello Edge picks 40 because the authors swept 10–40 and 40 was the knee.
- Frame size = 25 ms because that's the largest window over which speech is
  approximately stationary (phoneme timescale 30–100 ms).
- The 10 ms hop = 60% overlap, standard since HTK.
- Hello Edge is on 16 kHz; we run 8 kHz for a tighter compute budget.
  Re-derived for 8 kHz: same frame/hop in seconds, same band count, ~½ the
  FFT cost. Numbers above are scaled to 8 kHz.
- DCT-II preserves energy and decorrelates the Mel bins so the first ~13
  coefficients carry the spectral envelope — the rest are pitch.

### If asked
- *"Why not use an MFCC accelerator?"* → "We could buy one off the shelf — a
  Cortex-M4F with the DSP extension, or a Syntiant NDP. That's exactly the
  industry path we're trying to compare against. Our SoC is 36 MHz Hazard3,
  no FPU, no DSP — adding an MFCC block costs area we'd rather spend on the
  conv accelerator that already covers our model end-to-end."
- *"Are these op counts standard?"* → "Yes — these are the textbook
  estimates. CMSIS-DSP profiles within ±20% of these numbers."

---

## Slide 12 — Unified Pipeline (our design decision)

**topLeft:** `12 · Model` · file: `src/slides/NoMFCC.jsx`

### What's on screen
On entry from slide 11 the "Standard approach" box visually flies in from the
right (where the slide-11 MFCC box was) and lands at the left column position.
The slide-11 step list fades out, and big summary numbers pop in: **~7.0 M
total**, **1.6 M MFCC**, **5.4 M DS-CNN**. Right column — our pipeline at
**0.97 M MACs**. Punchline strip below. MacShareBar at the very bottom
introducing the 53 / 47 split.

### Script (≈ 60–75 s)
> "Our model skips MFCC. Instead, the very first layer of the network *is*
> the spectral front-end — a learnable 1-D convolution with 16 sinc-bandpass
> kernels initialised on a Mel scale, stride 16. It does the same job MFCC
> does — give the network a frequency-resolved view of the waveform — but
> it's a tensor operation, so it runs on the same accelerator as the rest of
> the network."
>
> "The accounting changes too. Instead of 1.6 M of preprocessing plus 5.4 M
> for the network — about 7 million ops total — we land at **0.97 M MACs**
> for the whole pipeline. Same task, same accuracy class, ~7× less compute.
> Front-end and body share one datapath. There is no second stage that has
> to run somewhere else."
>
> "And the bar at the bottom — that 53 / 47 split — is the next two slides.
> conv1d_mel is 53% of all our MACs. The three conv blocks behind it are
> 47%. Each of the next two slides zooms into one of those segments."

### Key facts
| Step | Cost |
|------|------|
| conv1d_mel (16 sinc-bandpass, K=65, s=16) | ~516 K MACs · 53.3% |
| BN · ReLU · MaxPool ÷4 | folded into adjacent ops |
| 3 × Conv1D blocks | ~451 K MACs · 46.6% |
| GAP → Dense 16 → Dense 5 | ~656 MACs · <0.1% |
| **Total system** | **0.97 M MACs · all int8** |

Per-layer MAC breakdown (precise):
- conv1d_mel : 515 840  (53.3%)
- Block 1 (conv1d_2) : 214 272  (22.1%)
- Block 2 (conv1d_3) : 120 528  (12.5%)
- Block 3 conv1 (conv1d_4) :  58 320  (6.0%)
- Block 3 conv2 (conv1d_5) :  58 320  (6.0%)
- dense_fc :   576  (0.1%)
- dense_out :   80  (<0.1%)
- **Total : 967 936 ≈ 0.97 M**

### Deep detail
- The 7× reduction is system-level, not network-level. Comparing apples to
  apples: 5.4 M (their network) vs 0.97 M (our network including front-end).
  ~5.5× there alone. The other ~1.6 M is preprocessing avoided.
- "Folded" BN/ReLU/Pool: BatchNorm absorbs into the preceding conv weights
  at deploy time; ReLU is a sign mask; MaxPool ÷4 just selects 1 of 4.
  None of these contribute MACs.
- The 53 / 47 split is *deliberate*. The first conv at full 496-frame
  resolution dominates because the pool happens *after* it. We picked stride
  16 specifically so the front-end isn't 90% of the budget.

### If asked
- *"Why count Conv1D MACs but not log/DCT ops?"* → "Same currency. A MAC is
  a MAC whether it's in a conv layer or in DCT-II. The 1.6 M MFCC number is
  total ops including non-MAC operations like log, which is why we say *ops*
  not *MACs*."
- *"Isn't your network just MFCC with extra steps?"* → "It's MFCC's spirit
  — a frequency-resolved decomposition — but it's *learnable*. The kernels
  start mel-spaced and end up wherever the loss takes them."

---

## Slide 13 — Conv1D Mel Front-End

**topLeft:** `13 · Model` · file: `src/slides/Conv1DMelFrontEnd.jsx`

### What's on screen
Left card: 4×4 grid of the 16 sinc kernels, low-frequency to high-frequency
bottom-right. Right card: a sliding-window animation, K=65 with stride 16,
plus three big stats — 8000 samples in, 496 → 124 frames after 4× pool, 1056
parameters. MacShareBar at bottom with the **53% segment** foregrounded.

### Script (≈ 75–90 s)
> "Here is the 53%. The first layer is a 1-D convolution with 16 filters,
> kernel size 65 samples, stride 16. The 8 kHz, 1-second waveform is 8 000
> samples; the layer slides this 65-sample kernel across that, producing
> 496 frames per filter. After a 4× max-pool, we hand 124 frames per filter
> to the rest of the network."
>
> "The kernels are *initialised* as Hamming-windowed sinc band-passes
> spaced on the Mel scale from 50 Hz to 4 kHz. You can see the low-frequency
> kernels at the top-left of the grid — slow oscillations — and the
> high-frequency ones at the bottom-right. After training, the kernels
> *adapt* — they don't have to stay perfectly band-pass. We freeze nothing."
>
> "The total parameter count is 16 filters × 65 taps + 16 biases = 1056
> parameters. That is the entire learnable spectral front-end."
>
> "Stride 16 is the lever. At stride 1 this layer would be 8 M MACs alone,
> bigger than the whole DS-CNN baseline. At stride 16 we get a 2-millisecond
> frame shift fused into the filter — same effective hop as MFCC's 10 ms,
> roughly — and the layer drops to 516 K MACs."

### Key facts
- 16 filters · K=65 · stride=16
- 1056 parameters (16 × 65 + 16)
- 515 840 MACs (= 16 · 65 · 496)
- Mel-init range: 50 Hz – 4 kHz (Nyquist at 8 kHz fs)
- Output shape: [124, 16] after MaxPool ÷4

### Deep detail
- Sinc-bandpass kernel formula (initialisation):
  ```
  h_i(n) = [sinc(2 f_h n) − sinc(2 f_l n)] · hamming(n)
  ```
  where `f_l, f_h` are the lower / upper edges of the i-th Mel band,
  normalised to fs.
- After init, the kernels are *not* parameterised by `f_l, f_h` — they're
  free Conv1D weights. SincNet (Ravanelli 2018) keeps them parameterised;
  we don't, because INT8 quantisation is cleaner on raw weights.
- K=65 was chosen so the receptive field at fs=8 kHz covers ~8 ms — long
  enough to resolve a 125 Hz tone (one full period) and still fit in the
  TCM cache lines we use on chip.
- After-training, the trained kernels still resemble band-passes by eye,
  but with phase shifts and minor sidelobe asymmetries the loss prefers.

### If asked
- *"Why 16 filters and not 40 like MFCC?"* → "We swept; 16 was the smallest
  count that didn't lose accuracy. MFCC uses 40 because it's a fixed
  transform with no downstream learning; we have learning, and the
  downstream conv blocks recover whatever spectral resolution we need."
- *"Why Hamming and not Hann?"* → "Hamming has lower sidelobes (~−43 dB vs
  −31 dB). Doesn't matter much after training, but the init starts cleaner."
- *"Did you try learnable Mel cutoff frequencies (SincNet style)?"* → "Yes
  — accuracy was indistinguishable, INT8 quantisation was harder. Free
  weights win on the deploy side."

---

## Slide 14 — Conv Body + Classifier

**topLeft:** `14 · Model` · file: `src/slides/ConvBodyClassifier.jsx`

### What's on screen
3D-stacked block visualisation of the three Conv1D blocks (shrinking
horizontally as the time axis pools). GAP → Dense-16 dot grids. Softmax bar
chart with `yes` at 0.92. MacShareBar at bottom — **47% segment**
foregrounded.

### Script (≈ 75–90 s)
> "Here is the 47%. Three plain 1-D convolution blocks, each 36 channels,
> kernel 3, BN-ReLU-MaxPool. Block 1 pools 4× — that's where most of the
> time-axis collapse happens. Block 2 pools 2×. Block 3 doesn't pool but
> runs the conv twice."
>
> "After the third block, global average pool collapses the 15-by-36
> activation map into 36 numbers — one per channel — and a tiny dense layer
> takes that down to 16, dropout 30%, then dense to 5 logits, softmax."
>
> "Five classes: `yes`, `no`, `up`, `down`, `_unknown_`. The `_unknown_`
> bucket carries everything else from Speech Commands and silence — it has
> to, otherwise the model will confidently mis-classify the 30+ words it
> wasn't trained on as one of the four real keywords."
>
> "The whole back half — body, GAP, dense, softmax — is plain 1-D INT8.
> Deliberately simpler than DS-CNN. Standard KWS uses depthwise-separable
> 2-D convs over a spectrogram; we stay 1-D, NNoM-quantisable, ~16 K params
> total."

### Key facts
- Block 1 : 31 × 36 · pool ÷4 (after pool: 31 frames)  · 214 272 MACs
- Block 2 : 15 × 36 · pool ÷2                          · 120 528 MACs
- Block 3 : 15 × 36 · 2× conv, no pool                 · 116 640 MACs
- GAP : 15×36 → 36 (no MACs, just averaging)
- Dense 16 + Dropout 0.3 (training only)               ·   576 MACs
- Dense 5 (softmax logits)                             ·   80 MACs
- ~16 K parameters total

### Deep detail
- Why plain 1-D not depthwise-separable? Two reasons. (1) NNoM int8 support
  for depthwise-separable was patchier when we picked the framework; plain
  Conv1D had fewer surprises on the deploy side. (2) Our channel count is
  small (36) — the parameter savings from depthwise-separable kick in
  around 64+ channels.
- Why 36 channels? Knee-of-the-curve from the sweep: 24 ch lost ~1.5%, 48
  ch gained nothing measurable. 36 was the smallest count without
  sacrificing accuracy.
- Dropout 0.3 only at training time. NNoM exports without dropout (it's
  identity at inference).
- L2 = 1e-4 on the dense layer to keep activations bounded for INT8.

### If asked
- *"Why softmax instead of sigmoid per class?"* → "Mutually-exclusive label
  per window. Softmax. If we wanted overlapping wake-words we'd switch."
- *"How does `_unknown_` get supervised?"* → "Negative samples: any
  Speech-Commands word not in our 4-class set, plus silence + background
  noise clips, sampled at the same rate as positives during training."

---

## Slide 15 — Architecture Detail

**topLeft:** `15 · Model` · file: `src/slides/ArchitectureDetail.jsx`

### What's on screen
8-row layer-by-layer table: Layer · Detail · Output · Params. Plus 4 stat
boxes: ~15.9 K params, 0.97 M MACs, 5 classes, 1-D throughout.

### Script (≈ 45–60 s)
> "Layer-by-layer table for the record. 1-D throughout. Plain operations
> only. About 15 900 parameters total — small enough that the int8 weights
> file is 16 KB. 0.97 M MACs per inference. Five output classes."
>
> "Notice the parameter distribution: the 16 K is dominated by the three
> conv blocks at 36 channels each — about 4 K each. The dense layers are
> tiny by comparison. The front-end conv is only 1 K parameters but does
> 53% of the MACs because it runs at 496-frame resolution."

### Key facts (table content)

| Layer | Detail | Output | Params |
|-------|--------|--------|--------|
| Input | 8000 samples · int8 | [8000, 1] | 0 |
| conv1d_mel | 16 · K=65 · s=16 | [496, 16] | 1 056 |
| → BN · ReLU · MaxPool ÷4 | folded | [124, 16] | folded |
| Block 1 (Conv1D 36 ch · K=3 · pool ÷4) | | [31, 36] | ~3.9 K |
| Block 2 (Conv1D 36 ch · K=3 · pool ÷2) | | [15, 36] | ~3.9 K |
| Block 3 (Conv1D 36 ch · K=3 · 2× conv) | | [15, 36] | ~7.8 K |
| Global Average Pool | over time axis | [36] | 0 |
| Dense 16 · ReLU · Dropout 0.3 | | [16] | 592 |
| Dense 5 (logits) → Softmax | | [5] | 85 |
| **Total** | | | **~15.9 K** |

### If asked
- *"Where do the 15.9 K params live in flash?"* → "All in `weights.h`,
  linked into XIP flash. Total weights file is ~16 KB after int8 packing."
- *"Why count BN as folded?"* → "After PTQ we fold the scale and shift into
  the preceding conv weights and biases. The deployed graph doesn't have a
  separate BN node."

---

## Slide 16 — Literature Comparison (architectural family)

**topLeft:** `16 · Model` · file: `src/slides/LiteratureComparison.jsx`

### What's on screen
7-row comparison table (Aspect · Standard KWS · This model). Plus a 3-card
strip: SincNet · LEAF · This model.

### Script (≈ 60 s)
> "How this model fits in the literature. The closest published work is
> SincNet — Ravanelli 2018. Same idea: learnable sinc filters in the first
> layer. Difference: SincNet keeps the filter parameterised by the lower
> and upper cutoff frequencies and learns those two scalars. We initialise
> as sinc, then let the weights drift freely — easier to quantise."
>
> "LEAF — Google 2021 — is the heavier cousin: Gabor filters with learnable
> pooling and per-channel compression. Beautiful work, not cleanly INT8."
>
> "Our delta from both: stride 16 baked into the front-end conv. SincNet
> runs at full resolution and pools afterwards — burns 16× the front-end
> compute. We pay the stride upfront and the rest of the model never sees
> the cost."

### Key facts (table content)

| Aspect | Standard KWS | This model |
|--------|--------------|------------|
| Input | log-mel spectrogram | raw 8 kHz int8 PCM |
| Front-end | fixed (MFCC / log-mel) | learnable Conv1D |
| Body | 2-D depthwise-separable conv | 1-D plain conv |
| Datatype | float32 mostly | int8 throughout |
| Front-end MACs | counted separately | counted in network |
| Total MACs | ~5–7 M (with FE) | 0.97 M |
| Quantisation | post-hoc | designed-for INT8 |

### Deep detail (move here when slide is trimmed)
- **SincNet (Ravanelli & Bengio, ICASSP 2018):** parameterised
  band-pass filters; only learns 2 scalars per filter (low + high cutoff).
  Achieves ~88% on Speech Commands v1 with ~22 K params and a much heavier
  back-end. We borrowed the *initialisation* but not the parameterisation.
- **LEAF (Zeghidour et al., ICLR 2021):** "LEAF: a Learnable Frontend for
  Audio Classification." Gabor filters, per-channel learnable PCEN-style
  compression, learnable Gaussian pooling. SOTA on AudioSet small-scale
  but uses float, not aimed at MCUs.
- **DS-CNN-S (Zhang 2017):** baseline. Depthwise-separable 2-D conv over
  log-mel spectrogram, ~38 K params, ~5.4 M network MACs, +~1.6 M MFCC.
  94.4% top-1.

### If asked
- *"Why not just cite SincNet and use it as-is?"* → "We did at first. The
  parameterised filters are float by construction — the cutoffs are
  continuous. Quantising those to int8 inserts an extra step. Free weights
  give us a one-pass int8 quantise."
- *"How is your front-end different from a STFT magnitude?"* → "An STFT is
  band-pass with rectangular passbands and zero phase response. Our sinc
  init is similar but Hamming-windowed (better sidelobes), and after
  training the filters can deviate from band-pass entirely — they're free."

---

## Slide 17 — vs Other Models (parameter / MAC comparison)

**topLeft:** `17 · Model` · file: `src/slides/VsOtherModels.jsx`

### What's on screen
5-row horizontal-bar comparison: DS-CNN, TC-ResNet8, MatchboxNet, This work,
TinyConv. Plus 3 callouts: 8.8× fewer params than MatchboxNet, 4.1× fewer
than TC-ResNet8, our footprint.

### Script (≈ 45–60 s)
> "Quantitative comparison on Google Speech Commands v1. DS-CNN-S is 94.4%
> with 38 K parameters and 5.4 M network MACs. TC-ResNet8 is 96.6% with
> 66 K params. MatchboxNet — NVIDIA's deep separable 1-D model — is 97.5%
> with 140 K params."
>
> "We're at 90.0% top-1 — three to seven points behind — with **16 K params
> and 0.97 M MACs**. 8.8× fewer parameters than MatchboxNet, 4.1× fewer
> than TC-ResNet8. The trade is conscious: every published model in this
> chart assumes a 32-bit float-capable host. We don't have one. Our budget
> is RV32IMAC at 36 MHz with no FPU."

### Key facts

| Model | Params | Network MACs | Top-1 | FE | Notes |
|-------|--------|--------------|-------|----|-----|
| DS-CNN-S | 38.6 K | 5.4 M | 94.4% | MFCC | Zhang 2017 baseline |
| TC-ResNet8 | 66 K | 11 M | 96.6% | MFCC | Choi 2019 |
| MatchboxNet 3×1×64 | 140 K | 33 M | 97.5% | MFCC | NVIDIA Majumdar 2020 |
| TinyConv | 21 K | 2.7 M | 92.7% | MFCC | TFLite tutorial baseline |
| **This work** | **~16 K** | **0.97 M** | **90.0%** | **learned** | our SoC budget |

### Deep detail
- TC-ResNet8 = "Temporal Convolutional ResNet, 8 layers." Full citation:
  Choi et al., "Temporal Convolution for Real-time Keyword Spotting on
  Mobile Devices," Interspeech 2019.
- MatchboxNet citation: Majumdar & Ginsburg, "MatchboxNet: 1D Time-Channel
  Separable Convolutional Neural Network Architecture for Speech Commands
  Recognition," Interspeech 2020.
- All comparisons exclude front-end MACs for the published models — they
  always run on a host with a free MFCC accelerator. Adding ~1.6 M
  preprocessing to each of those would only widen the gap.
- Our 90.0% is the int8 KLD-calibrated number from slide 19. Float32 is
  92.4%.

### If asked
- *"Why is your accuracy lower?"* → "Three reasons: (1) we're INT8
  end-to-end, the others are float at evaluation; (2) we have ~10× fewer
  parameters; (3) we trained at 8 kHz on the INMP441 dataset we collected,
  not the curated 16 kHz Speech Commands. Re-evaluating on 16 kHz Speech
  Commands at float, we hit 92.4%."
- *"Could you scale up to match MatchboxNet?"* → "On a faster host, yes.
  On 36 MHz Hazard3 we'd run out of cycle budget per inference. Our model
  is sized to fit a 100-ms inference budget, not a benchmark."

---

## Slide 18 — Training Closed Loop

**topLeft:** `18 · Model` · file: `src/slides/TrainingClosedLoop.jsx`

### What's on screen
Closed-loop diagram: training script → INT8 weights.h → C harness → linked
into both host and SoC builds. Same source, two targets. Dtype-aware
augmentation in the loop.

### Script (≈ 60 s)
> "Closed-loop training. The model is trained against the *exact* numerical
> pipeline the firmware runs. Dtype-aware augmentation: the same training
> script trains at float32 for the reference, int16 for an intermediate
> sanity check, and int8 for deployment. Noise floor is calibrated per
> dtype — int8 sees more aggressive noise because the quantisation
> already chews through the SNR margin."
>
> "After training, NNoM exports a `weights.h` file. That header is linked
> into a single C harness — the same harness compiles for the host and for
> the SoC. One source of truth. If accuracy on the host doesn't match
> accuracy on chip, that's a real bug, not a tooling artefact."

### Key facts
- Augmentation: time shift ±100 ms, background noise SNR 0–30 dB,
  vol jitter ±6 dB, peak-normalised then quantised
- NNoM v0.4.x for the export (header-only INT8 inference)
- Training: TF 2.x → NNoM converter → `weights.h`
- One C harness, two compile targets (host gcc-x86 + riscv32-unknown-elf-gcc)

### Deep detail
- Why a single C harness? Because the alternative — Python on host, C on
  chip — means accuracy regressions can come from either side and you
  can't bisect. With one source, every divergence is real silicon vs
  silicon-emulated.
- Dtype-aware augmentation: noise scale follows the dtype's quantisation
  step (1/255 for int8, 1/65535 for int16). Without this, int8 trained
  with float-style noise ends up too clean and falls off a cliff at
  inference.
- The "two targets" are bit-exact for ~99% of inputs. The remaining
  ~1% are saturation edge cases in the int32 accumulator that differ in
  rounding mode.

### If asked
- *"Why not QAT (quantisation-aware training)?"* → "Tried it. Marginal
  gain over PTQ-with-KLD. PTQ keeps the training loop simple — same
  graph for all dtypes."
- *"Can you re-train on a new keyword set?"* → "Yes. The pipeline takes
  an hour on a single GPU. Re-export, re-link, re-flash."

---

## Slide 19 — Quantization (PTQ + KLD)

**topLeft:** `19 · Model` · file: `src/slides/Quantization.jsx`

### What's on screen
Left: 5-step PTQ pipeline (Train float → collect histograms → KLD threshold
search → per-tensor int8 → emit `weights.h`). KLD note panel.
Right: accuracy bars — float32 92.4%, int8 min-max 86.1%, int8 KLD 90.0%.

### Script (≈ 60–75 s)
> "Quantisation strategy: **post-training quantisation, KL-divergence
> calibrated**. No QAT, no fine-tune. Train in float, calibrate on a
> held-out batch of 1024 samples, ship int8."
>
> "The naive thing — min-max quantisation — clips at the activation's
> observed min and max. That gives you 86.1% int8 accuracy. The smart
> thing — KLD calibration — picks the clip threshold that minimises the
> Kullback-Leibler divergence between the float histogram and the
> requantised histogram. That preserves the *shape* of the distribution
> at the cost of some outliers. 90.0%. Almost 4 points back."
>
> "The reference float32 number is 92.4%. The 2.4-point drop from float
> to int8-KLD is the price of int8 silicon with no FP unit. We pay it
> consciously."

### Key facts
- Reference float32 : **92.4%**
- int8 min-max PTQ : **86.1%**  (−6.3 pp)
- int8 KLD-calibrated : **90.0%**  (−2.4 pp from float)
- Calibration set: 1024 held-out samples
- Per-tensor scales (not per-channel); NNoM convention

### Deep detail
- KLD threshold search algorithm (TensorRT-style):
  1. Collect activation histogram with 2048 bins per tensor.
  2. For each candidate threshold T from min..max, requantise: bins
     beyond T merged into the last bin.
  3. Compute D_KL(P_float || P_requantised).
  4. Pick T that minimises D_KL.
- Why per-tensor and not per-channel? NNoM's int8 kernel only supports
  per-tensor scales. Per-channel would gain ~0.5pp but break the kernel
  contract.
- Why 1024 calibration samples? Empirical knee — 256 was noisy, 4096
  didn't change anything.

### If asked
- *"Why not QAT?"* → "Marginal. We tried QAT with the same architecture
  and got 90.4% — 0.4 pp better than PTQ-KLD. Not worth the training-loop
  complexity for our deployment cadence."
- *"What's the per-layer accuracy contribution?"* → "Most of the loss is
  in the front-end conv1d_mel where the activations have a long tail.
  KLD specifically helps there."

---

## Slide 20 — Data Gap (sim-to-real)

**topLeft:** `20 · Model` · file: `src/slides/DataGap.jsx`

### What's on screen
Two-column before/after: left (Speech Commands, INMP441 board) — accuracy
drops from 90% to 62% out-of-the-box. Right — after our two fixes — 90%
match between Speech Commands and INMP441.

### Script (≈ 60 s)
> "Two things kept the accuracy from collapsing on real-world audio. Out
> of the box, training on Google Speech Commands and deploying through
> the INMP441 MEMS microphone on our PCB drops accuracy from 90% to 62%.
> Different mic, different room, different SNR floor."
>
> "Fix one: we collected our own dataset through the INMP441 — same
> hardware, same room characteristics — and fine-tuned the last layers.
> Closes most of the gap."
>
> "Fix two: peak normalisation. Every clip is scaled so its loudest
> sample reaches 75% of int16 full scale, then right-shifted by 8 in
> firmware to land in a known int8 range. The hardware constraint —
> int8 dynamic range — made visible inside the training pipeline."

### Key facts
- Out-of-box (Speech Commands → INMP441) : 90% → **62%**  (−28 pp)
- After INMP441 fine-tune : 62% → ~85%
- After peak normalisation pipeline : ~85% → **90%**  (matches reference)
- INMP441 dataset size: ~3 K clips, 5 keywords, in-house recorded
- Peak-norm target: 75% of int16 full-scale (= 24 576 / 32 767)

### Deep detail
- Why 75% and not 100%? Headroom for transients. At 100% you clip on
  plosives ('p', 't' word-onsets).
- Why right-shift by 8 in firmware? Take the 16-bit peak-normalised
  value, drop the low byte, hand the high byte to the network as int8.
  No multiply needed.
- Why fine-tune only the last layers? Front-end + early conv generalise
  across mics; the late blocks specialise to the noise floor + tone of
  the actual hardware.
- The 28 pp drop without these fixes is *typical* for sim-to-real KWS.
  Most papers don't report it because they evaluate on the same source
  they trained on.

### If asked
- *"Why INMP441?"* → "Industry-standard digital MEMS, I²S out, ~$1.50.
  Same family that ships in Amazon Echo Dot v2 and similar."
- *"How much data did you record?"* → "About 3 000 clips across 5
  keywords + unknown. Two volunteers, two rooms, three sessions. Small
  on purpose — we want fine-tune, not from-scratch."
- *"What's the per-keyword accuracy?"* → "Yes / no near 95%; up / down
  closer to 87%; unknown ~92% on confusable phonemes."

---

## Section Q&A — beyond the individual slides

### "Why design your own model instead of using DS-CNN?"
Three constraints simultaneously: int8 throughout (no FPU on chip), front-end
must run on the same accelerator as the body (no separate DSP), and total
MACs has to fit a 100-ms inference budget at 36 MHz Hazard3. DS-CNN
violates two of three: it expects MFCC outside the network and float
internally.

### "What's the killer comparison number?"
**0.97 M MACs vs 7 M for the DS-CNN system, end-to-end.** 7× system-level
reduction at the cost of ~4 percentage points of accuracy.

### "What couldn't you optimise?"
Memory bandwidth. The int8 weights are in XIP flash; the activations are in
SRAM. Each conv layer reads its weights from flash through the cache. We
can't compress the weights below int8 without re-architecting the network.
Future work: 4-bit weights for the dense layers, where saturation matters
less.

### "How long to retrain on new keywords?"
~1 hour single GPU for the full pipeline (train float → calibrate KLD →
NNoM export). Adding a new keyword needs ~500 clips per keyword to match
the dataset balance.

### "What's the inference time on chip?"
~38 ms per 1-second window at 36 MHz, dominated by conv1d_mel. With the
accelerator engaged, ~6 ms. The remaining 32 ms / 6 ms is accelerator
saved cycles — see the accelerator section.
