// ─────────────────────────────────────────────────────────────────────────────
// content.js — single source of truth for every word on every slide.
//
// Edit any string here and the slide updates. Vite HMR keeps the deck on the
// current slide while you iterate. Speaker notes live alongside their slide.
//
// Schema:
//   slides: Array<{
//     id:      string         // stable, kebab-case
//     label:   string         // matches data-label on the <section>
//     notes:   string         // shown in deck-stage's notes panel
//     content: object         // slide-specific copy, shape depends on slide
//   }>
// ─────────────────────────────────────────────────────────────────────────────

export const slides = [
  // 01 ────────────────────────────────────────────────────────────────────────
  {
    id: '01-cover',
    label: '01 Cover',
    notes: "Good morning. I'm here to defend KWS-SoC — a fully custom keyword-spotting system on chip, built from RTL up. Open RISC-V core, accelerator we designed ourselves, model trained against the exact numerical pipeline the firmware runs, and a custom PCB underneath it all.",
    content: {
      brand: 'InitRamFS · KWS-SoC',
      defenseTag: 'Thesis Defense · 2026',
      eyebrow: 'Keyword spotting on a custom RISC-V SoC',
      displayLeft: 'KWS-SoC',
      displayAccent: '.',
      meta: [
        { label: 'Repo',  value: 'github.com/INITRAMFS-AUC/KWS-SoC', mono: true },
        { label: 'Stack', value: 'Hazard3 · NNoM int8 · Conv1D accel · Custom PCB' },
      ],
    },
  },

  // 02 ────────────────────────────────────────────────────────────────────────
  {
    id: '02-voice',
    label: '02 Voice Everywhere',
    notes: 'Before the technical detail, why anyone should care. Voice is the dominant emerging interface — phones, earbuds, smart speakers, cars, appliances. Behind every one of those interfaces is a tiny always-on classifier called keyword spotting.',
    content: {
      topLeft: '02 · Context',
      eyebrow: '"Hey Siri."\u00A0\u00A0"OK Google."\u00A0\u00A0"Alexa."',
      title: 'Voice command interfaces are everywhere.',
      bodyHTML: 'Phones. Earbuds. Smart speakers. Cars. Appliances. Behind every one of those interfaces is a tiny always-on classifier called <span style="color: var(--accent); font-weight: 500;">keyword spotting</span> — and it has to run within milliwatts, on kilobytes of memory, every second of every day.',
      pgnum: '02 / 21',
    },
  },

  // 03 ────────────────────────────────────────────────────────────────────────
  {
    id: '03-commercial-reality',
    label: '03 Commercial Reality',
    notes: "Today's KWS lives in two tiers. Tier one is purpose-built silicon — Syntiant's NDP series, dedicated wake-word chips. Ultra-low power, but proprietary, closed toolchains, locked to vendor frameworks. Tier two is general-purpose MCUs running quantized models through vendor stacks like X-CUBE-AI or eIQ. Familiar, but the chip is still a black box you deploy onto. Either way, you adapt your model to the chip — you don't co-design them. Nobody has built a fully open, end-to-end KWS system from the silicon up.",
    content: {
      topLeft: '03 · Context',
      eyebrow: 'Status quo',
      title: 'Two tiers, one problem.',
      tiers: [
        {
          head: 'Tier 01',
          lede: 'Purpose-built silicon',
          body: 'Syntiant NDP series, dedicated wake-word chips. Ultra-low power — proprietary, closed toolchains, locked to vendor frameworks.',
        },
        {
          head: 'Tier 02',
          lede: 'General-purpose MCUs',
          body: 'STM32, NXP, Nordic running quantized models through X-CUBE-AI, eIQ, and friends. Familiar — but the chip is still a black box you deploy onto.',
        },
      ],
      pull: "You adapt your model to the chip. You don't co-design them.",
      thesis: 'Nobody has built a fully open, end-to-end KWS system from the silicon up.',
      pgnum: '03 / 21',
    },
  },

  // 04 ────────────────────────────────────────────────────────────────────────
  {
    id: '04-we-did',
    label: '04 We Did',
    notes: 'We did. KWS-SoC is the first fully open RISC-V SoC built specifically for keyword spotting inference. Open core, custom accelerator, model trained knowing the hardware, custom PCB, single open toolchain. We didn\'t adapt a model to fit a chip — we built the chip to fit the model.',
    content: {
      topLeft: '04 · Thesis',
      eyebrow: 'KWS-SoC',
      title: 'The first fully open RISC-V SoC built specifically for keyword spotting inference.',
      pillars: [
        { head: '01', lede: 'Open RISC-V core',     body: 'Hazard3, formally re-verified after our edits.' },
        { head: '02', lede: 'Custom Conv1D accel',  body: 'RTL we designed and verified end-to-end.' },
        { head: '03', lede: 'HW-aware model',       body: 'Trained knowing exactly what the chip would do.' },
        { head: '04', lede: 'Custom PCB',           body: "Fabricated when the dev board wasn't enough." },
        { head: '05', lede: 'One open toolchain',   body: 'Nix, Verilator, Yosys, OpenOCD, GDB.' },
      ],
      callout: "We didn't adapt a model to fit a chip. We built the chip to fit the model.",
      pgnum: '04 / 21',
    },
  },

  // 05 ────────────────────────────────────────────────────────────────────────
  {
    id: '05-constraints',
    label: '05 Constraints',
    notes: 'Three constraints frame the work. Hazard3 RV32IMAC at 36 megahertz with no FPU. A 64-kilobyte SRAM budget. And an open toolchain — Nix, Verilator, Yosys, OpenOCD, GDB — reproducible from source.',
    content: {
      topLeft: '05 · Framing',
      eyebrow: 'The arena',
      title: 'Always-on keyword spotting in kilobytes.',
      subtitle: 'Real deployment-class constraints — not relaxed research targets.',
      constraints: [
        { head: 'Constraint · 01', lede: 'RV32IMAC, no FPU',  body: 'Hazard3 core at 36 MHz. All math integer-only — int8 / int32.' },
        { head: 'Constraint · 02', lede: '64 KB SRAM budget', body: 'NNoM static buffer fits inside this; weights live in XIP flash.' },
        { head: 'Constraint · 03', lede: 'Open toolchain',    body: 'Nix · Verilator · Yosys · OpenOCD · GDB — reproducible from source.' },
      ],
      pgnum: '05 / 21',
    },
  },

  // 06 ────────────────────────────────────────────────────────────────────────
  {
    id: '06-soc',
    label: '06 SoC Architecture',
    notes: 'The SoC. Hazard3 sits on an AHB-Lite system bus alongside SRAM, Conv1D accelerator memmory transfer interface, QSPI XIP flash. APB hangs off a bridge for the slow peripherals — UART, RISC-V timer, I²S receiver, and the Conv1D config at 0x4000_C000. Every block is either open-source code we audited or RTL we wrote.',
    content: {
      topLeft: '06 · Hardware',
      eyebrow: 'kws_soc.v',
      title: 'SoC block diagram',
      rowOne: [
        { label: 'Hazard3 Core', sub: 'RV32IMAC · 36 MHz · i+d ports' },
        { label: 'JTAG DTM',     sub: 'hazard3_dm + DTM', style: { width: 269, margin: '0 0 0 -18px' } },
        { label: 'SRAM',         sub: 'ahb_sync_sram · 64 KB', style: { width: 769 } },
        { label: 'QSPI XIP cache', sub: 'peris/xip · ro_cache.v', variant: 'accent' },
      ],
      bus: 'AHB-Lite system bus · 32-bit · busfabric/',
      busHint: 'press → to expand',
      rowTwo: [
        { label: 'Conv1D Accel core', sub: 'peris/conv1d_accel · AHBL master', variant: 'accent' },
        { label: 'DMA Master/Slave',  sub: 'peris/dma · AHBL master + APB slave', variant: 'accent-light' },
        { label: 'APB bridge',        sub: 'AHBL → APB · control + status' },
      ],
      peripherals: [
        { label: 'Conv1D config', sub: '0x4000_C000 · 7 regs', variant: 'accent' },
        { label: 'I²S RX + FIFO', sub: 'peris/i2s · INMP441',  variant: 'accent' },
        { label: 'UART',          sub: 'libfpga · 115200 8N1' },
        { label: 'RV Timer',      sub: 'mtime / mtimecmp' },
      ],
      footer: 'Every block is either open-source code we audited or RTL we wrote.',
      crossbarFooter: 'A partial crossbar — eight of twelve possible master→slave paths — is the right tradeoff between silicon area and the flexibility of a full mesh.',
      pgnum: '06 / 21',
    },
  },

  // 07 ────────────────────────────────────────────────────────────────────────
  {
    id: '07-memory-map',
    label: '07 Memory Map',
    notes: 'The memory map is the contract between hardware and firmware. SRAM at zero, peripherals at 0x4000_xxxx, XIP flash, DMA and Conv1D on AHBL BUS.',
    content: {
      topLeft: '07 · Hardware',
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
      pgnum: '07 / 21',
    },
  },

  // 08 ────────────────────────────────────────────────────────────────────────
  {
    id: '08-verification',
    label: '08 Verification',
    notes: 'Verification has three rungs and the same firmware binary runs on all three. cxxrtl gives a fast C++ simulation with a JTAG bit-bang wrapper. Verilator catches what cxxrtl misses — internally generated clocks like the I²S SCK. The DE10-Standard is the final rung. Each had to pass before the next design decision was committed.',
    content: {
      topLeft: '08 · Hardware',
      eyebrow: 'Three rungs of confidence',
      title: 'Same binary on all three.',
      rungs: [
        { head: 'Rung 01 · cxxrtl',        lede: 'RTL → C++ sim',  bodyHTML: 'JTAG bit-bang wrapper. <span class="mono">make sim</span>. OpenOCD &amp; GDB connect as if it were silicon.' },
        { head: 'Rung 02 · Verilator',     lede: 'Cycle-accurate', bodyHTML: 'Catches what cxxrtl misses — internally generated <span class="mono">sck</span>, where edge-detection variables cache before <span class="mono">.next</span> register values update.' },
        { head: 'Rung 03 · DE10-Standard', lede: 'Cyclone V FPGA', bodyHTML: 'Same firmware binary, no changes. The final rung before silicon.' },
      ],
      footer: 'Each rung is closer to real silicon. Each had to pass before the next design decision was committed.',
      pgnum: '08 / 21',
    },
  },

  // 09 ────────────────────────────────────────────────────────────────────────
  {
    id: '09-pcb',
    label: '09 PCB',
    notes: 'Real hardware, real noise. When we connected the INMP441 to the DE10\'s GPIO header, the I²S signal was corrupted by power-rail noise. The mic data was wrong. You cannot retrain your way out of physics. So we designed a custom PCB — proper decoupling, clean ground plane, INMP441 correctly housed. When the hardware fails you, you fix the hardware. That\'s what full-stack ownership buys you.',
    content: {
      topLeft: '09 · Hardware',
      eyebrow: 'Real hardware, real noise',
      title: 'We designed and fabricated our own board.',
      bodyOneHTML: 'The INMP441 on the DE10-Standard\'s GPIO header was corrupted by power-rail noise. The mic data was wrong. <strong style="color: var(--ink);">You cannot retrain your way out of physics.</strong>',
      bodyTwo: 'So we designed a custom PCB — proper decoupling, clean ground plane, INMP441 correctly housed. The result: a clean I²S signal and the path to 95 % accuracy on real mic data.',
      callout: 'When the hardware fails you, you fix the hardware.',
      imageSrc: '/assets/pcb.svg',
      imageAlt: 'KWS-SoC custom PCB schematic',
      pgnum: '09 / 21',
    },
  },

  // 10 ────────────────────────────────────────────────────────────────────────
  {
    id: '10-pivot-model',
    label: '10 Pivot · Model',
    notes: 'Pivot. The SoC exists to run one thing. Here\'s how we designed that thing to fit it — and why we started from sound itself.',
    content: {
      num: 'Pivot · I → II',
      bodyMain: "The SoC exists to run one thing. Here's how we designed that thing to fit it — and ",
      bodyEm: 'why we started from sound itself.',
      pgnum: '10 / 21',
    },
  },

  // 11 ────────────────────────────────────────────────────────────────────────
  {
    id: '11-the-model',
    label: '11 The Model',
    notes: "Mel-aware Conv1D, directly on the waveform. We don't use a fixed MFCC front-end because a fixed front-end is preprocessing the accelerator can't touch. Our learnable Conv1D learns the spectral decomposition itself — and becomes hardware-friendly because it's just a tensor operation. The first Conv1D layer dominates compute. That's by design — it becomes the accelerator target.",
    content: {
      topLeft: '11 · Model',
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
      pgnum: '11 / 21',
    },
  },

  // 12 ────────────────────────────────────────────────────────────────────────
  {
    id: '12-architecture-detail',
    label: '12 Architecture Detail',
    notes: 'The architecture in detail. 8000 int8 samples in. Conv1D mel front-end with 16 filters, kernel 65, stride 16. Four DS-CNN blocks. Global average pool. Dense head, eleven classes out.',
    content: {
      topLeft: '12 · Model',
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
      pgnum: '12 / 21',
    },
  },

  // 13 ────────────────────────────────────────────────────────────────────────
  {
    id: '13-training',
    label: '13 Training Closed Loop',
    notes: 'Closed-loop training. The model is trained on what the firmware will give it. Dtype-aware augmentation — same script trains float32, int16, int8, with noise calibrated per dtype. NNoM export gives us a weights.h linked into the harness. One harness, two targets — same C source on host and on SoC.',
    content: {
      topLeft: '13 · Model',
      eyebrow: 'Closed-loop training',
      title: 'Trained on what the firmware will give it.',
      pillars: [
        { head: '01 · Dtype-aware aug', lede: 'float32 · int16 · int8', bodyHTML: 'Same script trains all three. Random gain (30 %), time-shift (40 %), additive noise calibrated per dtype.' },
        { head: '02 · NNoM export',     lede: 'Keras → weights.h',      bodyHTML: '<span class="mono">nnom_generate_model</span> → linked into <span class="mono">kws_nnom_main.c</span> → cross-compiled for RV32IMAC.' },
        { head: '03 · One harness',     lede: 'Two targets',            bodyHTML: 'Same C source on host and on SoC. Identical inference results, different execution environments.' },
      ],
      footer: "If the firmware does a thing, the trainer simulates it. That's how we avoid the sim-to-real gap most KWS projects hit.",
      pgnum: '13 / 21',
    },
  },

  // 14 ────────────────────────────────────────────────────────────────────────
  {
    id: '14-data-gap',
    label: '14 Data Gap',
    notes: 'Studio audio is not real audio. A model trained only on Google Speech Commands and dropped onto our INMP441 shows meaningful accuracy degradation. The fix had two parts: we collected real INMP441 data through our own PCB and fine-tuned on it, and we added peak normalization — every clip scaled so the loudest sample reaches 75 percent of int16 full scale, then right-shifted by 8 in firmware to land in a known int8 range. 80.7 percent on Google Speech Commands becomes 95 percent on real mic data.',
    content: {
      topLeft: '14 · Model',
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
      pgnum: '14 / 21',
    },
  },

  // 15 ────────────────────────────────────────────────────────────────────────
  {
    id: '15-live-inference',
    label: '15 Live Inference',
    notes: 'kws_nnom_main is the test harness. kws_bare_main is the real system. Mic into I²S RX FIFO; ISR triggers on half-full; ping-pong buffers — one fills while the other is being processed; Conv1D accel plus NNoM model; DETECT on UART. Inference must complete before the other buffer fills. At 30 milliseconds end-to-end, we have ~970 milliseconds of margin per second of audio. Comfortably real-time.',
    content: {
      topLeft: '15 · Firmware',
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
      pgnum: '15 / 21',
    },
  },

  // 16 ────────────────────────────────────────────────────────────────────────
  {
    id: '16-pivot-accelerator',
    label: '16 Pivot · Accelerator',
    notes: 'Pivot. On software, the first Conv1D layer is the overwhelming majority of inference time. It is also the cleanest target for dedicated logic. We designed the model knowing we would build the accelerator for it.',
    content: {
      num: 'Pivot · II → III',
      bodyMain: 'On software, the first Conv1D layer is the overwhelming majority of inference time. It is also the cleanest target for dedicated logic. ',
      bodyEm: 'We designed the model knowing we would build the accelerator for it.',
      pgnum: '16 / 21',
    },
  },

  // 17 ────────────────────────────────────────────────────────────────────────
  {
    id: '17-accelerator-architecture',
    label: '17 Accelerator Architecture',
    notes: 'Conv1D accelerator. Configured over APB; fetches its own data over AHB-Lite. Seven config registers on the left. Three AHBL data paths on the right — weights from XIP flash, inputs from SRAM, outputs to SRAM. Inside, a 4-MAC int8 datapath into a 32-bit accumulator, bias add, per-channel right-shift, saturate to int8.',
    content: {
      topLeft: '17 · Accelerator',
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
      pgnum: '17 / 21',
    },
  },

  // 18 ────────────────────────────────────────────────────────────────────────
  {
    id: '18-register-map',
    label: '18 Register Map',
    notes: "Register map. The 7 registers sit at APB offsets — the CPU writes them. But what they hold are addresses into AHBL — pointers the accelerator dereferences itself. That's why it has to be an AHBL master, not a passive APB slave.",
    content: {
      topLeft: '18 · Accelerator',
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
      pgnum: '18 / 21',
    },
  },

  // 19 ────────────────────────────────────────────────────────────────────────
  {
    id: '19-three-decisions',
    label: '19 Three Decisions',
    notes: "Three load-bearing decisions. Loop order — C_out outer, W_out inner — avoids reloading 515 kilobytes of weights from XIP per output position. Mixed HSIZE — byte for unaligned weights, word for aligned inputs — gives 4× input bandwidth. The r_wait skip cycle handles the registered output of synchronous SRAM and the XIP cache. Each decision came from understanding the model's memory layout and the AHBL timing protocol simultaneously.",
    content: {
      topLeft: '19 · Accelerator',
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
      pgnum: '19 / 21',
    },
  },

  // 20 ────────────────────────────────────────────────────────────────────────
  {
    id: '20-optimization-journey',
    label: '20 Optimization Journey',
    notes: 'The optimization journey. Eight measured points, log scale. Strided NNoM at 15.6 seconds. Mel front-end at 6.3. Add DMA and unroll, then compiler optimizations, then XIP cache optimizations — that drops us from 15.6 seconds to about one second on software alone. Then the accelerator lands and we\'re at 70 milliseconds. Int8 weights drop us to 38 milliseconds. Conv1D double-buffering — overlapping weight fetch with compute — gets us to 30. End-to-end, 5.43 seconds to 30 milliseconds. Roughly 180×.',
    content: {
      topLeft: '20 · Results',
      eyebrow: 'Measured · csrr mcycle in Verilator',
      title: 'From 15.6 seconds to 30 milliseconds.',
      stats: [
        { value: '5.43 s → 30 ms',  label: 'End-to-end',              size: 56 },
        { value: '~180×',           label: 'Speedup',                 size: 56 },
        { value: '10 / 11 clips',   label: 'Matches SW baseline',     size: 44 },
        { value: '95 %',            label: 'INMP441 mic accuracy',    size: 56 },
      ],
      pgnum: '20 / 21',
    },
  },

  // 21 ────────────────────────────────────────────────────────────────────────
  {
    id: '21-what-we-built',
    label: '21 What We Built',
    notes: 'What we built. Every layer owned, every layer verified. Custom PCB, INMP441, I²S RX, ping-pong firmware, mel-compact int8 model, Conv1D accelerator, DETECT output. 180× speedup, 30 ms inference, 95 percent mic accuracy, 100 percent open source. Open for questions.',
    content: {
      brand: 'InitRamFS · KWS-SoC',
      defenseTag: '21 / 21 · Results · Questions',
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
