// Kindle本プレビュー生成器 - メインファイル
const { getMarkdownPath, getOutputPath } = require('./src/utils/pathUtils');
const { readMarkdownFile, writeHtmlFile } = require('./src/utils/fileUtils');
const { markdownToHtml } = require('./src/converters/markdownConverter');
const { generateHtmlTemplate } = require('./src/templates/htmlTemplate');

/**
 * Kindle本プレビューを生成するメイン関数
 */
function generateKindlePreview() {
    try {
        // Markdownファイルのパスを取得
        const markdownPath = getMarkdownPath();
        const outputPath = getOutputPath();

        // Markdownファイルを読み込み
        console.log('📖 Markdownファイルを読み込み中...');
        const markdownContent = readMarkdownFile(markdownPath);

        // MarkdownをHTMLに変換
        console.log('🔄 MarkdownをHTMLに変換中...');
        const htmlContent = markdownToHtml(markdownContent);

        // HTMLテンプレートを生成
        console.log('📄 HTMLテンプレートを生成中...');
        const fullHtml = generateHtmlTemplate(htmlContent);

        // HTMLファイルを出力
        console.log('💾 HTMLファイルを出力中...');
        writeHtmlFile(outputPath, fullHtml);

        // 完了メッセージ
        console.log('✅ Kindle本プレビューを生成しました: ' + outputPath);
        console.log(
            '📖 ブラウザで ' +
                outputPath +
                ' を開いてプレビューを確認してください'
        );
        console.log('🖼️ 画像ファイルが存在する場合は実際の画像が表示されます');
    } catch (error) {
        console.error('❌ エラーが発生しました:', error.message);
        process.exit(1);
    }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
    generateKindlePreview();
}

module.exports = {
    generateKindlePreview,
};
