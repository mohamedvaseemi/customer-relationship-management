import { pool } from './config/database.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const setupDatabase = async () => {
    try {
        console.log('🚀 Starting database setup...\n');

        // Read the schema file
        const schemaPath = join(__dirname, 'config', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('📝 Running schema.sql...');

        // Execute the schema
        await pool.query(schema);

        console.log('\n✅ Database setup completed successfully!');
        console.log('\n📊 Tables created:');
        console.log('   - users');
        console.log('   - contacts');
        console.log('   - leads');
        console.log('   - activities');
        console.log('   - deals');
        console.log('   - companies');
        console.log('\n✨ Your CRM database is ready to use!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
};

setupDatabase();
