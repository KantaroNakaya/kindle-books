const { getCssStyles } = require('../styles/cssStyles');

/**
 * Kindle本プレビュー用のHTMLテンプレートを生成
 * @param {string} content - HTMLコンテンツ
 * @returns {string} 完全なHTML文字列
 */
function generateHtmlTemplate(content) {
    const cssStyles = getCssStyles();

    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LookerStudio 導入書 - Kindle本プレビュー</title>
    <style>
        ${cssStyles}
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
        
        ${content}
    </div>
</body>
</html>`;
}

module.exports = {
    generateHtmlTemplate,
};
