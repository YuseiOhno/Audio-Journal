import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
  configureReanimatedLogger,
} from "react-native-reanimated";
import { Canvas, Path, usePathValue } from "@shopify/react-native-skia";
import type { SkPath } from "@shopify/react-native-skia";

import { normalizeDb } from "../lib/waveformMath";

type Props = {
  recordingInProgress: boolean;
  latestDecibel: React.RefObject<number | null>;
};

const updateWavePath = (
  path: SkPath,
  width: number,
  yMid: number,
  amp: number,
  phase: number,
  waves = 2.5,
  points = 80,
) => {
  "worklet";
  path.reset();
  const step = width / (points - 1);

  for (let i = 0; i < points; i++) {
    const x = i * step;
    const t = (i / (points - 1)) * Math.PI * 2 * waves;
    const edge = Math.sin((Math.PI * i) / (points - 1)); // 0→1→0
    const y = yMid + Math.sin(t + phase) * amp * edge;

    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
};

export default function LevelLineDisplay({ recordingInProgress, latestDecibel }: Props) {
  const W = 320; // まず固定でOK（あとで onLayout で可変にできる）
  const H = 120;
  const yMid = H / 2;

  // 位相：これを回すと「波が流れる」
  const phase = useSharedValue(0);

  // 振幅：音量で変える
  const amp = useSharedValue(4); // 最小でも少し揺れるように

  // 1) 録音中は位相をずっと回す（うねりの“流れ”）
  useEffect(() => {
    if (!recordingInProgress) {
      phase.value = 0;
      amp.value = withTiming(4, { duration: 180 });
      return;
    }

    phase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );

    const interval = setInterval(() => {
      if (latestDecibel.current != null) {
        const normalizedDecibel = normalizeDb(latestDecibel.current);

        const targetAmp = 4 + normalizedDecibel * 18; // 4..22px くらい

        // 3) 振幅はヌルっと追従（ガタつき防止）
        amp.value = withTiming(targetAmp, { duration: 120, easing: Easing.out(Easing.cubic) });
      }
    }, 120);

    return () => clearInterval(interval);
  }, [recordingInProgress, latestDecibel, phase, amp]);

  // 4) phase/amp から Path を生成（Skiaに渡す）
  const animatedPath = usePathValue((path) => {
    "worklet";
    updateWavePath(path, W, yMid, amp.value, phase.value, 2.2, 90);
  });

  return (
    <View style={[styles.container, { width: "100%", height: H }]}>
      <Canvas style={{ width: W, height: H }}>
        <Path
          path={animatedPath}
          color="#333333"
          style="stroke"
          strokeWidth={2.5}
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

configureReanimatedLogger({
  strict: false,
});
