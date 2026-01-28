const INT16_MAX = 32767;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

//0〜1 → Uint8Array/BLOB
export const toWaveformBlob = (normalizedHeights: number[]): Uint8Array => {
  const int16 = new Int16Array(normalizedHeights.length);
  for (let i = 0; i < normalizedHeights.length; i += 1) {
    const v = clamp01(normalizedHeights[i]);
    int16[i] = Math.round(v * INT16_MAX);
  }
  return new Uint8Array(int16.buffer);
};

//Uint8Array/ArrayBuffer → 0〜1配列
export const fromWaveformBlob = (blob: Uint8Array | ArrayBuffer): number[] => {
  const buffer = blob instanceof Uint8Array ? blob.buffer : blob;
  const int16 = new Int16Array(buffer);
  const heights = new Array(int16.length);
  for (let i = 0; i < int16.length; i += 1) {
    heights[i] = int16[i] / INT16_MAX;
  }
  return heights;
};
