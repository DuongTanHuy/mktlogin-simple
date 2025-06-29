const { useState, useEffect, useRef } = require('react');

function useUndoRedoVariableUi(initialValue, setRuleset = () => {}, unSelect = () => {}) {
  const [history, setHistory] = useState([initialValue]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const elementRef = useRef();
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const initHistory = (value) => {
    setHistory([value]);
    setCurrentIndex(0);
  };

  const set = (value) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(value);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const undo = () => {
    if (canUndo) {
      unSelect(null);
      setCurrentIndex((prev) => {
        const index = Math.max(prev - 1, 0);
        setRuleset(history[index]);
        return index;
      });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const redo = () => {
    if (canRedo) {
      unSelect(null);
      setCurrentIndex((prev) => {
        const index = Math.min(prev + 1, history.length - 1);
        setRuleset(history[index]);
        return index;
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (elementRef.current?.id === 'variable-template') {
        if (event.target.nodeName !== 'INPUT') {
          if (event.ctrlKey && event.key === 'z') {
            event.preventDefault();
            undo();
          } else if (event.ctrlKey && event.key === 'y') {
            event.preventDefault();
            redo();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [redo, undo]);

  return {
    list: history,
    history: history[currentIndex],
    canUndo,
    canRedo,
    initHistory,
    set,
    undo,
    redo,
    elementRef,
  };
}

export default useUndoRedoVariableUi;
