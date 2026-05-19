import { pool } from './db.js';

export const logAction = async (module, record_id, action, user_id, changes) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (module, record_id, action, user_id, changes)
       VALUES ($1, $2, $3, $4, $5)`,
      [module, record_id, action, user_id, JSON.stringify(changes)]
    );
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

