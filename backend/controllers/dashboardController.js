const Product = require('../models/Product');
const LimitOrder = require('../models/LimitOrder');

exports.getDashboardData = async (req, res) => {
    try {
        // Fetch products owned by the user
        const myProducts = await Product.find({ user: req.user.id });

        // Fetch active orders
        const myOrders = await LimitOrder.find({ user: req.user.id }).sort({ createdAt: -1 });

        // Matching Engine Simulation (Self-authored logic)
        const ordersWithMatches = await Promise.all(myOrders.map(async (order) => {
            const orderObj = order.toObject();
            // Find products matching the limit order criteria
            const matches = await Product.find({
                category: { $regex: new RegExp('^' + order.sector + '$', 'i') },
                price: { $lte: order.maxPrice },
                user: { $ne: req.user.id },
            });
            orderObj.matches = matches;
            return orderObj;
        }));

        res.json({
            user: req.user,
            myProducts,
            myOrders: ordersWithMatches
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};
