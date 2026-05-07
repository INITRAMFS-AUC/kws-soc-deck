import { createRoot } from 'react-dom/client';
import './styles.css';
import { slides } from './content.js';
import { slideComponents } from './slides/index.js';
import { SlideMetaContext } from './slide-meta.js';

const notes = document.createElement('script');
notes.type = 'application/json';
notes.id = 'speaker-notes';
notes.textContent = JSON.stringify(slides.map((s) => s.notes ?? ''));
document.head.appendChild(notes);

function Deck() {
  const total = slideComponents.length;
  return (
    <deck-stage width="1920" height="1080">
      {slideComponents.map((Slide, i) => (
        <SlideMetaContext.Provider
          key={i}
          value={{ num: i + 1, total, slide: slides[i] }}
        >
          <Slide />
        </SlideMetaContext.Provider>
      ))}
    </deck-stage>
  );
}

import('./deck-stage.js').then(() => {
  createRoot(document.getElementById('root')).render(<Deck />);
});
