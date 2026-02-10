import { useEffect } from "react";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";

import { DEFAULT_WAVEFORM_SAMPLE_INTERVAL_MS } from "@/core/lib/waveformConstants";
import { normalizeDb } from "../lib/waveformMath";

type Params = {
  recordingInProgress: boolean;
  latestDecibel: React.RefObject<number | null>;
  amplitudeScale: number;
  resetDurationMs: number;
};

export default function useLevelAmplitude({
  recordingInProgress,
  latestDecibel,
  amplitudeScale,
  resetDurationMs,
}: Params) {
  // UIが直接参照する振幅（Reanimated shared value）。
  const amplitude = useSharedValue(0);

  useEffect(() => {
    if (!recordingInProgress) {
      // 録音停止時は振幅を 0 へ戻し、波形をフラットに収束させる。
      amplitude.value = withTiming(0, {
        duration: resetDurationMs,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    // 録音中は一定間隔で最新 dB を取り込み、振幅へ変換して追従させる。
    const interval = setInterval(() => {
      if (latestDecibel.current == null) {
        return;
      }

      const normalizedDecibel = normalizeDb(latestDecibel.current);
      const targetAmplitude = normalizedDecibel * amplitudeScale;

      // 次サンプルまでを補間時間にして、段差を抑える。
      amplitude.value = withTiming(targetAmplitude, {
        duration: DEFAULT_WAVEFORM_SAMPLE_INTERVAL_MS,
        easing: Easing.out(Easing.cubic),
      });
    }, DEFAULT_WAVEFORM_SAMPLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [recordingInProgress, latestDecibel, amplitudeScale, resetDurationMs, amplitude]);

  return amplitude;
}
