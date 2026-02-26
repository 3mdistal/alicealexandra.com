import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

function fixFile(filePath) {
    if (!filePath.match(/\.(md|json|svelte|ts)$/)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find any pub-...r2.dev URL and replace %20 with %2520
    const regex = /https:\/\/pub-a1233e2ec22b407fb8ef2b8a06521728\.r2\.dev\/[^\s"'>)]+/g;
    let newContent = content.replace(regex, (match) => {
        return match.replace(/%20/g, '%2520');
    });
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Fixed:', filePath);
    }
}

walkDir('../teenylilcontent', fixFile);
walkDir('src', fixFile);
walkDir('content', fixFile);
