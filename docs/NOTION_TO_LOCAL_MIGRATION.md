# Content Management

This document describes how content is managed for the alicealexandra.com website.

## Overview

Content for blog posts, poems, and postcards is stored in a private GitHub repository (`teenylilcontent`) and fetched at build time. This approach provides:

1. **Performance**: Static content loads faster than API calls
2. **Privacy**: Content can remain private even if the main site repo is public
3. **Reliability**: No dependency on external API availability
4. **Version Control**: Full git history for content changes

> **Note**: Studio, Career, and Illustrations pages still use the Notion API at runtime for dynamic content.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Private GitHub Repo                         │
│                      (teenylilcontent)                           │
├─────────────────────────────────────────────────────────────────┤
│  content/                                                        │
│  ├── blog/                                                       │
│  │   ├── posts.json       # Blog post metadata                  │
│  │   └── *.md             # Individual blog posts               │
│  ├── poems/                                                      │
│  │   ├── sections.json    # Section metadata                    │
│  │   └── *.md             # Individual poems                    │
│  └── postcards/                                                  │
│      ├── metadata.json    # Postcard metadata                   │
│      └── *.md             # Individual postcards                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Build Time (Vercel)                         │
├─────────────────────────────────────────────────────────────────┤
│  1. fetch-content.sh clones teenylilcontent → content/          │
│  2. vite build: SvelteKit reads markdown files                  │
│  3. prerender: Static HTML generated with all content           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Runtime (User)                            │
├─────────────────────────────────────────────────────────────────┤
│  Static HTML served - no API calls needed for blog/poems        │
└─────────────────────────────────────────────────────────────────┘
```

## Editing Content

### Blog Posts

Edit markdown files in `teenylilcontent/blog/`:

1. Open the markdown file (e.g., `my-post.md`)
2. Edit the frontmatter and/or content
3. Commit and push to `teenylilcontent`
4. Redeploy the main site (or wait for automatic Vercel rebuild)

**Frontmatter format:**

```yaml
---
title: "Post Title"
slug: "post-slug"
subtitle: "A subtitle"
summary: "Brief summary for lists"
ogDescription: "Description for social sharing"
category: "Life"
publicationDate: "2024-01-15"
formattedPublicationDate: "January 15, 2024"
readTime: "5 minutes"
coverImage: "https://example.com/image.jpg"
coverImageCaption: "Photo credit"
notionId: "original-notion-uuid"
---
```

### Poems

Edit markdown files in `teenylilcontent/poems/`:

**Frontmatter format:**

```yaml
---
title: "Poem Title"
section: "section-name"
sequence: 1
notLineated: false
notionId: "original-notion-uuid"
---
```

Update `sections.json` for section metadata:

```json
[
  {
    "id": "section-uuid",
    "name": "section name",
    "quote": "An epigraph quote...",
    "quoteAuthor": "Author Name",
    "act": "act i",
    "coverImage": "https://imagekit.io/...",
    "sequence": 1
  }
]
```

### Postcards

Edit markdown files in `teenylilcontent/postcards/`:

**Frontmatter format:**

```yaml
---
title: "Postcard Title"
slug: "postcard-slug"
description: "Brief description"
heroImage: "https://example.com/image.jpg"
lastEditedTime: "2024-01-15T12:00:00.000Z"
notionId: "original-notion-uuid"
---
```

## Adding New Content

### New Blog Post

1. Create a new `.md` file in `teenylilcontent/blog/`
2. Add frontmatter with all required fields
3. Write the post content in markdown
4. Add an entry to `posts.json` with metadata
5. Commit and push

### New Poem

1. Create a new `.md` file in `teenylilcontent/poems/`
2. Add frontmatter with title, section, sequence
3. Write the poem content
4. Commit and push

### New Postcard

1. Create a new `.md` file in `teenylilcontent/postcards/`
2. Add frontmatter with all required fields
3. Write the content in markdown
4. Add an entry to `metadata.json`
5. Commit and push

## Local Development

Use the setup command to clone the content repository:

```bash
# Setup content (clones teenylilcontent repo)
pnpm setup:content

# Run the dev server
pnpm dev
```

### Script Options

```bash
# Interactive mode (default) - prompts for choices
pnpm setup:content

# Pull mode - non-interactive, pulls if content exists
pnpm setup:content --pull

# Force mode - non-interactive, replaces existing content
pnpm setup:content --force
```

The script will:
- Clone the `teenylilcontent` repo into `content/`
- Use SSH if available, otherwise fall back to HTTPS
- Keep the `.git` directory so you can push changes back
- Handle the case where content exists but isn't a git repo (from Vercel builds)

### Updating Content

```bash
# Option 1: Run setup with --pull flag
pnpm setup:content --pull

# Option 2: Pull manually
cd content && git pull
```

The `content/` directory is in `.gitignore` and will be populated by `fetch-content.sh` during Vercel builds.

## Vercel Configuration

The following environment variable is required in Vercel:

- `GITHUB_TOKEN`: Personal access token with `repo` scope for cloning `teenylilcontent`

The `vercel-build` script handles fetching content:

```bash
bash scripts/fetch-content.sh && vite build
```

## Troubleshooting

### Content not loading on Vercel

1. Check build logs for "Content fetched successfully!"
2. Verify `GITHUB_TOKEN` is set in Vercel environment variables
3. Ensure the token has `repo` scope and access to the private repo

### Local content not found

```bash
# Clone the content repo if missing
git clone https://github.com/3mdistal/teenylilcontent.git content
```

### Prerendering fails

Check for:
- Missing content files
- Malformed frontmatter (check YAML syntax)
- Missing required frontmatter fields

## Content Loaders

The content is loaded by these modules:

- `src/lib/content/blog.ts` - Blog post loader
- `src/lib/content/poems.ts` - Poems loader
- `src/lib/content/postcards.ts` - Postcards loader

## Historical Note

The content was originally migrated from Notion using migration scripts. These scripts have been archived to `archived/` and are no longer needed since content is now managed directly in the `teenylilcontent` repository.

Archived migration scripts:
- `archived/migrate-blog.ts`
- `archived/migrate-poems.ts`
- `archived/migrate-postcards.ts`
