/**
 * Accessibility utilities for WCAG 2.1 Level AA compliance
 */

/**
 * Skip to main content link for keyboard navigation
 */
export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 999,
        padding: '1rem',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        textDecoration: 'none',
        fontWeight: 600,
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = '0';
        e.currentTarget.style.top = '0';
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-9999px';
      }}
    >
      Skip to main content
    </a>
  );
};

/**
 * Visually hidden but screen-reader accessible text
 */
export const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </span>
  );
};

/**
 * Focus trap for modal dialogs
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>): void {
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [ref]);
}

/**
 * Announce changes to screen readers
 */
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}> = ({ children, politeness = 'polite', atomic = true }) => {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Hook for managing keyboard navigation in a list
 */
export function useKeyboardNavigation(
  items: unknown[],
  onSelect: (index: number) => void
): {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
} {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(items.length - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect(activeIndex);
          break;
      }
    },
    [activeIndex, items.length, onSelect]
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
}

/**
 * Check if color contrast meets WCAG AA standards
 */
export function checkColorContrast(foreground: string, background: string): boolean {
  // Simplified contrast check - in production use a proper contrast library
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.replace('#', ''), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;

    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return ratio >= 4.5; // WCAG AA standard for normal text
}

import React from 'react';
