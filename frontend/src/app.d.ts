declare global {
	namespace App {
		interface Locals {
			user: {
				id: number;
				email: string;
				name: string | null;
				tags: string[];
				notification_preference: string;
				email_frequency: string;
				push_frequency: string;
				last_test_digest_at: string | null;
			} | null;
			isAdmin: boolean;
		}
	}
}

export {};
