import React from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Slider } from "@tamagui/slider";
import { View, Pressable, Text } from "react-native";
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
    <View style={{ width: "100%" }}>
      <View style={{ flexDirection: "column", height: 60 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 30 }}>
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 14 }}>{formatTime(currentTimeMs / 1000)}</Text>
          <Text style={{ fontSize: 14 }}>{formatTime(durationMs / 1000)}</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "25",
          height: 60,
        }}
      >
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
