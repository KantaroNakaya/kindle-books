const path = require('path');

/**
 * 現在のディレクトリがlookerStudio-ga4ディレクトリ内かどうかを判定
 * @returns {boolean}
 */
function isInLookerStudioDir() {
    const currentDir = process.cwd();
    return currentDir.includes('lookerStudio-ga4');
}

/**
 * Markdownファイルのパスを取得
 * @returns {string}
 */
function getMarkdownPath() {
    return isInLookerStudioDir()
        ? 'kindle-book-content.md'
        : 'lookerStudio-ga4/kindle-book-content.md';
}

/**
 * 出力HTMLファイルのパスを取得
 * @returns {string}
 */
function getOutputPath() {
    return isInLookerStudioDir()
        ? 'kindle-preview.html'
        : 'lookerStudio-ga4/kindle-preview.html';
}

/**
 * 画像ファイルのベースディレクトリを取得
 * @returns {string}
 */
function getImageBaseDir() {
    return isInLookerStudioDir() ? '.' : 'lookerStudio-ga4';
}

module.exports = {
    isInLookerStudioDir,
    getMarkdownPath,
    getOutputPath,
    getImageBaseDir,
};
