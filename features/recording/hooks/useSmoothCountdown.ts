import { useCallback, useEffect, useRef, useState } from "react";

export function useSmoothCountdown(
  maxMs: number,
  isRunning: boolean,
  durationMillisFromRecorder?: number,
) {
  // レコーダーから受け取った実測値と、その時点の高精度時刻を基準として保持する。
  const baseDurationMsRef = useRef(0);
  const basePerfNowRef = useRef(0);
  // 同値更新を避けるため、最後に反映した推定値を保持する。
  const estimatedRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const [estimatedDurationMs, setEstimatedDurationMs] = useState(0);

  const commitEstimated = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(0, next), maxMs);
      if (clamped === estimatedRef.current) return;
      estimatedRef.current = clamped;
      setEstimatedDurationMs(clamped);
    },
    [maxMs],
  );

  useEffect(() => {
    // 実測値が更新されたら補間の基準点を更新する。
    baseDurationMsRef.current = durationMillisFromRecorder ?? 0;
    basePerfNowRef.current = performance.now();
  }, [durationMillisFromRecorder]);

  useEffect(() => {
    if (!isRunning) {
      // 停止時は最後の基準点からの経過分を一度だけ確定して表示を固定する。
      const elapsedSinceBase = performance.now() - basePerfNowRef.current;
      commitEstimated(baseDurationMsRef.current + elapsedSinceBase);
      return;
    }

    // 録音中は requestAnimationFrame で滑らかに補間する。
    const tick = () => {
      const elapsed = performance.now() - basePerfNowRef.current;
      commitEstimated(baseDurationMsRef.current + elapsed);

      if (estimatedRef.current < maxMs) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = null;
    };
  }, [isRunning, maxMs, commitEstimated]);

  const remainingMs = Math.max(0, maxMs - estimatedDurationMs);
  const remainingSecondsText = (remainingMs / 1000).toFixed(4);

  return {
    estimatedDurationMs,
    remainingMs,
    remainingSecondsText,
  };
}
