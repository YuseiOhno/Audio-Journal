import { db } from "@/core/db";
import { fromWaveformBlob, toWaveformBlob } from "@/core/lib/waveformBlob";
import type { RecordingDraft } from "@/core/types/types";

export async function insertRecording(data: RecordingDraft) {
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
      waveform_sample_interval_ms,
      recording_title
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    `,
    [
      data.dateKey,
      data.createdAt,
      data.audioUri,
      data.durationMs,
      data.location?.lat ?? null,
      data.location?.lng ?? null,
      data.location?.accuracy ?? null,
      data.memo,
      waveformBlob,
      data.waveform.length,
      data.waveformSampleIntervalMs,
      data.recording_title,
    ],
  );
}

export async function getRecordings() {
  const rows: any = await db.getAllAsync(
    "SELECT id, date_key, created_at, duration_ms, lat, lng, accuracy, recording_title FROM recordings",
  );
  if (!rows) return null;

  return rows.map((row: any) => ({
    ...row,
  }));
}

export async function getRecordingRecordById(id: number) {
  const row: any = await db.getFirstAsync("SELECT * FROM recordings WHERE id = ?", [id]);
  if (!row) return null;

  return { ...row, waveform_blob: row.waveform_blob ? fromWaveformBlob(row.waveform_blob) : null };
}

export async function getTest() {
  const rows: any = await db.getAllAsync("SELECT * FROM recordings");
  if (!rows) return null;

  return rows.map((row: any) => ({
    ...row,
  }));
}
