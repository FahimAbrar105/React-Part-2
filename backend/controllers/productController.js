// Product Controller
// Source: https://mongoosejs.com/docs/queries.html
const Product = require('../models/Product');
const LimitOrder = require('../models/LimitOrder');
const path = require('path');
const fs = require('fs');

/*
 * Get all products
 * Logic: Supports filtering by Sector, Max Price, and availability.
 */
exports.getProducts = async (req, res) => {
    try {
        let query = { status: 'Available' };
        if (req.user) {
            query.user = { $ne: req.user.id };
        }

        // Filter by Sector (Category)
        if (req.query.sector) {
            query.category = { $regex: new RegExp('^' + req.query.sector + '$', 'i') };
        }

        // Filter by Max Price
        if (req.query.maxPrice) {
            query.price = { $lte: req.query.maxPrice };
        }
        const products = await Product.find(query).populate('user', 'name avatar studentId');
        res.json({ products, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

/*
 * Get single product
 */
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('user', 'name email avatar studentId');

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ product, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: 'Product not found' });
    }
};

/*
 * Show Create Product Form
 */
exports.createProductForm = (req, res) => {
    res.json({ user: req.user });
};

/*
 * Create new product
 * Logic: Saves product and triggers matching engine for Limit Orders.
 */
exports.createProduct = async (req, res) => {
    try {
        const { title, description, price, category, isAnonymous } = req.body;

        // Handle images
        let images = [];
        if (req.files) {
            req.files.forEach(file => {
                images.push(file.path); // Cloudinary URL
            });
        }

        await Product.create({
            title,
            description,
            price,
            category,
            images,
            isAnonymous: isAnonymous === 'on', // Checkbox sends 'on' if checked
            user: req.user.id
        });

        // ---------------------------------------------------------
        // LIMIT ORDER MATCHING PROTOCOL
        // ---------------------------------------------------------
        // Find active orders for this sector with maxPrice >= new product price
        const matchingOrders = await LimitOrder.find({
            sector: category,
            maxPrice: { $gte: price },
            status: 'ACTIVE',
            user: { $ne: req.user.id } // Prevent self-matching (Wash Trading)
        });

        if (matchingOrders.length > 0) {
            // For MVP: Mark them as 'FILLED' to simulate execution
            for (const order of matchingOrders) {
                order.status = 'FILLED';
                await order.save();
            }
        }
        // ---------------------------------------------------------

        res.json({ success: true, redirect: '/dashboard' });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Error creating product. Please try again.',
            details: err.message
        });
    }
};

/*
 * Delete product
 */
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Make sure user is product owner
        if (product.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await product.deleteOne();

        res.json({ success: true, redirect: '/dashboard' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

/*
 * Create Limit Order
 * Logic: Places a "buy" order at a specific price point.
 */
exports.createLimitOrder = async (req, res) => {
    try {
        const { sector, maxPrice } = req.body;

        await LimitOrder.create({
            user: req.user.id,
            sector,
            maxPrice
        });


        res.json({ success: true, redirect: '/products' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

/*
 * Delete Limit Order
 */
exports.deleteLimitOrder = async (req, res) => {
    try {
        const order = await LimitOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Verify ownership
        if (order.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await order.deleteOne();
        console.log(`[ORDER] Limit Order ${req.params.id} cancelled by user`);

        res.json({ success: true, redirect: '/dashboard' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getMarketStats = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const category = product.category;
        const basePrice = product.price;

        const totalInCategory = await Product.countDocuments({ category });
        const totalGlobal = await Product.countDocuments();

        const categoryPct = totalGlobal > 0
            ? (totalInCategory / totalGlobal) * 100
            : 50;

        // Fetch category distribution to rank them by scarcity
        const categoryCounts = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const ALL_CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Other'];
        
        // Merge DB counts with the master list to ensure empty categories have 0 count
        const fullCategoryCounts = ALL_CATEGORIES.map(cat => {
            const found = categoryCounts.find(c => (c._id || '').toLowerCase() === cat.toLowerCase());
            return { category: cat, count: found ? found.count : 0 };
        });

        // Sort ascending by count (scarcest items first)
        fullCategoryCounts.sort((a, b) => a.count - b.count);

        const totalCategories = fullCategoryCounts.length;
        const rankIndex = fullCategoryCounts.findIndex(c => c.category.toLowerCase() === (category || '').toLowerCase());

        let livePrice;
        if (totalCategories <= 1 || rankIndex === -1) {
            livePrice = basePrice;
        } else {
            // Interpolation: rankIndex 0 (least products) gets +5%, rankIndex max (most products) gets -5%
            const t = rankIndex / (totalCategories - 1);
            const multiplier = 1.05 - (0.10 * t);
            livePrice = basePrice * multiplier;
        }

        livePrice = Math.round(livePrice * 100) / 100;

        const changePct = ((livePrice - basePrice) / basePrice) * 100;

        const limitOrders = await LimitOrder.find({
            sector: { $regex: new RegExp('^' + category + '$', 'i') },
            status: 'ACTIVE'
        }).populate('user', 'name studentId').sort({ maxPrice: -1 }).limit(10);

        res.json({
            category,
            basePrice,
            livePrice,
            changePct: Math.round(changePct * 100) / 100,
            totalInCategory,
            totalGlobal,
            categoryPct: Math.round(categoryPct * 100) / 100,
            limitOrders
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.holdProduct = async (req, res) => {
    try {
        const User = require('../models/User');
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const user = await User.findById(req.user.id);

        if (user.watchlist.includes(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Already in holdings' });
        }

        user.watchlist.push(req.params.id);
        await user.save();

        res.json({ success: true, message: 'Position acquired', watchlist: user.watchlist });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.unholdProduct = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        user.watchlist = user.watchlist.filter(id => id.toString() !== req.params.id);
        await user.save();

        res.json({ success: true, message: 'Position liquidated', watchlist: user.watchlist });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
