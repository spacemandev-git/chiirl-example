import postgres from 'postgres';
import { env } from '$env/dynamic/private';

const sql = postgres(env.DATABASE_URL || 'postgres://chiirl:chiirl@localhost:5432/chiirl', {
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
});

export default sql;
