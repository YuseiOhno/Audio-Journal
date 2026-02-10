import { db } from "@/core/db";
import {
  fromDbRecordingListRow,
  fromDbRecordingRow,
  toInsertRecordingParams,
  toRecordingDraft,
  type DbRecordingListRow,
  type DbRecordingRow,
} from "@/core/db/repositories/recordingsMapper";
import type { RecordingDraft } from "@/core/types/types";

//インサート
export async function insertRecording(data: RecordingDraft) {
  const params = toInsertRecordingParams(data);

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
  const rows = await db.getAllAsync<DbRecordingListRow>(
    "SELECT id, date_key, created_at, duration_ms, lat, lng, accuracy, memo, recording_title FROM recordings",
  );
  if (!rows) return null;

  return rows.map(fromDbRecordingListRow);
}

//IDをトリガーにレコードを取得
export async function getRecordingRecordById(id: number) {
  const row = await db.getFirstAsync<DbRecordingRow>("SELECT * FROM recordings WHERE id = ?", [id]);
  if (!row) return null;

  return fromDbRecordingRow(row);
}

//IDをトリガーにレコードを取得、Draft型に変換
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

//レコードのアップデート
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
