//波形を構成する各バー幅とその余白を端末の画面幅に応じて計算

type CalcWaveformLayoutParams = {
  containerWidth: number;
  targetBars: number;
  paddingHorizontal: number;
  borderWidth: number;
  barGap: number;
};

export function calcWaveformLayout({
  containerWidth,
  targetBars,
  paddingHorizontal,
  borderWidth,
  barGap,
}: CalcWaveformLayoutParams) {
  if (containerWidth <= 0 || targetBars <= 0) {
    return { fitBarWidth: 1, fitGap: 0 };
  }

  const innerWidth = Math.max(0, containerWidth - borderWidth * 2 - paddingHorizontal * 2);
  let gap = barGap;
  let width = (innerWidth - gap * (targetBars - 1)) / targetBars;

  if (width <= 0) {
    gap = 0;
    width = innerWidth / targetBars;
  }

  return { fitBarWidth: Math.max(1, width), fitGap: gap };
}
