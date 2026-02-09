import { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { calcWaveformLayout } from "@/core/lib/waveformLayout";
import {
  WAVEFORM_BAR_GAP,
  WAVEFORM_BORDER_WIDTH,
  WAVEFORM_DISPLAY_SCALE,
  WAVEFORM_HORIZONTAL_PADDING,
} from "@/core/lib/waveformConstants";
import { normalizeDb } from "../lib/waveformMath";

type Props = {
  recordingInProgress: boolean;
  latestDecibel: React.RefObject<number | null>;
  maxMs: number;
  sampleIntervalMs: number;
  waveformBufferRef: React.RefObject<number[]>;
};

export default function WaveformDisplay({
  recordingInProgress,
  latestDecibel,
  maxMs,
  sampleIntervalMs,
  waveformBufferRef,
}: Props) {
  const [waveformValues, setWaveformValues] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const barGap = WAVEFORM_BAR_GAP;
  const borderWidth = WAVEFORM_BORDER_WIDTH;
  const displayScale = WAVEFORM_DISPLAY_SCALE;
  const targetBars = Math.ceil(maxMs / sampleIntervalMs);
  const paddingHorizontal = WAVEFORM_HORIZONTAL_PADDING;

  //波形バー、隙間の幅を計算
  const { fitBarWidth, fitGap } = useMemo(
    () =>
      calcWaveformLayout({
        containerWidth,
        targetBars,
        paddingHorizontal,
        borderWidth,
        barGap,
      }),
    [containerWidth, targetBars, paddingHorizontal, borderWidth, barGap],
  );

  // DB保存用にバッファー、UI用にStateへ
  useEffect(() => {
    if (!recordingInProgress) return;
    setWaveformValues([]);

    const interval = setInterval(() => {
      if (latestDecibel.current != null) {
        const normalizedDecibel = normalizeDb(latestDecibel.current);

        waveformBufferRef.current.push(normalizedDecibel);
        if (waveformBufferRef.current.length <= targetBars) {
          setWaveformValues((prev) => [...prev, normalizedDecibel]);
        }
      }
    }, sampleIntervalMs);

    return () => clearInterval(interval);
  }, [recordingInProgress, latestDecibel, targetBars, waveformBufferRef, sampleIntervalMs]);

  return (
    <View
      style={[styles.container, { gap: fitGap, borderWidth }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {waveformValues.map((height, index) => (
        <View
          key={index}
          style={[styles.waveForm, { height: height * displayScale, width: fitBarWidth }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    borderRadius: 25,
    borderColor: "#333333",
  },
  waveForm: {
    backgroundColor: "#333333",
    borderRadius: 2,
  },
});
