# ビルドコマンド
build() {
    find src -name "*.ts" | xargs npx esbuild --format=esm --platform=node --outdir=dist
}

# サーバー起動コマンド
start() {
    # 開発段階ではこっちを使う
    if [ "$2" = "dev" ]; then
        tsx watch src/index.ts
    else
        build
        tsx dist/index.js
    fi
}

test() {
    # テストコードを書いたらここに書く
}

if [ "$1" == "test" ]; then
    test
elif [ "$1" == "build" ]; then
    build
elif [ "$1" == "start" ]; then
    start
else
    echo "Invalid command"
fi