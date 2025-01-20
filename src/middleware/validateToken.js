const JwtManage = require("../models/JwtManage"); // Replace with your actual path to JwtManage module

/**
 * Validate token. Use this middleware to protect routes that require authentication.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const validateToken = (req, res, next) => {
    const token = req.cookies?.token;

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided",
        });
    }

    // Verify token validity using JwtManage
    const tokenInfo = JwtManage.get(token);
    if (!tokenInfo) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid token",
        });
    }

    // If token is valid, attach token info to the request object for further use
    req.tokenInfo = tokenInfo;
    // console.log("Token info attached to request object:", tokenInfo);

    // Proceed to the next middleware or route handler
    next();
};

module.exports = { validateToken };
