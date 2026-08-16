/**
 * Client-side AES-GCM 256-bit Secure Storage Utility
 * Encrypts all data before writing to localStorage or Cookies.
 */

const ENCRYPTION_SALT = process.env.NEXT_PUBLIC_APP_SALT;
const SECRET_PASSPHRASE = process.env.NEXT_PUBLIC_CLIENT_SECRET;

async function deriveKey(salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(SECRET_PASSPHRASE),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: enc.encode(salt),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// Convert Buffer to Base64 safely in browser
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export const secureStorage = {
    // Encrypt and Save to LocalStorage
    async setItem(key, value) {
        if (typeof window === 'undefined') return;
        try {
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const keyObj = await deriveKey(ENCRYPTION_SALT);
            const enc = new TextEncoder();
            const encodedData = enc.encode(JSON.stringify(value));

            const cipherBuffer = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                keyObj,
                encodedData
            );

            const payload = {
                iv: arrayBufferToBase64(iv),
                data: arrayBufferToBase64(cipherBuffer)
            };

            localStorage.setItem(key, JSON.stringify(payload));
        } catch (err) {
            console.error(`[SecureStorage] Encryption failed for key "${key}":`, err);
        }
    },

    // Decrypt and Read from LocalStorage
    async getItem(key) {
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;

            const { iv, data } = JSON.parse(raw);
            const keyObj = await deriveKey(ENCRYPTION_SALT);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(base64ToArrayBuffer(iv)) },
                keyObj,
                base64ToArrayBuffer(data)
            );

            const dec = new TextDecoder();
            return JSON.parse(dec.decode(decrypted));
        } catch (err) {
            // Fallback for non-encrypted legacy values
            const fallback = localStorage.getItem(key);
            try { return JSON.parse(fallback); } catch { return fallback; }
        }
    },

    removeItem(key) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    },

    clear() {
        if (typeof window !== 'undefined') {
            localStorage.clear();
        }
    }
};