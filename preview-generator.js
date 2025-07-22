const fs = require('fs');
const path = require('path');

// 現在のディレクトリを確認して、適切なパスを設定
const currentDir = process.cwd();
const isInLookerStudioDir = currentDir.includes('lookerStudio-ga4');

// Markdownファイルのパスを設定
const markdownPath = isInLookerStudioDir
    ? 'kindle-book-content.md'
    : 'lookerStudio-ga4/kindle-book-content.md';

// Markdownファイルを読み込み
const markdownContent = fs.readFileSync(markdownPath, 'utf8');

// 画像ファイルの存在確認
function checkImageExists(imagePath) {
    const baseDir = isInLookerStudioDir ? '.' : 'lookerStudio-ga4';
    const fullPath = path.join(currentDir, baseDir, imagePath);
    return fs.existsSync(fullPath);
}

// 簡単なMarkdown to HTML変換（基本的な変換のみ）
function markdownToHtml(markdown) {
    let html = markdown;

    // 見出しの変換（####と#####にも対応）
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 太字
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 斜体
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 目次部分の特別処理（修正版）
    html = html.replace(
        /## 目次\n\n((?:- \[.*?\]\(.*?\)\n?)+)/g,
        function (match, tocContent) {
            const tocItems = tocContent
                .split('\n')
                .filter((line) => line.trim());
            const tocHtml = tocItems
                .map((item, index) => {
                    const chapterTitle = item.replace(
                        /^- \[(.*?)\]\(.*?\)$/,
                        '$1'
                    );
                    return `<li class="toc-item"><span class="toc-number">${
                        index + 1
                    }.</span> <span class="toc-title">${chapterTitle}</span></li>`;
                })
                .join('');
            return (
                '<h2>目次</h2>\n<div class="toc-container">\n<ol class="toc-list">' +
                tocHtml +
                '</ol>\n</div>'
            );
        }
    );

    // 画像の処理（改良版）
    html = html.replace(
        /!\[(.*?)\]\((.*?)\)/g,
        function (match, altText, imagePath) {
            if (checkImageExists(imagePath)) {
                // 実際の画像ファイルが存在する場合
                const imageSrc = imagePath; // 常に相対パスを使用
                return `<div class="image-container">
                    <img src="${imageSrc}" alt="${altText}" class="book-image" />
                    <div class="image-caption">${altText}</div>
                </div>`;
            } else {
                // 画像ファイルが存在しない場合
                return `<div class="image-placeholder">
                    <div class="placeholder-icon">📷</div>
                    <div class="placeholder-text">[画像: ${altText}]</div>
                    <div class="placeholder-path">パス: ${imagePath}</div>
                </div>`;
            }
        }
    );

    // 画像の説明文を処理（_で囲まれたテキスト）
    html = html.replace(/_([^_]+)_/g, '<p class="image-description">$1</p>');

    // コードブロック
    html = html.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');

    // リストの処理を改善
    // まず、リストアイテムを一時的にマーク
    html = html.replace(/^- (.*$)/gim, '<!--LIST_ITEM-->$1<!--/LIST_ITEM-->');

    // 連続するリストアイテムをulで囲む
    html = html.replace(
        /(<!--LIST_ITEM-->.*?<!--\/LIST_ITEM-->)(?:\s*(<!--LIST_ITEM-->.*?<!--\/LIST_ITEM-->))*/gs,
        function (match) {
            const items = match.match(
                /<!--LIST_ITEM-->(.*?)<!--\/LIST_ITEM-->/gs
            );
            if (items && items.length > 0) {
                const listItems = items
                    .map((item) =>
                        item.replace(
                            /<!--LIST_ITEM-->(.*?)<!--\/LIST_ITEM-->/s,
                            '<li>$1</li>'
                        )
                    )
                    .join('');
                return `<ul>${listItems}</ul>`;
            }
            return match;
        }
    );

    // 段落の処理を改善
    // 空行で区切られたテキストブロックを段落に変換
    const lines = html.split('\n');
    const processedLines = [];
    let currentParagraph = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // 既にHTMLタグが含まれている行はそのまま
        if (line.match(/^<(h[1-6]|ul|ol|div|pre|p)/)) {
            // 現在の段落があれば処理
            if (currentParagraph.length > 0) {
                const paragraphText = currentParagraph.join(' ').trim();
                if (paragraphText) {
                    processedLines.push(`<p>${paragraphText}</p>`);
                }
                currentParagraph = [];
            }
            processedLines.push(line);
        }
        // 空行の場合
        else if (line === '') {
            // 現在の段落があれば処理
            if (currentParagraph.length > 0) {
                const paragraphText = currentParagraph.join(' ').trim();
                if (paragraphText) {
                    processedLines.push(`<p>${paragraphText}</p>`);
                }
                currentParagraph = [];
            }
        }
        // 通常のテキスト行
        else {
            currentParagraph.push(line);
        }
    }

    // 最後の段落を処理
    if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ').trim();
        if (paragraphText) {
            processedLines.push(`<p>${paragraphText}</p>`);
        }
    }

    html = processedLines.join('\n');

    // 不要な空の段落タグを削除
    html = html.replace(/<p>\s*<\/p>/g, '');

    // 画像コンテナ内の不要な段落タグを削除
    html = html.replace(
        /<div class="image-container">\s*<p>/g,
        '<div class="image-container">'
    );
    html = html.replace(
        /<\/p>\s*<div class="image-caption">/g,
        '<div class="image-caption">'
    );
    html = html.replace(
        /<div class="image-placeholder">\s*<p>/g,
        '<div class="image-placeholder">'
    );
    html = html.replace(
        /<\/p>\s*<div class="placeholder-icon">/g,
        '<div class="placeholder-icon">'
    );

    // 画像後の不正なHTMLタグを修正
    html = html.replace(/<p><\/div>/g, '</div>');
    html = html.replace(/<p><\/div>/g, '</div>');
    html = html.replace(/<\/div>\s*<p>/g, '</div><p>');

    // 画像説明文の位置を調整
    html = html.replace(
        /<\/div>\s*<p class="image-description">/g,
        '</div>\n<p class="image-description">'
    );

    // 画像コンテナ後の不正なHTMLタグを修正
    html = html.replace(/<\/div><\/p>/g, '</div>');
    html = html.replace(/<\/div>\s*<\/p>/g, '</div>');

    return html;
}

// HTMLテンプレート
const htmlTemplate = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LookerStudio 導入書 - Kindle本プレビュー</title>
    <style>
        body {
            font-family: 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .book-container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            min-height: 100vh;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
            font-size: 2.2em;
        }
        h2 {
            color: #34495e;
            border-left: 4px solid #3498db;
            padding-left: 15px;
            margin-top: 40px;
            margin-bottom: 20px;
            font-size: 1.8em;
        }
        h3 {
            color: #2c3e50;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 1.4em;
            border-bottom: 1px solid #ecf0f1;
            padding-bottom: 5px;
        }
        h4 {
            color: #34495e;
            margin-top: 25px;
            margin-bottom: 12px;
            font-size: 1.2em;
            font-weight: 600;
        }
        h5 {
            color: #2c3e50;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 1.1em;
            font-weight: 600;
        }
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        ul {
            margin-bottom: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .toc-container {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 2px solid #dee2e6;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .toc-list {
            list-style: none;
            counter-reset: toc-counter;
            margin: 0;
            padding: 0;
        }
        .toc-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 12px 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
            counter-increment: toc-counter;
        }
        .toc-item:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            background: #f8f9fa;
        }
        .toc-number {
            font-weight: bold;
            color: #3498db;
            font-size: 1.1em;
            margin-right: 15px;
            min-width: 30px;
        }
        .toc-title {
            font-size: 1.05em;
            color: #2c3e50;
            font-weight: 500;
        }
        .image-container {
            margin: 25px 0;
            text-align: center;
        }
        .book-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border: 1px solid #e9ecef;
        }
        .image-caption {
            margin-top: 10px;
            font-size: 0.9em;
            color: #6c757d;
            font-style: italic;
            text-align: center;
        }
        .image-description {
            margin-top: 15px;
            font-size: 0.95em;
            color: #495057;
            font-style: italic;
            text-align: center;
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            border-left: 3px solid #3498db;
        }
        .image-placeholder {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 2px dashed #bdc3c7;
            padding: 30px;
            text-align: center;
            margin: 25px 0;
            border-radius: 8px;
            color: #7f8c8d;
        }
        .placeholder-icon {
            font-size: 3em;
            margin-bottom: 15px;
        }
        .placeholder-text {
            font-size: 1.1em;
            font-weight: 500;
            margin-bottom: 8px;
        }
        .placeholder-path {
            font-size: 0.9em;
            color: #95a5a6;
            font-family: monospace;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 20px 0;
        }
        code {
            font-family: 'Courier New', monospace;
        }
        .toc {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .toc h2 {
            border: none;
            padding: 0;
            margin: 0 0 15px 0;
        }
        .kindle-info {
            background: #e8f4fd;
            border: 1px solid #3498db;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .kindle-info h3 {
            color: #2980b9;
            margin-top: 0;
        }
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            .book-container {
                padding: 20px;
            }
            .toc-item {
                flex-direction: column;
                align-items: flex-start;
            }
            .toc-number {
                margin-bottom: 5px;
            }
            .book-image {
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="book-container">
        <div class="kindle-info">
            <h3>📱 Kindle本プレビュー</h3>
            <p>このページは、MarkdownファイルをKindle本形式で表示したプレビューです。実際のKindle本では、以下のような特徴があります：</p>
            <ul>
                <li>目次から各章へのジャンプ機能</li>
                <li>フォントサイズの調整機能</li>
                <li>ブックマーク機能</li>
                <li>ハイライト・メモ機能</li>
                <li>ページめくりアニメーション</li>
            </ul>
        </div>
        
        ${markdownToHtml(markdownContent)}
    </div>
</body>
</html>
`;

// HTMLファイルを生成
const outputPath = isInLookerStudioDir
    ? 'kindle-preview.html'
    : 'lookerStudio-ga4/kindle-preview.html';
fs.writeFileSync(outputPath, htmlTemplate);
console.log('✅ Kindle本プレビューを生成しました: ' + outputPath);
console.log(
    '📖 ブラウザで ' + outputPath + ' を開いてプレビューを確認してください'
);
console.log('🖼️ 画像ファイルが存在する場合は実際の画像が表示されます');
