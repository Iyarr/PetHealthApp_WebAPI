# PetHealthApp_WebAPI

## ファイル構成

```bash
.
├── README.md
├── package.json
├── package-lock.json
├── dist/
├── src/
│   ├── app.ts
│   ├── routes/
│   |   └── user.ts
|   ├── controllers/
│       └── user.ts
|
├── tsconfig.json
└── npm.sh
```

## 使用できるコマンド

### 本番用

- サーバーの起動

```bash
./npm.sh start
```

- コードのビルド(JavaScript に変換)

```bash
./npm.sh build
```

### 開発用

- サーバーの起動

```bash
./npm.sh start dev
```

- コードのテスト

> 内容はまだ決めてない
