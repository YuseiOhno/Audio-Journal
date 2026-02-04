# expo-audio: スライダーで再生時間を管理する仕組み

## 目的
- `expo-audio` のプレイヤーは **秒単位** で再生位置を管理する。
- スライダーは **0〜1 の進捗率** で表示するのがシンプル。
- したがって「秒 ⇄ 進捗率」の相互変換が核心。

## 使う値（expo-audio）
- `AudioStatus.currentTime` : 現在位置（秒）
- `AudioStatus.duration` : 音声の長さ（秒）
- `player.seekTo(seconds)` : 指定秒へ移動

## 具体例 1（基本）
- duration = **120.0 秒**
- currentTime = **30.0 秒**

スライダー表示値:
```
value = currentTime / duration
      = 30.0 / 120.0
      = 0.25
```
→ スライダーは **25%** の位置

ユーザーがスライダーを **0.70** に動かした場合:
```
seekSeconds = value * duration
            = 0.70 * 120.0
            = 84.0 秒
```
→ `player.seekTo(84.0)` で **1分24秒** に移動

## 具体例 2（別の長さ）
- duration = **215.5 秒**
- ユーザーが **0.10** に動かす

```
seekSeconds = 0.10 * 215.5 = 21.55 秒
```

- currentTime = **107.75 秒** のとき
```
value = 107.75 / 215.5 = 0.50
```
→ スライダーは **50%**

## 0割り回避
`duration` がまだ取得できていない場合の保険:
```
if (duration > 0) {
  value = currentTime / duration;
} else {
  value = 0;
}
```

## ドラッグ中のガタつき対策
- 再生中は `currentTime` が更新され続ける
- そのまま反映すると、ユーザーのドラッグが “戻される”

対策の基本:
- **ドラッグ中は status 反映を止める**
- **ドラッグ終了時に seekTo を実行**

## 最小の概念コード
```ts
const player = useAudioPlayer(source, 250);
const status = useAudioPlayerStatus(player);

const duration = status?.duration ?? 0;
const position = status?.currentTime ?? 0;
const sliderValue = duration > 0 ? position / duration : 0;

const onSlidingComplete = (value: number) => {
  if (duration > 0) player.seekTo(value * duration);
};
```

## まとめ
- プレイヤーは **秒**、スライダーは **0〜1**
- 表示: `value = currentTime / duration`
- 操作: `seek = value * duration`
- ドラッグ中は status 反映を止めるのが安定

# Tamagui Slider: 見た目のpropsまとめ

## 触る場所（基本構成）
- `Slider`（全体）
- `Slider.Track`（背景レール）
- `Slider.TrackActive`（進捗部分）
- `Slider.Thumb`（つまみ）

## よく使うprops（見た目）
- `backgroundColor`：色指定（Track / TrackActive / Thumb）
- `height` / `width`：レールの太さや長さ
- `borderRadius`：角丸（丸レールにするなら `999`）
- `opacity`：透明度（つまみ非表示にも使える）
- `size`：`Slider` に指定すると下位に反映される

## 色変更の例
```tsx
<Slider value={[30]} min={0} max={100} step={1} width="100%" size="$4">
  <Slider.Track backgroundColor="$gray6" height={4} borderRadius={999}>
    <Slider.TrackActive backgroundColor="$green10" />
  </Slider.Track>
  <Slider.Thumb backgroundColor="$green10" size="$3" circular />
</Slider>
```

## つまみを見えなくする例
```tsx
<Slider.Thumb opacity={0} width={1} height={1} />
```

## メモ
- `Slider` は `value` が **配列**（例: `[30]`）
- `min` / `max` / `step` は Slider 側に指定
