// Authentication Routes
// Main Auth: https://youtu.be/6FOq4cUdH8k?si=CpxiMbVsN-prrvD8
// Social Login: https://youtube.com/playlist?list=PL4cUxeGkcC9jdm7QX143aMLAqyM-jTZ2x&si=bTYYFiyuN3Gyo8YH
// OTP Logic: https://youtu.be/dBl5seCbzYA?si=HCAEhols7s_XgdWK
// Source: https://expressjs.com/en/guide/routing.html
const express = require('express');
const router = express.Router();
const { register, login, logout, verifyOtp, getMe, updateAvatar, removeAvatar, completeProfile } = require('../controllers/authController');

const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/verify-otp', verifyOtp);
router.post('/complete-profile', protect, completeProfile);

router.get('/me', protect, getMe);

// Avatar Management

router.post('/update-avatar', protect, upload.single('avatar'), updateAvatar);
router.post('/remove-avatar', protect, removeAvatar);

// Google Auth
const passport = require('passport');
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', async (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            // Check for specific restriction message
            if (info && info.message && info.message.includes('@iut-dhaka.edu')) {
                return res.redirect('http://localhost:5173/register?error=' + encodeURIComponent(info.message));
            }
            return res.redirect('http://localhost:5173/login?error=AuthenticationFailed');
        }
        // Check verification status
        // OTP Required for Social Logins as requested.
        if (!user.isVerified) {
            if (!user.otp || user.otpExpires < Date.now()) {
                user.otp = Math.floor(100000 + Math.random() * 900000).toString();
                user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
                await user.save();

                // Send Email
                const sendEmail = require('../utils/sendEmail');
                const emailTemplate = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                        <div style="background-color: #CC2936; padding: 20px; text-align: center; color: white;">
                            <h1 style="margin: 0;">IUT Marketplace</h1>
                        </div>
                        <div style="padding: 20px; background-color: #f9f9f9;">
                            <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
                            <p style="color: #666; text-align: center; font-size: 16px;">We noticed a login attempt via Google. Please use the verification code below to complete your login.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <span style="background-color: #fff; padding: 15px 30px; font-size: 24px; font-weight: bold; border: 2px solid #CC2936; border-radius: 5px; color: #CC2936; letter-spacing: 5px;">${user.otp}</span>
                            </div>
                            <p style="color: #666; text-align: center;">This code will expire in <strong>5 minutes</strong>.</p>
                        </div>
                    </div>
                `;
                try {
                    await sendEmail({
                        email: user.email,
                        subject: 'Verify your ID - IUT Marketplace',
                        message: emailTemplate
                    });
                } catch (e) {
                    // Email failed
                }
            }
            return res.redirect(`http://localhost:5173/verify?email=${user.email}`);
        }

        req.logIn(user, (err) => {
            if (err) { return next(err); }

            // Check if profile is complete
            if (!user.studentId || !user.contactNumber) {
                // Redirect to dashboard with a query param to trigger an incomplete profile modal/form if implemented
                return res.redirect('http://localhost:5173/dashboard?incomplete=true');
            }

            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            res.redirect('http://localhost:5173/dashboard');
        });
    })(req, res, next);
});

// GitHub Auth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', (req, res, next) => {
    passport.authenticate('github', async (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            if (info && info.message && info.message.includes('@iut-dhaka.edu')) {
                // req.flash('error', info.message);
                return res.redirect('http://localhost:5173/register?error=' + encodeURIComponent(info.message));
            }
            // req.flash('error', 'Authentication failed (Email might be private or invalid).');
            return res.redirect('http://localhost:5173/login?error=AuthenticationFailed');
        }
        // OTP Required
        if (!user.isVerified) {
            if (!user.otp || user.otpExpires < Date.now()) {
                user.otp = Math.floor(100000 + Math.random() * 900000).toString();
                user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
                await user.save();

                const sendEmail = require('../utils/sendEmail');
                const emailTemplate = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                        <div style="background-color: #CC2936; padding: 20px; text-align: center; color: white;">
                            <h1 style="margin: 0;">IUT Marketplace</h1>
                        </div>
                        <div style="padding: 20px; background-color: #f9f9f9;">
                            <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
                            <p style="color: #666; text-align: center; font-size: 16px;">We noticed a login attempt via GitHub. Please use the verification code below to complete your login.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <span style="background-color: #fff; padding: 15px 30px; font-size: 24px; font-weight: bold; border: 2px solid #CC2936; border-radius: 5px; color: #CC2936; letter-spacing: 5px;">${user.otp}</span>
                            </div>
                            <p style="color: #666; text-align: center;">This code will expire in <strong>5 minutes</strong>.</p>
                        </div>
                    </div>
                `;
                try {
                    await sendEmail({
                        email: user.email,
                        subject: 'Verify your ID - IUT Marketplace',
                        message: emailTemplate
                    });
                } catch (e) {
                    // Email failed
                }
            }
            return res.redirect(`http://localhost:5173/verify?email=${user.email}`);
        }

        req.logIn(user, (err) => {
            if (err) { return next(err); }

            // Check if profile is complete
            if (!user.studentId || !user.contactNumber) {
                return res.redirect('http://localhost:5173/dashboard?incomplete=true');
            }

            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            res.redirect('http://localhost:5173/dashboard');
        });
    })(req, res, next);
});

module.exports = router;
