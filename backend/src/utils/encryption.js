const crypto = require('crypto');

// Get encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt sensitive data
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted data in format: iv:authTag:encryptedData
 */
const encrypt = (text) => {
  if (!text) return null;

  try {
    // Generate a random IV for each encryption
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the auth tag for authentication
    const authTag = cipher.getAuthTag();
    
    // Return in format: iv:authTag:encryptedData (all hex encoded)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted data in format: iv:authTag:encryptedData
 * @returns {string} Decrypted text
 */
const decrypt = (encryptedData) => {
  if (!encryptedData) return null;

  try {
    // Split the encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    
    // Convert hex strings back to buffers
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Encrypt an object's sensitive fields
 * @param {Object} obj - Object to encrypt
 * @param {Array<string>} fields - Fields to encrypt
 * @returns {Object} Object with encrypted fields
 */
const encryptFields = (obj, fields) => {
  if (!obj || !fields || !Array.isArray(fields)) return obj;

  const encrypted = { ...obj };
  
  fields.forEach(field => {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      try {
        encrypted[field] = encrypt(encrypted[field]);
      } catch (error) {
        console.error(`Error encrypting field ${field}:`, error);
        // Keep original if encryption fails
      }
    }
  });
  
  return encrypted;
};

/**
 * Decrypt an object's sensitive fields
 * @param {Object} obj - Object to decrypt
 * @param {Array<string>} fields - Fields to decrypt
 * @returns {Object} Object with decrypted fields
 */
const decryptFields = (obj, fields) => {
  if (!obj || !fields || !Array.isArray(fields)) return obj;

  const decrypted = { ...obj };
  
  fields.forEach(field => {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        decrypted[field] = decrypt(decrypted[field]);
      } catch (error) {
        console.error(`Error decrypting field ${field}:`, error);
        // Keep encrypted value if decryption fails
      }
    }
  });
  
  return decrypted;
};

/**
 * Hash data (one-way, for comparison)
 * @param {string} text - Text to hash
 * @returns {string} Hashed value
 */
const hash = (text) => {
  if (!text) return null;
  return crypto.createHash('sha256').update(text).digest('hex');
};

module.exports = {
  encrypt,
  decrypt,
  encryptFields,
  decryptFields,
  hash
};

