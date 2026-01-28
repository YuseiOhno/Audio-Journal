import { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";

export default function WaveformDisplay({
  recordingInProgress,
  latestDecibel,
  maxMs,
}: {
  recordingInProgress: boolean;
  latestDecibel: React.RefObject<number | null>;
  maxMs: number;
}) {
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const barGap = 1;
  const borderWidth = 1;
  const sampleIntervalMs = 200;
  const targetBars = Math.ceil(maxMs / sampleIntervalMs);

  //波形バー、隙間の幅を調整
  const { fitBarWidth, fitGap } = useMemo(() => {
    if (containerWidth <= 0) return { fitBarWidth: 1, fitGap: 0 };
    const innerWidth = Math.max(0, containerWidth - borderWidth * 2);
    let gap = barGap;
    let width = (innerWidth - gap * (targetBars - 1)) / targetBars;
    if (width <= 0) {
      gap = 0;
      width = innerWidth / targetBars;
    }
    return { fitBarWidth: width, fitGap: gap };
  }, [containerWidth, barGap, targetBars, borderWidth]);

  useEffect(() => {
    if (!recordingInProgress) return;
    setWaveformHeights([]);

    let waveformBuffer: number[] = [];
    const interval = setInterval(() => {
      if (latestDecibel.current != null) {
        const normalized = Math.max(0, Math.min(1, (latestDecibel.current + 60) / 60));
        const height = normalized * 60;

        waveformBuffer.push(height);
        if (waveformBuffer.length <= targetBars) {
          setWaveformHeights([...waveformBuffer]);
        }
      }
    }, sampleIntervalMs);

    return () => clearInterval(interval);
  }, [recordingInProgress, latestDecibel, targetBars]);

  return (
    <View
      style={[styles.container, { gap: fitGap, borderWidth }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {waveformHeights.map((height, index) => (
        <View key={index} style={[styles.waveForm, { height: height * 2, width: fitBarWidth }]} />
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
