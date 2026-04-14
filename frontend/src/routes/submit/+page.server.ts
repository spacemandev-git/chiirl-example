import type { Actions, PageServerLoad } from './$types';
import sql from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';

const TAG_KEYWORDS: Record<string, string[]> = {
	'co-working': ['coworking', 'co-working', 'work session', 'hack session', 'build session'],
	'discussion': ['discussion', 'roundtable', 'q&a', 'ama', 'debate', 'town hall'],
	'hangout': ['happy hour', 'mixer', 'hangout', 'social', 'party', 'brunch', 'gathering', 'meetup'],
	'networking': ['networking', 'professional', 'career', 'conference', 'summit', 'connect'],
	'pitching-demo': ['pitch night', 'demo day', 'pitch competition', 'showcase', 'demo night'],
	'speaker-panel': ['panel', 'fireside', 'keynote', 'speaker', 'talk', 'lecture', 'seminar'],
	'branding': ['branding', 'brand strategy', 'brand identity', 'brand building'],
	'business-strategy': ['business strategy', 'strategy session', 'business model', 'competitive'],
	'capital-deployment': ['capital deployment', 'investment strategy', 'portfolio', 'asset allocation'],
	'code-engineering': ['programming', 'coding', 'hackathon', 'software', 'developer', 'engineering', 'api', 'web3', 'blockchain', 'ai', 'machine learning', 'data', 'tech'],
	'finance': ['finance', 'fintech', 'accounting', 'financial', 'revenue', 'profit'],
	'fundraising': ['fundraising', 'fundraise', 'raise capital', 'investor', 'venture capital', 'vc', 'angel'],
	'gtm': ['go to market', 'gtm', 'launch strategy', 'market entry', 'distribution'],
	'legal-ip': ['legal', 'ip', 'intellectual property', 'patent', 'trademark', 'compliance', 'regulatory'],
	'marketing': ['marketing', 'growth marketing', 'content marketing', 'seo', 'social media', 'advertising'],
	'org-management': ['organization', 'management', 'operations', 'leadership', 'team building', 'culture'],
	'recruiting': ['recruiting', 'hiring', 'talent', 'recruitment', 'job fair', 'career fair'],
	'product': ['product', 'product management', 'product design', 'roadmap', 'user research'],
	'pitching-howto': ['how to pitch', 'pitch deck', 'pitch workshop', 'pitch practice', 'storytelling'],
	'policy': ['policy', 'regulation', 'government', 'civic', 'public policy', 'advocacy'],
	'sales': ['sales', 'revenue', 'closing', 'b2b', 'enterprise sales', 'sales strategy'],
	'scaling': ['scaling', 'scale', 'growth stage', 'hypergrowth', 'expansion'],
	'uiux-cx': ['ux', 'ui', 'design', 'user experience', 'customer experience', 'cx', 'usability'],
};

function classifyEvent(title: string, description: string): string[] {
	const text = `${title} ${description}`.toLowerCase();
	const matched: string[] = [];
	for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
		if (keywords.some((kw) => text.includes(kw))) {
			matched.push(tag);
		}
	}
	return matched.length > 0 ? matched : ['hangout'];
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Please sign in first' });

		const form = await request.formData();
		const title = form.get('title')?.toString().trim();
		const description = form.get('description')?.toString().trim() || '';
		const url = form.get('url')?.toString().trim();
		const location = form.get('location')?.toString().trim() || null;
		const start_time = form.get('start_time')?.toString();
		const end_time = form.get('end_time')?.toString() || null;
		const image_url = form.get('image_url')?.toString().trim() || null;
		const userTags = form.getAll('tags').map((t) => t.toString());

		if (!title) return fail(400, { error: 'Title is required', title, description, url, location, start_time, end_time, image_url });
		if (!url) return fail(400, { error: 'Event URL is required', title, description, url, location, start_time, end_time, image_url });
		if (!start_time) return fail(400, { error: 'Start time is required', title, description, url, location, start_time, end_time, image_url });

		const autoTags = classifyEvent(title, description);
		const finalTags = userTags.length > 0 ? userTags : autoTags;
		const tagStr = `{${finalTags.join(',')}}`;

		const sourceId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

		const result = await sql`
			INSERT INTO events (title, description, url, source, source_id, start_time, end_time, location, image_url, tags, status, submitted_by)
			VALUES (
				${title},
				${description},
				${url},
				'user',
				${sourceId},
				${new Date(start_time)},
				${end_time ? new Date(end_time) : null},
				${location},
				${image_url},
				${tagStr}::event_tag[],
				'pending',
				${locals.user.id}
			)
			RETURNING id
		`;

		redirect(303, `/events/${result[0].id}`);
	},
};
