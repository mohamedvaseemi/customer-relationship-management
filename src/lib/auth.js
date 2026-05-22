import jwt from 'jsonwebtoken';

export const verifyAuth = (req) => {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        }

        // API key fallback – routes will validate the raw key via utils
        const apiKey = req.headers.get('x-api-key');
        if (apiKey) {
            return { apiKey };
        }

        return null;
    } catch (error) {
        return null;
    }
};

export const adminOnly = (user) => {
    return user && user.role === 'admin';
};
