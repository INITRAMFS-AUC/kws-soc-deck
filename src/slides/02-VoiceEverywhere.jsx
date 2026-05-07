import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('02-voice').content;

export default function VoiceEverywhere() {
  return (
    <SlideFrame label="02 Voice Everywhere" topLeft={c.topLeft} bottomRight={c.pgnum}>
      <div style={{ marginTop: 60 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ fontSize: 96, maxWidth: 1500, marginBottom: 60 }}>
          {c.title}
        </h1>
      </div>
      <p className="body" style={{ maxWidth: 1500, fontSize: 36, lineHeight: 1.4 }}
         dangerouslySetInnerHTML={{ __html: c.bodyHTML }} />
    </SlideFrame>
  );
}
