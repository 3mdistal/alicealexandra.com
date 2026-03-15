import { createHash } from 'node:crypto';

export function createContentSourceChecksum(source: string): string {
	return createHash('sha1').update(source).digest('hex');
}
