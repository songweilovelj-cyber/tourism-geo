const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

const scriptTagStart = '<script type="module" crossorigin>';
const scriptTagEnd = '</script>';

const startIdx = html.indexOf(scriptTagStart);
const endIdx = html.indexOf(scriptTagEnd, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  let jsCode = html.substring(startIdx + scriptTagStart.length, endIdx);
  
  console.log('JS code length:', jsCode.length);
  
  const scriptTagCount = (jsCode.match(/<\/script>/g) || []).length;
  console.log('Found </script> strings in JS:', scriptTagCount);
  
  if (scriptTagCount > 0) {
    jsCode = jsCode.replace(/<\/script>/g, '<\\/script>');
    console.log('Escaped </script> strings');
  }
  
  html = html.substring(0, startIdx) + '<script>' + jsCode + '</script>' + html.substring(endIdx + scriptTagEnd.length);
}

html = html.replace(
  '<title>全民 GEO · 本地服务 + 大模型</title>',
  '<title>文物期刊论文写作助手</title>'
);

html = html.replace('<link rel="icon" type="image/svg+xml" href="./icons.svg" />', '');

const outputPath = path.join(__dirname, 'dist', '文物论文写作助手-单文件版.html');
fs.writeFileSync(outputPath, html, 'utf-8');

const stats = fs.statSync(outputPath);
console.log('');
console.log('✅ 单文件版已生成：');
console.log('   ', outputPath);
console.log('   文件大小：', (stats.size / 1024).toFixed(1), 'KB');
console.log('');
console.log('💡 使用方法：双击HTML文件即可在浏览器中打开体验');
