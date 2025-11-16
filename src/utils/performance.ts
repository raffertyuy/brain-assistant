/**
 * Performance monitoring utilities
 * Measures page load, TTI, and interaction performance
 */

interface PerformanceMetrics {
  pageLoad: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay?: number;
}

/**
 * Measure and log performance metrics
 */
export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.measureCoreWebVitals();
  }

  /**
   * Measure Core Web Vitals (LCP, FID, CLS)
   */
  private measureCoreWebVitals(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
          this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime || 0;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported', e);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if ('processingStart' in entry && 'startTime' in entry) {
              const fidEntry = entry as PerformanceEntry & { processingStart: number };
              this.metrics.firstInputDelay = fidEntry.processingStart - entry.startTime;
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported', e);
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if ('value' in entry && !(entry as { hadRecentInput?: boolean }).hadRecentInput) {
              clsValue += (entry as { value: number }).value;
            }
          });
          this.metrics.cumulativeLayoutShift = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported', e);
      }
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      pageLoad: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      timeToInteractive: navigation ? navigation.domInteractive - navigation.fetchStart : 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: this.metrics.largestContentfulPaint || 0,
      cumulativeLayoutShift: this.metrics.cumulativeLayoutShift || 0,
      firstInputDelay: this.metrics.firstInputDelay,
    };
  }

  /**
   * Log performance metrics to console
   */
  logMetrics(): void {
    const metrics = this.getMetrics();
    console.group('Performance Metrics');
    console.log(`Page Load: ${metrics.pageLoad.toFixed(2)}ms`);
    console.log(`Time to Interactive: ${metrics.timeToInteractive.toFixed(2)}ms`);
    console.log(`First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(2)}ms`);
    console.log(`Largest Contentful Paint: ${metrics.largestContentfulPaint.toFixed(2)}ms`);
    console.log(`Cumulative Layout Shift: ${metrics.cumulativeLayoutShift.toFixed(4)}`);
    if (metrics.firstInputDelay) {
      console.log(`First Input Delay: ${metrics.firstInputDelay.toFixed(2)}ms`);
    }
    console.groupEnd();
  }

  /**
   * Check if metrics meet performance targets
   */
  checkTargets(): { passed: boolean; failures: string[] } {
    const metrics = this.getMetrics();
    const failures: string[] = [];

    // Target: Page load < 3s on 3G
    if (metrics.pageLoad > 3000) {
      failures.push(`Page load (${metrics.pageLoad.toFixed(0)}ms) exceeds 3s target`);
    }

    // Target: TTI < 5s
    if (metrics.timeToInteractive > 5000) {
      failures.push(`TTI (${metrics.timeToInteractive.toFixed(0)}ms) exceeds 5s target`);
    }

    // Target: LCP < 2.5s (Good)
    if (metrics.largestContentfulPaint > 2500) {
      failures.push(`LCP (${metrics.largestContentfulPaint.toFixed(0)}ms) exceeds 2.5s target`);
    }

    // Target: CLS < 0.1 (Good)
    if (metrics.cumulativeLayoutShift > 0.1) {
      failures.push(`CLS (${metrics.cumulativeLayoutShift.toFixed(4)}) exceeds 0.1 target`);
    }

    // Target: FID < 100ms (Good)
    if (metrics.firstInputDelay && metrics.firstInputDelay > 100) {
      failures.push(`FID (${metrics.firstInputDelay.toFixed(0)}ms) exceeds 100ms target`);
    }

    return { passed: failures.length === 0, failures };
  }

  /**
   * Measure drag-and-drop FPS
   */
  measureDragFPS(callback: (fps: number) => void): () => void {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        callback(fps);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFrame);
    };

    animationId = requestAnimationFrame(measureFrame);

    return () => cancelAnimationFrame(animationId);
  }

  /**
   * Clean up observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Create and initialize performance monitor
 */
export function initPerformanceMonitoring(): PerformanceMonitor {
  const monitor = new PerformanceMonitor();
  
  // Log metrics after page load
  if (document.readyState === 'complete') {
    setTimeout(() => monitor.logMetrics(), 0);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => monitor.logMetrics(), 0);
    });
  }

  return monitor;
}
