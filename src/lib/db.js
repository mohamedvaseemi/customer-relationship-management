import mysql from 'mysql2/promise';
import { headers } from 'next/headers';

// Sample data datasets for demonstration
const sampleContacts = [
    { id: 101, first_name: 'Sarah', last_name: 'Jenkins', email: 'sarah@techflow.com', phone: '+1-555-0199', company: 'TechFlow Inc.', position: 'Head of Sales', source: 'referral', status: 'active', notes: 'Interested in enterprise license.', created_at: new Date('2026-05-10T10:00:00Z'), is_deleted: 0 },
    { id: 102, first_name: 'David', last_name: 'Chen', email: 'dchen@apexcorp.org', phone: '+1-555-0142', company: 'Apex Corporation', position: 'VP of Technology', source: 'website', status: 'active', notes: 'Attended the cloud webinar.', created_at: new Date('2026-05-12T14:30:00Z'), is_deleted: 0 },
    { id: 103, first_name: 'Elena', last_name: 'Rostova', email: 'elena@novasolutions.io', phone: '+44-20-7946-0958', company: 'Nova Solutions', position: 'CTO', source: 'cold_call', status: 'active', notes: 'Referred by standard contact.', created_at: new Date('2026-05-14T09:15:00Z'), is_deleted: 0 }
];

const sampleLeads = [
    { id: 201, contact_id: 101, title: 'Enterprise Sales Hub Implementation', value: 45000.00, currency: 'USD', status: 'qualified', priority: 'high', source: 'referral', expected_close_date: '2026-06-30', probability: 70, notes: 'Sarah requested proposal by end of month.', created_at: new Date('2026-05-10T10:05:00Z'), is_deleted: 0 },
    { id: 202, contact_id: 102, title: 'Apex Cloud Migration Phase 1', value: 120000.00, currency: 'USD', status: 'negotiation', priority: 'urgent', source: 'website', expected_close_date: '2026-06-15', probability: 85, notes: 'Contract is under legal review.', created_at: new Date('2026-05-12T14:35:00Z'), is_deleted: 0 },
    { id: 203, contact_id: 103, title: 'Nova CRM Evaluation', value: 15000.00, currency: 'USD', status: 'new', priority: 'medium', source: 'cold_call', expected_close_date: '2026-07-15', probability: 20, notes: 'Setting up demo for next week.', created_at: new Date('2026-05-14T09:20:00Z'), is_deleted: 0 }
];

const sampleDeals = [
    { id: 301, lead_id: 201, contact_id: 101, name: 'TechFlow Enterprise License', amount: 45000.00, currency: 'USD', stage: 'proposal', probability: 70, expected_close_date: '2026-06-30', notes: 'Proposal delivered.', created_at: new Date('2026-05-10T10:10:00Z'), is_deleted: 0 },
    { id: 302, lead_id: 202, contact_id: 102, name: 'Apex Cloud Infrastructure', amount: 120000.00, currency: 'USD', stage: 'negotiation', probability: 85, expected_close_date: '2026-06-15', notes: 'Negotiating payment terms.', created_at: new Date('2026-05-12T14:40:00Z'), is_deleted: 0 }
];

const sampleCompanies = [
    { id: 401, name: 'TechFlow Inc.', industry: 'Software', website: 'https://techflow.com', phone: '+1-555-0100', email: 'info@techflow.com', address: '100 Pine St', city: 'San Francisco', state: 'CA', country: 'USA', employee_count: 250, annual_revenue: 12000000.00, notes: 'Fast-growing SaaS business.', created_at: new Date('2026-05-10T09:00:00Z'), is_deleted: 0 },
    { id: 402, name: 'Apex Corporation', industry: 'Financial Services', website: 'https://apexcorp.org', phone: '+1-555-0200', email: 'contact@apexcorp.org', address: '500 Fifth Ave', city: 'New York', state: 'NY', country: 'USA', employee_count: 1200, annual_revenue: 85000000.00, notes: 'Traditional finance undergoing digital transformation.', created_at: new Date('2026-05-12T09:00:00Z'), is_deleted: 0 },
    { id: 403, name: 'Nova Solutions', industry: 'Healthcare IT', website: 'https://novasolutions.io', phone: '+44-20-7946-0000', email: 'hello@novasolutions.io', address: '10 Baker St', city: 'London', country: 'UK', employee_count: 85, annual_revenue: 4500000.00, notes: 'Startup focusing on medical imaging systems.', created_at: new Date('2026-05-14T09:00:00Z'), is_deleted: 0 }
];

const sampleActivities = [
    { id: 501, type: 'call', subject: 'Initial Discovery Call', description: 'Discussed cloud migration requirements and budget size.', contact_id: 102, lead_id: 202, status: 'completed', priority: 'medium', due_date: new Date('2026-05-12T15:00:00Z'), completed_at: new Date('2026-05-12T15:30:00Z'), created_at: new Date('2026-05-12T14:45:00Z'), is_deleted: 0 },
    { id: 502, type: 'task', subject: 'Send Proposal Draft', description: 'Prepare and send the formal proposal.', contact_id: 101, lead_id: 201, status: 'pending', priority: 'high', due_date: new Date('2026-05-20T17:00:00Z'), created_at: new Date('2026-05-10T10:15:00Z'), is_deleted: 0 },
    { id: 503, type: 'meeting', subject: 'Technical Demo & Q&A', description: 'Present deep-dive platform walkthrough.', contact_id: 103, lead_id: 203, status: 'pending', priority: 'medium', due_date: new Date('2026-05-23T11:00:00Z'), created_at: new Date('2026-05-14T09:30:00Z'), is_deleted: 0 }
];

const recentActivities = [
    { id: 501, type: 'call', subject: 'Initial Discovery Call', description: 'Discussed cloud migration requirements and budget size.', contact_id: 102, lead_id: 202, status: 'completed', priority: 'medium', due_date: new Date('2026-05-12T15:00:00Z'), completed_at: new Date('2026-05-12T15:30:00Z'), created_at: new Date('2026-05-12T14:45:00Z'), first_name: 'David', last_name: 'Chen', assigned_to_name: 'Admin User' },
    { id: 502, type: 'task', subject: 'Send Proposal Draft', description: 'Prepare and send the formal proposal.', contact_id: 101, lead_id: 201, status: 'pending', priority: 'high', due_date: new Date('2026-05-20T17:00:00Z'), created_at: new Date('2026-05-10T10:15:00Z'), first_name: 'Sarah', last_name: 'Jenkins', assigned_to_name: 'Admin User' },
    { id: 503, type: 'meeting', subject: 'Technical Demo & Q&A', description: 'Present deep-dive platform walkthrough.', contact_id: 103, lead_id: 203, status: 'pending', priority: 'medium', due_date: new Date('2026-05-23T11:00:00Z'), created_at: new Date('2026-05-14T09:30:00Z'), first_name: 'Elena', last_name: 'Rostova', assigned_to_name: 'Admin User' }
];

const sampleTickets = [
    { id: 601, subject: 'Unable to sync Google Calendar', description: 'User reports auth error when attempting to connect Google Workspace.', status: 'open', priority: 'high', contact_id: 101, assigned_to: null, created_at: new Date('2026-05-15T08:00:00Z') },
    { id: 602, subject: 'Custom field option limit', description: 'Request to increase picklist options limit beyond 50 values.', status: 'closed', priority: 'low', contact_id: 102, assigned_to: null, created_at: new Date('2026-05-16T10:30:00Z') }
];

const getSSLConfig = () => {
    if (process.env.DB_SSL === 'true') {
        return { rejectUnauthorized: false };
    }
    return false;
};

if (!global.mysqlPool) {
    console.log('🏗️ Initializing new MySQL pool...');
    global.mysqlPool = mysql.createPool({
        host:     process.env.DB_HOST,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port:     parseInt(process.env.DB_PORT) || 3306,
        ssl:      getSSLConfig(),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

const rawPool = global.mysqlPool;

// A wrapper to translate queries and mimic pg's result format
const queryWrapper = async (text, params = []) => {
    const start = Date.now();
    let sql = text;
    let values = [...params];

    // 1. ILIKE -> LIKE
    sql = sql.replace(/\bILIKE\b/gi, 'LIKE');

    // 2. $1, $2 placeholders -> ?
    if (values.length > 0) {
        const newValues = [];
        sql = sql.replace(/\$(\d+)/g, (match, num) => {
            const idx = parseInt(num, 10) - 1;
            newValues.push(values[idx]);
            return '?';
        });
        values = newValues;
    }

    // 3. RETURNING clause handling
    const hasReturning = sql.match(/RETURNING\s+(.*?)$/i);
    let returningCols = '*';
    if (hasReturning) {
        returningCols = hasReturning[1].trim();
        sql = sql.replace(/\s+RETURNING\s+.*?$/i, '').trim();
    }

    try {
        if (hasReturning) {
            const isInsert = sql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)/i);
            const isUpdate = sql.match(/UPDATE\s+([a-zA-Z0-9_]+)/i);
            const isDelete = sql.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)/i);

            if (isInsert) {
                const tableName = isInsert[1];
                const [result] = await rawPool.query(sql, values);
                const insertId = result.insertId;

                const fetchQuery = `SELECT ${returningCols} FROM ${tableName} WHERE id = ?`;
                const [rows] = await rawPool.query(fetchQuery, [insertId]);
                
                const duration = Date.now() - start;
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`[DB Compat Insert] ${duration}ms | ${text.substring(0, 50)}... | Rows: ${rows.length}`);
                }
                return { rows, rowCount: rows.length };
            } else if (isUpdate) {
                const tableName = isUpdate[1];
                
                const idPlaceholderMatch = text.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
                let idValue = null;
                if (idPlaceholderMatch) {
                    const idx = parseInt(idPlaceholderMatch[1], 10) - 1;
                    idValue = params[idx];
                }

                const [result] = await rawPool.query(sql, values);

                if (idValue !== null) {
                    const fetchQuery = `SELECT ${returningCols} FROM ${tableName} WHERE id = ?`;
                    const [rows] = await rawPool.query(fetchQuery, [idValue]);
                    const duration = Date.now() - start;
                    if (process.env.NODE_ENV !== 'production') {
                        console.log(`[DB Compat Update] ${duration}ms | ${text.substring(0, 50)}... | Rows: ${rows.length}`);
                    }
                    return { rows, rowCount: rows.length };
                } else {
                    const duration = Date.now() - start;
                    if (process.env.NODE_ENV !== 'production') {
                        console.log(`[DB Compat Update Fallback] ${duration}ms | ${text.substring(0, 50)}...`);
                    }
                    return { rows: [], rowCount: result.affectedRows };
                }
            } else if (isDelete) {
                const idPlaceholderMatch = text.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
                let idValue = null;
                if (idPlaceholderMatch) {
                    const idx = parseInt(idPlaceholderMatch[1], 10) - 1;
                    idValue = params[idx];
                }

                const [result] = await rawPool.query(sql, values);
                const duration = Date.now() - start;
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`[DB Compat Delete] ${duration}ms | ${text.substring(0, 50)}...`);
                }
                const mockRows = idValue !== null ? [{ id: idValue }] : [];
                return { rows: mockRows, rowCount: mockRows.length };
            }
        }

        const [rows] = await rawPool.query(sql, values);
        const duration = Date.now() - start;

        // Check if we should override with sample data
        let useSample = false;
        try {
            const reqHeaders = await headers();
            const clientHeader = reqHeaders.get('x-sample-data');
            if (clientHeader === 'true') {
                useSample = true;
            } else if (clientHeader !== 'false') {
                // Auto-enable if no data exists in DB
                const upperSql = sql.toUpperCase();
                if (upperSql.includes('FROM CONTACTS') && (rows.length === 0 || (rows[0] && (rows[0].total_contacts === 0 || rows[0].total_contacts === '0')))) {
                    useSample = true;
                } else if (upperSql.includes('FROM LEADS') && (rows.length === 0 || (rows[0] && (rows[0].total_leads === 0 || rows[0].total_leads === '0')))) {
                    useSample = true;
                } else if (upperSql.includes('FROM DEALS') && (rows.length === 0 || (rows[0] && (rows[0].total_deals === 0 || rows[0].total_deals === '0')))) {
                    useSample = true;
                } else if (upperSql.includes('FROM COMPANIES') && rows.length === 0) {
                    useSample = true;
                } else if (upperSql.includes('FROM ACTIVITIES') && (rows.length === 0 || (rows[0] && (rows[0].total_activities === 0 || rows[0].total_activities === '0')))) {
                    useSample = true;
                } else if (upperSql.includes('FROM TICKETS') && (rows.length === 0 || (rows[0] && (rows[0].total_tickets === 0 || rows[0].total_tickets === '0')))) {
                    useSample = true;
                }
            }
        } catch (e) {
            // Ignore headers error outside request context
        }

        if (useSample && sql.trim().toUpperCase().startsWith('SELECT')) {
            const upperSql = sql.toUpperCase();
            if (upperSql.includes('FROM CONTACTS')) {
                if (upperSql.includes('COUNT(')) {
                    return { rows: [{ total_contacts: 3, active_contacts: 3 }], rowCount: 1 };
                }
                return { rows: sampleContacts, rowCount: sampleContacts.length };
            }
            if (upperSql.includes('FROM LEADS')) {
                if (upperSql.includes('COUNT(') && upperSql.includes('SUM(')) {
                    return { rows: [{ total_leads: 3, new_leads: 1, qualified_leads: 1, won_leads: 0, lost_leads: 0, total_pipeline_value: 180000.00, total_value: 180000.00, avg_probability: 58.3 }], rowCount: 1 };
                }
                if (upperSql.includes('TO_CHAR') || upperSql.includes('DATE_TRUNC') || upperSql.includes('MONTH(')) {
                    return { rows: [{ month: 'May', count: 3 }], rowCount: 1 };
                }
                if (upperSql.includes('STATUS') && upperSql.includes('GROUP BY')) {
                    return { rows: [{ status: 'new', count: 1 }, { status: 'qualified', count: 1 }, { status: 'negotiation', count: 1 }], rowCount: 3 };
                }
                return { rows: sampleLeads, rowCount: sampleLeads.length };
            }
            if (upperSql.includes('FROM DEALS')) {
                if (upperSql.includes('COUNT(')) {
                    return { rows: [{ total_deals: 2, won_amount: 0, pending_amount: 165000.00 }], rowCount: 1 };
                }
                if (upperSql.includes('TO_CHAR') || upperSql.includes('DATE_TRUNC') || upperSql.includes('MONTH(')) {
                    return { rows: [{ month: 'May', total: 0 }, { month: 'Jun', total: 0 }], rowCount: 2 };
                }
                return { rows: sampleDeals, rowCount: sampleDeals.length };
            }
            if (upperSql.includes('FROM COMPANIES')) {
                return { rows: sampleCompanies, rowCount: sampleCompanies.length };
            }
            if (upperSql.includes('FROM ACTIVITIES')) {
                if (upperSql.includes('COUNT(')) {
                    return { rows: [{ total_activities: 3, pending_activities: 2, completed_activities: 1 }], rowCount: 1 };
                }
                if (upperSql.includes('LEFT JOIN CONTACTS') || upperSql.includes('LEFT JOIN USERS') || upperSql.includes('A.*')) {
                    return { rows: recentActivities, rowCount: recentActivities.length };
                }
                if (upperSql.includes("TYPE = 'TASK'")) {
                    return { rows: sampleActivities.filter(a => a.type === 'task'), rowCount: 1 };
                }
                if (upperSql.includes("TYPE = 'MEETING'")) {
                    return { rows: sampleActivities.filter(a => a.type === 'meeting'), rowCount: 1 };
                }
                return { rows: sampleActivities, rowCount: sampleActivities.length };
            }
            if (upperSql.includes('FROM TICKETS')) {
                if (upperSql.includes('COUNT(')) {
                    return { rows: [{ total_tickets: 2, open_tickets: 1 }], rowCount: 1 };
                }
                return { rows: sampleTickets, rowCount: sampleTickets.length };
            }
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DB Compat Query] ${duration}ms | ${text.substring(0, 50)}...`);
        }

        if (!Array.isArray(rows)) {
            return { rows: [], rowCount: rows.affectedRows, insertId: rows.insertId };
        }

        return { rows, rowCount: rows.length };
    } catch (error) {
        console.error('❌ Database Query Error:', {
            originalText: text,
            translatedSql: sql,
            values,
            error: error.message
        });
        throw error;
    }
};

// Create a proxy/wrapper for pool object
const pool = new Proxy(rawPool, {
    get(target, prop, receiver) {
        if (prop === 'query') {
            return queryWrapper;
        }
        const val = Reflect.get(target, prop, receiver);
        if (typeof val === 'function') {
            return val.bind(target);
        }
        return val;
    }
});

export { pool };
export const query = queryWrapper;

