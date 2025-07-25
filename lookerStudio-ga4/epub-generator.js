/**
 * EPUB Generator for Kindle Books
 *
 * 使用方法:
 *   node epub-generator.js
 *
 * 機能:
 *   - MarkdownファイルをEPUB形式に変換
 *   - 日本語フォント対応
 *   - レスポンシブデザイン
 *   - 目次機能付き
 *
 * 出力:
 *   - epub-output/ (一時ファイル)
 *   - lookerstudio-introduction.epub (完成ファイル)
 */

const fs = require('fs');
const path = require('path');

// MarkdownをHTMLに変換する関数（改善版）
function markdownToHTML(markdown) {
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
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />');

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

// EPUBファイルを生成する関数
function generateEPUB(markdownContent, outputPath) {
    // 章ごとに分割
    const chapters = markdownContent.split(/(?=^## 第 \d+ 章)/m);

    // EPUBファイルの構造を作成
    const epubDir = 'epub-output';
    if (!fs.existsSync(epubDir)) {
        fs.mkdirSync(epubDir, { recursive: true });
    }

    // META-INFディレクトリを作成
    const metaInfDir = path.join(epubDir, 'META-INF');
    if (!fs.existsSync(metaInfDir)) {
        fs.mkdirSync(metaInfDir, { recursive: true });
    }

    // container.xmlを作成
    const containerXML = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`;

    fs.writeFileSync(path.join(metaInfDir, 'container.xml'), containerXML);

    // content.opfを作成
    const manifestItems = [];
    const spineItems = [];

    // ナビゲーションファイルを追加
    manifestItems.push(
        '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>'
    );
    spineItems.push('<itemref idref="nav"/>');

    // CSSファイルを追加
    manifestItems.push(
        '<item id="css" href="style.css" media-type="text/css"/>'
    );

    // 各章のHTMLファイルを作成
    chapters.forEach((chapter, index) => {
        if (chapter.trim()) {
            const chapterNumber = index + 1;
            const chapterId = `chapter${chapterNumber}`;
            const chapterFilename = `${chapterId}.xhtml`;

            // 章のタイトルを抽出
            const titleMatch = chapter.match(/^# (.*$)/m);
            const title = titleMatch ? titleMatch[1] : `第${chapterNumber}章`;

            const chapterHTML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
    <title>${title}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    ${markdownToHTML(chapter)}
</body>
</html>`;

            fs.writeFileSync(path.join(epubDir, chapterFilename), chapterHTML);

            // マニフェストとスパインに追加
            manifestItems.push(
                `<item id="${chapterId}" href="${chapterFilename}" media-type="application/xhtml+xml"/>`
            );
            spineItems.push(`<itemref idref="${chapterId}"/>`);
        }
    });

    // content.opfを作成
    const contentOPF = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
        <dc:identifier id="book-id">lookerstudio-introduction</dc:identifier>
        <dc:title>縦スクロールでパパッと学ぶ！LookerStudio 導入書</dc:title>
        <dc:creator>著者</dc:creator>
        <dc:language>ja</dc:language>
        <dc:date>2024</dc:date>
        <dc:publisher>出版社</dc:publisher>
        <dc:description>LookerStudioの導入に必要な基礎知識を網羅した実践的なガイドブック</dc:description>
        <meta property="dcterms:modified">2024-01-01T00:00:00Z</meta>
    </metadata>
    <manifest>
        ${manifestItems.join('\n        ')}
    </manifest>
    <spine>
        ${spineItems.join('\n        ')}
    </spine>
</package>`;

    fs.writeFileSync(path.join(epubDir, 'content.opf'), contentOPF);

    // ナビゲーションファイルを作成
    const navItems = [];
    chapters.forEach((chapter, index) => {
        if (chapter.trim()) {
            const chapterNumber = index + 1;
            const titleMatch = chapter.match(/^# (.*$)/m);
            const title = titleMatch ? titleMatch[1] : `第${chapterNumber}章`;
            navItems.push(
                `            <li><a href="chapter${chapterNumber}.xhtml">${title}</a></li>`
            );
        }
    });

    const navXHTML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
    <title>目次</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <nav epub:type="toc">
        <h1>目次</h1>
        <ol>
${navItems.join('\n')}
        </ol>
    </nav>
</body>
</html>`;

    fs.writeFileSync(path.join(epubDir, 'nav.xhtml'), navXHTML);

    // CSSスタイルファイルを作成
    const cssContent = `body {
    font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
    line-height: 1.6;
    margin: 2em;
    color: #333;
    text-align: justify;
}

h1 {
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 0.5em;
    margin-top: 2em;
    margin-bottom: 1em;
    font-size: 1.8em;
}

h2 {
    color: #34495e;
    margin-top: 2em;
    margin-bottom: 1em;
    font-size: 1.5em;
}

h3 {
    color: #7f8c8d;
    margin-top: 1.5em;
    margin-bottom: 0.8em;
    font-size: 1.3em;
}

h4 {
    color: #95a5a6;
    margin-top: 1.2em;
    margin-bottom: 0.6em;
    font-size: 1.1em;
}

p {
    margin-bottom: 1em;
    text-indent: 1em;
}

ul, ol {
    margin-left: 2em;
    margin-bottom: 1em;
}

li {
    margin-bottom: 0.5em;
}

code {
    background-color: #f8f9fa;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: "Courier New", "Monaco", monospace;
    font-size: 0.9em;
}

pre {
    background-color: #f8f9fa;
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
    margin: 1em 0;
}

blockquote {
    border-left: 4px solid #3498db;
    padding-left: 1em;
    margin-left: 0;
    color: #7f8c8d;
    font-style: italic;
}

img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1em auto;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    font-size: 0.9em;
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
    font-weight: bold;
}

nav ol {
    list-style-type: none;
    padding: 0;
}

nav li {
    margin-bottom: 0.8em;
}

nav a {
    text-decoration: none;
    color: #3498db;
    font-size: 1.1em;
}

nav a:hover {
    text-decoration: underline;
}

nav h1 {
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 0.5em;
    margin-bottom: 1.5em;
}

/* ページブレークの制御 */
h1, h2 {
    page-break-before: auto;
    page-break-after: avoid;
}

h3, h4 {
    page-break-after: avoid;
}

/* 画像のページブレーク制御 */
img {
    page-break-inside: avoid;
}

/* リストのページブレーク制御 */
ul, ol {
    page-break-inside: avoid;
}`;

    fs.writeFileSync(path.join(epubDir, 'style.css'), cssContent);

    console.log(
        `EPUBファイルのコンポーネントが ${epubDir} ディレクトリに作成されました。`
    );
    console.log(
        '完全なEPUBファイルを作成するには、以下のコマンドを実行してください：'
    );
    console.log(`cd ${epubDir} && zip -r ../lookerstudio-introduction.epub .`);
}

// メイン処理
const markdownPath = 'kindle-book-content.md';

if (fs.existsSync(markdownPath)) {
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');
    generateEPUB(markdownContent, 'lookerstudio-introduction.epub');
} else {
    console.error('Markdownファイルが見つかりません:', markdownPath);
}
