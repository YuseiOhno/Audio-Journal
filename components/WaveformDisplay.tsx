import { useEffect, useState } from "react";
import { View } from "react-native";

export default function WaveformDisplay({
  recordingInProgress,
  latestDecibel,
}: {
  recordingInProgress: boolean;
  latestDecibel: React.RefObject<number | null>;
}) {
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);
  const maxBars = 50;

  useEffect(() => {
    if (!recordingInProgress) return;
    setWaveformHeights([]);

    let waveformBuffer: number[] = [];
    const interval = setInterval(() => {
      if (latestDecibel.current != null) {
        const normalized = Math.max(0, Math.min(1, (latestDecibel.current + 60) / 60));
        const variation = 0.6 + Math.random() * 0.1; // WhatsApp wiggle
        const height = normalized * 60 * variation;

        waveformBuffer.push(height);
        if (waveformBuffer.length > maxBars) waveformBuffer.shift();

        setWaveformHeights([...waveformBuffer]);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [recordingInProgress, latestDecibel]);

  return (
    <View
      style={{
        height: 120,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        width: "100%",
        borderWidth: 1,
        borderRadius: 25,
        borderColor: "#333333",
      }}
    >
      {waveformHeights.map((height, index) => (
        <View
          key={index}
          style={{
            width: 4,
            height: height * 2,
            backgroundColor: "#333333",
            borderRadius: 2,
          }}
        />
      ))}
    </View>
  );
}
