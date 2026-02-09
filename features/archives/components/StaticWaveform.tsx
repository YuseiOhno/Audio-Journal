import { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { calcWaveformLayout } from "@/core/lib/waveformLayout";
import {
  STATIC_WAVEFORM_TARGET_BARS,
  WAVEFORM_BAR_GAP,
  WAVEFORM_BORDER_WIDTH,
  WAVEFORM_DISPLAY_SCALE,
  WAVEFORM_HORIZONTAL_PADDING,
} from "@/core/lib/waveformConstants";

type StaticWaveformProps = {
  waveform: number[] | null | undefined;
  waveformLength: number | null | undefined;
};

export default function StaticWaveform({ waveform, waveformLength }: StaticWaveformProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const barGap = WAVEFORM_BAR_GAP;
  const borderWidth = WAVEFORM_BORDER_WIDTH;
  const displayScale = WAVEFORM_DISPLAY_SCALE;
  const targetBars = STATIC_WAVEFORM_TARGET_BARS;
  const paddingHorizontal = WAVEFORM_HORIZONTAL_PADDING;

  const limitedWaveform = useMemo(() => {
    if (!waveform || waveform.length === 0) return [];
    const total = waveformLength && waveformLength > 0 ? waveformLength : waveform.length;
    const maxBars = Math.min(targetBars, total);
    return waveform.slice(0, maxBars);
  }, [waveform, waveformLength, targetBars]);

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

  if (!limitedWaveform || limitedWaveform.length === 0) {
    return <Text style={styles.empty}>null</Text>;
  }

  return (
    <View
      style={[styles.container, { gap: fitGap, borderWidth }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {limitedWaveform.map((value, index) => (
        <View
          key={index}
          style={[styles.bar, { height: Math.max(1, value * displayScale), width: fitBarWidth }]}
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
