import { useEffect, useState } from "react";
import { normalizeDb } from "@/features/recording/lib/waveformMath";

type Params = {
  recordingInProgress: boolean;
  latestDecibel: React.RefObject<number | null>;
  targetBars: number;
  sampleIntervalMs: number;
  waveformBufferRef: React.RefObject<number[]>;
};

export default function useLiveWaveform({
  recordingInProgress,
  latestDecibel,
  targetBars,
  sampleIntervalMs,
  waveformBufferRef,
}: Params) {
  const [waveformValues, setWaveformValues] = useState<number[]>([]);

  useEffect(() => {
    if (!recordingInProgress) return;
    setWaveformValues([]);

    const interval = setInterval(() => {
      if (latestDecibel.current != null) {
        const normalized = normalizeDb(latestDecibel.current);
        waveformBufferRef.current.push(normalized);

        if (waveformBufferRef.current.length <= targetBars) {
          setWaveformValues((prev) => [...prev, normalized]);
        }
      }
    }, sampleIntervalMs);

    return () => clearInterval(interval);
  }, [recordingInProgress, latestDecibel, targetBars, sampleIntervalMs, waveformBufferRef]);

  return waveformValues;
}
