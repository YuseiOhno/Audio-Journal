import { useEffect, useMemo, useRef, useState } from "react";

/**
 * 実測(durationMillis)は粗く更新されてもOK。
 * UI表示はperformance.now()で補間して滑らかにする。
 *
 * @param durationMillisFromRecorder useAudioRecorderState(recorder).durationMillis
 * @param isRunning 録音中のみ補間を回す
 */
export function useSmoothCountdown(
  maxMs: number,
  isRunning: boolean,
  durationMillisFromRecorder?: number,
) {
  // recorderから来た「最新の実測値」を保持
  const baseDurationMsRef = useRef<number>(0);
  // その実測値を受け取った瞬間のperformance.now()
  const basePerfNowRef = useRef<number>(0);

  // UI用：補間された推定duration（ms）
  const [estimatedDurationMs, setEstimatedDurationMs] = useState(0);

  // 実測値が更新されたら基準を更新
  useEffect(() => {
    const d = durationMillisFromRecorder ?? 0;
    baseDurationMsRef.current = d;
    basePerfNowRef.current = performance.now();
  }, [durationMillisFromRecorder]);

  // requestAnimationFrameで補間更新
  useEffect(() => {
    if (!isRunning) {
      const clamped = Math.min(baseDurationMsRef.current, maxMs);
      setEstimatedDurationMs(clamped);
      return;
    }

    let rafId = 0;

    const tick = () => {
      const elapsed = performance.now() - basePerfNowRef.current; // 基準からの経過
      const estimated = baseDurationMsRef.current + elapsed;

      // 上限（録音が止まっても伸び続けないようにクランプ）
      const clamped = Math.min(estimated, maxMs);

      setEstimatedDurationMs(clamped);

      // 0〜maxMsの範囲なら回し続ける
      if (clamped < maxMs) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isRunning, maxMs]);

  // 残りms（UI表示用）
  const remainingMs = useMemo(() => {
    return Math.max(0, maxMs - estimatedDurationMs);
  }, [estimatedDurationMs, maxMs]);

  // 小数点以下4桁（UI表示文字列）
  const remainingSecondsText = useMemo(() => {
    return (remainingMs / 1000).toFixed(4);
  }, [remainingMs]);

  return {
    estimatedDurationMs, // 推定の経過ms（表示用）
    remainingMs, // 残りms（表示用）
    remainingSecondsText, // "12.3456" 形式
  };
}
