import { query } from '@/lib/db';

export const getRooms = async (userId) => {
    const result = await query(`
        SELECT cr.*, u.name as participant_name
        FROM chat_rooms cr
        JOIN users u ON cr.participant_id = u.id
        WHERE cr.created_by = $1 OR cr.participant_id = $1
        ORDER BY cr.updated_at DESC
    `, [userId]);
    return { rooms: result.rows };
};

export const getMessages = async (roomId) => {
    const result = await query(`
        SELECT cm.*, u.name as sender_name
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.id
        WHERE cm.room_id = $1
        ORDER BY cm.created_at ASC
    `, [roomId]);
    return { messages: result.rows };
};

export const sendMessage = async (data, userId) => {
    const { room_id, content } = data;
    const result = await query(
        `INSERT INTO chat_messages (room_id, sender_id, content)
         VALUES ($1, $2, $3) RETURNING *`,
        [room_id, userId, content]
    );
    // Update room timestamp
    await query('UPDATE chat_rooms SET updated_at = NOW() WHERE id = $1', [room_id]);
    return { message: result.rows[0] };
};
