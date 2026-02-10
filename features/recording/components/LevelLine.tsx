import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { Canvas, Path, usePathValue } from "@shopify/react-native-skia";
import type { SkPath } from "@shopify/react-native-skia";

import useLevelAmplitude from "../hooks/useLevelAmplitude";

type Props = {
  recordingInProgress: boolean;
  latestDecibel: React.RefObject<number | null>;
};

const HEIGHT = 120;
const Y_MID = HEIGHT / 2;
const POINT_COUNT = 100;
const WAVE_CYCLES = 8;
const STROKE_WIDTH = 2;
const AMPLITUDE_SCALE = 50;
const RESET_AMPLITUDE_DURATION_MS = 500;

// 現在の振幅と幅から、1本の波形パスを再生成する。
const updateWavePath = (
  path: SkPath,
  width: number,
  yMid: number,
  amp: number,
  waves: number,
  points: number,
) => {
  "worklet";
  path.reset();

  if (width <= 0 || points < 2) {
    return;
  }

  const step = width / (points - 1);

  for (let i = 0; i < points; i++) {
    const x = i * step;
    // 横方向の位置 i を角度に変換して、波の周期数を制御する。
    const t = (i / (points - 1)) * Math.PI * 2 * waves;
    // 両端で振幅を 0 に近づけ、中央を最も大きく揺らす。
    const edge = Math.sin((Math.PI * i) / (points - 1));
    const y = yMid + Math.sin(t) * amp * edge;

    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
};

export default function LevelLineDisplay({ recordingInProgress, latestDecibel }: Props) {
  const [containerWidth, setContainerWidth] = useState(0);

  // dB の更新値を Reanimated の shared value（振幅）へ変換する。
  const amp = useLevelAmplitude({
    recordingInProgress,
    latestDecibel,
    amplitudeScale: AMPLITUDE_SCALE,
    resetDurationMs: RESET_AMPLITUDE_DURATION_MS,
  });

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setContainerWidth((prevWidth) => (prevWidth === nextWidth ? prevWidth : nextWidth));
  }, []);

  // 振幅と幅に応じて Skia Path を更新し、見た目の線をアニメーションさせる。
  const animatedPath = usePathValue((path) => {
    "worklet";
    updateWavePath(path, containerWidth, Y_MID, amp.value, WAVE_CYCLES, POINT_COUNT);
  });

  return (
    <View style={[styles.container, { width: "100%", height: HEIGHT }]} onLayout={handleLayout}>
      <Canvas style={{ width: containerWidth, height: HEIGHT }}>
        <Path
          path={animatedPath}
          color="#333333"
          style="stroke"
          strokeWidth={STROKE_WIDTH}
          strokeCap="round"
          strokeJoin="round"
        />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
});
