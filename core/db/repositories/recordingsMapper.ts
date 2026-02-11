import { fromWaveformBlob, toWaveformBlob } from "@/core/lib/waveformBlob";
import type { RecordingDraft, RecordingListItem, RecordingRow } from "@/core/types/types";

export type DbRecordingRow = {
  id: number;
  date_key: string;
  created_at: string;
  audio_uri: string;
  duration_ms: number | null;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  memo: string | null;
  waveform_blob: Uint8Array | ArrayBuffer | null;
  waveform_length: number | null;
  recording_title: string | null;
};

export type DbRecordingListRow = {
  id: number;
  date_key: string;
  created_at: string;
  duration_ms: number | null;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  memo: string | null;
  recording_title: string | null;
};

export type InsertRecordingParams = [
  string,
  string,
  string,
  number,
  number | null,
  number | null,
  number | null,
  string,
  Uint8Array,
  number,
  string,
];

export const toInsertRecordingParams = (data: RecordingDraft): InsertRecordingParams => {
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

export const fromDbRecordingRow = (row: DbRecordingRow): RecordingRow => {
  const waveform = row.waveform_blob ? fromWaveformBlob(row.waveform_blob) : [];

  return {
    id: row.id,
    date_key: row.date_key,
    created_at: row.created_at,
    audio_uri: row.audio_uri,
    duration_ms: row.duration_ms ?? 0,
    lat: row.lat,
    lng: row.lng,
    accuracy: row.accuracy,
    memo: row.memo ?? "",
    waveform_blob: waveform,
    waveform_length: row.waveform_length ?? waveform.length,
    recording_title: row.recording_title ?? "",
  };
};

export const fromDbRecordingListRow = (row: DbRecordingListRow): RecordingListItem => {
  return {
    id: row.id,
    date_key: row.date_key,
    created_at: row.created_at,
    duration_ms: row.duration_ms ?? 0,
    lat: row.lat,
    lng: row.lng,
    accuracy: row.accuracy,
    memo: row.memo ?? "",
    recording_title: row.recording_title ?? "",
  };
};

export const toRecordingDraft = (row: RecordingRow): RecordingDraft => {
  return {
    dateKey: row.date_key,
    createdAt: row.created_at,
    audioUri: row.audio_uri,
    durationMs: row.duration_ms,
    location:
      row.lat == null || row.lng == null
        ? null
        : { lat: row.lat, lng: row.lng, accuracy: row.accuracy ?? null },
    memo: row.memo,
    waveform: row.waveform_blob,
    recording_title: row.recording_title,
  };
};
