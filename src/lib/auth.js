import jwt from 'jsonwebtoken';

export const getAuthUser = (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'MODERN_CRM_SECRET');
        return decoded;
    } catch (error) {
        return null;
    }
};

export const isAdmin = (user) => {
    return user?.role === 'admin';
};
