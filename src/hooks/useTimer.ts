import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
}

export function useTimer({ initialSeconds, onTimeUp }: UseTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const startTimer = useCallback(() => {
    if (initialSeconds <= 0) return; // Untimed practice mode

    stopTimer();
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          if (onTimeUpRef.current) {
            onTimeUpRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initialSeconds, stopTimer]);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(initialSeconds);
  }, [initialSeconds, stopTimer]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
