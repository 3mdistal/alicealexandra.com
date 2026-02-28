import fs from 'fs';
const content = fs.readFileSync('content/tall-tales/factory.md', 'utf8');
const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
const match = content.match(frontmatterRegex);
const body = content.slice(match[0].length);
const rawSections = body.split('\n---\n');
console.log('Number of sections:', rawSections.length);
rawSections.forEach((s, i) => {
	console.log(`Section ${i} starts with: ${s.trim().substring(0, 30)}`);
});
