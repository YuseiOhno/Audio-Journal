import { forwardRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import { formatCreatedAtLocal, formatSeconds } from "@/core/lib/format";
import { RecordingRow } from "@/core/types/types";
import StaticWaveform from "@/features/archives/components/StaticWaveform";
import AudioPlayer from "@/features/archives/components/AudioPlayer";
import { formatLocationText } from "@/features/archives/lib/archiveFormat";

type Props = {
  selected?: RecordingRow;
  onOpenMenu: (closeSheet: () => void) => void;
};

const DetailSheet = forwardRef<BottomSheet, Props>(function DetailSheet(
  { selected, onOpenMenu },
  ref,
) {
  const closeSheet = () => {
    if (ref && "current" in ref) {
      ref.current?.close();
    }
  };

  return (
    <GestureHandlerRootView style={styles.bottomSheetContainer} pointerEvents="box-none">
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={["70%", "90%"]}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={styles.bottomSheetBackground}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} pressBehavior="close" opacity={0.3} />
        )}
        footerComponent={(props) => (
          <BottomSheetFooter {...props}>
            <View style={styles.footerContainer}>
              <AudioPlayer audioUri={selected?.audio_uri ?? ""} />
            </View>
          </BottomSheetFooter>
        )}
      >
        <View style={styles.moreButtonWrap}>
          <Pressable
            style={({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.6 : 1 }]}
            onPress={() => onOpenMenu(closeSheet)}
          >
            <MaterialIcons name="more-horiz" size={30} color="#555555" />
          </Pressable>
        </View>
        <BottomSheetScrollView style={styles.bsScrollViewContainer}>
          <View style={styles.contentWrap}>
            <Text style={styles.bsMeta}>Title : {selected?.recording_title ?? "Untitled"}</Text>
            <Text style={styles.bsMeta}>
              Duration : {formatSeconds(selected?.duration_ms ?? 0)}
            </Text>
            <Text style={styles.bsMeta}>
              Time : {formatCreatedAtLocal(selected?.created_at ?? "null")}
            </Text>
            <Text style={styles.bsMeta}>
              Location : {formatLocationText(selected?.lat, selected?.lng, selected?.accuracy)}
            </Text>
            <Text style={styles.bsMemo}>- Memo -</Text>
            <Text style={styles.bsMeta}>{selected?.memo}</Text>

            <View>
              <StaticWaveform
                waveform={selected?.waveform_blob}
                waveformLength={selected?.waveform_length}
                waveformSampleIntervalMs={selected?.waveform_sample_interval_ms}
              />
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
});

export default DetailSheet;

const styles = StyleSheet.create({
  bottomSheetContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
  },
  bottomSheetBackground: {
    backgroundColor: "#B5B6B6",
  },
  footerContainer: {
    paddingHorizontal: 36,
    paddingVertical: 12,
    backgroundColor: "rgba(181, 182, 182, 0.9)",
  },
  bsScrollViewContainer: {
    flex: 1,
    paddingBottom: 36,
  },
  moreButtonWrap: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: "auto",
    alignItems: "center",
  },
  contentWrap: {
    paddingHorizontal: 36,
  },
  bsMeta: {
    marginTop: 8,
    fontSize: 14,
    color: "#555555",
  },
  bsMemo: {
    marginTop: 16,
    fontSize: 14,
    color: "#555555",
  },
});
