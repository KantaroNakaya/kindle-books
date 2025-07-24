/**
 * Kindle本プレビュー用のCSSスタイル
 * @returns {string} CSSスタイル文字列
 */
function getCssStyles() {
    return `
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
    `;
}

module.exports = {
    getCssStyles,
};
