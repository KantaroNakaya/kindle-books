const { checkImageExists } = require('../utils/fileUtils');

/**
 * MarkdownをEPUB用HTMLに変換
 * @param {string} markdown - Markdown内容
 * @returns {string} EPUB用HTML
 */
function markdownToEpubHtml(markdown) {
    let html = markdown;

    // 見出しの変換
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');

    // 強調とイタリック
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // インラインコード
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // 画像
    html = html.replace(
        /!\[(.*?)\]\((.*?)\)/g,
        function (match, altText, imagePath) {
            if (checkImageExists(imagePath)) {
                return `<img src="${imagePath}" alt="${altText}" />`;
            } else {
                return `<div class="image-placeholder">[画像: ${altText}]</div>`;
            }
        }
    );

    // リンク
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    // 引用
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // リスト（順序なし）
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');

    // 段落の処理
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/^<p>/g, '');
    html = html.replace(/<\/p>$/g, '');
    html = html.replace(/<\/p><p>/g, '</p>\n<p>');

    // 空の段落を削除
    html = html.replace(/<p><\/p>/g, '');

    return html;
}

/**
 * EPUB用のXHTMLテンプレートを生成
 * @param {string} title - タイトル
 * @param {string} content - HTML内容
 * @returns {string} XHTMLテンプレート
 */
function generateEpubXhtml(title, content) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
    <meta charset="UTF-8"/>
    <title>${title}</title>
    <link rel="stylesheet" type="text/css" href="../styles/epub.css"/>
</head>
<body>
    ${content}
</body>
</html>`;
}

/**
 * container.xmlを生成
 * @returns {string} container.xml内容
 */
function generateContainerXml() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`;
}

/**
 * content.opfを生成
 * @param {string} title - タイトル
 * @param {string} author - 著者
 * @param {Array} chapters - 章の配列
 * @returns {string} content.opf内容
 */
function generateContentOpf(title, author, chapters) {
    const manifestItems = [];
    const spineItems = [];

    // ナビゲーションファイルを追加（manifestのみ、spineには含めない）
    manifestItems.push(
        '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>'
    );
    // spineItems.push('<itemref idref="nav"/>'); // この行を削除

    // 各章を追加
    chapters.forEach((chapter, index) => {
        const chapterId = `chapter-${index + 1}`;
        const chapterFile = `chapter-${index + 1}.xhtml`;

        manifestItems.push(
            `<item id="${chapterId}" href="${chapterFile}" media-type="application/xhtml+xml"/>`
        );
        spineItems.push(`<itemref idref="${chapterId}"/>`);
    });

    // CSSファイルを追加
    manifestItems.push(
        '<item id="css" href="styles/epub.css" media-type="text/css"/>'
    );

    return `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
        <dc:identifier id="uid">urn:uuid:${generateUuid()}</dc:identifier>
        <dc:title>${title}</dc:title>
        <dc:creator>${author}</dc:creator>
        <dc:language>ja</dc:language>
        <dc:publisher>Kindle Book Generator</dc:publisher>
        <dc:date>${new Date().toISOString().split('T')[0]}</dc:date>
        <meta property="dcterms:modified">${new Date().toISOString()}</meta>
    </metadata>
    <manifest>
        ${manifestItems.join('\n        ')}
    </manifest>
    <spine>
        ${spineItems.join('\n        ')}
    </spine>
</package>`;
}

/**
 * nav.xhtmlを生成
 * @param {string} title - タイトル
 * @param {Array} chapters - 章の配列
 * @returns {string} nav.xhtml内容
 */
function generateNavXhtml(title, chapters) {
    const tocItems = chapters
        .map((chapter, index) => {
            const chapterTitle = extractChapterTitle(chapter);
            return `        <li><a href="chapter-${
                index + 1
            }.xhtml">${chapterTitle}</a></li>`;
        })
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
    <meta charset="UTF-8"/>
    <title>目次</title>
</head>
<body>
    <nav epub:type="toc" id="toc">
        <h1>目次</h1>
        <ol>
${tocItems}
        </ol>
    </nav>
</body>
</html>`;
}

/**
 * 章のタイトルを抽出
 * @param {string} chapter - 章の内容
 * @returns {string} 章のタイトル
 */
function extractChapterTitle(chapter) {
    const titleMatch = chapter.match(/^## (.*$)/m);
    return titleMatch ? titleMatch[1] : '無題の章';
}

/**
 * UUIDを生成
 * @returns {string} UUID
 */
function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
}

module.exports = {
    markdownToEpubHtml,
    generateEpubXhtml,
    generateContainerXml,
    generateContentOpf,
    generateNavXhtml,
};
