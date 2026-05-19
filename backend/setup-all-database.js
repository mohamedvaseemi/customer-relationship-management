/**
 * Manual DB setup script — run this once if needed.
 * The server already auto-creates tables on startup.
 *
 * Usage:  node setup-all-database.js
 */
import { testConnection, closePool } from './config/database.js';

(async () => {
    try {
        console.log('🚀 Manual DB setup started...\n');
        // testConnection auto-creates all tables via initSchema()
        await testConnection();
        console.log('\n✨ All tables are ready. Your CRM database is good to go!');
    } catch (err) {
        console.error('Setup failed:', err.message);
    } finally {
        await closePool();
    }
})();
