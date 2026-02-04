//modalを開く　要素以外をタップしたら閉じる
//削除、編集、共有の項目
//削除はファイル、DBの流れ
//編集はmemoモーダルを使用

import { Modal } from "react-native";

type Props = {
  id?: number;
  audioUri?: string;
  title?: string | null;
  memo?: string | null;
};

export default function PopupMenu({ id, audioUri, title, memo }: Props) {
  return <></>;
}
