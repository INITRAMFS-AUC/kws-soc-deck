// ─────────────────────────────────────────────────────────────────────────────
// content.js — single source of truth for every word on every slide.
//
// Edit any string here and the slide updates. Vite HMR keeps the deck on the
// current slide while you iterate. Speaker notes live alongside their slide.
//
// Schema:
//   slides: Array<{
//     id:      string         // stable, kebab-case (no leading number)
//     label:   string         // descriptor only — slide number is prepended
//                             //   automatically by SlideFrame / PivotSlide
//     notes:   string         // shown in deck-stage's notes panel
//     content: object         // slide-specific copy. Common fields:
//       kind?:  string        // top-left descriptor (e.g. 'Context', 'Hardware')
//                             //   The slide number is prepended automatically.
//                             //   No pgnum / topLeft fields — derived from
//                             //   manifest position via slide-meta context.
//   }>
// ─────────────────────────────────────────────────────────────────────────────

export const slides = [
  // Cover ─────────────────────────────────────────────────────────────────────
  {
    id: 'cover',
    label: 'Cover',
    notes: "Good morning. I'm here to defend KWS-SoC — a fully custom keyword-spotting system on chip, built from RTL up. Open RISC-V core, accelerator we designed ourselves, model trained against the exact numerical pipeline the firmware runs, and a custom PCB underneath it all.",
    content: {
      brand: 'InitRamFS · KWS-SoC',
      defenseTag: 'Thesis Defense · 2026',
      eyebrow: 'Keyword spotting on a custom RISC-V SoC',
      displayLeft: 'KWS-SoC',
      displayAccent: '.',
      meta: [
        { label: 'Repo',  value: 'github.com/INITRAMFS-AUC/KWS-SoC', mono: true },
        { label: 'Supervisor', value: 'Dr. Mohamed Shalan' },
      ],
      groupMembers: [
        'Ahmed Waseem Raslan',
        'Omar ElFouly',
        'Ziad Mohamed',
        'Yousef Mansour',
        'Bavly Remon',
        'Ahmed Ali Rostom',
        'Ahmed Elbarbary',
      ],
    },
  },

  // Voice Everywhere ──────────────────────────────────────────────────────────
  {
    id: 'voice',
    label: 'Voice Everywhere',
    notes: 'Before the technical detail, why anyone should care. Voice is the dominant emerging interface — phones, earbuds, smart speakers, cars, appliances. Behind every one of those interfaces is a tiny always-on classifier called keyword spotting.',
    content: {
      kind: 'Context',
      eyebrow: '"Hey Siri."\u00A0\u00A0"OK Google."\u00A0\u00A0"Alexa."',
      title: 'Voice command interfaces are everywhere.',
      bodyHTML: 'Phones. Earbuds. Smart speakers. Cars. Appliances. Behind every one of those interfaces is a tiny always-on classifier called <span style="color: var(--accent); font-weight: 500;">keyword spotting</span> — and it has to run within milliwatts, on kilobytes of memory, every second of every day.',
      market: {
        stats: [
          { label: 'Revenue, 2023',       value: '$23.9 B' },
          { label: 'Forecast, 2030',      value: '$92.4 B' },
          { label: 'CAGR, 2024 – 2030',   value: '21.3%'   },
        ],
        chartTitle: 'Global voice user interface market, 2017 – 2030 (US$ M)',
        // Grand View Research, Voice User Interface Market report
        series: [
          { y: 2017, v:  6900 },
          { y: 2018, v:  9000 },
          { y: 2019, v: 11000 },
          { y: 2020, v: 13500 },
          { y: 2021, v: 16200 },
          { y: 2022, v: 19500 },
          { y: 2023, v: 23941 },
          { y: 2024, v: 29000 },
          { y: 2025, v: 35000 },
          { y: 2026, v: 42500 },
          { y: 2027, v: 51500 },
          { y: 2028, v: 62500 },
          { y: 2029, v: 76000 },
          { y: 2030, v: 92410 },
        ],
        sourceLabel: 'Source · Grand View Research, Voice User Interface Market Report',
        sourceUrl: 'https://www.grandviewresearch.com/industry-analysis/voice-user-interface-market-report',
      },
    },
  },

  // KWS & NLP ────────────────────────────────────────────────────────────────
  {
    id: 'kws-nlp',
    label: 'KWS & NLP',
    notes: '',
    content: {
      kind: 'Context',
      eyebrow: 'Where KWS sits',
      title: 'Keyword Spotting & Natural Language Processing.',
      body: 'Unlike Natural Language Processing, Keyword Spotting is concerned with classifying single words from the user, not the whole speech. Keyword spotting usually aids NLP applications, like Siri, when you say "Hey Siri". And is used in simpler applications like smart home devices as a simpler low-compute alternative to NLP.',
      wakePhrase: 'Hey Siri',
    },
  },

  // Commercial Reality ────────────────────────────────────────────────────────
  {
    id: 'commercial-reality',
    label: 'Commercial Reality',
    notes: "Today's KWS lives in two tiers. Tier one is purpose-built silicon — Syntiant's NDP series, dedicated wake-word chips. Ultra-low power, but proprietary, closed toolchains, locked to vendor frameworks. Tier two is general-purpose MCUs running quantized models through vendor stacks like X-CUBE-AI or eIQ. Familiar, but the chip is still a black box you deploy onto. Either way, you adapt your model to the chip — you don't co-design them. Nobody has built a fully open, end-to-end KWS system from the silicon up.",
    content: {
      kind: 'Context',
      eyebrow: 'Status quo',
      title: 'Two Approaches to KWS, & Their Caveats.',
      tiers: [
        {
          head: 'Tier 01',
          lede: 'Purpose-built silicon',
          bullets: [
            'High NRE cost.',
            'Locked to vendor frameworks.',
            'Closed toolchains.',
            'Only viable at scale.',
          ],
          imageSrc: 'assets/si-layout.jpg',
          imageAlt: 'Silicon layout of a purpose-built KWS chip',
        },
        {
          head: 'Tier 02',
          lede: 'General-purpose MCUs',
          bullets: [
            'STM32, NXP, Cortex-M series, eIQ, and friends.',
            'Too general — leaves HW optimizations on the table.',
            'Closed source.',
          ],
          comparison: {
            tableTitle: 'Cortex-M7 — what you pay for',
            headers: ['Metric', 'Cortex-M7'],
            rows: [
              ['Core-only dynamic power', '18.5–58.5 µW/MHz minimum cacheless'],
              ['Unit cost', '$16'],
            ],
            featuresTitle: 'Included features',
            features: [
              'Dual core',
              'AXI bus',
              'DSP extension',
              'Instruction cache',
              'Data cache',
              'Instruction TCM',
            ],
            sources: [
              {
                label: 'Digi-Key · STM32H753VIH6',
                url: 'https://www.digikey.com/en/products/detail/stmicroelectronics/STM32H753VIH6/10326801',
              },
              { label: 'Arm Cortex-M Processor Comparison Table' },
            ],
          },
        },
      ],
      pull: "You adapt your model to the chip. You don't co-design them.",
      thesis: 'Most of the time you pay for things you do not need',
    },
  },

  // We Did ───────────────────────────────────────────────────────────────────
  {
    id: 'we-did',
    label: 'We Did',
    notes: 'We did. KWS-SoC is a fully open RISC-V SoC built specifically for keyword spotting inference. Open core, custom accelerator, model trained knowing the hardware, custom PCB, single open toolchain. We didn\'t adapt a model to fit a chip — we built the chip to fit the model.',
    content: {
      kind: 'Thesis',
      eyebrow: 'KWS-SoC',
      title: 'A fully open RISC-V SoC built specifically for Audio inference.',
      pillars: [
        {
          head: '01', lede: 'Open RISC-V core',
          body: 'Hazard3, formally re-verified after our edits.',
          constraint: {
            tag: 'Constraint · 01',
            head: 'RV32IMAC, no FPU',
            body: 'Hazard3 core at 36 MHz. All math integer-only — int8 / int32.',
          },
        },
        {
          head: '02', lede: 'Custom Conv1D accel',
          body: 'RTL we designed and verified end-to-end.',
        },
        {
          head: '03', lede: 'HW-aware model',
          body: 'Trained knowing exactly what the chip would do.',
          constraint: {
            tag: 'Constraint · 02',
            head: '64 KB SRAM budget',
            body: 'NNoM static buffer fits inside this; weights live in XIP flash.',
          },
        },
        {
          head: '04', lede: 'Custom PCB',
          body: "Fabricated when the dev board wasn't enough.",
        },
        {
          head: '05', lede: 'One open toolchain',
          body: 'Nix, Verilator, Yosys, OpenOCD, GDB.',
          constraint: {
            tag: 'Constraint · 03',
            head: 'Open toolchain',
            body: 'Nix · Verilator · Yosys · OpenOCD · GDB — reproducible from source.',
          },
        },
      ],
      titleInitial: 'A fully open RISC-V SoC built specifically for Audio inference.',
      titleConstraints: 'A fully open RISC-V SoC, has its constraints.',
      callout: "We didn't adapt a model to fit a chip. We built both to fit eachother.",
    },
  },

  // SoC Architecture ─────────────────────────────────────────────────────────
  {
    id: 'soc',
    label: 'SoC Architecture',
    notes: 'The SoC. Hazard3 sits on an AHB-Lite system bus alongside SRAM, Conv1D accelerator memmory transfer interface, QSPI XIP flash. APB hangs off a bridge for the slow peripherals — UART, RISC-V timer, I²S receiver, and the Conv1D config at 0x4000_C000. Every block is either open-source code we audited or RTL we wrote.',
    content: {
      kind: 'Hardware',
      eyebrow: 'kws_soc.v',
      title: 'SoC block diagram',
      rowOne: [
        { label: 'Hazard3 Core', sub: 'RV32IMAC · 36 MHz · i+d ports' },
        { label: 'JTAG DTM',     sub: 'hazard3_dm + DTM', style: { width: 269, margin: '0 0 0 -18px' } },
        { label: 'SRAM',         sub: 'ahb_sync_sram · 64 KB', style: { width: 769 } },
        { stack: [
          { label: 'QSPI XIP Flash Controller', sub: 'peris/xip · qspi_flash_ctrl.v', variant: 'accent-light' },
          { label: 'QSPI XIP cache',            sub: 'peris/xip · ro_cache.v',        variant: 'accent' },
        ] },
      ],
      bus: 'AHB-Lite system bus · 32-bit · busfabric/',
      busHint: 'press → to expand',
      rowTwo: [
        { label: 'Conv1D Accel core', sub: 'peris/conv1d_accel · AHBL master', variant: 'accent' },
        { label: 'DMA Master/Slave',  sub: 'peris/dma · AHBL master + APB slave', variant: 'accent-light' },
        { label: 'APB bridge',        sub: 'AHBL → APB · control + status' },
      ],
      peripherals: [
        { label: 'I²S RX + FIFO', sub: 'peris/i2s · INMP441',  variant: 'accent' },
        { label: 'UART',          sub: 'libfpga · 115200 8N1' },
        { label: 'RV Timer',      sub: 'mtime / mtimecmp' },
      ],
      footer: 'Every block is either open-source code we audited or RTL we wrote.',
      crossbarFooter: 'A partial crossbar — eight of twelve possible master→slave paths — is the right tradeoff between silicon area and the flexibility of a full mesh.',
    },
  },

  // Memory Map ───────────────────────────────────────────────────────────────
  {
    id: 'memory-map',
    label: 'Memory Map',
    notes: 'The memory map is the contract between hardware and firmware. SRAM at zero, peripherals at 0x4000_xxxx, XIP flash, DMA and Conv1D on AHBL BUS.',
    content: {
      kind: 'Hardware',
      eyebrow: 'Address space',
      title: 'Memory map',
      headers: [
        { label: 'Base',   width: 260 },
        { label: 'Region', width: 220 },
        { label: 'Bus',    width: 140 },
        { label: 'Notes' },
      ],
      rows: [
        [{ cls: 'addr', html: '0x0000_0000' }, { cls: 'name', html: 'SRAM' },                        { html: 'AHB' },  { cls: 'desc', html: '128 KB. Reset vector. <span class="mono">_sram</span> ELFs link here for GDB <span class="mono">load</span>.' }],
        [{ cls: 'addr', html: '0x4000_0000' }, { cls: 'name', html: 'System timer' },                { html: 'APB' },  { cls: 'desc', html: 'Hazard3 RISC-V timer · µs timebase.' }],
        [{ cls: 'addr', html: '0x4000_4000' }, { cls: 'name', html: 'UART' },                        { html: 'APB' },  { cls: 'desc', html: '<span class="mono">uart_mini</span> · TX/RX · IRQ.' }],
        [{ cls: 'addr', html: '0x4000_8000' }, { cls: 'name', html: 'I²S RX' },                      { html: 'APB' },  { cls: 'desc', html: 'FIFO + IRQ; 8/16-bit width modes.' }],
        [{ cls: 'addr', html: '0x4000_C000' }, { cls: 'name', html: 'Conv1D accel · cfg' },          { html: 'APB' },  { cls: 'desc', html: '7 control registers · CTRL · CFG0/1 · address pointers.' }],
        [{ cls: 'addr', html: '_' },           { cls: 'name', html: 'Conv1D accel · Transfers' },    { html: 'AHB' },  { cls: 'desc', html: 'Crossbar master 3 · reads input/weights/bias from SRAM &amp; XIP, writes output to SRAM.' }],
        [{ cls: 'addr', html: '0x4000_E000' }, { cls: 'name', html: 'Bus snooper' },                 { html: 'APB' },  { cls: 'desc', html: 'Debug-gated (<span class="mono">`DEBUG_SNOOPER</span>); taps bridge + d-port.' }],
        [{ cls: 'addr', html: '0x6000_0000' }, { cls: 'name', html: 'DMAC regs' },                   { html: 'AHB' },  { cls: 'desc', html: '<span class="mono">MS_DMAC_AHBL</span> · I²S FIFO trigger.' }],
        [{ cls: 'addr', html: '0x8000_0000' }, { cls: 'name', html: 'XIP flash' },                   { html: 'QSPI' }, { cls: 'desc', html: '<span class="mono">_xip</span> binaries link here; weights live here.' }],
      ],
    },
  },

  // Verification ─────────────────────────────────────────────────────────────
  {
    id: 'verification',
    label: 'Verification',
    notes: 'Verification has three rungs and the same firmware binary runs on all three. cxxrtl gives a fast C++ simulation with a JTAG bit-bang wrapper. Verilator catches what cxxrtl misses — internally generated clocks like the I²S SCK. The DE10-Standard is the final rung. Each had to pass before the next design decision was committed.',
    content: {
      kind: 'Hardware',
      eyebrow: 'Three rungs of confidence',
      title: 'Same binary on all three.',
      rungs: [
        { head: 'Rung 01 · cxxrtl',        lede: 'RTL → C++ sim',  bodyHTML: 'JTAG bit-bang wrapper. <span class="mono">make sim</span>. OpenOCD &amp; GDB connect as if it were silicon.' },
        { head: 'Rung 02 · Verilator',     lede: 'Cycle-accurate', bodyHTML: 'Catches what cxxrtl misses — internally generated <span class="mono">sck</span>, where edge-detection variables cache before <span class="mono">.next</span> register values update.' },
        { head: 'Rung 03 · DE10-Standard', lede: 'Cyclone V FPGA', bodyHTML: 'Same firmware binary, no changes. The final rung before silicon.' },
      ],
      footer: 'Each rung is closer to real silicon. Each had to pass before the next design decision was committed.',
    },
  },

  // PCB ──────────────────────────────────────────────────────────────────────
  {
    id: 'pcb',
    label: 'PCB',
    notes: 'Real hardware, real noise. When we connected the INMP441 to the DE10\'s GPIO header, the I²S signal was corrupted by power-rail noise. The mic data was wrong. You cannot retrain your way out of physics. So we designed a custom PCB — proper decoupling, clean ground plane, INMP441 correctly housed. When the hardware fails you, you fix the hardware. That\'s what full-stack ownership buys you.',
    content: {
      kind: 'Hardware',
      eyebrow: 'Real hardware, real noise',
      title: 'We designed and fabricated our own Dev board.',
      bodyOneHTML: 'For our Design to interface with external peripheries and debuggers we were using regular Breadboards and veroboards, we suffered from signal integrity and noise issues at high frequencies, <strong>we needed to grow out of our dev boards and upgrade.</strong>',
      bodyTwo: 'So we designed a custom PCB, clean ground plane. The result: a clean I²S signal and clean clocks.',
      callout: 'When the hardware fails you, you fix the hardware.',
      imageSrc: 'assets/pcb.svg',
      imageAlt: 'KWS-SoC custom PCB schematic',
      actualImageSrc: 'assets/actual_pcb.jpg',
      actualImageAlt: 'Photograph of the fabricated KWS-SoC dev board',
      // Annotation pins on the fabricated-board photo. Tune target {x,y}
      // (image-relative %) and pill {x,y} (label position %) to match the
      // photo. Connector line is drawn from pill anchor to target dot.
      labels: [
        { text: 'JTAG debugger',         target: { x: 56, y: 32 }, pill: { x: 36,  y: 15  } },
        { text: 'INMP441 I²S mic',       target: { x: 50, y: 58 }, pill: { x: 44,  y: 92 } },
        { text: '2 MB XIP Flash',        target: { x: 40, y: 62 }, pill: { x: 4, y: 80 } },
        { text: 'IDC interface to FPGA', target: { x: 46, y: 48 }, pill: { x: 26, y: 28  } },
        { text: 'UART to USB', target: { x: 66, y: 52 }, pill: { x: 96, y: 50  } },
      ],
    },
  },

  // Pivot · Model ────────────────────────────────────────────────────────────
  {
    id: 'pivot-model',
    label: 'Pivot · Model',
    notes: 'Pivot. The SoC exists to run one thing. Here\'s how we designed that thing to fit it — and why we started from sound itself.',
    content: {
      // PivotSlide reads `num` directly (not auto-derived) since pivot top-left
      // is a custom transition tag, not a numbered descriptor.
      num: 'Pivot · I → II',
      bodyMain: "The SoC exists to run one thing. Here's how we designed that thing to fit it — and ",
      bodyEm: 'why we started from sound itself.',
    },
  },

  // The Model ────────────────────────────────────────────────────────────────
  {
    id: 'the-model',
    label: 'The Model',
    notes: "Mel-aware Conv1D directly on the waveform. Rather than a separate MFCC stage, we use a learnable Conv1D that performs spectral decomposition as part of the model itself. The result is a single unified pipeline — one datatype, one compute path. The first Conv1D layer dominates MACs at 53%. That's by design: it becomes the accelerator target.",
    content: {
      kind: 'Model',
      eyebrow: 'build_mel_compact()',
      title: 'Mel-aware Conv1D, directly on the waveform.',
      flow: [
        { label: 'Waveform',    sub: '8000 × 1 int8 PCM' },
        { label: 'Conv1D mel',  sub: '16 · K=65 · s=16<br/>mel-spaced bandpass init', variant: 'accent' },
        { label: 'DS-CNN ×4',   sub: 'depthwise + pointwise' },
        { label: 'Dense 16',    sub: 'L2 = 1e-4' },
        { label: '11 classes',  sub: 'softmax' },
      ],
      bodyHTML: "Why raw waveform instead of a fixed spectral front-end? A fixed front-end is preprocessing the accelerator can't touch. Our learnable Conv1D <em>is</em> the spectral decomposition — and it's hardware-friendly because it's just a tensor operation.",
      callout: "The first Conv1D layer dominates compute. That's by design — it becomes the accelerator target.",
    },
  },

  // Standard MFCC ───────────────────────────────────────────────────────────
  {
    id: 'standard-mfcc',
    label: 'Standard MFCC Pipeline',
    notes: 'This is the industry baseline — a well-established pipeline from Zhang et al., Hello Edge, 2017. Six steps: framing, FFT, power spectrum, Mel filterbank, log compression, DCT-II. Together they cost around 1.6 M ops of preprocessing before the network even starts. This pipeline is proven and widely used. On platforms with a dedicated DSP or MFCC accelerator it runs in parallel. On our bare RISC-V core, both stages share the same CPU.',
    content: { kind: 'Model' },
  },

  // No MFCC ─────────────────────────────────────────────────────────────────
  {
    id: 'no-mfcc',
    label: 'Unified Pipeline',
    notes: 'Our design decision: skip the MFCC stage entirely. A learnable Conv1D replaces it, merging front-end and body into one pipeline. The total system cost is 0.97 M MACs — no separate preprocessing stage. Zhang et al. DS-CNN-S runs at 5.4 M network MACs plus ~1.6 M MFCC preprocessing, ~7 M total. We achieve 90% accuracy at 0.97 M total — front-end cost included.',
    content: { kind: 'Model' },
  },

  // Conv1D Mel Front-End ─────────────────────────────────────────────────────
  {
    id: 'conv1d-mel',
    label: 'Conv1D Mel Front-End',
    notes: 'The learnable sinc filterbank in detail. 16 sinc-bandpass kernels, Hamming-windowed, mel-initialized 50 Hz to 4 kHz. K=65, stride 16 — a 2 ms frame shift fused into the filter. 8000 samples in, 496 frames out, 124 after the 4× pool. 1056 parameters total. This layer alone is 78% of total MACs — by design, it becomes the accelerator target.',
    content: { kind: 'Model' },
  },

  // Conv Body + Classifier ───────────────────────────────────────────────────
  {
    id: 'conv-body',
    label: 'Conv Body + Head',
    notes: 'Three plain 1D conv blocks, then collapse. No depthwise-separable, no 2D — plain Conv1D, BN, ReLU, MaxPool throughout. Block 1 at 31×36, pool 4×. Block 2 at 15×36, pool 2×. Block 3 at 15×36, double conv no pool. Global average pool collapses to 36 channels, dense 16 with ReLU and dropout 0.3, then softmax over 5 classes.',
    content: { kind: 'Model' },
  },

  // Architecture Detail ──────────────────────────────────────────────────────
  {
    id: 'architecture-detail',
    label: 'Architecture Detail',
    notes: 'The architecture in detail. 8000 int8 samples in. Conv1D mel front-end with 16 filters, kernel 65, stride 16. Four DS-CNN blocks. Global average pool. Dense head, eleven classes out.',
    content: {
      kind: 'Model',
      eyebrow: 'Layer by layer',
      title: 'Mel-compact architecture',
      headers: [
        { label: 'Layer',          width: 340 },
        { label: 'Shape · Params', width: 560 },
        { label: 'Purpose' },
      ],
      rows: [
        [{ cls: 'name', html: 'Input' },                        { html: '8000 × 1 int8' },                                            { cls: 'desc', html: '1 second of audio @ 8 kHz' }],
        [{ cls: 'name', html: 'Conv1D mel' },                   { html: '16 filters · K=65 · s=16 · BN · ReLU → MaxPool 4×' },        { cls: 'desc', html: 'Learnable bandpass front-end' }],
        [{ cls: 'name', html: 'Conv block ×4' },                { html: '36 ch · K=3 · BN · ReLU · MaxPool (4×, 2×, —, —)' },          { cls: 'desc', html: 'Feature extraction' }],
        [{ cls: 'name', html: 'Global Avg Pool' },              { html: '—' },                                                          { cls: 'desc', html: 'Spatial aggregation' }],
        [{ cls: 'name', html: 'Dense 36 → 16 · ReLU' },         { html: 'L2 = 1e-4' },                                                  { cls: 'desc', html: 'Classification head' }],
        [{ cls: 'name', html: 'Dense 16 → 11 · Softmax' },      { html: 'L2 = 1e-4' },                                                  { cls: 'desc', html: '11-class logits → output' }],
      ],
      stats: [
        { value: '16.2 KB',     label: 'Flash footprint',  size: 56 },
        { value: '20.1 KB',     label: 'NNoM static buf',  size: 56 },
        { value: '0.97 M',      label: 'Total MACs',       size: 56 },
        { value: '0.30 / 1e-4', label: 'Dropout · L2',     size: 56 },
      ],
    },
  },

  // Literature Comparison ───────────────────────────────────────────────────
  {
    id: 'lit-comparison',
    label: 'vs Literature',
    notes: 'How this model is different. Most published KWS networks — DS-CNN, MobileNet-derived — are 2D convs over a fixed log-mel spectrogram. We stay on the waveform, learn the front-end, keep the body simple, and quantise it INT8 for NNoM. Closest published work: SincNet (Ravanelli 2018) uses learnable sinc filters but at full resolution then pools. LEAF (Google 2021) uses Gabor filters with learnable pooling — heavier and not cleanly INT8-quantisable. Our stride-16 fused filter saves 16× compute up front.',
    content: { kind: 'Model' },
  },

  // vs Other Models ──────────────────────────────────────────────────────────
  {
    id: 'vs-models',
    label: 'vs Other Models',
    notes: '90% accuracy at a fraction of the parameter count. Google Speech Commands benchmark. DS-CNN small at 94.4% with 38K params and 5.4M MACs. TC-ResNet8 at 96.6% with 66K params. MatchboxNet at 97.5% with 140K params. This work: 90.0% with ~16K params and 0.97M MACs. 8.8× fewer params than MatchboxNet, 4.1× fewer than TC-ResNet8, running on a 36 MHz RV32IMAC.',
    content: { kind: 'Model' },
  },

  // Training Closed Loop ─────────────────────────────────────────────────────
  {
    id: 'training',
    label: 'Training Closed Loop',
    notes: 'Closed-loop training. The model is trained on what the firmware will give it. Dtype-aware augmentation — same script trains float32, int16, int8, with noise calibrated per dtype. NNoM export gives us a weights.h linked into the harness. One harness, two targets — same C source on host and on SoC.',
    content: {
      kind: 'Model',
      eyebrow: 'Closed-loop training',
      title: 'Trained on what the firmware will give it.',
      pillars: [
        { head: '01 · Dtype-aware aug', lede: 'float32 · int16 · int8', bodyHTML: 'Same script trains all three. Random gain (30 %), time-shift (40 %), additive noise calibrated per dtype.' },
        { head: '02 · NNoM export',     lede: 'Keras → weights.h',      bodyHTML: '<span class="mono">nnom_generate_model</span> → linked into <span class="mono">kws_nnom_main.c</span> → cross-compiled for RV32IMAC.' },
        { head: '03 · One harness',     lede: 'Two targets',            bodyHTML: 'Same C source on host and on SoC. Identical inference results, different execution environments.' },
      ],
      footer: "If the firmware does a thing, the trainer simulates it. That's how we avoid the sim-to-real gap most KWS projects hit.",
    },
  },

  // Quantization ────────────────────────────────────────────────────────────
  {
    id: 'quantization',
    label: 'Quantization',
    notes: 'Post-training quantization, KL-divergence calibrated. No QAT, no fine-tune. Train in float, calibrate on a held-out batch of 1024 samples, ship int8. KLD threshold search picks the clip threshold that minimises D_KL between the float histogram and the requantised histogram — preserving the shape of the distribution rather than the extremes. float32 reference: 92.4%. int8 min-max PTQ: 86.1%. int8 KLD-calibrated: 90.0%. The 2.4 point drop is the price of int8 silicon with no FP unit.',
    content: { kind: 'Model' },
  },

  // Data Gap ─────────────────────────────────────────────────────────────────
  {
    id: 'data-gap',
    label: 'Data Gap',
    notes: 'Studio audio is not real audio. A model trained only on Google Speech Commands and dropped onto our INMP441 shows meaningful accuracy degradation. The fix had two parts: we collected real INMP441 data through our own PCB and fine-tuned on it, and we added peak normalization — every clip scaled so the loudest sample reaches 75 percent of int16 full scale, then right-shifted by 8 in firmware to land in a known int8 range. 80.7 percent on Google Speech Commands becomes 95 percent on real mic data.',
    content: {
      kind: 'Model',
      eyebrow: 'Studio audio is not real audio',
      title: 'The model holds up when the audio gets real.',
      sources: [
        { head: 'Source A', lede: 'Google Speech Commands',     body: 'Clean, studio-quality. Consistent levels. Headset and high-quality mic captures.' },
        { head: 'Source B', lede: 'Our INMP441 on our PCB',     body: 'Real noise floor. MEMS frequency response. Real dynamic range. Real environment.' },
      ],
      bodyHTML: 'Two things kept the accuracy from collapsing on real-world audio: <strong style="color: var(--ink);">(1)</strong> we collected our own INMP441 dataset through our PCB and fine-tuned on it; <strong style="color: var(--ink);">(2)</strong> peak normalization — every clip scaled so its loudest sample reaches 75 % of int16 full scale, then right-shifted by 8 in firmware to land in a known int8 range. The hardware constraint, made visible inside the training pipeline.',
      gscLabel: 'Google Speech Commands',
      gscValue: '90 %',
      arrowLabel: 'no degradation',
      micLabel: 'Real INMP441 mic data',
      micValue: '90 %',
    },
  },

  // Live Inference ───────────────────────────────────────────────────────────
  {
    id: 'live-inference',
    label: 'Live Inference',
    notes: 'kws_nnom_main is the test harness. kws_bare_main is the real system. Mic into I²S RX FIFO; ISR triggers on half-full; ping-pong buffers — one fills while the other is being processed; Conv1D accel plus NNoM model; DETECT on UART. Inference must complete before the other buffer fills. At 30 milliseconds end-to-end, we have ~970 milliseconds of margin per second of audio. Comfortably real-time.',
    content: {
      kind: 'Firmware',
      eyebrow: 'kws_bare_main.c',
      title: 'Live inference on streaming audio.',
      pipeStart: [
        { label: 'INMP441 mic', sub: 'I²S MEMS' },
        { label: 'I²S RX FIFO', sub: 'peris/i2s' },
        { label: 'ISR',         sub: 'half-full trigger' },
      ],
      buffers: [
        { label: 'Buffer A · fill',    variant: 'accent' },
        { label: 'Buffer B · process', variant: 'dashed' },
      ],
      pipeEnd: { labelHTML: 'Conv1D accel<br/>+ NNoM model', sub: '→ DETECT on UART' },
      pingpong: '↻ ping-pong: A and B alternate roles every half-second',
      bodyHTML: '<span class="mono">kws_nnom_main</span> is the test harness. <span class="mono">kws_bare_main</span> is the real system. The constraint that closes the loop: inference must complete before the other buffer fills.',
      callout: 'At 30 ms end-to-end, we have ~970 ms of margin per second of audio. Comfortably real-time.',
    },
  },

  // Pivot · Accelerator ──────────────────────────────────────────────────────
  {
    id: 'pivot-accelerator',
    label: 'Pivot · Accelerator',
    notes: 'Pivot. On software, the first Conv1D layer is the overwhelming majority of inference time. It is also the cleanest target for dedicated logic. We designed the model knowing we would build the accelerator for it.',
    content: {
      num: 'Pivot · II → III',
      bodyMain: 'On software, the first Conv1D layer is the overwhelming majority of inference time. It is also the cleanest target for dedicated logic. ',
      bodyEm: 'We designed the model knowing we would build the accelerator for it.',
    },
  },

  // Accelerator Architecture ─────────────────────────────────────────────────
  {
    id: 'accelerator-architecture',
    label: 'Accelerator Architecture',
    notes: 'Conv1D accelerator. Configured over APB; fetches its own data over AHB-Lite. Seven config registers on the left. Three AHBL data paths on the right — weights from XIP flash, inputs from SRAM, outputs to SRAM. Inside, a 4-MAC int8 datapath into a 32-bit accumulator, bias add, per-channel right-shift, saturate to int8.',
    content: {
      kind: 'Accelerator',
      eyebrow: 'peris/conv1d_accel',
      title: 'Configured over APB. Fetches its own data over AHBL.',
      apbTag: 'APB · control surface',
      apbLabel: '7 config registers',
      apbSub: 'CTRL · CFG0/1 · address pointers',
      apbArrow: 'CPU writes →',
      coreTitle: 'Conv1D Accelerator',
      coreSteps: [
        '4 × int8 MAC',
        '→ 32-bit accumulator',
        '→ bias add',
        '→ per-channel right-shift',
        '→ saturate to int8',
      ],
      ahbTag: 'AHBL · bus master',
      ahbPaths: [
        { label: '⇒ weights', sub: 'XIP flash · 0x80000000' },
        { label: '⇒ inputs',  sub: 'SRAM · 0x00000000' },
        { label: '⇒ outputs', sub: 'SRAM' },
      ],
      footer: 'Configuration on APB. Data movement on AHBL. Four MACs per cycle, int8 in, int8 out.',
    },
  },

  // Register Map ─────────────────────────────────────────────────────────────
  {
    id: 'register-map',
    label: 'Register Map',
    notes: "Register map. The 7 registers sit at APB offsets — the CPU writes them. But what they hold are addresses into AHBL — pointers the accelerator dereferences itself. That's why it has to be an AHBL master, not a passive APB slave.",
    content: {
      kind: 'Accelerator',
      eyebrow: 'APB base · 0x4000_C000',
      title: 'The accelerator lives on two buses.',
      subtitleHTML: '7 registers at APB offsets — but what they hold are <em>addresses into AHBL</em>.',
      headers: [
        { label: 'Off',                  width: 120 },
        { label: 'Register',             width: 240 },
        { label: 'Holds',                width: 380 },
        { label: 'Resolves to (AHBL)' },
      ],
      rows: [
        [{ cls: 'addr', html: '0x00' }, { cls: 'name', html: 'CTRL' },        { cls: 'desc', html: 'start / busy / done' },         { cls: 'desc', html: '—' }],
        [{ cls: 'addr', html: '0x04' }, { cls: 'name', html: 'SRC_ADDR' },    { cls: 'desc', html: 'input pointer' },                { cls: 'desc', html: 'SRAM' }],
        [{ cls: 'addr', html: '0x08' }, { cls: 'name', html: 'WT_ADDR' },     { cls: 'desc', html: 'weight pointer' },               { cls: 'desc', html: 'XIP flash or SRAM' }],
        [{ cls: 'addr', html: '0x0C' }, { cls: 'name', html: 'DST_ADDR' },    { cls: 'desc', html: 'output pointer' },               { cls: 'desc', html: 'SRAM' }],
        [{ cls: 'addr', html: '0x10' }, { cls: 'name', html: 'BS_ADDR' },     { cls: 'desc', html: 'bias pointer' },                 { cls: 'desc', html: 'SRAM' }],
        [{ cls: 'addr', html: '0x14' }, { cls: 'name', html: 'CFG0' },        { cls: 'desc', html: 'C_in · C_out · K_w · stride' },  { cls: 'desc', html: '—' }],
        [{ cls: 'addr', html: '0x18' }, { cls: 'name', html: 'CFG1' },        { cls: 'desc', html: 'W_in' },                          { cls: 'desc', html: '—' }],
        [{ cls: 'addr', html: '0x20' }, { cls: 'name', html: 'SHIFT_ADDR' },  { cls: 'desc', html: 'per-channel shift pointer' },    { cls: 'desc', html: 'SRAM' }],
      ],
    },
  },

  // Three Decisions ──────────────────────────────────────────────────────────
  {
    id: 'three-decisions',
    label: 'Three Decisions',
    notes: "Three load-bearing decisions. Loop order — C_out outer, W_out inner — avoids reloading 515 kilobytes of weights from XIP per output position. Mixed HSIZE — byte for unaligned weights, word for aligned inputs — gives 4× input bandwidth. The r_wait skip cycle handles the registered output of synchronous SRAM and the XIP cache. Each decision came from understanding the model's memory layout and the AHBL timing protocol simultaneously.",
    content: {
      kind: 'Accelerator',
      eyebrow: 'Three load-bearing decisions',
      title: 'What made it work.',
      decisions: [
        {
          head: '01 · Loop order',
          lede: 'C_out outer, W_out inner',
          body: 'W_out-outer reloaded all weights from XIP per output position — 515 KB of redundant flash reads on a 1 KB cache. C_out-outer loads each filter once, sweeps all output positions.',
        },
        {
          head: '02 · Mixed HSIZE',
          lede: 'BYTE for weights · WORD for inputs',
          body: "NNoM filter offsets aren't word-aligned; byte reads with lane extraction are always correct. Inputs in SRAM are aligned — WORD gives 4× bandwidth.",
        },
        {
          head: '03 · r_wait skip-cycle',
          lede: 'Registered HRDATA',
          body: 'SRAM and the XIP cache register their output. Without the skip cycle, the first byte of every burst captures stale HRDATA from the previous transaction.',
        },
      ],
      footer: "Each decision came from understanding both the model's memory layout and the AHBL timing protocol simultaneously.",
    },
  },

  // XIP Cache Optimizations ─────────────────────────────────────────────────
  {
    id: 'xip-cache',
    label: 'XIP Cache · CWF',
    notes: 'A closer look at one of the biggest software wins. All firmware and accelerator weights live in QSPI flash at 0x8000_0000. Without a cache, every fetch pays the full QSPI miss penalty — about 150 cycles per 32-byte line. We sit a read-only direct-mapped 8 KB cache between the AHB-Lite bus and the flash: four masters share it — CPU instruction port, CPU data port, DMAC, and the conv1D accelerator. The flash side runs Quad-IO Read for 4× throughput, and reports a per-word ready bitmap back to the cache — that bitmap is what enables Critical-Word-First. CWF releases the bus the instant the requested word lands instead of waiting for the whole line. Two correctness fixes are mandatory: a stale-bit filter that latches only the rising edges of word_done so a second miss does not republish the previous fetch, and a deferred-miss rescue that catches a parked CPU data phase so a new miss issued during background fill does not deadlock the bus. Measured: −1.23 percent CYCLES_INFER on mel_compact_4blk_ch36; −34 percent stall on the standalone testbench across non-zero word offsets.',
    content: {
      kind: 'Optimization',
      eyebrow: 'XIP cache · ro_cache.v',
      title: 'Critical-Word-First cache, four masters, one flash.',
      // Step 0 — cache topology + spec
      masters: [
        { name: 'CPU · I-port',  sub: 'instruction fetch' },
        { name: 'CPU · D-port',  sub: 'data load/store' },
        { name: 'DMAC',          sub: 'I²S → SRAM' },
        { name: 'conv1d_accel',  sub: 'weights/inputs' },
      ],
      cacheSpec: [
        { v: '8 KB',          l: 'Total · 256 lines' },
        { v: '32 B',          l: 'Line size · 8 words' },
        { v: 'Direct-map',    l: 'RO · 4 masters' },
        { v: 'Quad-IO 0xEB',  l: '4× SCK throughput' },
      ],
      flashNote: 'Per-word ready bitmap word_done[7:0] — bit K rises when word K lands.',
      // Step 1 — Critical-Word-First timeline
      cwfHeading: 'Critical-Word-First / Early Restart',
      cwfSub: 'Return the requested word the moment it lands; finish the line in background.',
      timeline: [
        { w: 'w0', t: 10 },
        { w: 'w1', t: 20 },
        { w: 'w2', t: 32, requested: true },
        { w: 'w3', t: 44 },
        { w: 'w4', t: 56 },
        { w: 'w5', t: 68 },
        { w: 'w6', t: 76 },
        { w: 'w7', t: 84 },
      ],
      compare: [
        { kind: 'naive', cyc: 84, label: 'Naive cache',
          body: 'bus stalled until t = 84 (full-line fill)' },
        { kind: 'cwf',   cyc: 32, label: 'CWF cache',
          body: 'bus released at t = 32 — 52 cyc earlier · remaining words finish in background' },
      ],
      fixes: [
        {
          tag: 'Fix 01',
          head: 'Stale-bit filter',
          body: 'word_done is level — bits stay high after each word lands and only clear on the next start (~3 cyc later).',
          fix:  'Latch fwv[7:0]; reset on miss-entry; OR-accumulate only the rising edges of word_done.',
        },
        {
          tag: 'Fix 02',
          head: 'Deferred-miss rescue',
          body: 'CWF early-restart hands the bus back mid-fetch — CPU may issue a NEW miss before the FSM is back to IDLE.',
          fix:  'When the fetch finishes, check the parked data phase (cpu_dvalid && !dhit) and start the next miss.',
        },
      ],
      results: [
        { v: '−1.23 %', l: 'CYCLES_INFER · mel_compact_4blk_ch36' },
        { v: '−34 %',   l: 'Stall · standalone TB · non-zero offsets' },
      ],
    },
  },

  // XIP Prefetch — adopted vs rejected ─────────────────────────────────────
  {
    id: 'xip-prefetch',
    label: 'XIP Prefetch · Adopted vs Rejected',
    notes: "Prefetch story. We tried the textbook chained next-line prefetch — on every demand miss, also pull line+1 into the main cache. The standalone testbench passed, but end-to-end every cache size regressed: nine percent slower at NL=256, forty-six percent slower at NL=64. Mechanism: prefetch evicts a hot line on every miss, the CPU then misses on the evicted line, that triggers another prefetch, eviction cascade. We reverted that. The version we adopted is gated and default off: NNoM-aware prefetch. The accelerator knows each Conv1D call's weight base and length the moment it starts. PREFETCH_BASE, PREFETCH_LEN, PREFETCH_CTRL.EN — when the firmware pulses EN, a side-band into ro_dmc triggers the next weight line into a separate victim buffer that cannot evict the main cache. MVP fetches first line per call: minus 1.29 percent CYCLES_INFER.",
    content: {
      kind: 'Optimization',
      eyebrow: 'XIP prefetch · ro_dmc + conv1d_accel APB',
      title: 'Prefetch — naive vs NNoM-aware.',
    },
  },

  // Optimization Journey ─────────────────────────────────────────────────────
  {
    id: 'optimization-journey',
    label: 'Optimization Journey',
    notes: 'The optimization journey. Eight measured points, log scale. Mel front-end at 6.3. Add DMA and unroll, then compiler optimizations, then XIP cache optimizations — that drops us from 15.6 seconds to about one second on software alone. Then the accelerator lands and we\'re at 70 milliseconds. Int8 weights drop us to 38 milliseconds. Conv1D double-buffering — overlapping weight fetch with compute — gets us to 30. End-to-end, 5.43 seconds to 30 milliseconds. Roughly 180×.',
    content: {
      kind: 'Results',
      eyebrow: 'Measured · csrr mcycle in Verilator',
      title: 'From 3.0s seconds to 30 milliseconds.',
      stats: [
        { value: '3.0s → 30 ms',  label: 'End-to-end',              size: 56 },
        { value: '~1000×',           label: 'Speedup',                 size: 56 },
        { value: '10 / 11 clips',   label: 'Matches SW baseline',     size: 44 },
        { value: '90 %',            label: 'INMP441 mic accuracy',    size: 56 },
      ],
    },
  },

  // What We Built ────────────────────────────────────────────────────────────
  {
    id: 'what-we-built',
    label: 'What We Built',
    notes: 'What we built. Every layer owned, every layer verified. Custom PCB, INMP441, I²S RX, ping-pong firmware, mel-compact int8 model, Conv1D accelerator, DETECT output. 180× speedup, 30 ms inference, 95 percent mic accuracy, 100 percent open source. Open for questions.',
    content: {
      brand: 'InitRamFS · KWS-SoC',
      // defenseTagSuffix is appended after the auto-derived "NN / NN" prefix.
      defenseTagSuffix: '· Results · Questions',
      eyebrow: 'What we built',
      titleLineOne: 'First fully open',
      titleLineTwo: 'RISC-V KWS SoC.',
      stack: [
        { num: '07', label: 'DETECT output',           accent: true },
        { num: '06', label: 'Conv1D HW accelerator' },
        { num: '05', label: 'Mel-compact int8 model' },
        { num: '04', label: 'Ping-pong firmware' },
        { num: '03', label: 'I²S RX peripheral' },
        { num: '02', label: 'INMP441 microphone' },
        { num: '01', label: 'Custom PCB' },
      ],
      stats: [
        { label: 'Speedup',      value: '180×',  accent: true },
        { label: 'Inference',    value: '30 ms' },
        { label: 'Mic accuracy', value: '95 %' },
        { label: 'Open source',  value: '100 %' },
      ],
    },
  },
];

export const getSlide = (id) => slides.find((s) => s.id === id);
