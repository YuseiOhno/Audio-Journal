import { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { calcWaveformLayout } from "@/core/lib/waveformLayout";
import {
  WAVEFORM_BAR_GAP,
  WAVEFORM_BORDER_WIDTH,
  WAVEFORM_DISPLAY_SCALE,
  WAVEFORM_HORIZONTAL_PADDING,
} from "@/core/lib/waveformConstants";

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
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const barGap = WAVEFORM_BAR_GAP;
  const borderWidth = WAVEFORM_BORDER_WIDTH;
  const displayScale = WAVEFORM_DISPLAY_SCALE;
  const targetBars = Math.ceil(maxMs / sampleIntervalMs);
  const horizontalPadding = WAVEFORM_HORIZONTAL_PADDING;

  //波形バー、隙間の幅を計算
  const { fitBarWidth, fitGap } = useMemo(
    () =>
      calcWaveformLayout({
        containerWidth,
        targetBars,
        paddingHorizontal: horizontalPadding,
        borderWidth,
        barGap,
      }),
    [containerWidth, targetBars, horizontalPadding, borderWidth, barGap],
  );

  useEffect(() => {
    if (!recordingInProgress) return;
    setWaveformHeights([]);

    const interval = setInterval(() => {
      if (latestDecibel.current != null) {
        const normalized = Math.max(0, Math.min(1, (latestDecibel.current + 60) / 60));
        const shaped = Math.pow(normalized, 1.4);

        waveformBufferRef.current.push(shaped);
        if (waveformBufferRef.current.length <= targetBars) {
          setWaveformHeights((prev) => [...prev, shaped * displayScale]);
        }
      }
    }, sampleIntervalMs);

    return () => clearInterval(interval);
  }, [
    recordingInProgress,
    latestDecibel,
    targetBars,
    waveformBufferRef,
    sampleIntervalMs,
    displayScale,
  ]);

  return (
    <View
      style={[styles.container, { gap: fitGap, borderWidth }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {waveformHeights.map((height, index) => (
        <View key={index} style={[styles.waveForm, { height: height, width: fitBarWidth }]} />
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
