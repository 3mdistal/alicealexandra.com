const fs = require('fs');
const content = fs.readFileSync('../teenylilcontent/tall-tales/factory.md', 'utf8');
const oldStr = `  - backgroundImage: "https://pub-a1233e2ec22b407fb8ef2b8a06521728.r2.dev/tall-tales/factory-3.jpg"\n    textColor: "#ffffff"\n---`;
const newStr = `  - backgroundImage: "https://pub-a1233e2ec22b407fb8ef2b8a06521728.r2.dev/tall-tales/factory-3.jpg"\n    textColor: "#ffffff"\n  - backgroundImage: "https://pub-a1233e2ec22b407fb8ef2b8a06521728.r2.dev/tall-tales/factory-4.jpg"\n    textColor: "#ffffff"\n---`;
fs.writeFileSync('../teenylilcontent/tall-tales/factory.md', content.replace(oldStr, newStr));
