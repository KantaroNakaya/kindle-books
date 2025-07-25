const fs = require('fs');
const path = require('path');
const { isInLookerStudioDir } = require('./pathUtils');

/**
 * EPUB出力ディレクトリのパスを取得
 * @returns {string}
 */
function getEpubOutputDir() {
    return isInLookerStudioDir()
        ? 'epub-output'
        : 'lookerStudio-ga4/epub-output';
}

/**
 * EPUBファイルのパスを取得
 * @returns {string}
 */
function getEpubOutputPath() {
    return isInLookerStudioDir()
        ? 'kindle-book.epub'
        : 'lookerStudio-ga4/kindle-book.epub';
}

/**
 * ディレクトリが存在しない場合は作成
 * @param {string} dirPath - ディレクトリパス
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * EPUBファイルを書き込み
 * @param {string} filePath - 出力ファイルパス
 * @param {string} content - ファイル内容
 */
function writeEpubFile(filePath, content) {
    fs.writeFileSync(filePath, content);
}

/**
 * 章ごとにMarkdownを分割
 * @param {string} markdownContent - Markdown内容
 * @returns {Array} 章の配列
 */
function splitIntoChapters(markdownContent) {
    return markdownContent.split(/(?=^## 第 \d+ 章)/m);
}

/**
 * ファイル名を安全な形式に変換
 * @param {string} filename - 元のファイル名
 * @returns {string} 安全なファイル名
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

module.exports = {
    getEpubOutputDir,
    getEpubOutputPath,
    ensureDirectoryExists,
    writeEpubFile,
    splitIntoChapters,
    sanitizeFilename,
};
