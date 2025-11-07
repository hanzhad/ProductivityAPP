import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';

type TimerCallback = () => void;

interface Timer {
  id: string;
  callback: TimerCallback;
  interval: number;
  intervalId: number | null;
  isRunning: boolean;
  appStateListener: PluginListenerHandle | null;
  visibilityListener: (() => void) | null;
}

/**
 * Platform-aware timer manager that handles iOS-specific setInterval issues.
 * On iOS, combines setInterval with app state and visibility listeners to ensure
 * timers work reliably even when the app is backgrounded or the screen is locked.
 */
class PlatformTimerManager {
  private timers: Map<string, Timer> = new Map();
  private isIOS: boolean;

  constructor() {
    this.isIOS = Capacitor.getPlatform() === 'ios';
  }

  /**
   * Creates a new platform-aware interval timer.
   * On iOS, this also sets up app state and visibility listeners.
   *
   * @param callback - Function to execute on each interval
   * @param interval - Interval duration in milliseconds
   * @returns Timer ID that can be used to clear the timer
   */
  setInterval(callback: TimerCallback, interval: number): string {
    const timerId = this.generateTimerId();

    const timer: Timer = {
      id: timerId,
      callback,
      interval,
      intervalId: null,
      isRunning: false,
      appStateListener: null,
      visibilityListener: null,
    };

    this.timers.set(timerId, timer);
    this.startTimer(timer);

    if (this.isIOS) {
      this.setupIOSListeners(timer);
    }

    return timerId;
  }

  /**
   * Clears a timer by its ID.
   *
   * @param timerId - The ID returned by setInterval
   */
  clearInterval(timerId: string): void {
    const timer = this.timers.get(timerId);
    if (!timer) {
      return;
    }

    this.stopTimer(timer);
    this.cleanupIOSListeners(timer);
    this.timers.delete(timerId);
  }

  /**
   * Clears all active timers.
   */
  clearAll(): void {
    for (const timer of this.timers.values()) {
      this.stopTimer(timer);
      this.cleanupIOSListeners(timer);
    }
    this.timers.clear();
  }

  /**
   * Gets the count of active timers.
   */
  getActiveTimersCount(): number {
    return this.timers.size;
  }

  private startTimer(timer: Timer): void {
    if (timer.isRunning) {
      return;
    }

    timer.intervalId = setInterval(() => {
      timer.callback();
    }, timer.interval) as unknown as number;

    timer.isRunning = true;
  }

  private stopTimer(timer: Timer): void {
    if (!timer.isRunning || timer.intervalId === null) {
      return;
    }

    clearInterval(timer.intervalId);
    timer.intervalId = null;
    timer.isRunning = false;
  }

  private setupIOSListeners(timer: Timer): void {
    // App state listener - handle app going to background/foreground
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // App came to foreground - ensure timer is running and execute callback as catch-up
        if (!timer.isRunning) {
          this.startTimer(timer);
        }
        // Execute callback immediately on resume to catch up on any missed updates
        timer.callback();
      }
      // Note: We DON'T stop the timer when going to background
      // iOS may throttle it, but we want it to continue attempting to run
    }).then((listener) => {
      timer.appStateListener = listener;
    });

    // Page visibility listener - handle screen lock/unlock
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible - ensure timer is running and do a catch-up
        if (!timer.isRunning) {
          this.startTimer(timer);
        }
        timer.callback();
      }
      // Note: We DON'T stop the timer when page is hidden
      // Let the timer continue running in the background if iOS allows it
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    timer.visibilityListener = handleVisibilityChange;
  }

  private cleanupIOSListeners(timer: Timer): void {
    if (timer.appStateListener) {
      timer.appStateListener.remove();
      timer.appStateListener = null;
    }

    if (timer.visibilityListener) {
      document.removeEventListener('visibilitychange', timer.visibilityListener);
      timer.visibilityListener = null;
    }
  }

  private generateTimerId(): string {
    return `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const platformTimerManager = new PlatformTimerManager();
