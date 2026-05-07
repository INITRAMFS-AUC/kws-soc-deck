import { createContext, useContext } from 'react';

// Each slide is wrapped in a Provider by main.jsx with its 1-based position
// and the live manifest entry. SlideFrame/PivotSlide read this to derive
// data-label, top-left chrome, and the page-number footer automatically —
// adding/removing/reordering slides updates every slide's chrome for free.
export const SlideMetaContext = createContext({
  num: 1,
  total: 1,
  slide: null,
});

export function useSlideMeta() {
  return useContext(SlideMetaContext);
}

export const pad2 = (n) => String(n).padStart(2, '0');
