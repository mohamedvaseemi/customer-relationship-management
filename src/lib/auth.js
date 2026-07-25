import jwt from 'jsonwebtoken';

export const verifyAuth = (req) => {
    try {
        let token = null;

        // 1. Check Authorization header
        const authHeader = req.headers?.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const rawToken = authHeader.substring(7).trim();
            if (rawToken && rawToken !== 'undefined' && rawToken !== 'null') {
                token = rawToken;
            }
        }

        // 2. Fallback to Cookie
        if (!token && req.cookies) {
            const cookieToken = req.cookies.get('token')?.value;
            if (cookieToken && cookieToken !== 'undefined' && cookieToken !== 'null') {
                token = cookieToken;
            }
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        }

        // API key fallback – routes will validate the raw key via utils
        const apiKey = req.headers?.get('x-api-key');
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

