//-60~0のdb値を0~1に変換・補正。
export const normalizeDb = (db: number) => {
  const normalized = Math.max(0, Math.min(1, (db + 60) / 60));
  const shaped = Math.pow(normalized, 1.4);

  return shaped;
};
