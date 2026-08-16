import jwt from 'jsonwebtoken';

export const verifyAuth = (req) => {
    try {
        let token = null;
        const authHeader = req.headers?.get('authorization');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
        }

        if (!token && req.cookies) {
            token = req.cookies.get('token')?.value;
        }

        if (token && token !== 'undefined' && token !== 'null') {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded; // Returns { id, email, role, company_id }
        }

        return null;
    } catch (error) {
        return null;
    }
};

// Guard: Company Admin Role Verification
export const isCompanyAdmin = (user) => {
    return user && (user.role === 'admin' || user.role === 'superadmin');
};

// Helper: Get SQL Condition for Tenant Isolation
export const getTenantCondition = (user, tableAlias = '') => {
    const prefix = tableAlias ? `${tableAlias}.` : '';
    
    // Superadmin monitors everything across all companies
    if (user.role === 'superadmin') {
        return { sql: '1=1', params: [] };
    }

    // Company Admin & Employee can only see data belonging to their company_id
    return {
        sql: `${prefix}company_id = $1`,
        params: [user.company_id]
    };
};