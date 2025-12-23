# News / Changelog System

This folder powers the `/news` page, which tracks updates across the site.

## Studio Changelog

Studio updates (Hymns for Calliope, Postcards) are tracked in `updates.ts`.

### Adding a changelog entry

When you add or edit content in `content/poems/` or `content/postcards/`, add a corresponding entry to `STUDIO_NEWS` in `src/lib/news/updates.ts`.

Entry structure:

```ts
{
  id: 'studio-{category}-{YYYY-MM-DD}-{slugified-title}',
  date: 'YYYY-MM-DD',
  area: 'studio',
  category: 'hfc' | 'postcards',
  action: 'added' | 'edited' | 'removed',
  title: 'entry title as shown',
  href: '/studio/hfc' // or '/studio/postcards/{slug}'
}
```

### Examples

**Adding a new hymn:**

```ts
{
  id: 'studio-hfc-2025-12-23-my-new-poem',
  date: '2025-12-23',
  area: 'studio',
  category: 'hfc',
  action: 'added',
  title: 'my new poem',
  href: '/studio/hfc'
}
```

**Editing an existing hymn:**

```ts
{
  id: 'studio-hfc-2025-12-23-portrait-of-the-body-as-a-failed-industry',
  date: '2025-12-23',
  area: 'studio',
  category: 'hfc',
  action: 'edited',
  title: 'portrait of the body as a failed industry',
  href: '/studio/hfc'
}
```

**Adding a new postcard:**

```ts
{
  id: 'studio-postcards-2025-12-23-my-postcard',
  date: '2025-12-23',
  area: 'studio',
  category: 'postcards',
  action: 'added',
  title: 'My Postcard',
  href: '/studio/postcards/my-postcard'
}
```

### Notes

- The array is auto-sorted by date (descending), so order in the file doesn't matter.
- For postcards, the `href` should use the slugified title (kebab-case). For hymns, all link to `/studio/hfc`.
- Hymn titles are lowercase; postcard titles use title case.

## Site Changelog

Site-level changes (features, fixes, infrastructure) are tracked in `/CHANGELOG.md` at the repo root. The `/news` page parses this file and displays summaries under the "Site" tab.
