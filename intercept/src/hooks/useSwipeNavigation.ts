import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SwipeConfig {
  leftPath: string | null;
  rightPath: string | null;
  onNavigate?: (direction: 'left' | 'right', path: string) => void;
}

export function useSwipeNavigation({ leftPath, rightPath, onNavigate }: SwipeConfig) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [transitioningTo, setTransitioningTo] = useState<'left' | 'right' | null>(null);
  const [enteringFrom, setEnteringFrom] = useState<'left' | 'right' | null>(null);

  // Restore entry state
  useEffect(() => {
    const dir = sessionStorage.getItem('nav-direction');
    if (dir) {
      setEnteringFrom(dir as 'left' | 'right');
      sessionStorage.removeItem('nav-direction');
    }
  }, []);

  const performNavigation = (direction: 'left' | 'right', path: string) => {
    if (onNavigate) {
      onNavigate(direction, path);
    } else {
      router.push(path);
    }
  };

  const handleNavigate = (direction: 'left' | 'right', path: string) => {
    setTransitioningTo(direction);
    sessionStorage.setItem('nav-direction', direction);
    setTimeout(() => {
      performNavigation(direction, path);
    }, 450);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isSwiping = false;
    let directionDetermined = false;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = true;
      directionDetermined = false;
      
      // Reset any inline transitions for smooth dragging
      const content = container.querySelector('.magazine-content') as HTMLElement;
      if (content) content.style.transition = 'none';
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
      
      const diffX = currentX - startX;
      const diffY = currentY - startY;

      if (!directionDetermined) {
        // If scrolling vertically more than horizontally, cancel swipe gesture
        if (Math.abs(diffY) > Math.abs(diffX)) {
          isSwiping = false;
          return;
        }
        directionDetermined = true;
      }

      // Lock swipe to directions that exist
      if (diffX > 0 && !leftPath) return; // Can't swipe right to reveal left if left doesn't exist
      if (diffX < 0 && !rightPath) return; // Can't swipe left to reveal right if right doesn't exist

      // Use requestAnimationFrame for completely fluid 120fps motion
      requestAnimationFrame(() => {
        const content = container.querySelector('.magazine-content') as HTMLElement;
        const peekLeft = container.querySelector('.magazine-peek-left') as HTMLElement;
        const peekRight = container.querySelector('.magazine-peek-right') as HTMLElement;

        if (content) {
          // Drag active card: follows finger, shrinks and blurs slightly
          const scale = Math.max(0.85, 1 - Math.abs(diffX) / 1500);
          const blur = Math.min(5, Math.abs(diffX) / 50);
          content.style.transform = `translateX(${diffX}px) scale(${scale})`;
          content.style.filter = `blur(${blur}px) brightness(${scale})`;
        }

        const viewportWidth = window.innerWidth;

        if (diffX > 0 && peekLeft) {
          // Swiping right, revealing left panel
          const scale = Math.min(1, 0.9 + diffX / 1500);
          const blur = Math.max(0, 3 - diffX / 50);
          // Translate from left edge towards center
          const translate = Math.min(viewportWidth * 0.4, diffX * 0.8);
          peekLeft.style.transform = `translateX(${translate}px) scale(${scale})`;
          peekLeft.style.filter = `blur(${blur}px)`;
          peekLeft.style.opacity = `${Math.min(1, 0.5 + diffX / 200)}`;
        } else if (diffX < 0 && peekRight) {
          // Swiping left, revealing right panel
          const scale = Math.min(1, 0.9 + Math.abs(diffX) / 1500);
          const blur = Math.max(0, 3 - Math.abs(diffX) / 50);
          // Translate from right edge towards center
          const translate = Math.max(-viewportWidth * 0.4, diffX * 0.8);
          peekRight.style.transform = `translateX(${translate}px) scale(${scale})`;
          peekRight.style.filter = `blur(${blur}px)`;
          peekRight.style.opacity = `${Math.min(1, 0.5 + Math.abs(diffX) / 200)}`;
        }
      });
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isSwiping) return;
      isSwiping = false;
      const diffX = currentX - startX;

      // Threshold to trigger navigation
      const threshold = window.innerWidth * 0.25;

      const content = container.querySelector('.magazine-content') as HTMLElement;
      const peekLeft = container.querySelector('.magazine-peek-left') as HTMLElement;
      const peekRight = container.querySelector('.magazine-peek-right') as HTMLElement;

      if (diffX > threshold && leftPath) {
        // Trigger left navigation
        setTransitioningTo('left');
        sessionStorage.setItem('nav-direction', 'left');

        if (content) {
          content.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
          content.style.transform = `translateX(50%) scale(0.85)`;
          content.style.filter = `blur(6px) brightness(0.8)`;
        }
        if (peekLeft) {
          peekLeft.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
          peekLeft.style.transform = `translateX(0) scale(1)`;
          peekLeft.style.filter = `none`;
          peekLeft.style.opacity = '1';
        }

        setTimeout(() => performNavigation('left', leftPath), 450);
      } else if (diffX < -threshold && rightPath) {
        // Trigger right navigation
        setTransitioningTo('right');
        sessionStorage.setItem('nav-direction', 'right');

        if (content) {
          content.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
          content.style.transform = `translateX(-50%) scale(0.85)`;
          content.style.filter = `blur(6px) brightness(0.8)`;
        }
        if (peekRight) {
          peekRight.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
          peekRight.style.transform = `translateX(0) scale(1)`;
          peekRight.style.filter = `none`;
          peekRight.style.opacity = '1';
        }

        setTimeout(() => performNavigation('right', rightPath), 450);
      } else {
        // Snap back
        if (content) {
          content.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
          content.style.transform = '';
          content.style.filter = '';
        }
        if (peekLeft) {
          peekLeft.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
          peekLeft.style.transform = '';
          peekLeft.style.filter = '';
          peekLeft.style.opacity = '';
        }
        if (peekRight) {
          peekRight.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
          peekRight.style.transform = '';
          peekRight.style.filter = '';
          peekRight.style.opacity = '';
        }
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [leftPath, rightPath, router, onNavigate]);

  return { transitioningTo, enteringFrom, handleNavigate, containerRef };
}
