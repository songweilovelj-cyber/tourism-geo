const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

const htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

const cssMatch = htmlContent.match(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
let cssCode = '';
if (cssMatch) {
  const cssPath = path.join(distDir, cssMatch[1].replace(/^\.\//, ''));
  cssCode = fs.readFileSync(cssPath, 'utf-8');
}

const jsMatch = htmlContent.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/);
let jsCode = '';
if (jsMatch) {
  const jsPath = path.join(distDir, jsMatch[1].replace(/^\.\//, ''));
  jsCode = fs.readFileSync(jsPath, 'utf-8');
}

jsCode = jsCode.replace(/<\/script>/g, '<\\/script>');

const finalHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>文物期刊论文写作助手</title>
    <style>${cssCode}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>${jsCode}</script>
  </body>
</html>`;

const outputPath = path.join(distDir, '文物论文写作助手-单文件版.html');
fs.writeFileSync(outputPath, finalHtml, 'utf-8');

const stats = fs.statSync(outputPath);
console.log('✅ 单文件版已生成：');
console.log('   ', outputPath);
console.log('   文件大小：', (stats.size / 1024).toFixed(1), 'KB');
console.log('   CSS 大小：', (cssCode.length / 1024).toFixed(1), 'KB');
console.log('   JS 大小：', (jsCode.length / 1024).toFixed(1), 'KB');
console.log('');
console.log('💡 使用方法：双击HTML文件即可在浏览器中打开体验');
