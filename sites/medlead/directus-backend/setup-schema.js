const { Client } = require('pg');

const client = new Client({
  host: 'db.bkxtfznmmnsjllogwazf.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Test128920251289',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupSchema() {
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('\nCreating directus schema...');
    await client.query('CREATE SCHEMA IF NOT EXISTS directus;');
    console.log('✓ Schema created');

    console.log('\nGranting permissions to postgres role...');
    await client.query('GRANT USAGE, CREATE ON SCHEMA directus TO postgres;');
    console.log('✓ Permissions granted to postgres');

    console.log('\nChecking for pooler user...');
    const result = await client.query(`SELECT 1 FROM pg_roles WHERE rolname = 'postgres.bkxtfznmmnsjllogwazf'`);
    if (result.rows.length > 0) {
      console.log('Granting permissions to pooler user...');
      await client.query(`GRANT USAGE, CREATE ON SCHEMA directus TO "postgres.bkxtfznmmnsjllogwazf";`);
      console.log('✓ Permissions granted to pooler user');
    } else {
      console.log('ℹ Pooler user not found (this is normal)');
    }

    console.log('\n✅ Database schema setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupSchema();
