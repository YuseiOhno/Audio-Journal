import { db } from "@/db";

type RecordingInsert = {
  dateKey: string;
  createdAt: string;
  audioUri: string;
  durationMs: number | null;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  memo: string | null;
};

export async function insertRecording(data: RecordingInsert) {
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
      memo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
    ]
  );
}

export async function readRecordings() {
  const allRows = await db.getAllAsync("SELECT * FROM recordings");
  console.log(allRows);
}
