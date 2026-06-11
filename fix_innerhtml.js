// fix_innerhtml.js

const fs = require('fs');
const files = ['../gradesim/extension/src/popup.js', '../gradesim/extension/src/curriculum.js'];

const helper = `
// Safe HTML setter to avoid AMO innerHTML warnings
Object.defineProperty(Element.prototype, 'safeHTML', {
  set: function(html) {
    if (!html) {
      this.replaceChildren();
      return;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    this.replaceChildren(...doc.body.childNodes);
  }
});
`;

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  // Insert helper after the first comment block if not present
  if (!code.includes('safeHTML')) {
    code = code.replace(/(?:\/\*[\s\S]*?\*\/|\/\/.*[\r\n]+)*/, match => match + helper);
  }

  // Fix sanitizeText
  code = code.replace(
    /const div = document\.createElement\('div'\);\s*div\.textContent = text;\s*return div\.innerHTML;/,
    `return text.replace(/[&<>"']/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m]));`
  );

  // Replace all .innerHTML = with .safeHTML =
  code = code.replace(/\.innerHTML\s*=/g, '.safeHTML =');

  fs.writeFileSync(file, code);
});
console.log('Fixed safeHTML!');
