
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
});

async function debug() {
    const res = await pool.query("SELECT id, name, parent_id, depth, tech_type, category_type FROM categories ORDER BY depth, display_order");
    console.table(res.rows);
    process.exit(0);
}

debug();
