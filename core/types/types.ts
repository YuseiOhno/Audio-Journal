export type GeoPoint = {
  lat: number;
  lng: number;
  accuracy: number | null;
};

export type RecordingDraft = {
  dateKey: string;
  createdAt: string;
  audioUri: string;
  durationMs: number;
  location: GeoPoint | null;
  memo: string;
  waveform: number[];
  recording_title: string;
};

export type RecordingRow = {
  id: number;
  date_key: string;
  created_at: string;
  audio_uri: string;
  duration_ms: number;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  memo: string;
  waveform_blob: number[];
  waveform_length: number;
  recording_title: string;
};
