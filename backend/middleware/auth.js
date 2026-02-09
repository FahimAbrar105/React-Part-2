// JWT Authentication Middleware
// Tutorial: https://www.youtube.com/watch?v=mbsmsi7l3r4 (JWT Auth Tutorial)
// Source: https://jwt.io/introduction
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // 1. Extract token from cookies
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // 2. If no token, return 401
    if (!token) {
        return res.status(401).json({ error: 'Not authorized', redirect: '/login' });
    }

    try {
        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find user in database
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            res.clearCookie('token');
            return res.status(401).json({ error: 'User not found', redirect: '/login' });
        }

        // 5. Ensure user is verified (Required since you implemented OTP)
        if (!req.user.isVerified) {
            // If they have an email, we can help them verify
            return res.status(403).json({
                error: 'Email not verified',
                redirect: '/verify',
                email: req.user.email
            });
        }

        // 6. Check if token was issued before the last logout
        if (req.user.lastLogout) {
            const lastLogoutTime = new Date(req.user.lastLogout).getTime() / 1000;
            if (decoded.iat < lastLogoutTime) {
                res.clearCookie('token');
                return res.status(401).json({ error: 'Session expired', redirect: '/login' });
            }
        }

        // 7. Security: Prevent caching of protected pages
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err.message);
        res.clearCookie('token');
        return res.status(401).json({ error: 'Not authorized', redirect: '/login' });
    }
};