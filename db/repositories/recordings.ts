import { db } from "@/db";
import { toWaveformBlob, fromWaveformBlob } from "@/utils/waveformBlob";

type RecordingInsert = {
  dateKey: string;
  createdAt: string;
  audioUri: string;
  durationMs: number | null;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  memo: string | null;
  waveform: number[];
  waveformSampleIntervalMs: number;
};

export async function insertRecording(data: RecordingInsert) {
  const waveformBlob = toWaveformBlob(data.waveform);

  await db.runAsync(
    `
    INSERT INTO recordings (
      date_key,
      created_at,
      audio_uri,
      duration_ms,
      lat,
      lng,
      accuracy,
      memo,
      waveform_blob,
      waveform_length,
      waveform_sample_interval_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.dateKey,
      data.createdAt,
      data.audioUri,
      data.durationMs,
      data.lat,
      data.lng,
      data.accuracy,
      data.memo,
      waveformBlob,
      data.waveform.length,
      data.waveformSampleIntervalMs,
    ],
  );
}

export async function readRecordings() {
  const rows: any = await db.getAllAsync("SELECT id, audio_uri, created_at FROM recordings");

  return rows.map((row: any) => ({
    ...row,
  }));
  // if (!row) return null;

  // return {
  //   ...row,
  //   waveform: row.waveform_blob ? fromWaveformBlob(row.waveform_blob) : [],
  // };
}
