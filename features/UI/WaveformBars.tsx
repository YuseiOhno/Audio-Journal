import { useMemo, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { calcWaveformLayout } from "@/core/lib/waveformLayout";
import {
  WAVEFORM_BAR_GAP,
  WAVEFORM_BORDER_WIDTH,
  WAVEFORM_DISPLAY_SCALE,
  WAVEFORM_HORIZONTAL_PADDING,
} from "@/core/lib/waveformConstants";

type WaveformBarsProps = {
  values: number[];
  targetBars: number;
  minBarHeight?: number;
  containerStyle?: StyleProp<ViewStyle>;
  barStyle?: StyleProp<ViewStyle>;
};

export default function WaveformBars({
  values,
  targetBars,
  minBarHeight = 0,
  containerStyle,
  barStyle,
}: WaveformBarsProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const { fitBarWidth, fitGap } = useMemo(
    () =>
      calcWaveformLayout({
        containerWidth,
        targetBars,
        paddingHorizontal: WAVEFORM_HORIZONTAL_PADDING,
        borderWidth: WAVEFORM_BORDER_WIDTH,
        barGap: WAVEFORM_BAR_GAP,
      }),
    [containerWidth, targetBars],
  );

  return (
    <View
      style={[styles.container, containerStyle, { gap: fitGap, borderWidth: WAVEFORM_BORDER_WIDTH }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {values.map((value, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            barStyle,
            {
              height: Math.max(minBarHeight, value * WAVEFORM_DISPLAY_SCALE),
              width: fitBarWidth,
            },
          ]}
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
    borderColor: "#333333",
  },
  bar: {
    backgroundColor: "#333333",
    borderRadius: 2,
  },
});
