# Kindle 本プレビューツール

このツールは、Markdown ファイルを Kindle 本形式でプレビューし、EPUB ファイルを生成するためのツールです。

## 📖 使用方法

### 1. HTML プレビュー（推奨）

最も簡単で高速なプレビュー方法です。

```bash
# HTMLプレビューを生成
node preview-generator.js
# または
npm run preview

# ブラウザでプレビューを開く
open kindle-preview.html
```

**特徴：**

-   即座にプレビュー可能
-   レスポンシブデザイン対応
-   目次が正しくリスト表示される
-   Kindle 本の特徴を説明する情報ボックス付き

### 2. EPUB 生成

実際の電子書籍形式の EPUB ファイルを生成します。

```bash
# 依存関係をインストール（初回のみ）
npm install

# EPUBファイルを生成
node epub-generator.js
# または
npm run epub

# 生成されたEPUBファイルを確認
open kindle-book.epub
```

**特徴：**

-   実際の電子書籍形式（EPUB）
-   章ごとに分割された構造
-   目次からのジャンプ機能
-   日本語フォント対応
-   Kindle や EPUB リーダーで直接開ける

### 3. 一括生成

HTML プレビューと EPUB ファイルを同時に生成します。

```bash
npm run build
```

## 🏗️ プロジェクト構造

```
kindle-books/
├── src/
│   ├── utils/
│   │   ├── pathUtils.js      # パス管理ユーティリティ
│   │   ├── fileUtils.js      # ファイル操作ユーティリティ
│   │   └── epubUtils.js      # EPUB生成用ユーティリティ
│   ├── converters/
│   │   ├── markdownConverter.js  # Markdown→HTML変換
│   │   └── epubConverter.js      # EPUB生成用コンバーター
│   ├── templates/
│   │   └── htmlTemplate.js   # HTMLテンプレート
│   └── styles/
│       └── epub.css          # EPUB用スタイルシート
├── preview-generator.js      # HTMLプレビュー生成
├── epub-generator.js         # EPUBファイル生成
├── package.json              # 依存関係管理
└── README.md                 # このファイル
```

## 📱 Kindle 本の特徴

実際の Kindle 本では以下の機能が利用できます：

### 基本機能

-   **目次ジャンプ**：目次から各章への直接ジャンプ
-   **フォント調整**：文字サイズの変更
-   **ブックマーク**：お気に入りページの保存
-   **ハイライト**：重要な部分のマーキング
-   **メモ機能**：ページへのメモ追加

### 読みやすさ

-   **ページめくり**：スムーズなページめくりアニメーション
-   **自動スクロール**：画面サイズに応じた自動調整
-   **ダークモード**：目に優しい表示モード
-   **行間調整**：読みやすさのカスタマイズ

## 🎯 プレビューの活用方法

### 執筆中の確認

1. **構成の確認**：章立てと目次が適切か
2. **読みやすさの確認**：文章の流れとレイアウト
3. **画像配置の確認**：図表の位置とサイズ
4. **文字数の確認**：各章のボリュームバランス

### 最終チェック

1. **表記の統一**：用語や表記の一貫性
2. **リンクの確認**：目次のリンクが正しく動作するか
3. **画像の確認**：画像が適切に表示されるか
4. **レイアウトの確認**：モバイルでの表示確認

## 🔧 技術仕様

### 対応形式

-   **入力**: Markdown (.md)
-   **出力**: HTML (.html), EPUB (.epub)

### 依存関係

-   Node.js 14.0.0 以上
-   archiver (EPUB 生成用)

### ファイル配置

-   Markdown ファイル: `lookerStudio-ga4/kindle-book-content.md`
-   HTML 出力: `lookerStudio-ga4/kindle-preview.html`
-   EPUB 出力: `lookerStudio-ga4/kindle-book.epub`
-   一時ファイル: `lookerStudio-ga4/epub-output/`

## 📝 注意事項

1. **画像ファイル**: 画像は相対パスで指定し、Markdown ファイルと同じディレクトリに配置してください
2. **文字エンコーディング**: UTF-8 で保存してください
3. **EPUB ファイル**: 生成された EPUB ファイルは標準的な EPUB リーダーで開けます
4. **一時ファイル**: `epub-output/`ディレクトリは自動生成されますが、手動で削除しても問題ありません
