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
│   │    └── user.ts
│   ├── controllers/
│       └── user.ts
│
├── tsconfig.json
└── npm.sh
```

### routes

API のエンドポイントを定義する場所
パスごとにファイルを分ける

### controllers

API のエンドポイントに対して処理を行う場所
routes に対応するファイルを作成する

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
