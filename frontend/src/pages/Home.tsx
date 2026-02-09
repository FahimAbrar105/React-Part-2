import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="bg-bg min-h-screen">
            {/* Market Dashboard Header */}
            <div className="bg-surface border-b border-border py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Market Status */}
                        <div className="bg-bg border border-border p-4 rounded">
                            <p className="text-text-secondary text-xs font-mono uppercase">Market Status</p>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <span className="text-2xl font-mono text-bull font-bold">OPEN</span>
                                <span className="text-xs text-text-secondary">09:30:00 EST</span>
                            </div>
                            <div className="mt-2 w-full bg-border h-1 rounded-full overflow-hidden">
                                <div className="bg-bull h-full w-2/3 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Volatility Index */}
                        <div className="bg-bg border border-border p-4 rounded">
                            <p className="text-text-secondary text-xs font-mono uppercase">VIX (Volatility)</p>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <span className="text-2xl font-mono text-white font-bold">18.42</span>
                                <span className="text-xs text-bear font-mono">▼ -1.2%</span>
                            </div>
                            {/* Mini line graph (simulated with CSS) */}
                            <div className="flex items-end space-x-1 h-3 mt-2">
                                <div className="w-1 bg-border h-2"></div>
                                <div className="w-1 bg-border h-3"></div>
                                <div className="w-1 bg-bear h-2"></div>
                                <div className="w-1 bg-border h-4"></div>
                            </div>
                        </div>

                        {/* Total Volume */}
                        <div className="bg-bg border border-border p-4 rounded">
                            <p className="text-text-secondary text-xs font-mono uppercase">24h Volume</p>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <span className="text-2xl font-mono text-white font-bold">2.4M</span>
                                <span className="text-xs text-bull font-mono">▲ +12%</span>
                            </div>
                        </div>

                        {/* Active Traders */}
                        <div className="bg-bg border border-border p-4 rounded">
                            <p className="text-text-secondary text-xs font-mono uppercase">Active Traders</p>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <span className="text-2xl font-mono text-action font-bold">1,204</span>
                                <span className="text-xs text-bull font-mono">▲ +45</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Trading Floor */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl text-white font-bold flex items-center space-x-2">
                        <span className="w-2 h-6 bg-action block"></span>
                        <span>TOP MOVERS</span>
                    </h2>

                    <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-surface border border-border text-xs text-white font-mono hover:bg-border transition">ALL</button>
                        <button className="px-3 py-1 bg-bg border border-border text-xs text-text-secondary font-mono hover:bg-border transition">TECH</button>
                        <button className="px-3 py-1 bg-bg border border-border text-xs text-text-secondary font-mono hover:bg-border transition">DORM</button>
                    </div>
                </div>

                {/* Features Grid (Legacy Features modernized) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-surface border border-border p-6 rounded relative overflow-hidden group hover:border-action transition cursor-crosshair">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <i className="fas fa-shield-alt text-4xl text-border"></i>
                        </div>
                        <h3 className="text-white font-bold mb-2">VERIFIED ASSETS</h3>
                        <p className="text-text-secondary text-sm">Strict KYC: Only @iut-dhaka.edu allowed.</p>
                    </div>
                    <div className="bg-surface border border-border p-6 rounded relative overflow-hidden group hover:border-action transition cursor-crosshair">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <i className="fas fa-bolt text-4xl text-border"></i>
                        </div>
                        <h3 className="text-white font-bold mb-2">HFT EXECUTION</h3>
                        <p className="text-text-secondary text-sm">Real-time messaging & instant settlement.</p>
                    </div>
                    <div className="bg-surface border border-border p-6 rounded relative overflow-hidden group hover:border-action transition cursor-crosshair">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <i className="fas fa-chart-line text-4xl text-border"></i>
                        </div>
                        <h3 className="text-white font-bold mb-2">MARKET MAKERS</h3>
                        <p className="text-text-secondary text-sm">List assets in seconds. High liquidity.</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-bg to-surface border border-border p-8 rounded text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            {user ? `WELCOME BACK, ${user.name?.toUpperCase() || 'TRADER'}` : 'START TRADING TODAY'}
                        </h2>
                        <div className="flex justify-center space-x-4">
                            {user ? (
                                <Link to="/dashboard" className="px-6 py-2 bg-action text-white font-mono font-bold text-sm hover:bg-blue-600 transition flex items-center space-x-2">
                                    <span>GO TO DASHBOARD</span>
                                    <i className="fas fa-arrow-right"></i>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="px-6 py-2 border border-action text-action font-mono text-sm hover:bg-action hover:text-white transition">LOGIN</Link>
                                    <Link to="/register" className="px-6 py-2 bg-bull text-black font-mono font-bold text-sm hover:bg-green-400 transition">OPEN ACCOUNT</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
