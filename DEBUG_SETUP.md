# Debug Setup Guide

## Fixed Issues

### 1. "[object Object]" Error

**Root Cause**: The `NotionAPIError` class was being converted to string improperly, showing as "[object Object]" instead of meaningful error messages.

**Solution**:

- Added proper `toString()` and `toJSON()` methods to the `NotionAPIError` class
- Improved error messages with clear descriptions

### 2. Missing Environment Variables

**Root Cause**: The application requires Notion API credentials but they weren't configured, causing server errors.

**Solution**:

- Added graceful fallbacks in all server-side load functions
- Created `.env.example` file with required environment variables
- Added try-catch blocks to prevent crashes when Notion is not configured

### 3. Svelte 5 Reactivity Issues

**Root Cause**:

- Variables in `site-title.svelte` weren't using `$state()` for reactivity
- Store named `state` conflicted with Svelte 5's `$state` rune

**Solution**:

- Changed regular variables to use `$state()` for reactivity
- Renamed `state` store to `pageState` to avoid naming conflicts
- Updated all imports and usages across the application

## Environment Setup

To fully configure the application, create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then fill in your Notion API credentials:

1. Get API key from: https://www.notion.so/my-integrations
2. Get database IDs from your Notion workspace
3. Configure the bypass token for ISR (optional)

## Files Modified

- `src/lib/notion/api/client.ts` - Improved error handling
- `src/lib/homepage/site-title.svelte` - Fixed reactivity and store naming
- `src/lib/stores.ts` - Renamed state store to pageState
- All server-side load functions - Added graceful fallbacks
- Multiple component files - Updated store imports and usage

## Development Notes

The application now gracefully handles missing Notion configuration by:

- Logging warnings instead of crashing
- Returning empty arrays as fallbacks
- Continuing to function for non-Notion dependent features

This allows development to continue even without full Notion setup.
