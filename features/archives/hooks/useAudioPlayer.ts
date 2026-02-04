import { useCallback, useEffect } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

export default function useAudioPlayerHook(audioUri?: string | null) {
  const player = useAudioPlayer(audioUri ?? null);
  const status = useAudioPlayerStatus(player);
  const canPlay = !!audioUri;

  //終了を検知して自動で先頭に戻す
  useEffect(() => {
    if (status?.didJustFinish) {
      (async () => {
        await player.seekTo(0);
      })();
    }
  }, [status?.didJustFinish, player]);

  const seekBy = useCallback(
    async (seconds: number) => {
      if (!canPlay) return;
      const currentTime = status?.currentTime ?? 0;
      await player.seekTo(currentTime + seconds);
    },
    [player, status?.currentTime, canPlay],
  );

  //10秒進む
  const seekToForward = useCallback(() => {
    seekBy(10);
  }, [seekBy]);

  //10秒戻る
  const seekToReplay = useCallback(() => {
    seekBy(-10);
  }, [seekBy]);

  //再生or一時停止
  const togglePlayPause = useCallback(() => {
    if (!canPlay) return;
    if (status?.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player, status?.playing, canPlay]);

  const seekToTime = useCallback(
    async (seconds: number) => {
      if (!canPlay) return;
      await player.seekTo(seconds);
    },
    [player, canPlay],
  );

  return { status, togglePlayPause, seekToForward, seekToReplay, seekToTime, canPlay };
}
