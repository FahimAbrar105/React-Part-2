// Express App Setup
// Tutorial: https://www.youtube.com/watch?v=L72fhGm1tfE (Express.js Crash Course)
// Source: https://expressjs.com/en/starter/hello-world.html
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Load env vars
dotenv.config();

// Connect to DB
// Source: https://mongoosejs.com/docs/connections.html
const connectDB = require('./config/db');
connectDB();

// Passport Config
// Source: https://www.passportjs.org/docs/
require('./config/passport')(passport);

const app = express();
const server = http.createServer(app);

// Socket.io Setup
// Tutorial: https://www.youtube.com/watch?v=ZKEqqIO7n-k (Socket.io Realtime Chat)
// Source: https://socket.io/get-started/chat/
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware Configuration
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Custom Middleware for User Checking
const { checkUser } = require('./middleware/checkUser');
app.use(checkUser);

// Custom Middleware for Notifications
const notification = require('./middleware/notification');
app.use(notification);

// Route Definitions
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/chat', require('./routes/chat'));
app.use('/dashboard', require('./routes/dashboard'));

// Home Route
app.get('/', (req, res) => {
    if (req.cookies.token) {
        return res.json({ message: 'Welcome to IUT Marketplace API', user: req.user });
    }
    res.json({ message: 'Please Login', user: null });
});

/**
 * Socket.io Real-time Chat Logic
 * Source: Adapted from Socket.io documentation with custom DB integration.
 */
const Message = require('./models/Message');

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    socket.on('chatMessage', async (msg) => {
        const { sender, receiver, content, productId } = msg;

        try {
            // Save message to MongoDB
            const newMessage = await Message.create({
                sender,
                receiver,
                content,
                product: (productId && productId.length > 0) ? productId : null
            });

            // Real-time dispatch
            io.to(receiver).emit('message', newMessage);

            if (sender.toString() !== receiver.toString()) {
                io.to(sender).emit('message', newMessage);
            }
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
