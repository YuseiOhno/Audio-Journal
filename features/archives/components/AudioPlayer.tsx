import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Slider } from "@tamagui/slider";
import { View, Pressable, Text, StyleSheet } from "react-native";
import useAudioPlayerHook from "@/features/archives/hooks/useAudioPlayer";
import { formatTime } from "@/core/lib/format";

type AudioPlayerProps = {
  audioUri?: string | null;
};

export default function AudioPlayer({ audioUri }: AudioPlayerProps) {
  const { status, togglePlayPause, seekToForward, seekToReplay, seekToTime, canPlay } =
    useAudioPlayerHook(audioUri);

  const durationMs = Math.round((status?.duration ?? 0) * 1000);
  const currentTimeMs = Math.round((status?.currentTime ?? 0) * 1000);

  return (
    <View style={styles.container}>
      <View style={styles.progressSection}>
        <View style={styles.sliderWrap}>
          <Slider
            value={[Math.min(currentTimeMs, durationMs)]}
            min={0}
            max={durationMs}
            step={100}
            width={"100%"}
            size="$1"
            onValueChange={(value) => {
              seekToTime(value[0] / 1000);
            }}
          >
            <Slider.Track backgroundColor="rgba(230, 230, 230, 0.3)">
              <Slider.TrackActive backgroundColor="#333333" />
            </Slider.Track>
            <Slider.Thumb circular index={0} opacity={0} />
          </Slider>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTimeMs / 1000)}</Text>
          <Text style={styles.timeText}>{formatTime(durationMs / 1000)}</Text>
        </View>
      </View>
      <View style={styles.controlRow}>
        {/* 10秒戻る */}
        <Pressable onPress={seekToReplay} style={pressableOpacity}>
          <MaterialIcons name="replay-10" size={35} color="#333333" />
        </Pressable>

        {/* 再生 */}
        <Pressable onPress={togglePlayPause} style={pressableOpacity} disabled={!canPlay}>
          {status?.playing ? (
            <MaterialIcons name="pause" size={50} color="#333333" />
          ) : (
            <MaterialIcons name="play-arrow" size={50} color="#333333" />
          )}
        </Pressable>

        {/* 10秒進む */}
        <Pressable onPress={seekToForward} style={pressableOpacity}>
          <MaterialIcons name="forward-10" size={35} color="#333333" />
        </Pressable>
      </View>
    </View>
  );
}

const pressableOpacity = ({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.6 : 1 }];

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  progressSection: {
    flexDirection: "column",
    height: 60,
  },
  sliderWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  timeText: {
    fontSize: 14,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 25,
    height: 60,
  },
});
