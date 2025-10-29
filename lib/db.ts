import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_fKUFDu73NoCh@ep-soft-sky-a2aar30j-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });

// if (!process.env.DATABASE_URL) {
//     throw new Error('DATABASE_URL is not set');
// }

// const sql = neon("postgresql://neondb_owner:npg_fKUFDu73NoCh@ep-soft-sky-a2aar30j-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
// export const db = drizzle(sql, { schema });
