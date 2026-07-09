const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dist', '文物论文写作助手-单文件版.html');
const html = fs.readFileSync(filePath, 'utf-8');

console.log('File size:', html.length, 'bytes');
console.log('Starts with:', html.substring(0, 150));
console.log('...');
console.log('Has style tag:', html.includes('<style>'));
console.log('Has script tag:', html.includes('<script>'));

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
console.log('CSS length:', styleMatch ? styleMatch[1].length : 0);

const scriptMatches = html.match(/<script>/g);
console.log('Script open tags:', scriptMatches ? scriptMatches.length : 0);

const scriptCloseMatches = html.match(/<\/script>/g);
console.log('Script close tags:', scriptCloseMatches ? scriptCloseMatches.length : 0);

// 检查 body 内容
const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
if (bodyMatch) {
  console.log('Body content length:', bodyMatch[1].length);
  console.log('Body starts with:', bodyMatch[1].substring(0, 100));
}
