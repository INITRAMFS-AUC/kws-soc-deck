// Ordered manifest. Slide order in the deck = order in this array.
// Slide numbering (chrome top-left + page footer + data-label) is auto-derived
// from each slide's position via SlideMetaContext (see src/slide-meta.js).
import Cover from './Cover.jsx';
import VoiceEverywhere from './VoiceEverywhere.jsx';
import KwsNlp from './KwsNlp.jsx';
import CommercialReality from './CommercialReality.jsx';
import WeDid from './WeDid.jsx';
import SocArchitecture from './SocArchitecture.jsx';
import MemoryMap from './MemoryMap.jsx';
import I2sDatapath from './I2sDatapath.jsx';
import Pcb from './Pcb.jsx';
import PivotModel from './PivotModel.jsx';
import StandardMFCC from './StandardMFCC.jsx';
import Conv1DMelFrontEnd from './Conv1DMelFrontEnd.jsx';
import ConvBodyClassifier from './ConvBodyClassifier.jsx';
import ArchitectureDetail from './ArchitectureDetail.jsx';
import LiteratureComparison from './LiteratureComparison.jsx';
import VsOtherModels from './VsOtherModels.jsx';
import Quantization from './Quantization.jsx';
import TrainingClosedLoop from './TrainingClosedLoop.jsx';
import DataGap from './DataGap.jsx';
import PivotAccelerator from './PivotAccelerator.jsx';
import AcceleratorArchitecture from './AcceleratorArchitecture.jsx';
import RegisterMap from './RegisterMap.jsx';
import ThreeDecisions from './ThreeDecisions.jsx';
import OptimizationJourney from './OptimizationJourney.jsx';
import XipCache from './XipCache.jsx';
import XipPrefetch from './XipPrefetch.jsx';
import WhatWeBuilt from './WhatWeBuilt.jsx';

export const slideComponents = [
  Cover,
  VoiceEverywhere,
  KwsNlp,
  CommercialReality,
  WeDid,
  SocArchitecture,
  MemoryMap,
  Pcb,
  I2sDatapath,
  PivotModel,
  StandardMFCC,
  Conv1DMelFrontEnd,
  ConvBodyClassifier,
  ArchitectureDetail,
  LiteratureComparison,
  VsOtherModels,
  TrainingClosedLoop,
  Quantization,
  DataGap,
  PivotAccelerator,
  AcceleratorArchitecture,
  RegisterMap,
  ThreeDecisions,
  XipCache,
  XipPrefetch,
  OptimizationJourney,
  WhatWeBuilt,
];
