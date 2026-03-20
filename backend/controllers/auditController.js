import { pool } from '../config/database.js';

// Get activity logs for a module or record
export const getAuditLogs = async (req, res) => {
  const { module, record_id } = req.query;
  try {
    let query = `
      SELECT al.*, u.name as user_name 
      FROM audit_logs al 
      LEFT JOIN users u ON al.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (module) {
      query += ` AND al.module = $${paramCount}`;
      params.push(module);
      paramCount++;
    }

    if (record_id) {
      query += ` AND al.record_id = $${paramCount}`;
      params.push(record_id);
      paramCount++;
    }

    query += ' ORDER BY al.created_at DESC LIMIT 100';

    const result = await pool.query(query, params);
    res.json({ logs: result.rows });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Log an action (helper function, not a direct route)
export const logAction = async (module, record_id, action, user_id, changes) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (module, record_id, action, user_id, changes)
       VALUES ($1, $2, $3, $4, $5)`,
      [module, record_id, action, user_id, changes]
    );
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};
