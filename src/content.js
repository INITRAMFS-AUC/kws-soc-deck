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
      // Intra-slide step between "are everywhere." and "Market Cap" — same
      // slide, second pane: smart-watch + "Start Timer." over a top-down track.
      wrist: {
        bodyHTML: 'A runner mid-set. A surgeon between cases. A driver on the freeway. The hands are already doing something — and the device that hears the wake word is the one strapped to your wrist.',
        eyebrow: '◉ Wake word, then a fixed verb',
        quote: '"Start Timer."',
        caption: '— spoken at lap&nbsp;3, 6:47&nbsp;AM',
        // Top-down running track with athletes on the lanes. Swap the
        // Unsplash ID if a different shot fits better.
        backdropUrl: 'https://images.unsplash.com/photo-1502810190503-8303352d0dd1?w=1920&q=80',
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

  // I²S Datapath ─────────────────────────────────────────────────────────────
  {
    id: 'i2s-datapath',
    label: 'I²S Datapath',
    notes: 'The microphone speaks PCM over I²S. Each int32 word is sampled and packed into four int8 lanes, then queued in the FIFO. When the FIFO crosses half-full it raises an IRQ and the DMA flushes everything into the SRAM ring — and the cycle restarts. Packing four samples per FIFO entry quadruples throughput at the cost of nothing: we already quantize to int8 for the model.',
    content: {
      kind: 'Hardware',
      eyebrow: 'PCM · pack int8 · half-full IRQ',
      title: 'PCM Audio Journey, I²S Datapath.',
      footer: 'Each int32 word is sampled into four packed int8 lanes; at half-full the FIFO fires an IRQ and the DMA flushes it into the SRAM ring.',
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
      bodyOneHTML: 'For our Design to interface with external peripheries and debuggers we were using regular Breadboards and veroboards, we suffered from signal integrity and noise issues at high frequencies, <strong>we needed to grow out of our breadboards and upgrade.</strong>',
      bodyTwo: 'So we designed a custom PCB, clean ground plane. The result: a clean I²S signal and clean clocks.',
      callout: 'When the hardware fails you, you fix the hardware.',
      imageSrc: 'assets/PCB_KICAD.png',
      imageAlt: 'KWS-SoC custom PCB KiCad layout',
      peripheralsTitle: 'External peripherals on board',
      peripheralsLede: 'The fabricated dev board breaks out the SoC to four off-chip interfaces:',
      peripherals: [
        { name: 'JTAG debug probe', detail: 'Hazard3 core debug + flash programming' },
        { name: '2 MB XIP Flash',   detail: 'QSPI memory-mapped — instructions fetched in place' },
        { name: 'INMP441 I²S mic',  detail: 'Digital MEMS microphone, 24-bit PCM stream' },
        { name: 'UART to USB',      detail: 'Console + log streaming over a single cable' },
      ],
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

  // Standard MFCC vs Our Model — five-phase walk on a single slide. ─────────
  {
    id: 'standard-mfcc',
    label: 'Standard MFCC vs Our Model',
    notes: 'Five-phase walk on one slide. P0: the industry baseline (Zhang et al., Hello Edge, 2017) — six MFCC steps at ~1.6 M ops feeding a DS-CNN body at ~5.4 M MACs. A walking data packet shows the dataflow. P1: side-by-side summary cards — ~7 M ops vs. 0.97 M MACs. P2: our model takes over with three components (Front-end · Body · Head). P3: zoom into the Front-end — 16 sinc-bandpass kernels, K=65, stride 16, 1 056 params, ~516 K MACs (53 % of total), the layer the accelerator targets. P4: zoom into the Body+Head — three plain Conv1D blocks (31×36, 15×36, 15×36), GAP → Dense 16 → Softmax 11 (yes, no, up, down, left, right, on, off, stop, go, _unknown_). Slides 12 and 13 used to host the front-end and body zooms; they are now intra-slide phases so the visual continuity is real (the Front-end / Body card grows into its detail view).',
    content: { kind: 'Model' },
  },

  // Bridge — closest related work (sinc / raw-waveform). ─────────────────────
  {
    id: 'lit-comparison',
    label: 'vs Literature',
    notes: [
      'Bridge slide — big numbers only on screen. The detail belongs in the talk.',
      '',
      'The standard-KWS comparison (DS-CNN, MobileNet on log-mel spectrograms) is already covered by slide 11. Here we narrow in on the LEARNABLE-FRONT-END family on raw audio — three closely related papers, then ours.',
      '',
      'SincNet (Ravanelli & Bengio, 2018). Sinc bandpass filters as the first conv layer; only two learnable cutoffs per filter. Built for speaker ID, runs at full waveform resolution then pools downstream. ~22 M total parameters in the standard config. Float throughout, no stride fusion, no INT8 deployment story.',
      '',
      'LEAF (Zeghidour et al., Google, 2021). Gabor filters with learnable centre/bandwidth, plus a fully learnable per-channel pooling layer (PCEN-style). Aimed at general audio understanding. ~80 K front-end parameters alone. Heavier compute and float-only — the learnable pooling is not cleanly INT8-quantisable.',
      '',
      'M5 / M11 (Dai et al., 2017). Pure 1D conv stack on raw audio — no fixed front-end at all. The model learns from scratch with K=80 first-layer kernels and 5–11 conv blocks. ~558 K parameters for M5, ~1.79 M for M11. No INT8 deployment story.',
      '',
      'Ours. Stride 16 fused into the sinc kernel — one op gives both the bandpass and the 16× downsample. Plain MaxPool, plain BN, NNoM-quantisable INT8 end-to-end. ~16 K total parameters — ~35× smaller than M5, two orders of magnitude smaller than SincNet. Built for a 36 MHz RV32IMAC. Next slide: how we score against the general KWS leaderboard.',
    ].join('\n'),
    content: { kind: 'Model' },
  },

  // vs Other Models ──────────────────────────────────────────────────────────
  {
    id: 'vs-models',
    label: 'vs Other Models',
    notes: [
      '93.5 % float on Google Speech Commands at a fraction of the parameter count. Numbers in descending accuracy order so Mel Compact lands directly under DS-CNN, our closest neighbour.',
      '',
      'MatchboxNet · Majumdar 2020 — 97.5 % · ~140 K params · 7.4 M MACs.',
      'TC-ResNet8 · Choi 2019 — 96.6 % · ~66 K params · 6.0 M MACs.',
      'DS-CNN small · Zhang 2018 — 94.4 % · ~38 K params · 5.4 M MACs.',
      'Mel Compact · ours — 93.5 % · ~16 K params · 0.97 M MACs (float baseline).',
      '',
      'Bars animate on slide entry, staggered top-down (140 ms per row, plus ~60 ms gap between accuracy/params/MACs columns within each row). Banbury TinyConv was removed — it sat far below in accuracy and added clutter without sharpening the comparison.',
      '',
      'Callouts: vs MatchboxNet 8.8× fewer params, 7.6× fewer MACs at −4.0 pts accuracy. vs DS-CNN small 2.4× fewer params, 5.6× fewer MACs at −0.9 pts accuracy. The DS-CNN delta is what to dwell on — under one accuracy point for under half the parameters.',
    ].join('\n'),
    content: { kind: 'Model' },
  },

  // Why NNoM — bridge from float training to int8-on-chip. ──────────────────
  {
    id: 'why-nnom',
    label: 'Why NNoM',
    notes: [
      'Bridge slide. The leaderboard you just saw was a float number. Everything past this slide is int8 — and there is one runtime question to answer first: what executes the network on our chip.',
      '',
      'Our SoC is a Hazard3 RV32IMAC running at 36 MHz with 64 KB of SRAM and no FPU. Three constraints: integer-only math, deterministic static memory, and a build that links straight into firmware. NNoM (Neural Network on Microcontroller) is the only embedded inference runtime that satisfies all three without ceremony.',
      '',
      'Card 1 — no FPU. Hazard3 has no float unit. Every floating-point op would be a soft-float helper call into libgcc — large, slow, hard to predict cycle-wise. NNoM does everything in int8 weights / int8 activations / int32 accumulators with power-of-2 scales, so requantization is a shift, not a divide. No idiv, no soft-float helpers, no tensor of zeros where libgcc choked.',
      '',
      'Card 2 — 64 KB SRAM, no malloc. NNoM declares all tensor buffers at compile time. We can size the static buffer once, link it, and know exactly what fits in our 64 KB SRAM. There is no "tensor arena" to grow at runtime, no fragmentation, no surprise OOM mid-inference. Weights live in XIP flash and are streamed by the cache prefetcher (slide 22).',
      '',
      'Card 3 — codegen, not interpreter. The trained Keras model goes through nnom_generate_model and out comes a single weights.h that we link straight into kws_nnom_main.c. Same C source compiles for the host (test harness) and for the SoC (firmware). Bit-identical inference both places — no "works in sim, breaks on chip".',
      '',
      'Why NNoM and not CMSIS-NN, TFLite-Micro, X-CUBE-AI? Open source, small enough that we could read every line, no Cortex-M dependencies (we are RISC-V), and we needed to patch the cache prefetcher to know about NNoM\'s exact weight layout — not something a closed runtime would let us do.',
      '',
      'Bridge to next slide: NNoM gives us the runtime. We still need to get the trained float weights into NNoM\'s int8 format — that is post-training quantization, KL-divergence calibrated, no QAT, no fine-tune. That is next.',
    ].join('\n'),
    content: { kind: 'Model' },
  },

  // Quantization ────────────────────────────────────────────────────────────
  {
    id: 'quantization',
    label: 'Quantization',
    notes: [
      'Post-training quantization, KL-divergence calibrated. 11 classes — same Mel Compact head we just walked through. No QAT, no fine-tune. Train float32, calibrate on a held-out batch of 1024 samples, ship int8.',
      '',
      'KLD threshold search: for each tensor, sweep candidate clip thresholds and pick the one that minimises D_KL between the float histogram and the requantised histogram — preserving the shape of the distribution rather than the extremes. Min-max calibration is the naive baseline: pick min and max as the int8 endpoints, which one fat outlier can hijack.',
      '',
      'GSC test top-1 numbers: float32 baseline 93.5 %. Naive int8 min-max 84.0 %. KLD-calibrated int8 90.0 %. KLD recovers ~6 pts vs naive min-max for free. Net float→int8 drop is 3.5 pts — that is the price of running on int8 silicon with no FP unit.',
      '',
      'The 90 % int8 KLD number is the same one the deployed model gets on the INMP441 mic — see next slide.',
    ].join('\n'),
    content: { kind: 'Model' },
  },

  // Data Gap ─────────────────────────────────────────────────────────────────
  {
    id: 'data-gap',
    label: 'Data Gap',
    notes: [
      'Three-phase reveal. Every accuracy on this slide is int8 — the deployed model — so the audience never confuses these numbers with the float baseline on the leaderboard slide.',
      '',
      'P0 (default view): top two panels only. Bars animate left→right. Before: GSC int8 = 90 %, INMP441 int8 = 62 %. The deployed int8 model loses 28 pts when we drop it onto a real INMP441 — distribution shift the model never saw on GSC. After: GSC int8 = 90 %, INMP441 int8 = 90 %. Same int8 weights, just calibrated to the new audio source. Zero degradation between domains.',
      '',
      'P1 (press →): two fix specimen cards fade up at the bottom. Fix 01 — peak normalization: divide every waveform by its peak absolute value before training and on device. Removes microphone gain variation. Free, no extra params, no extra ops. Fix 02 — domain fine-tuning: record ~50 utterances per class with the INMP441 through our own PCB, mix 10 % into the training set, three fine-tune epochs on the blended corpus. Int8 accuracy recovers to GSC baseline.',
      '',
      'P2 (press → again): the two fix cards cross-fade out and one wide box takes their place. We measured the INMP441\'s frequency response — flat to ±1.5 dB from 100 Hz to 4 kHz. At an 8 kHz sample rate there is no spectral distortion to fix; the two cards above patch a level shift, not a frequency-dependent one. The deeper reason the gap closes so cleanly is hardware choice — the mic is well-behaved across our band — and the fixes are mostly correcting for level, not spectrum.',
    ].join('\n'),
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
    notes: "One Conv1D layer end-to-end. CPU configures the accel over APB (7 registers), issues WFI, then halts. The accel is its own AHB-Lite master — weights from XIP flash, inputs and outputs in SRAM. MS_DMAC is uninvolved here. State machine: load weights once, then for each output position load an input patch and MAC, with ping-pong buffers overlapping the next patch's load with the current MAC. Last patch has no parallel load. Done → accel raises an IRQ, CPU wakes from WFI.",
    content: {
      kind: 'Accelerator',
      eyebrow: 'peris/conv1d_accel · end-to-end',
      title: 'One Conv1D layer, the way the RTL runs it.',
      footnote: 'MS_DMAC is uninvolved. The accel is its own AHB master — two AHB masters in this SoC, contending only on the crossbar arbiter.',
    },
  },

  // Register Map ─────────────────────────────────────────────────────────────
  {
    id: 'register-map',
    label: 'CPU vs Accelerator',
    notes: "The punchline. CPU-only baseline doing the same MAC loop scalar — load byte, load byte, mul, add, repeat — eats roughly 40 cycles per MAC on Hazard3. The accel runs four MACs per cycle and overlaps loads with computation. On the toy 8-MAC example: 960 vs 30 cycles. On the real model (mel_compact_4blk_ch36, ~5M MACs): 195M vs 4.6M cycles, 42× speedup.",
    content: {
      kind: 'Accelerator',
      eyebrow: 'CPU baseline vs accelerator',
      title: 'Same convolution. Two clocks.',
      footer: '8-MAC toy example: ~40 cycles per scalar MAC vs ~0.25 peak. Real KWS model (~5M MACs): 195M vs 4.6M cycles → 42× speedup.',
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
        { value: '~100×',           label: 'Speedup',                 size: 56 },
        { value: '10 / 11 clips',   label: 'Matches SW baseline',     size: 44 },
        { value: '90 %',            label: 'INMP441 mic accuracy',    size: 56 },
      ],
    },
  },

  // Empowerment ──────────────────────────────────────────────────────────────
  {
    id: 'empowerment',
    label: 'Empowerment',
    notes: 'Beyond the chip itself. KWS-SoC is built to be picked up by the next student, the next lab, the next community team. Three pillars: a community-deployed SoC anyone can fab, end-to-end documentation that explains every block, and a Verilator VPI we wrote on top of Hazard3 that drops simulation compile times by ~10× and lets the testbench run multithreaded. The toolchain we wished existed when we started.',
    content: {
      kind: 'Outcome',
      eyebrow: 'Beyond the chip',
      title: 'Empowerment Outcome: An Open Platform Built for Audio Inference.',
      pillars: [
        {
          tag: '01 · Community',
          head: 'Community-deployed SoC',
          body: 'Open RTL, open PCB, open firmware. Reproducible from a fresh clone — fab it, flash it, talk to it.',
        },
        {
          tag: '02 · Research here',
          head: 'Research header here',
          body: 'Research body here',
        },
        {
          tag: '03 · Toolchain',
          head: 'Hazard3 · Verilator VPI',
          body: 'A VPI shim on top of the Hazard3 SoC testbench: ~10× faster sim builds and runtime multithreading. Iteration that used to take minutes now takes seconds.',
          stats: [
            { value: '~10×',   label: 'Less Sim Compilation Time' },
            { value: '~100×',   label: 'Smaller Waveform Size, by utilizing FST format Dump' },
            { value: 'multi-threaded',  label: 'runtime threads' },
          ],
        },
      ],
      callout: 'The deliverable is not just a chip — it is a starting point.',
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
      titleLineOne: 'Fully open',
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
        { label: 'Speedup',      value: '100×',  accent: true },
        { label: 'Inference',    value: '30 ms' },
        { label: 'Mic accuracy', value: '90 %' },
        { label: 'Open source',  value: '100 %' },
      ],
    },
  },
];

export const getSlide = (id) => slides.find((s) => s.id === id);
