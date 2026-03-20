import { pool } from '../config/database.js';

// Get channels for current user
export const getMyChannels = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.* FROM chat_channels c
             JOIN channel_members cm ON c.id = cm.channel_id
             WHERE cm.user_id = $1`,
            [req.user.id]
        );
        res.json({ channels: result.rows });
    } catch (error) {
        console.error('Get channels error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get messages for a channel
export const getChannelMessages = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT m.*, u.name as sender_name, cn.first_name as customer_name
             FROM chat_messages m
             LEFT JOIN users u ON m.sender_id = u.id
             LEFT JOIN contacts cn ON m.customer_id = cn.id
             WHERE m.channel_id = $1
             ORDER BY m.created_at ASC`,
            [req.params.channelId]
        );
        res.json({ messages: result.rows });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Send message
export const sendMessage = async (req, res) => {
    try {
        const { channel_id, content, is_bot } = req.body;
        const result = await pool.query(
            `INSERT INTO chat_messages (channel_id, sender_id, content, is_bot)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [channel_id, req.user.id, content, is_bot || false]
        );
        res.status(201).json({ message: result.rows[0] });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
