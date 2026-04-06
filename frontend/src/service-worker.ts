/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

// Install: cache all static assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	);
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) {
				if (key !== CACHE) await caches.delete(key);
			}
			self.clients.claim();
		})
	);
});

// Fetch: cache-first for static assets, network-first for everything else
self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	// Static assets: cache-first
	if (ASSETS.includes(url.pathname)) {
		event.respondWith(
			caches.match(event.request).then((cached) => cached || fetch(event.request))
		);
		return;
	}

	// API/pages: network-first with cache fallback
	if (url.origin === self.location.origin) {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					const clone = response.clone();
					caches.open(CACHE).then((cache) => cache.put(event.request, clone));
					return response;
				})
				.catch(() => caches.match(event.request).then((cached) => cached || new Response('Offline', { status: 503 })))
		);
	}
});

// Push notifications
self.addEventListener('push', (event) => {
	if (!event.data) return;

	const data = event.data.json();
	event.waitUntil(
		self.registration.showNotification(data.title || 'chiirl', {
			body: data.body || 'New events in Chicago!',
			icon: data.icon || '/icon-192.png',
			badge: '/icon-192.png',
			data: { url: data.url || '/' },
		})
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = event.notification.data?.url || '/';
	event.waitUntil(self.clients.openWindow(url));
});
