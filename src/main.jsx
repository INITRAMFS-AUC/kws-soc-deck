import { createRoot } from 'react-dom/client';
import './styles.css';
import { slides } from './content.js';
import { slideComponents } from './slides/index.js';

const notes = document.createElement('script');
notes.type = 'application/json';
notes.id = 'speaker-notes';
notes.textContent = JSON.stringify(slides.map((s) => s.notes ?? ''));
document.head.appendChild(notes);

function Deck() {
  return (
    <deck-stage width="1920" height="1080">
      {slideComponents.map((Slide, i) => <Slide key={i} />)}
    </deck-stage>
  );
}

import('./deck-stage.js').then(() => {
  createRoot(document.getElementById('root')).render(<Deck />);
});
