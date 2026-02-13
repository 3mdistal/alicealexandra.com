export interface NavItem {
	href: string;
	label: string;
}

export const navItems: NavItem[] = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About' },
	{ href: '/studio', label: 'Studio' },
	{ href: '/career', label: 'Career' },
	{ href: '/blog', label: 'Blog' },
	{ href: '/news', label: 'News' }
];

export function isActive(pathname: string, href: string): boolean {
	if (href === '/') {
		return pathname === '/';
	}

	return pathname === href || pathname.startsWith(`${href}/`);
}
