// Kindle本EPUB生成器 - メインファイル
const { getMarkdownPath } = require('./src/utils/pathUtils');
const { readMarkdownFile } = require('./src/utils/fileUtils');
const {
    getEpubOutputDir,
    getEpubOutputPath,
    ensureDirectoryExists,
    writeEpubFile,
    splitIntoChapters,
} = require('./src/utils/epubUtils');
const {
    markdownToEpubHtml,
    generateEpubXhtml,
    generateContainerXml,
    generateContentOpf,
    generateNavXhtml,
} = require('./src/converters/epubConverter');
const fs = require('fs');
const path = require('path');

/**
 * Kindle本EPUBを生成するメイン関数
 */
function generateKindleEpub() {
    try {
        // Markdownファイルのパスを取得
        const markdownPath = getMarkdownPath();
        const epubOutputDir = getEpubOutputDir();
        const epubOutputPath = getEpubOutputPath();

        // Markdownファイルを読み込み
        console.log('📖 Markdownファイルを読み込み中...');
        const markdownContent = readMarkdownFile(markdownPath);

        // EPUB出力ディレクトリを作成
        console.log('📁 EPUB出力ディレクトリを作成中...');
        ensureDirectoryExists(epubOutputDir);

        // META-INFディレクトリを作成
        const metaInfDir = path.join(epubOutputDir, 'META-INF');
        ensureDirectoryExists(metaInfDir);

        // stylesディレクトリを作成
        const stylesDir = path.join(epubOutputDir, 'styles');
        ensureDirectoryExists(stylesDir);

        // container.xmlを作成
        console.log('📄 container.xmlを作成中...');
        const containerXml = generateContainerXml();
        writeEpubFile(path.join(metaInfDir, 'container.xml'), containerXml);

        // CSSファイルをコピー
        console.log('🎨 CSSファイルをコピー中...');
        const cssSourcePath = path.join(__dirname, 'src', 'styles', 'epub.css');
        const cssDestPath = path.join(stylesDir, 'epub.css');
        fs.copyFileSync(cssSourcePath, cssDestPath);

        // 章ごとに分割
        console.log('📚 章ごとに分割中...');
        const chapters = splitIntoChapters(markdownContent);

        // 各章のXHTMLファイルを作成
        console.log('📖 各章のXHTMLファイルを作成中...');
        chapters.forEach((chapter, index) => {
            if (chapter.trim()) {
                const chapterTitle = extractChapterTitle(chapter);
                const chapterHtml = markdownToEpubHtml(chapter);
                const chapterXhtml = generateEpubXhtml(
                    chapterTitle,
                    chapterHtml
                );
                const chapterFileName = `chapter-${index + 1}.xhtml`;
                writeEpubFile(
                    path.join(epubOutputDir, chapterFileName),
                    chapterXhtml
                );
            }
        });

        // nav.xhtmlを作成
        console.log('📋 目次ファイルを作成中...');
        const navXhtml = generateNavXhtml('目次', chapters);
        writeEpubFile(path.join(epubOutputDir, 'nav.xhtml'), navXhtml);

        // content.opfを作成
        console.log('📦 content.opfを作成中...');
        const title = extractBookTitle(markdownContent);
        const author = '著者名'; // TODO: 設定可能にする
        const contentOpf = generateContentOpf(title, author, chapters);
        writeEpubFile(path.join(epubOutputDir, 'content.opf'), contentOpf);

        // EPUBファイルをZIP形式で作成
        console.log('📦 EPUBファイルを作成中...');
        createEpubFile(epubOutputDir, epubOutputPath);

        // 完了メッセージ
        console.log('✅ Kindle本EPUBを生成しました: ' + epubOutputPath);
        console.log(
            '📖 EPUBファイルをKindleやEPUBリーダーで開いて確認してください'
        );
    } catch (error) {
        console.error('❌ エラーが発生しました:', error.message);
        process.exit(1);
    }
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
 * 本のタイトルを抽出
 * @param {string} markdownContent - Markdown内容
 * @returns {string} 本のタイトル
 */
function extractBookTitle(markdownContent) {
    const titleMatch = markdownContent.match(/^# (.*$)/m);
    return titleMatch ? titleMatch[1] : 'Kindle本';
}

/**
 * EPUBファイルをZIP形式で作成
 * @param {string} epubDir - EPUBディレクトリ
 * @param {string} outputPath - 出力パス
 */
function createEpubFile(epubDir, outputPath) {
    // 簡易的なZIP作成（実際のプロジェクトではadm-zipなどのライブラリを使用することを推奨）
    const archiver = require('archiver');
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log('📦 EPUBファイルが正常に作成されました');
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);
    archive.directory(epubDir, false);
    archive.finalize();
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
    generateKindleEpub();
}

module.exports = {
    generateKindleEpub,
};
