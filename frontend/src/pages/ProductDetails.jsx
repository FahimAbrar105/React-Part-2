import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProductDetails.css';

const POLL_INTERVAL = 8000; // 8 seconds
const MAX_CHART_POINTS = 30;

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [marketStats, setMarketStats] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTimeRange, setActiveTimeRange] = useState('30D');
    const intervalRef = useRef(null);

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`/products/${id}`);
                setProduct(res.data.product);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Fetch market stats and build chart
    const fetchMarketStats = useCallback(async () => {
        try {
            const res = await axios.get(`/products/${id}/market-stats`);
            const stats = res.data;
            setMarketStats(stats);

            // Add micro-noise (±1.5%) for stock-market jitter
            const noise = 1 + (Math.random() - 0.5) * 0.03;
            const noisyPrice = Math.round(stats.livePrice * noise * 100) / 100;

            setPriceHistory(prev => {
                const next = [...prev, noisyPrice];
                if (next.length > MAX_CHART_POINTS) next.shift();
                return next;
            });
        } catch (err) {
            console.error('Market stats fetch error:', err);
        }
    }, [id]);

    useEffect(() => {
        fetchMarketStats();
        intervalRef.current = setInterval(fetchMarketStats, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [fetchMarketStats]);

    // Initialize the price history with seed data once we have marketStats
    useEffect(() => {
        if (marketStats && priceHistory.length <= 1) {
            const base = marketStats.basePrice;
            const live = marketStats.livePrice;
            const seed = [];
            for (let i = 0; i < 20; i++) {
                const t = i / 19;
                const interpolated = base + (live - base) * t;
                const noise = 1 + (Math.random() - 0.5) * 0.04;
                seed.push(Math.round(interpolated * noise * 100) / 100);
            }
            setPriceHistory(seed);
        }
    }, [marketStats]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to liquidate this asset?')) return;
        try {
            await axios.post(`/products/${id}/delete`);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to liquidate asset');
        }
    };

    const handleStartChat = () => {
        if (!user) return navigate('/login');
        if (product.user._id === (user.id || user._id)) return alert("You cannot chat with yourself");
        navigate(`/chat/${product.user._id}?productId=${product._id}`);
    };

    // ─── Chart helpers ───
    const buildChartPath = (data, width, height) => {
        if (data.length < 2) return { linePath: '', areaPath: '' };

        const min = Math.min(...data) * 0.998;
        const max = Math.max(...data) * 1.002;
        const range = max - min || 1;

        const points = data.map((val, i) => ({
            x: (i / (data.length - 1)) * width,
            y: height - ((val - min) / range) * height
        }));

        let linePath = `M${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
            const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
            linePath += ` C${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
        }

        const areaPath = linePath + ` V ${height} H 0 Z`;
        return { linePath, areaPath };
    };

    const getYAxisLabels = (data) => {
        if (data.length === 0) return ['0', '0', '0', '0', '0'];
        const min = Math.min(...data) * 0.998;
        const max = Math.max(...data) * 1.002;
        const labels = [];
        for (let i = 0; i < 5; i++) {
            const val = max - (i / 4) * (max - min);
            labels.push(Math.round(val).toLocaleString());
        }
        return labels;
    };

    // ─── Generate simulated order book entries ───
    const generateOrderBook = () => {
        if (!marketStats || !product) return { sells: [], buys: [] };

        const { livePrice, limitOrders } = marketStats;

        // Sell-side: orders above live price
        const sells = [];
        for (let i = 0; i < 5; i++) {
            const spreadMul = 1 + (Math.random() * 0.003 + 0.001) * (5 - i);
            const price = livePrice * spreadMul;
            const displayName = limitOrders[i]
                ? (limitOrders[i].user?.name?.split(' ')[0] || 'Trader') + '_' + Math.floor(Math.random() * 9000 + 1000)
                : 'Trader_' + Math.floor(Math.random() * 9000 + 1000);
            sells.push({
                trader: displayName,
                size: Math.floor(Math.random() * 9) + 1,
                price: Math.round(price * 100) / 100
            });
        }
        sells.sort((a, b) => b.price - a.price);

        // Buy-side: orders below live price
        const buys = [];
        for (let i = 0; i < 5; i++) {
            const spreadMul = 1 - (Math.random() * 0.003 + 0.001) * (i + 1);
            const price = livePrice * spreadMul;
            buys.push({
                trader: 'Student_' + Math.floor(Math.random() * 9000 + 1000),
                size: Math.floor(Math.random() * 9) + 1,
                price: Math.round(price * 100) / 100
            });
        }
        buys.sort((a, b) => b.price - a.price);

        const spread = sells.length && buys.length
            ? Math.round((sells[sells.length - 1].price - buys[0].price) * 100) / 100
            : 0;

        return { sells, buys, spread: Math.abs(spread).toFixed(2) };
    };

    // ─── Render ───
    if (loading) {
        return (
            <div className="product-details-page">
                <div className="loading-state">
                    <span className="loading-pulse">LOADING TERMINAL...</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-details-page">
                <div className="loading-state">
                    ASSET NOT FOUND — <Link to="/products" style={{ color: '#4dabf7' }}>RETURN TO MARKETS</Link>
                </div>
            </div>
        );
    }

    const livePrice = marketStats?.livePrice ?? product.price;
    const changePct = marketStats?.changePct ?? 0;
    const isPositive = changePct >= 0;
    const orderBook = generateOrderBook();
    const { linePath, areaPath } = buildChartPath(priceHistory, 500, 200);
    const yLabels = getYAxisLabels(priceHistory);
    const isOwner = user && product.user._id === (user.id || user._id);

    const imgSrc = product.images && product.images.length > 0
        ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000/${product.images[0]}`)
        : null;

    return (
        <div className="product-details-page">
            {/* ── Navbar ── */}
            <div className="pd-container">
                {/* ── Asset Header ── */}
                <header className="asset-header">
                    <div className="asset-title">
                        <h1>
                            {product.title} <span className="badge">SPOT</span>
                        </h1>
                        <p className="asset-meta">
                            SECTOR: {product.category.toUpperCase()} &nbsp; ID: {product._id.slice(-8)}
                        </p>
                    </div>
                    <div className="asset-price">
                        <div className={`price-main ${isPositive ? 'positive' : 'negative'}`}>
                            ৳{livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="change">
                                {isPositive ? '+' : ''}{changePct.toFixed(2)}%
                            </span>
                        </div>
                        <div className="price-sub">
                            BASE PRICE: <span className="strikethrough">৳{product.price.toLocaleString()}</span> — REAL-TIME FEED
                        </div>
                    </div>
                </header>

                {/* ── Dashboard Grid ── */}
                <main className="dashboard-grid">

                    {/* ── Left Column ── */}
                    <div className="col-left">
                        <div className="card image-card">
                            <div className="image-wrapper">
                                {imgSrc ? (
                                    <img src={imgSrc} alt={product.title} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#333', fontSize: '3rem' }}>📦</div>
                                )}
                            </div>
                        </div>

                        <div className="card fundamentals-card">
                            <h3>ASSET FUNDAMENTALS</h3>
                            <div className="fund-row">
                                <span className="fund-label">DESCRIPTION</span>
                            </div>
                            <div className="fund-row" style={{ flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: 1.5 }}>{product.description}</span>
                            </div>
                            <div className="fund-row">
                                <span className="fund-label">SELLER</span>
                                <span className="fund-value">{product.isAnonymous ? 'ANONYMOUS' : product.user.name}</span>
                            </div>
                            <div className="fund-row">
                                <span className="fund-label">MARKET SHARE</span>
                                <span className={`fund-value ${(marketStats?.categoryPct ?? 50) >= 50 ? 'green' : 'red'}`}>
                                    {marketStats?.categoryPct?.toFixed(1) ?? '—'}%
                                </span>
                            </div>
                            <div className="fund-row">
                                <span className="fund-label">GLOBAL SUPPLY</span>
                                <span className="fund-value">
                                    {marketStats?.totalInCategory ?? '—'} / {marketStats?.totalGlobal ?? '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Middle Column: Order Book ── */}
                    <div className="col-mid">
                        <div className="card order-book-card">
                            <div className="card-header">
                                <h3>ORDER BOOK</h3>
                                <span className="live-indicator">● LIVE</span>
                            </div>

                            <div className="table-header">
                                <span>TRADER</span>
                                <span>SIZE</span>
                                <span>PRICE (৳)</span>
                            </div>

                            {orderBook.sells.length > 0 || orderBook.buys.length > 0 ? (
                                <>
                                    <div className="order-list sell-list">
                                        {orderBook.sells.map((o, i) => (
                                            <div className="order-row red" key={`sell-${i}`}>
                                                <span>{o.trader}</span>
                                                <span>{o.size}</span>
                                                <span>{o.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="spread-row">SPREAD: {orderBook.spread}</div>

                                    <div className="order-list buy-list">
                                        {orderBook.buys.map((o, i) => (
                                            <div className="order-row green" key={`buy-${i}`}>
                                                <span>{o.trader}</span>
                                                <span>{o.size}</span>
                                                <span>{o.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="empty-orders">NO ACTIVE ORDERS IN THIS SECTOR</div>
                            )}
                        </div>
                    </div>

                    {/* ── Right Column ── */}
                    <div className="col-right">
                        <div className="card chart-card">
                            <div className="card-header">
                                <h3>PRICE PERFORMANCE (LIVE)</h3>
                                <div className="time-toggles">
                                    {['1H', '1D', '30D'].map(range => (
                                        <button
                                            key={range}
                                            className={activeTimeRange === range ? 'active' : ''}
                                            onClick={() => setActiveTimeRange(range)}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="chart-container">
                                <div className="y-axis">
                                    {yLabels.map((label, i) => (
                                        <span key={i}>{label}</span>
                                    ))}
                                </div>
                                <div className="graph-area">
                                    <svg viewBox="0 0 500 200" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor={isPositive ? '#00ff9d' : '#ff3366'} stopOpacity="0.3" />
                                                <stop offset="100%" stopColor={isPositive ? '#00ff9d' : '#ff3366'} stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        {/* Grid lines */}
                                        {[0, 1, 2, 3, 4].map(i => (
                                            <line
                                                key={i}
                                                x1="0" y1={i * 50}
                                                x2="500" y2={i * 50}
                                                stroke="#2a2c35" strokeWidth="1" strokeDasharray="4" opacity="0.5"
                                            />
                                        ))}
                                        {areaPath && <path fill="url(#chartGradient)" d={areaPath} />}
                                        {linePath && (
                                            <path
                                                fill="none"
                                                stroke={isPositive ? '#00ff9d' : '#ff3366'}
                                                strokeWidth="2.5"
                                                d={linePath}
                                                className="chart-line-animated"
                                            />
                                        )}
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        {isOwner ? (
                            <button className="btn-liquidate" onClick={handleDelete}>
                                🗑 LIQUIDATE ASSET (DELETE)
                            </button>
                        ) : (
                            <button className="btn-message" onClick={handleStartChat}>
                                ✉ CONTACT SELLER
                            </button>
                        )}
                    </div>
                </main>

                <footer className="bottom-bar">
                    Marketplace. Made for IUTians.
                </footer>
            </div>
        </div>
    );
};

export default ProductDetails;
