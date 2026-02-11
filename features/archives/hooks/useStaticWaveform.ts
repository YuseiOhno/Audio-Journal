import { useMemo } from "react";

type Params = {
  waveform: number[] | null | undefined;
  waveformLength: number | null | undefined;
  targetBars: number;
};

export default function useStaticWaveform({ waveform, waveformLength, targetBars }: Params) {
  return useMemo(() => {
    if (!waveform || waveform.length === 0) return [];
    const total = waveformLength && waveformLength > 0 ? waveformLength : waveform.length;
    return waveform.slice(0, Math.min(targetBars, total));
  }, [waveform, waveformLength, targetBars]);
}
