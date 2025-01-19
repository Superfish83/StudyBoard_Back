const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const EXPIRE_IN  = process.env.JWT_EXPIRE_IN;

class JwtManage {
    /**
     * userCreate: Creates a JWT token from user object.
     * @param {Object} user - The user object containing name, class, email.
     * @returns {string} - The generated JWT token.
     */
    static createUser(user) {
        const payload = {
            name: user.name,
            email: user.email,
            id: user.id
        };

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRE_IN });
        return token;
    }

    /**
     * create: Creates a JWT token from any object.
     * @param {Object} obj - The object to encode in the JWT token.
     * @param {string|number} expiresIn - Expiration time for the token.
     * @returns {string} - The generated JWT token.
     */
    static create(obj, expiresIn) {
        const token = jwt.sign(obj, SECRET_KEY, { expiresIn });
        return token;
    }

    /**
     * get: Verifies the JWT token and extracts information.
     * @param {string} token - The JWT token to verify.
     * @returns {Object|null} - The decoded information if valid, otherwise null.
     */
    static get(token) {
        try { return jwt.verify(token, SECRET_KEY); }
        catch (err) { return null; }
    }
}

module.exports = JwtManage;