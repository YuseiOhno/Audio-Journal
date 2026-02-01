import { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

type StaticWaveformProps = {
  waveform: number[] | null | undefined;
  waveformLength: number | null | undefined;
  waveformSampleIntervalMs: number | null | undefined;
};

export default function StaticWaveform({
  waveform,
  waveformLength,
  waveformSampleIntervalMs,
}: StaticWaveformProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const barGap = 1;
  const borderWidth = 1;
  const displayScale = 60;
  const maxMs = 30000;
  const targetBars = useMemo(() => {
    const interval =
      waveformSampleIntervalMs && waveformSampleIntervalMs > 0 ? waveformSampleIntervalMs : 200;
    return Math.ceil(maxMs / interval);
  }, [waveformSampleIntervalMs]);

  const limitedWaveform = useMemo(() => {
    if (!waveform || waveform.length === 0) return [];
    const total = waveformLength && waveformLength > 0 ? waveformLength : waveform.length;
    const maxBars = Math.min(targetBars, total);
    return waveform.slice(0, maxBars);
  }, [waveform, waveformLength, targetBars]);

  const { fitBarWidth, fitGap } = useMemo(() => {
    if (containerWidth <= 0) {
      return { fitBarWidth: 1, fitGap: 0 };
    }
    const innerWidth = Math.max(0, containerWidth - borderWidth * 2 - 10 * 2);
    let gap = barGap;
    let width = (innerWidth - gap * (targetBars - 1)) / targetBars;
    if (width <= 0) {
      gap = 0;
      width = innerWidth / targetBars;
    }
    return { fitBarWidth: width, fitGap: gap };
  }, [containerWidth, barGap, borderWidth, targetBars]);

  if (!limitedWaveform || limitedWaveform.length === 0) {
    return <Text style={styles.empty}>waveform</Text>;
  }

  return (
    <View
      style={[styles.container, { gap: fitGap, borderWidth }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {limitedWaveform.map((value, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            { height: Math.max(1, value * displayScale * 2), width: fitBarWidth },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    height: 120,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    borderRadius: 12,
    borderColor: "#333333",
  },
  bar: {
    backgroundColor: "#333333",
    borderRadius: 2,
  },
  empty: {
    marginTop: 16,
    fontSize: 12,
    color: "#666666",
  },
});
