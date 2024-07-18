# ビルドコマンド
build() {
    find src -name "*.ts" | xargs npx esbuild --format=esm --platform=node --outdir=dist
}

# サーバー起動コマンド
start() {
    # 開発段階ではこっちを使う
    if [ "$1" = "dev" ]; then
        npx tsx watch src/app.ts
    else
        build
        npx tsx dist/app.js
    fi
}

test() {
    # テストコードを書いたらここに書く
    echo "test"
}

if [ "$1" == "test" ]; then
    test
elif [ "$1" == "build" ]; then
    build
elif [ "$1" == "start" ]; then
    start $2
else
    echo "Invalid command"
fi

exit 0