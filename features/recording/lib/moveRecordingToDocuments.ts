import { File, Directory, Paths } from "expo-file-system";

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
