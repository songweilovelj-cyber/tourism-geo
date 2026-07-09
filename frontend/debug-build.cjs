const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const htmlPath = path.join(distDir, 'index.html');

let html = fs.readFileSync(htmlPath, 'utf-8');
console.log('Original HTML length:', html.length);
console.log('');

const linkRegex = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
let match;
let cssContent = '';
let linkCount = 0;
while ((match = linkRegex.exec(html)) !== null) {
  linkCount++;
  const cssPath = path.join(distDir, match[1].replace(/^\.\//, ''));
  console.log('Found CSS link:', match[1]);
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf-8');
    console.log('  CSS file size:', css.length);
    cssContent += css + '\n';
  }
}
console.log('Total CSS links found:', linkCount);
console.log('Total CSS content length:', cssContent.length);
console.log('');

const scriptRegex = /<script[^>]*src="([^"]+)"[^>]*><\/script>/g;
let jsContent = '';
let scriptCount = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  scriptCount++;
  const jsPath = path.join(distDir, match[1].replace(/^\.\//, ''));
  console.log('Found JS script:', match[1]);
  if (fs.existsSync(jsPath)) {
    const js = fs.readFileSync(jsPath, 'utf-8');
    console.log('  JS file size:', js.length);
    jsContent += js + '\n';
  }
}
console.log('Total JS scripts found:', scriptCount);
console.log('Total JS content length:', jsContent.length);
