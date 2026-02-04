# React Native Flexboxまとめ

## 基本
- 親が「flexコンテナ」、子が「flexアイテム」
- 既定の並びは `flexDirection: "column"`（上→下）
- 主軸（main axis）と交差軸（cross axis）を意識する
  - `row` なら主軸=横、交差軸=縦
  - `column` なら主軸=縦、交差軸=横

## 親（コンテナ）でよく使う
- `flexDirection`: `"row"` / `"column"`（並べる向き）
- `justifyContent`: 主軸方向の整列
  - `"flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly"`
- `alignItems`: 交差軸方向の整列
  - `"flex-start" | "center" | "flex-end" | "stretch" | "baseline"`
- `flexWrap`: 折り返し
  - `"nowrap" | "wrap"`
- `gap` / `rowGap` / `columnGap`: 要素間の隙間（対応バージョンのみ）

## 子（アイテム）でよく使う
- `flex`: 余白の取り合い（比率）
  - 例: `1` と `2` なら 1:2 で配分
- `flexGrow`: 余白の広がり
- `flexShrink`: 収縮の度合い
- `flexBasis`: 初期サイズ
- `alignSelf`: その子だけ `alignItems` を上書き

## 最短イメージ
- `justifyContent`: 並び方向にどう散らす/寄せるか
- `alignItems`: 並びと直交する方向にどう揃えるか
- `alignItems: "stretch"` は交差軸方向に伸ばす（ただし子に固定サイズがあると伸びない）

## 例
```tsx
<View style={{ flexDirection: "row" }}>
  <View style={{ flex: 1 }} />
  <View style={{ flex: 2 }} />
</View>
```
