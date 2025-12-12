# Migrating Content from Notion to Local Markdown

This document describes the process used to migrate the HFC (Hymns for Calliope) poems from Notion to local markdown files. Use this as a template for migrating other pages like `/blog` and other `/studio` pages.

## Overview

### Why Migrate?

1. **Performance**: Static content loads faster than API calls to Notion
2. **Privacy**: Content can remain private even if the main site repo is public
3. **Reliability**: No dependency on Notion API availability
4. **Editing**: Markdown files are easier to version control and edit

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Build Time (Vercel)                       │
├─────────────────────────────────────────────────────────────────┤
│  1. prebuild: fetch-content.sh clones private repo              │
│  2. vite build: SvelteKit reads markdown files                  │
│  3. prerender: Static HTML generated with all content           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Runtime (User)                            │
├─────────────────────────────────────────────────────────────────┤
│  Static HTML served - no API calls, no file system access        │
└─────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Migration Process

### Step 1: Create the Private Content Repository

Create a new private GitHub repository for your content:

```bash
# Outside your main project
mkdir teenylilcontent
cd teenylilcontent
git init
echo "# Private Content Repository" > README.md
git add .
git commit -m "Initial commit"
gh repo create teenylilcontent --private --source=. --push
```

### Step 2: Write a Migration Script

Create a script to fetch content from Notion and convert it to markdown:

```typescript
// scripts/migrate-[content-type].ts
import dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Client } from '@notionhq/client';

// Load environment variables
dotenv.config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_KEY });
const OUTPUT_DIR = '../teenylilcontent/[content-type]';

// Key function: Convert Notion rich text to markdown
function richTextToMarkdown(richText: any[]): string {
  return richText
    .map((item) => {
      let text = item.plain_text;
      
      // Apply formatting
      if (item.annotations?.bold) text = `**${text}**`;
      if (item.annotations?.italic) text = `*${text}*`;
      if (item.annotations?.code) text = `\`${text}\``;
      if (item.annotations?.strikethrough) text = `~~${text}~~`;
      if (item.href) text = `[${text}](${item.href})`;
      
      return text;
    })
    .join('');
}

async function migrate() {
  // 1. Fetch from Notion database
  const response = await notion.databases.query({
    database_id: process.env.YOUR_DATABASE_ID!,
  });

  // 2. For each item, fetch block content and convert
  for (const page of response.results) {
    // Extract properties
    const title = getTitle(page);
    const blocks = await notion.blocks.children.list({ block_id: page.id });
    
    // Convert blocks to markdown
    const content = blocksToMarkdown(blocks.results);
    
    // 3. Write markdown file with frontmatter
    const markdown = `---
title: "${title}"
notionId: "${page.id}"
# Add other metadata as needed
---

${content}`;

    const filename = slugify(title) + '.md';
    await fs.writeFile(path.join(OUTPUT_DIR, filename), markdown);
  }
}
```

Add the script to package.json:

```json
{
  "scripts": {
    "migrate:[content-type]": "npx tsx scripts/migrate-[content-type].ts"
  },
  "devDependencies": {
    "dotenv": "^16.x"
  }
}
```

### Step 3: Create a Content Loader

Create a utility to load the markdown files at build time:

```typescript
// src/lib/content/[content-type].ts
import * as fs from 'fs/promises';
import * as path from 'path';

const PROJECT_ROOT = process.cwd();
const CONTENT_PATH = path.join(PROJECT_ROOT, 'content', '[content-type]');

interface ContentItem {
  id: string;
  title: string;
  content: string;
  // ... other fields from frontmatter
}

function parseFrontmatter(content: string): { frontmatter: any; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('No frontmatter found in markdown file');
  }

  const frontmatterStr = match[1];
  const body = content.slice(match[0].length);

  // Parse YAML-like frontmatter
  const frontmatter: Record<string, any> = {};
  for (const line of frontmatterStr.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value: any = line.slice(colonIndex + 1).trim();

      // Remove quotes, parse booleans/numbers
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value))) value = Number(value);

      frontmatter[key] = value;
    }
  }

  return { frontmatter, body: body.trim() };
}

export async function loadAllContent(): Promise<ContentItem[]> {
  const files = await fs.readdir(CONTENT_PATH);
  const mdFiles = files.filter((f) => f.endsWith('.md'));

  const items: ContentItem[] = [];

  for (const file of mdFiles) {
    const filePath = path.join(CONTENT_PATH, file);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(fileContent);

    items.push({
      id: frontmatter.notionId,
      title: frontmatter.title,
      content: body,
      // Map other frontmatter fields
    });
  }

  return items;
}
```

### Step 4: Update the Page Server

Modify the `+page.server.ts` to use local content instead of Notion:

```typescript
// src/routes/(landing-pages)/[your-page]/+page.server.ts
import { loadAllContent } from '$lib/content/[content-type]';

// Enable static prerendering
export const prerender = true;

export async function load() {
  try {
    const content = await loadAllContent();

    return {
      props: {
        content
      }
    };
  } catch (error) {
    console.error('Failed to load content:', error);
    throw error; // Let build fail if content missing
  }
}
```

### Step 5: Update the Page Component

Simplify the Svelte component to use preloaded data:

```svelte
<!-- +page.svelte -->
<script lang="ts">
  export let data;
  
  // Content is already loaded - no need for onMount fetching
  const { content } = data.props;
</script>

{#each content as item}
  <!-- Render your content -->
{/each}
```

### Step 6: Create the Prebuild Script

Create a script to fetch the private content at build time:

```bash
#!/bin/bash
# scripts/fetch-content.sh

echo "📦 Fetching private content..."

# Skip if content already exists (local dev)
if [ -d "content" ]; then
  echo "  Content directory exists, skipping fetch"
  exit 0
fi

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Error: GITHUB_TOKEN not set"
  exit 1
fi

# Clone the private repository
echo "  Cloning from private repository..."
git clone https://${GITHUB_TOKEN}@github.com/YOUR_USERNAME/teenylilcontent.git content

echo "✓ Content fetched successfully!"
```

Make it executable:

```bash
chmod +x scripts/fetch-content.sh
```

### Step 7: Update package.json

Add the vercel-build script:

```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "bash scripts/fetch-content.sh && vite build"
  }
}
```

### Step 8: Configure .gitignore

Add the content directory to .gitignore (it's fetched at build time):

```gitignore
# Private content (fetched at build time)
content/
```

### Step 9: Set Up Vercel Environment Variables

In your Vercel project settings, add:

- `GITHUB_TOKEN`: A personal access token with `repo` scope

To create a token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Copy and add to Vercel environment variables

### Step 10: Run the Migration

```bash
# 1. Run the migration script to populate the private repo
pnpm migrate:[content-type]

# 2. Commit and push the content to the private repo
cd ../teenylilcontent
git add .
git commit -m "Add [content-type] content"
git push

# 3. For local development, clone content manually or symlink
cd ../alicealexandra.com
git clone https://github.com/YOUR_USERNAME/teenylilcontent.git content

# 4. Test locally
pnpm dev

# 5. Deploy
git push  # Vercel will run fetch-content.sh automatically
```

## Content Structure Examples

### Poems (HFC)

```
content/
└── poems/
    ├── sections.json       # Section metadata
    ├── friction.md
    ├── dehiscence.md
    └── ...
```

**sections.json:**
```json
[
  {
    "id": "section-uuid",
    "name": "remembrance's folly",
    "quote": "Who will be lost...",
    "quoteAuthor": "Ocean Vuong",
    "act": "act i",
    "coverImage": "https://imagekit.io/...",
    "sequence": 1
  }
]
```

**poem.md:**
```markdown
---
title: "friction"
section: "narcissus and calliope"
sequence: 4
notLineated: false
notionId: "original-notion-uuid"
---

1. the rubbing of one object or surface against another

There's no good way to pour gasoline...
```

### Blog Posts (Future)

```
content/
└── blog/
    ├── posts.json          # Post metadata (dates, tags, etc.)
    ├── my-first-post.md
    └── ...
```

### Studio Pages (Future)

```
content/
├── studio/
│   ├── illustrations/
│   │   └── metadata.json
│   └── ...
└── postcards/
    └── metadata.json
```

## Troubleshooting

### Content not loading on Vercel

1. Check build logs for "Content fetched successfully!"
2. Verify `GITHUB_TOKEN` is set in Vercel environment variables
3. Ensure the token has `repo` scope and access to the private repo

### Path resolution errors

Always use `process.cwd()` for the project root:

```typescript
// ✅ Correct
const PROJECT_ROOT = process.cwd();
const CONTENT_PATH = path.join(PROJECT_ROOT, 'content', 'poems');

// ❌ Incorrect (may resolve wrong in bundled code)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

### Prerendering fails

If prerendering fails, the error will be visible in Vercel build logs. Common issues:
- Missing content files
- Malformed frontmatter
- Path resolution issues

Add detailed logging to catch issues:

```typescript
console.log('Loading content from:', CONTENT_PATH);
try {
  const content = await loadAllContent();
  console.log('Loaded', content.length, 'items');
} catch (error) {
  console.error('Failed to load:', error);
  throw error; // Re-throw to fail build
}
```

## Checklist for New Migrations

- [ ] Create migration script in `scripts/`
- [ ] Run migration to populate private content repo
- [ ] Create content loader in `src/lib/content/`
- [ ] Update `+page.server.ts` with `prerender = true`
- [ ] Simplify `+page.svelte` (remove lazy-loading)
- [ ] Test locally with cloned content
- [ ] Deploy and verify on Vercel preview
- [ ] Create PR and merge

## Related Files

- `scripts/fetch-content.sh` - Prebuild script
- `scripts/migrate-poems.ts` - HFC migration script (reference)
- `src/lib/content/poems.ts` - HFC content loader
- `src/routes/(landing-pages)/studio/hfc/+page.server.ts` - HFC page server

