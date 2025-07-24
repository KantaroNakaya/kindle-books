const fs = require('fs');
const path = require('path');
const { getImageBaseDir } = require('./pathUtils');

/**
 * 画像ファイルの存在確認
 * @param {string} imagePath - 画像ファイルのパス
 * @returns {boolean}
 */
function checkImageExists(imagePath) {
    const currentDir = process.cwd();
    const baseDir = getImageBaseDir();
    const fullPath = path.join(currentDir, baseDir, imagePath);
    return fs.existsSync(fullPath);
}

/**
 * Markdownファイルを読み込み
 * @param {string} filePath - ファイルパス
 * @returns {string} ファイル内容
 */
function readMarkdownFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * HTMLファイルを書き込み
 * @param {string} filePath - 出力ファイルパス
 * @param {string} content - HTML内容
 */
function writeHtmlFile(filePath, content) {
    fs.writeFileSync(filePath, content);
}

module.exports = {
    checkImageExists,
    readMarkdownFile,
    writeHtmlFile,
};
