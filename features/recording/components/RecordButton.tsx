import React, { useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, View, Animated, Easing } from "react-native";

type Props = {
  isRecording: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function RecordButton({ isRecording, disabled = false, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const size = 80;
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
      ]),
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

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Animated.View
        style={[
          styles.container,
          { width: size, height: size, transform: [{ scale }], opacity: disabled ? 0.45 : 1 },
        ]}
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
