import { useState, useEffect, useRef } from 'react';

function useTooltipNecessity(observeResize = true) {
  const elementRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const checkTooltipNecessity = () => {
      if (elementRef.current) {
        const isOverflowing =
          elementRef.current.offsetHeight < elementRef.current.scrollHeight ||
          elementRef.current.offsetWidth < elementRef.current.scrollWidth;
        setShowTooltip(isOverflowing);
      }
    };
    checkTooltipNecessity();

    if (observeResize) {
      const resizeObserver = new ResizeObserver(checkTooltipNecessity);

      const currentElement = elementRef.current;

      if (currentElement) {
        resizeObserver.observe(currentElement);
      }

      return () => {
        if (currentElement) {
          resizeObserver.unobserve(currentElement);
        }
      };
    }

    return () => {};
  }, [observeResize]);

  return [elementRef, showTooltip];
}

export default useTooltipNecessity;
