/**
 * Utility functions for blog content processing
 */

import type { TOCEntry } from '../types/notion-types';

/**
 * Replaces custom superscript and subscript markers in HTML content
 * @param context - The HTML element containing the content to process
 */
export function subAndSuper(context: HTMLElement): void {
	const content = Array.from(context.querySelectorAll('p, h1, h2, h3, li'));
	const superscript = /\{super:([^}]*)\}/g;
	const subscript = /\{sub:([^}]*)\}/g;
	content.forEach((e) => {
		e.innerHTML = e.innerHTML
			.replace(superscript, '<sup>$1</sup>')
			.replace(subscript, '<sub>$1</sub>');
	});
}

/**
 * Groups list items into ordered or unordered lists based on their sibling relationships
 * @param context - The HTML element containing the list items to process
 */
export function wrapLists(context: HTMLElement): void {
	// Select all list items
	const liArray = Array.from(context.querySelectorAll('li'));

	const firstSiblings: HTMLLIElement[] = [];

	// Loop through all list items to get first sibling of new group
	liArray.forEach((li) => {
		if (
			li.previousElementSibling?.tagName !== 'LI' ||
			li.className !== li.previousElementSibling?.className
		) {
			firstSiblings.push(li as HTMLLIElement);
		}
	});

	// Loop over each first sibling to create new parent for group
	firstSiblings.forEach((fs) => {
		const newParent = document.createElement(fs.classList.contains('ordered') ? 'ol' : 'ul');
		fs.parentNode!.insertBefore(newParent, fs);
		// Loop over parent siblings until they're not <li>
		for (
			let i = newParent.nextElementSibling;
			i && i.tagName && i.tagName === 'LI';
			i = newParent.nextElementSibling
		) {
			newParent.appendChild(i);
		}
	});
}

/**
 * Creates a table of contents based on h2 headers in the document
 * @returns An array of TOC entries
 */
export function createTOC(): { id: string; text: string }[] {
	const headings = document.querySelectorAll('h2');
	const tocEntries: { id: string; text: string }[] = [];

	headings.forEach((heading, index) => {
		// Create an ID for the heading if it doesn't have one
		if (!heading.id) {
			const headingText = heading.textContent || `section-${index + 1}`;
			const headingId = headingText
				.toLowerCase()
				.replace(/[^\w\s-]/g, '')
				.replace(/\s+/g, '-');
			heading.id = headingId;
		}

		tocEntries.push({
			id: heading.id,
			text: heading.textContent || `Section ${index + 1}`
		});
	});

	return tocEntries;
}

/**
 * Inserts a table of contents into the DOM
 */
export function insertTOC(): void {
	const tocEntries = createTOC();

	if (tocEntries.length === 0) {
		return;
	}

	// Check if TOC already exists
	if (document.querySelector('.toc-container')) {
		return;
	}

	// Create TOC container
	const tocContainer = document.createElement('div');
	tocContainer.className = 'toc-container';

	// Create TOC header
	const tocHeader = document.createElement('h3');
	tocHeader.textContent = 'Table of Contents';
	tocHeader.className = 'toc-header';
	tocContainer.appendChild(tocHeader);

	// Create TOC list
	const tocList = document.createElement('ol');
	tocList.className = 'toc-list';

	tocEntries.forEach((entry) => {
		const listItem = document.createElement('li');
		listItem.className = 'toc-item';

		const link = document.createElement('a');
		link.href = `#${entry.id}`;
		link.textContent = entry.text;
		link.className = 'toc-link';

		// Add click event to smooth scroll
		link.addEventListener('click', (e) => {
			e.preventDefault();
			const targetElement = document.getElementById(entry.id);
			if (targetElement) {
				targetElement.scrollIntoView({ behavior: 'smooth' });

				// Add a highlight effect to the target heading
				targetElement.classList.add('highlight-heading');
				setTimeout(() => {
					targetElement.classList.remove('highlight-heading');
				}, 2000);

				// Update URL hash without jumping
				history.pushState(null, '', `#${entry.id}`);
			}
		});

		listItem.appendChild(link);
		tocList.appendChild(listItem);
	});

	tocContainer.appendChild(tocList);

	// Find the first heading and insert TOC before it
	const firstHeading = document.querySelector('h2');
	if (firstHeading && firstHeading.parentNode) {
		firstHeading.parentNode.insertBefore(tocContainer, firstHeading);

		// Add CSS for TOC
		const style = document.createElement('style');
		style.textContent = `
			.toc-container {
				margin: 2rem 0 3rem;
				padding: 1.5rem;
				border-radius: 8px;
				background: var(--blog-callout-light);
				border: 1px solid var(--blog-border-light);
				box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
				position: relative;
				z-index: 1;
			}
			
			.toc-header {
				margin-bottom: 1rem;
				font-size: 1.25rem;
				font-weight: 600;
				color: var(--blog-heading-light);
			}
			
			.toc-list {
				list-style-type: decimal;
				padding-left: 1.5rem;
				margin: 0;
			}
			
			.toc-item {
				margin-bottom: 0.75rem;
				padding-left: 0.5rem;
				transition: transform 0.2s ease;
			}
			
			.toc-item:hover {
				transform: translateX(3px);
			}
			
			.toc-link {
				display: inline-block;
				color: var(--blog-accent-light);
				font-size: 1rem;
				text-decoration: none;
				transition: color 0.2s ease;
			}
			
			.toc-link:hover {
				color: var(--blog-text-light);
				text-decoration: underline;
			}
			
			.highlight-heading {
				animation: highlight-pulse 2s ease-out;
			}
			
			@keyframes highlight-pulse {
				0% { background-color: var(--blog-accent-light); }
				100% { background-color: transparent; }
			}

			html.dark-mode .toc-container {
				background: var(--blog-callout-dark);
				border-color: var(--blog-border-dark);
			}

			html.dark-mode .toc-header {
				color: var(--blog-heading-dark);
			}

			html.dark-mode .toc-link {
				color: var(--blog-accent-dark);
			}

			html.dark-mode .toc-link:hover {
				color: var(--blog-text-dark);
			}

			@media (max-width: 768px) {
				.toc-container {
					margin: 1.5rem 0 2.5rem;
					padding: 1.25rem;
				}
				
				.toc-header {
					font-size: 1.125rem;
				}
				
				.toc-link {
					font-size: 0.9rem;
				}
			}
		`;
		document.head.appendChild(style);

		console.log('Table of Contents inserted successfully');
	} else {
		console.warn('No h2 elements found for TOC insertion');
	}
}
