import { useState, useCallback } from 'react';

export function useTweaks(defaults) {
  const [values, setValues] = useState(defaults);
  const setTweak = useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    if (typeof window !== 'undefined') {
      try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*'); } catch {}
      window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
    }
  }, []);
  return [values, setTweak];
}
