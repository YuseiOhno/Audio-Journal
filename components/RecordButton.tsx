import React, { useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, View, Animated, Easing } from "react-native";

type Props = {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  size?: number; // 例: 84
};

export function RecordButton({ isRecording, onStart, onStop, disabled = false, size = 80 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const ringWidth = Math.max(6, Math.round(size * 0.09));
  const innerSize = size - ringWidth * 2;

  const startPulse = () => {
    pulse.setValue(0);
    pulseLoop.current?.stop();
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    pulseLoop.current = null;
    pulse.stopAnimation(() => {
      pulse.setValue(1);
    });
  };

  useEffect(() => {
    if (isRecording) startPulse();
    else stopPulse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const innerPulseOpacity = useMemo(() => {
    return pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  }, [pulse]);

  const onPress = () => {
    if (disabled) return;
    if (isRecording) onStop();
    else onStart();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={isRecording ? "録音を停止" : "録音を開始"}
      accessibilityState={{ disabled, selected: isRecording }}
    >
      <Animated.View
        style={[styles.container, { width: size, height: size, transform: [{ scale }] }]}
      >
        {/* outer ring */}
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: ringWidth,
            },
          ]}
        />

        {/* inner shape */}
        <Animated.View
          style={[
            styles.inner,
            {
              width: innerSize / 1.2,
              height: innerSize / 1.2,
              borderRadius: innerSize / 2,
              opacity: innerPulseOpacity,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderColor: "#333333",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  inner: {
    backgroundColor: "#333333",
  },
});
