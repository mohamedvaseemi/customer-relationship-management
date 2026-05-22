import crypto from 'crypto';

/**
 * Generate a cryptographically secure API key.
 * Format: crm_<40 random hex chars>
 */
export function generateApiKey() {
    const raw = crypto.randomBytes(20).toString('hex');
    return `crm_${raw}`;
}

/**
 * SHA-256 hash the raw key for storage.
 * One-way — the raw key can never be recovered.
 */
export function hashKey(rawKey) {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Constant-time comparison of raw key against stored hash.
 */
export function verifyKey(rawKey, storedHash) {
    const inputHash = hashKey(rawKey);
    // Use timingSafeEqual to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(inputHash, 'hex'),
            Buffer.from(storedHash, 'hex')
        );
    } catch {
        return false;
    }
}

/**
 * Extract the key prefix (first 12 chars after "crm_") for display.
 * e.g. "crm_a1b2c3d4e5f6..." → "crm_a1b2c3d4"
 */
export function getKeyPrefix(rawKey) {
    return rawKey.substring(0, 12) + '...';
}

/**
 * Validate an incoming API request using the X-API-Key header.
 * Looks up the key in the api_keys table, updates last_used_at on success.
 * Returns { valid: true, keyRecord } or { valid: false, error }
 */
export async function validateApiKeyRequest(req, pool) {
    const apiKeyHeader = req.headers.get('x-api-key');
    if (!apiKeyHeader) {
        return { valid: false, error: 'Missing X-API-Key header' };
    }

    const keyHash = hashKey(apiKeyHeader);

    try {
        const result = await pool.query(
            `SELECT * FROM api_keys WHERE key_hash = $1 AND is_active = 1 LIMIT 1`,
            [keyHash]
        );

        if (result.rows.length === 0) {
            return { valid: false, error: 'Invalid or revoked API key' };
        }

        const keyRecord = result.rows[0];

        // Check expiry
        if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
            return { valid: false, error: 'API key has expired' };
        }

        // Update last_used_at (fire-and-forget)
        pool.query(
            `UPDATE api_keys SET last_used_at = NOW() WHERE id = $1`,
            [keyRecord.id]
        ).catch(() => {});

        return { valid: true, keyRecord };
    } catch (err) {
        console.error('API key validation error:', err);
        return { valid: false, error: 'Server error during key validation' };
    }
}
