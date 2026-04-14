export const EVENT_TAGS = [
	// Event format
	'co-working', 'discussion', 'hangout', 'networking', 'pitching-demo', 'speaker-panel',
	// Topics
	'branding', 'business-strategy', 'capital-deployment', 'code-engineering',
	'finance', 'fundraising', 'gtm', 'legal-ip', 'marketing', 'org-management',
	'recruiting', 'product', 'pitching-howto', 'policy', 'sales', 'scaling', 'uiux-cx',
] as const;

export type EventTag = (typeof EVENT_TAGS)[number];

export const TAG_COLORS: Record<string, string> = {
	// Event format
	'co-working': '#E8A838',
	'discussion': '#9B59B6',
	'hangout': '#F0A830',
	'networking': '#3498DB',
	'pitching-demo': '#E63946',
	'speaker-panel': '#C41E3A',
	// Topics
	'branding': '#E67E22',
	'business-strategy': '#4682B4',
	'capital-deployment': '#27AE60',
	'code-engineering': '#4A9ED6',
	'finance': '#2ECC71',
	'fundraising': '#E74C3C',
	'gtm': '#1ABC9C',
	'legal-ip': '#8E44AD',
	'marketing': '#3DAEE0',
	'org-management': '#D4A017',
	'recruiting': '#27D17F',
	'product': '#A86ED6',
	'pitching-howto': '#E57373',
	'policy': '#7F8C8D',
	'sales': '#C0392B',
	'scaling': '#16A085',
	'uiux-cx': '#AF7AC5',
};

export function formatDate(date: string | Date): string {
	return new Date(date).toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		timeZone: 'America/Chicago',
	});
}

export function formatTime(date: string | Date): string {
	return new Date(date).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		timeZone: 'America/Chicago',
	});
}

export function formatDateTime(date: string | Date): string {
	return `${formatDate(date)} at ${formatTime(date)}`;
}

export function shortLocation(location: string | null | undefined): string {
	if (!location) return '';
	return location.split(',')[0]!.trim();
}
