import jwt from 'jsonwebtoken';

export const getAuthUser = (req) => {
    try {
        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
        
        if (!authHeader) {
            return null;
        }

        const token = authHeader.split(' ')[1]; // Splits 'Bearer <token>'

        if (!token || token === 'null' || token === 'undefined') {
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'MODERN_CRM_SECRET');
        return decoded;
    } catch (error) {
        console.error('JWT Verification failed:', error.message);
        return null;
    }
};

export const isAdmin = (user) => {
    return user?.role === 'admin';
};
