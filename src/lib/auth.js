import jwt from 'jsonwebtoken';

export const verifyAuth = (req) => {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
};

export const adminOnly = (user) => {
    return user && user.role === 'admin';
};
