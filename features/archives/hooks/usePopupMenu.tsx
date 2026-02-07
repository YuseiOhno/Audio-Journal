//modalを開く　要素以外をタップしたら閉じる
//削除、編集、共有の項目
//削除はファイル、DBの流れ
//編集はmemoモーダルを使用

import { useActionSheet } from "@expo/react-native-action-sheet";

type Props = {
  id?: number;
  audioUri?: string;
  title?: string | null;
  memo?: string | null;
};

export default function usePopupMenu() {
  const { showActionSheetWithOptions } = useActionSheet();

  return ({ id, audioUri, title, memo }: Props) => {
    const options = ["Edit", "Delete", "Cancel"];
    const destructiveButtonIndex = 1; //red

    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        tintColor: "#333333",
        userInterfaceStyle: "light",
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case 1:
            console.log("edit");
            break;
          case 2:
            console.log("cancel");
            break;
          case destructiveButtonIndex:
            console.log("delete");
            break;
        }
      },
    );
  };
}
