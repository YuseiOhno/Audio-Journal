import { db } from "@/core/db";
import { fromWaveformBlob, toWaveformBlob } from "@/core/lib/waveformBlob";
import type { RecordingDraft, RecordingRow } from "@/core/types/types";

const toInsertParams = (data: RecordingDraft) => {
  const waveformBlob = toWaveformBlob(data.waveform);

  return [
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
    data.recording_title,
  ];
};

const toRecordingRow = (row: any): RecordingRow => {
  return {
    ...row,
    waveform_blob: row.waveform_blob ? fromWaveformBlob(row.waveform_blob) : [],
  };
};

const toRecordingDraft = (row: RecordingRow): RecordingDraft => {
  return {
    dateKey: row.date_key,
    createdAt: row.created_at,
    audioUri: row.audio_uri,
    durationMs: row.duration_ms,
    location:
      row.lat == null || row.lng == null
        ? null
        : { lat: row.lat, lng: row.lng, accuracy: row.accuracy ?? null },
    memo: row.memo ?? "",
    waveform: row.waveform_blob ?? [],
    recording_title: row.recording_title ?? "",
  };
};

export async function insertRecording(data: RecordingDraft) {
  const params = toInsertParams(data);

  const result = await db.runAsync(
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
      recording_title
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [...params],
  );
  return result.lastInsertRowId;
}

//一覧用のデータを取得
export async function getRecordings() {
  const rows: any = await db.getAllAsync(
    "SELECT id, date_key, created_at, duration_ms, lat, lng, accuracy, recording_title FROM recordings",
  );
  if (!rows) return null;

  return rows.map((row: any) => ({
    ...row,
  }));
}

//IDをトリガーにレコードを取得
export async function getRecordingRecordById(id: number) {
  const row: any = await db.getFirstAsync("SELECT * FROM recordings WHERE id = ?", [id]);
  if (!row) return null;

  return toRecordingRow(row);
}

export async function getRecordingDraftById(id: number) {
  const row = await getRecordingRecordById(id);
  if (!row) return null;

  return toRecordingDraft(row);
}

//IDをトリガーにレコードを削除
export async function deleteRecordingRecordById(id: number) {
  const result = await db.runAsync("DELETE FROM recordings WHERE id = ?", [id]);
  return result.changes > 0;
}

//レコードの編集
export async function updateRecordingTitleMemoById(
  id: number,
  patch: { recording_title: string; memo: string },
) {
  const result = await db.runAsync(
    "UPDATE recordings SET recording_title = ?, memo = ? WHERE id = ?",
    [patch.recording_title, patch.memo, id],
  );
  return result.changes > 0;
}
