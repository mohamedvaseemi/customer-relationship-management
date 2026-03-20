import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

// Create user (Admin only)
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check user exists
        const existingUsers = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUsers.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, avatar, created_at',
            [name, email, hashedPassword, role || 'user']
        );

        res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await pool.query(
            'SELECT id, name, email, role, avatar, created_at, updated_at FROM users ORDER BY created_at DESC'
        );
        res.json({ users: users.rows });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user (including role)
export const updateUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        let query = 'UPDATE users SET name = $1, email = $2, role = $3';
        let params = [name, email, role];
        let paramCount = 4;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += `, password = $${paramCount}`;
            params.push(hashedPassword);
            paramCount++;
        }

        query += ` WHERE id = $${paramCount - 1} RETURNING id, name, email, role, avatar, created_at`;

        // In PostgreSQL, the WHERE clause parameter should be the last one
        // But since I'm appending password dynamically, the ID param index shifts.
        // Let's rewrite strictly.

        let updateFields = ['name = $1', 'email = $2', 'role = $3'];
        let updateParams = [name, email, role];
        let nextParamIndex = 4;

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push(`password = $${nextParamIndex}`);
            updateParams.push(hashedPassword);
            nextParamIndex++;
        }

        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${nextParamIndex} RETURNING id, name, email, role, avatar`;
        updateParams.push(req.params.id);

        const result = await pool.query(updateQuery, updateParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User updated successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        // Prevent deleting self
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
