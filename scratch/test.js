import fs from 'fs';
const code = fs.readFileSync('src/main.js', 'utf8');
try {
  new Function(code);
  console.log("No syntax errors");
} catch(e) {
  console.error("Syntax Error:", e);
}
