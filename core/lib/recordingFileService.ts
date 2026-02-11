import { File, Directory, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

//音声ファイルの永続化
export async function moveRecordingToDocuments(tmpUri: string) {
  // tmpUri から File を作成
  const src = new File(tmpUri);

  // 保存先ディレクトリを作成
  const destDir = new Directory(Paths.document, "recordings");
  destDir.create({ intermediates: true, idempotent: true });

  // ファイル名を生成して移動
  const ext = tmpUri.split(".").pop() || "wav";
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dest = new File(destDir, filename);

  src.move(dest);
  return dest.uri; // DBに保存するURI
}

//ファイルの削除
export async function removeIfExists(audioUri: string) {
  const file = new File(audioUri);
  file.delete();
}

//ファイル共有
const mimeMap: Record<string, string> = {
  wav: "audio/wav",
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
};

type ShareResult = { ok: true } | { ok: false; reason: "UNAVAILABLE" | "FAILED"; message?: string };

export const shareFile = async (fileUri: string): Promise<ShareResult> => {
  const ext = fileUri.split(".").pop()?.toLocaleLowerCase();
  const mime = ext ? mimeMap[ext] : undefined;

  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    return { ok: false, reason: "UNAVAILABLE" };
  }

  try {
    await Sharing.shareAsync(fileUri, {
      dialogTitle: "ファイルの共有",
      ...(mime ? { mimeType: mime } : {}),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: "FAILED", message: String((e as any)?.message ?? e) };
  }
};
