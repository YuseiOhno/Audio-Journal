import React, { useState } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Slider } from "@tamagui/slider";
import { View, Pressable, Text } from "react-native";

export default function AudioPlayer() {
  const [play, setPlay] = useState(false);
  return (
    <View style={{ width: "100%" }}>
      <View style={{ flexDirection: "column" }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 30 }}>
          <Slider defaultValue={[0]} min={0} max={100} step={1} width={"100%"} size="$1">
            <Slider.Track backgroundColor="rgba(230, 230, 230, 0.3)">
              <Slider.TrackActive backgroundColor="#333333" />
            </Slider.Track>
            <Slider.Thumb circular index={0} />
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
          <Text style={{ fontSize: 14 }}>0:00</Text>
          <Text style={{ fontSize: 14 }}>3:00</Text>
        </View>
      </View>
      <View
        style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "25" }}
      >
        {/* 10秒戻る */}
        <Pressable style={pressableOpacity}>
          <MaterialIcons name="replay-10" size={35} color="#333333" />
        </Pressable>

        {/* 再生 */}
        <Pressable onPress={() => setPlay((prev) => !prev)} style={pressableOpacity}>
          {play ? (
            <MaterialIcons name="pause" size={50} color="#333333" />
          ) : (
            <MaterialIcons name="play-arrow" size={50} color="#333333" />
          )}
        </Pressable>

        {/* 10秒進む */}
        <Pressable style={pressableOpacity}>
          <MaterialIcons name="forward-10" size={35} color="#333333" />
        </Pressable>
      </View>
    </View>
  );
}

const pressableOpacity = ({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.6 : 1 }];
