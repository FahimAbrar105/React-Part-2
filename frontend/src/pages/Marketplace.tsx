import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Product {
    _id: string;
    title: string;
    price: number;
    category: string;
    images: string[];
    isAnonymous: boolean;
    user: {
        _id: string;
        name: string;
        studentId?: string;
    };
}

const Marketplace = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Market Status State
    const [volatility, setVolatility] = useState(45);
    const [volume, setVolume] = useState(1204);
    const [activeNodes, setActiveNodes] = useState(84);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('/products');
                setProducts(res.data.products || []);
            } catch (err) {
                console.error("Error loading marketplace", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        // Simulate Market Activity
        const interval = setInterval(() => {
            setVolatility(prev => Math.min(Math.max(prev + (Math.random() - 0.5) * 10, 10), 90));
            setVolume(prev => prev + Math.floor((Math.random() - 0.3) * 5));
            setActiveNodes(prev => prev + Math.floor((Math.random() - 0.5) * 3));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const handleLimitOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            await axios.post('/products/orders', data);
            alert('LIMIT ORDER SUBMITTED');
            setIsModalOpen(false);
            form.reset();
        } catch (err) {
            console.error(err);
            alert('ORDER FAILED');
        }
    };

    if (loading) return <div className="p-8 text-center text-text-secondary font-mono animate-pulse">CONNECTING TO MARKET...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                <div className="flex-1 mr-4">
                    <div className="mb-1">
                        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center space-x-3 font-mono">
                            <i className="fas fa-network-wired text-action text-2xl animate-pulse"></i>
                            <span>IUT MARKETPLACE</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-1 pl-1">
                            <span className="text-[10px] font-mono text-bull animate-pulse">● SYSTEM ONLINE</span>
                            <span className="text-[10px] font-mono text-text-secondary/50">|</span>
                            <p className="text-[10px] text-text-secondary font-mono tracking-widest">
                                ENCRYPTED P2P EXCHANGE // VERIFIED STUDENT NODES
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dynamic Market Status Dashboard */}
                <div className="hidden md:flex gap-4 mb-8 w-full max-w-2xl">
                    {/* Volatility Meter */}
                    <div className="bg-bg border border-border p-3 rounded flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-text-secondary font-mono">MARKET VOLATILITY</span>
                            <span className="text-xs font-bold text-bear font-mono">{Math.floor(volatility)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                            <div
                                className="h-full bg-bear transition-all duration-1000 ease-in-out"
                                style={{ width: `${volatility}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* 24h Volume */}
                    <div className="bg-bg border border-border p-3 rounded flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-text-secondary font-mono">24H VOLUME</span>
                            <span className="text-[10px] text-bull font-mono">▲ 4.2%</span>
                        </div>
                        <div className="text-xl font-bold text-white font-mono">৳{volume.toLocaleString()}</div>
                    </div>

                    {/* Active Traders */}
                    <div className="bg-bg border border-border p-3 rounded flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-text-secondary font-mono">ACTIVE NODES</span>
                            <span className="text-[10px] text-action font-mono animate-pulse">● LIVE</span>
                        </div>
                        <div className="text-xl font-bold text-white font-mono">{activeNodes}</div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 bg-surface p-1 rounded border border-border">
                    <button className="px-3 py-1 rounded text-[10px] font-bold bg-bg text-white border border-border shadow-sm flex items-center gap-2">
                        <i className="fas fa-th-large text-action"></i> GRID
                    </button>
                    <button className="px-3 py-1 rounded text-[10px] font-bold text-text-secondary hover:text-white flex items-center gap-2 hover:bg-bg/50 transition">
                        <i className="fas fa-list"></i> LIST
                    </button>
                </div>
            </div>

            {/* Ticker Tape */}
            <div className="mb-8 overflow-hidden w-full relative border-y border-border/50 bg-black/20 py-1">
                <style>
                    {`
                    @keyframes ticker {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .ticker-wrap {
                        mask-image: linear-gradient(to right, transparent, black 2%, black 98%, transparent);
                        -webkit-mask-image: linear-gradient(to right, transparent, black 2%, black 98%, transparent);
                    }
                    .ticker-move {
                        animation: ticker 60s linear infinite;
                        width: max-content;
                    }
                    .ticker-move:hover {
                        animation-play-state: paused;
                    }
                    `}
                </style>
                <div className="ticker-wrap flex-1 overflow-hidden relative h-6">
                    <div className="ticker-move whitespace-nowrap absolute top-0 left-0 flex items-center h-full">
                        {[...products, ...products].map((p, i) => (
                            <span key={i} className="inline-block px-4 text-xs font-mono text-text-secondary">
                                <i className="fas fa-cube text-[8px] opacity-30 mr-1"></i>
                                {p.title.toUpperCase()}: <span className="text-bull font-bold">৳{p.price}</span>
                                <span className="text-text-secondary/30 ml-2">|</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Initiate Limit Order Button */}
            <div className="ml-4 mb-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-1.5 rounded-none text-xs font-bold bg-action hover:bg-blue-600 text-white border border-border flex items-center space-x-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
                >
                    <i className="fas fa-plus-square"></i>
                    <span>INITIATE LIMIT ORDER</span>
                </button>
            </div>

            {/* Limit Order Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                            aria-hidden="true"
                            onClick={() => setIsModalOpen(false)}
                        ></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="relative inline-block align-bottom bg-bg rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-border">
                            <form onSubmit={handleLimitOrderSubmit}>
                                <div className="bg-surface px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-bull/10 sm:mx-0 sm:h-10 sm:w-10 border border-bull/20">
                                            <i className="fas fa-chart-line text-bull"></i>
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-white font-mono" id="modal-title">
                                                SUBMIT LIMIT ORDER
                                            </h3>
                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <label className="block text-text-secondary text-xs font-mono mb-1">TARGET SECTOR</label>
                                                    <select name="sector" className="w-full bg-bg border border-border text-white text-sm rounded p-2 font-mono focus:border-action outline-none">
                                                        <option value="Electronics">ELECTRONICS</option>
                                                        <option value="Clothing">CLOTHING</option>
                                                        <option value="Books">BOOKS</option>
                                                        <option value="Furniture">FURNITURE</option>
                                                        <option value="Other">OTHER</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-text-secondary text-xs font-mono mb-1">STRIKE PRICE (MAX)</label>
                                                    <input
                                                        type="number"
                                                        name="maxPrice"
                                                        placeholder="0.00"
                                                        className="w-full bg-bg border border-border text-white text-sm rounded p-2 font-mono focus:border-action outline-none"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-bg px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-border">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-bull text-base font-medium text-black hover:bg-green-500 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm font-mono font-bold"
                                    >
                                        SUBMIT ORDER
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-border shadow-sm px-4 py-2 bg-surface text-base font-medium text-text-secondary hover:text-white focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm font-mono"
                                    >
                                        CANCEL
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-surface border border-dashed border-border rounded-lg">
                    <i className="fas fa-box-open text-6xl text-border mb-4"></i>
                    <p className="text-text-secondary font-mono text-lg mb-4">NO ASSETS FOUND IN LIQUIDITY POOL</p>
                    <Link to="/products/create" className="px-6 py-2 bg-action text-white font-mono font-bold text-sm hover:bg-blue-600 rounded">
                        INITIATE IPO
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <Link
                            key={product._id}
                            to={`/products/${product._id}`}
                            className="bg-surface border border-border rounded-lg overflow-hidden group hover:border-action transition relative flex flex-col h-full"
                        >
                            {/* Asset Image */}
                            <div className="w-full h-48 bg-bg relative overflow-hidden border-b border-border">
                                {product.images && product.images.length > 0 ? (
                                    <div className="w-full h-full relative">
                                        <img
                                            src={product.images[0]}
                                            alt={product.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                        <div className="hidden absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/50 border border-border/50">
                                            <i className="fas fa-cube text-xl text-border mb-1 opacity-50"></i>
                                            <span className="text-[8px] font-mono text-bear tracking-widest">[REDACTED]</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 border border-border/50">
                                        <i className="fas fa-cube text-xl text-border mb-1 opacity-50"></i>
                                        <span className="text-[8px] font-mono text-bear tracking-widest">[REDACTED]</span>
                                    </div>
                                )}

                                {/* Sector Tag */}
                                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm border border-border px-2 py-1 rounded text-[10px] font-mono text-text-secondary">
                                    SECTOR: {product.category.toUpperCase()}
                                </div>
                            </div>

                            <div className="p-4 flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-white font-bold text-base truncate pr-2 w-3/4">
                                            {product.title}
                                        </h3>
                                        {/* Sparkline Simulation with SVG */}
                                        <svg width="60" height="20" className="opacity-70">
                                            <polyline
                                                points={`0,${10 + Math.random() * 10} 10,${10 - Math.random() * 5} 20,${10 + Math.random() * 5} 30,${10 - Math.random() * 8} 40,${10 + Math.random() * 3} 50,${10 - Math.random() * 5} 60,${10}`}
                                                fill="none"
                                                stroke="#00e396"
                                                strokeWidth="1.5"
                                            />
                                        </svg>
                                    </div>

                                    {/* Price Display */}
                                    <div className="flex items-baseline space-x-2 mb-4">
                                        <span className="text-text-secondary text-xs font-mono">LAST:</span>
                                        <span className="text-xl font-mono text-bull font-bold">৳{product.price}</span>
                                    </div>

                                    <div className="flex items-center space-x-2 text-[10px] text-text-secondary font-mono mb-4 border-t border-border pt-2">
                                        <span className="flex items-center">
                                            {product.isAnonymous ? (
                                                <span className="text-bear">SOURCE: REDACTED</span>
                                            ) : (
                                                <>
                                                    <i className="fas fa-user-circle text-text-secondary mr-1"></i>
                                                    {product.user?.name ? product.user.name.replace(/\d+/g, '').trim().toUpperCase() : 'UNKNOWN'}
                                                    <span className="text-text-secondary/50 mx-1">ID:</span>
                                                    {product.user?.studentId || '####'}
                                                </>
                                            )}
                                        </span>
                                        <span>•</span>
                                        <span>VOL: HIGH</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
