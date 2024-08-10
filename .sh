# 開発時に必要なコマンドをまとめたスクリプト

# サーバー起動コマンド
start() {
  npx tsx watch src/app.ts
}

test() {
  # テストコードを書いたらここに書く
  echo "test"
}

if [ "$1" == "test" ]; then
  test
elif [ "$1" == "start" ]; then
  start
else
  echo "Invalid command"
fi

exit 0