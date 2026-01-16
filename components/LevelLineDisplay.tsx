import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Easing, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Canvas, Path, usePathValue } from "@shopify/react-native-skia";
import type { SkPath } from "@shopify/react-native-skia";

type Props = {
  recordingInProgress: boolean;
  latestDecibel: React.RefObject<number | null>;
};

const DB_FLOOR = -60;
const DB_CEIL = 0;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const updateWavePath = (
  path: SkPath,
  width: number,
  yMid: number,
  amp: number,
  phase: number,
  waves = 2.5,
  points = 80
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

export default function WavyLineDisplay({ recordingInProgress, latestDecibel }: Props) {
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
      false
    );

    const interval = setInterval(() => {
      const db = latestDecibel.current;
      if (db == null) return;

      const normalized = clamp01((db - DB_FLOOR) / (DB_CEIL - DB_FLOOR));

      // 2) 音量 → 振幅（px）
      //    小さい音も見えるようにカーブ（**2 など）をかけると気持ちいい
      const curved = Math.pow(normalized, 1.7);

      const targetAmp = 4 + curved * 18; // 4..22px くらい

      // 3) 振幅はヌルっと追従（ガタつき防止）
      amp.value = withTiming(targetAmp, { duration: 120, easing: Easing.out(Easing.cubic) });
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
