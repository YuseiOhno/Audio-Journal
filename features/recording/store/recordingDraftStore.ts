// features/recording/store/recordingDraftStore.ts
import { create } from "zustand";
import type { RecordingDraft } from "@/core/types/types";

type RecordingDraftState = {
  draft: RecordingDraft | null;
  setDraft: (draft: RecordingDraft) => void;
  updateDraft: (partial: Partial<RecordingDraft>) => void;
  clearDraft: () => void;
};

export const useRecordingDraftStore = create<RecordingDraftState>((set, get) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  updateDraft: (partial) =>
    set((state) => (state.draft ? { draft: { ...state.draft, ...partial } } : state)),
  clearDraft: () => set({ draft: null }),
}));
