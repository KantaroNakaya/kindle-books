const { checkImageExists } = require('../utils/fileUtils');

/**
 * 見出しをHTMLに変換
 * @param {string} html - HTML文字列
 * @returns {string} 変換後のHTML
 */
function convertHeadings(html) {
    // 見出しの変換（####と#####にも対応）
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    return html;
}

/**
 * 目次部分を特別処理
 * @param {string} html - HTML文字列
 * @returns {string} 変換後のHTML
 */
function convertTableOfContents(html) {
    return html.replace(
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
}

/**
 * 画像をHTMLに変換
 * @param {string} html - HTML文字列
 * @returns {string} 変換後のHTML
 */
function convertImages(html) {
    return html.replace(
        /!\[(.*?)\]\((.*?)\)/g,
        function (match, altText, imagePath) {
            if (checkImageExists(imagePath)) {
                // 実際の画像ファイルが存在する場合
                const imageSrc = imagePath; // 常に相対パスを使用
                return `<div class="image-container">
                    <img src="${imageSrc}" alt="${altText}" class="book-image" />
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
}

/**
 * リストをHTMLに変換
 * @param {string} html - HTML文字列
 * @returns {string} 変換後のHTML
 */
function convertLists(html) {
    // まず、リストアイテムを一時的にマーク（インデントも含む）
    html = html.replace(/^(\s*)- (.*$)/gim, function (match, spaces, content) {
        const indentLevel = Math.floor(spaces.length / 2); // 2スペース = 1レベル
        return `<!--LIST_ITEM:${indentLevel}-->${content}<!--/LIST_ITEM-->`;
    });

    // 番号付きリストを処理
    html = html.replace(
        /^(\d+)\.\s+(.*$)/gim,
        '<!--ORDERED_LIST_ITEM-->$1<!--/ORDERED_LIST_ITEM-->$2<!--/ORDERED_LIST_ITEM_CONTENT-->'
    );

    // 連続するリストアイテムをulで囲む（ネスト対応）
    html = html.replace(
        /(<!--LIST_ITEM:\d+-->.*?<!--\/LIST_ITEM-->)(?:\s*(<!--LIST_ITEM:\d+-->.*?<!--\/LIST_ITEM-->))*/gs,
        function (match) {
            const items = match.match(
                /<!--LIST_ITEM:(\d+)-->(.*?)<!--\/LIST_ITEM-->/gs
            );
            if (items && items.length > 0) {
                const listItems = items
                    .map((item) => {
                        const parts = item.match(
                            /<!--LIST_ITEM:(\d+)-->(.*?)<!--\/LIST_ITEM-->/s
                        );
                        const indentLevel = parseInt(parts[1]);
                        const content = parts[2];
                        return `<li style="margin-left: ${
                            indentLevel * 20
                        }px">${content}</li>`;
                    })
                    .join('');
                return `<ul>${listItems}</ul>`;
            }
            return match;
        }
    );

    // 連続する番号付きリストアイテムをolで囲む
    html = html.replace(
        /(<!--ORDERED_LIST_ITEM-->.*?<!--\/ORDERED_LIST_ITEM_CONTENT-->)(?:\s*(<!--ORDERED_LIST_ITEM-->.*?<!--\/ORDERED_LIST_ITEM_CONTENT-->))*/gs,
        function (match) {
            const items = match.match(
                /<!--ORDERED_LIST_ITEM-->(\d+)<!--\/ORDERED_LIST_ITEM-->(.*?)<!--\/ORDERED_LIST_ITEM_CONTENT-->/gs
            );
            if (items && items.length > 0) {
                const listItems = items
                    .map((item) => {
                        const parts = item.match(
                            /<!--ORDERED_LIST_ITEM-->(\d+)<!--\/ORDERED_LIST_ITEM-->(.*?)<!--\/ORDERED_LIST_ITEM_CONTENT-->/s
                        );
                        return `<li value="${parts[1]}">${parts[2]}</li>`;
                    })
                    .join('');
                return `<ol>${listItems}</ol>`;
            }
            return match;
        }
    );

    return html;
}

/**
 * 段落をHTMLに変換
 * @param {string} html - HTML文字列
 * @returns {string} 変換後のHTML
 */
function convertParagraphs(html) {
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

    return processedLines.join('\n');
}

/**
 * HTMLの後処理（不要なタグの削除など）
 * @param {string} html - HTML文字列
 * @returns {string} 処理後のHTML
 */
function postProcessHtml(html) {
    // 不要な空の段落タグを削除
    html = html.replace(/<p>\s*<\/p>/g, '');

    // 画像コンテナ内の不要な段落タグを削除
    html = html.replace(
        /<div class="image-container">\s*<p>/g,
        '<div class="image-container">'
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

/**
 * MarkdownをHTMLに変換
 * @param {string} markdown - Markdown文字列
 * @returns {string} HTML文字列
 */
function markdownToHtml(markdown) {
    let html = markdown;

    // 基本的な変換
    html = convertHeadings(html);

    // 太字
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 斜体
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 目次部分の特別処理
    html = convertTableOfContents(html);

    // 画像の処理
    html = convertImages(html);

    // 画像の説明文を処理（_で囲まれたテキスト）
    html = html.replace(/_([^_]+)_/g, '<p class="image-description">$1</p>');

    // コードブロック
    html = html.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');

    // リストの処理
    html = convertLists(html);

    // 段落の処理
    html = convertParagraphs(html);

    // 後処理
    html = postProcessHtml(html);

    return html;
}

module.exports = {
    markdownToHtml,
};
