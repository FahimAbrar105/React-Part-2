import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [randomCode, setRandomCode] = useState('00');
    const [shouldFlicker, setShouldFlicker] = useState(false);

    // Dynamic number effect for logo
    useEffect(() => {
        const interval = setInterval(() => {
            setRandomCode(Math.floor(Math.random() * 99).toString().padStart(2, '0'));
            setShouldFlicker(Math.random() > 0.8);
        }, 80);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="bg-bg text-text-primary font-sans antialiased min-h-screen flex flex-col">
            {/* Header / Navigation */}
            <nav className="bg-surface border-b border-border sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <Link to="/dashboard" className="flex items-center space-x-3 group">
                        <div className={`w-10 h-10 bg-black border border-action/50 rounded flex flex-col items-center justify-center relative overflow-hidden group-hover:border-action transition shadow-[0_0_10px_rgba(41,98,255,0.2)]`}>
                            {/* Scanline */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-action/10 to-transparent animate-scan"></div>

                            {/* Dynamic Numbers */}
                            <span className={`text-action font-mono font-bold text-lg leading-none tracking-tighter ${shouldFlicker ? 'opacity-50' : 'opacity-100'}`}>
                                {randomCode}
                            </span>

                            {/* Sub-text */}
                            <span className="text-[6px] text-text-secondary font-mono leading-none mt-0.5">NET</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight">IUT MARKETPLACE</span>
                            <span className="text-[10px] text-text-secondary font-mono tracking-widest">SECURE STUDENT TRADING TERMINAL</span>
                        </div>
                    </Link>

                    {/* Nav Links (Desktop) */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Link to="/products" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-white hover:bg-border/50 rounded transition">MARKETS</Link>

                        {user && (
                            <>
                                <Link to="/products/create" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-white hover:bg-border/50 rounded transition flex items-center space-x-2">
                                    <i className="fas fa-plus text-xs"></i>
                                    <span>IPO</span>
                                </Link>
                                <Link to="/chat" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-white hover:bg-border/50 rounded transition relative">
                                    <span>COMMS</span>
                                    {/* Unread indicator would go here */}
                                </Link>

                                {/* Profile Dropdown */}
                                <div className="relative ml-4">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="flex items-center space-x-2 focus:outline-none hover:bg-border/50 p-1 rounded transition group"
                                    >
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=0b0e11&color=fff&size=64`}
                                            alt="Profile"
                                            className="w-8 h-8 rounded border border-border bg-black object-cover group-hover:border-action transition"
                                        />
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-mono text-white group-hover:text-action transition">{user.name.split(' ')[0]}</span>
                                            <span className="text-[10px] text-bull font-mono">ONLINE</span>
                                        </div>
                                        <i className="fas fa-chevron-down text-xs text-text-secondary group-hover:text-white transition"></i>
                                    </button>

                                    {isMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                                            <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded shadow-xl py-1 z-50">
                                                <div className="px-4 py-3 border-b border-border">
                                                    <p className="text-sm text-white font-medium truncate">{user.name}</p>
                                                    <p className="text-xs text-text-secondary font-mono truncate">ID: {user.studentId || 'N/A'}</p>
                                                </div>

                                                <button
                                                    onClick={() => { setIsMenuOpen(false); setProfileOpen(true); }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-bg hover:text-white transition group"
                                                >
                                                    <i className="fas fa-id-card mr-2 text-action group-hover:text-white"></i>
                                                    MY PROFILE
                                                </button>

                                                <Link to="/dashboard" className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg hover:text-white transition">
                                                    <i className="fas fa-chart-line mr-2"></i> PORTFOLIO
                                                </Link>

                                                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-bear hover:bg-bg transition hover:text-bear">
                                                    <i className="fas fa-sign-out-alt mr-2"></i> DISCONNECT
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                        {!user && (
                            <div className="flex items-center space-x-4 ml-4">
                                <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-white">LOGIN</Link>
                                <Link to="/register" className="px-4 py-1.5 text-sm font-bold bg-action hover:bg-blue-600 text-white rounded">JOIN MARKETPLACE</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Profile Modal */}
            {profileOpen && user && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setProfileOpen(false)}></div>
                    <div className="relative bg-surface border border-border rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="bg-bg border-b border-border p-6 flex justify-between items-center bg-gradient-to-r from-bg to-surface">
                            <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                                <span className="w-1 h-5 bg-action block"></span>
                                PERSONNEL FILE
                            </h3>
                            <button onClick={() => setProfileOpen(false)} className="text-text-secondary hover:text-white transition">
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="flex flex-col items-center mb-8 relative group">
                                <div className="relative w-32 h-32 rounded-full border-4 border-surface shadow-2xl overflow-hidden mb-4 bg-black">
                                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=0b0e11&color=fff&size=128`} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-white">{user.name.replace(/\d+/g, '').trim()}</h2>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <span className="text-xs font-mono text-bull bg-bull/10 px-2 py-0.5 rounded border border-bull/20">CLEARANCE: AAA</span>
                                        <span className="text-xs font-mono text-text-secondary">ID: {user.studentId || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 text-sm font-mono border-t border-border pt-6">
                                <div className="flex justify-between items-center p-3 bg-bg rounded border border-border/50">
                                    <span className="text-text-secondary">CONTACT</span>
                                    <span className="text-white">{user.contactNumber || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-bg rounded border border-border/50">
                                    <span className="text-text-secondary">EMAIL</span>
                                    <span className="text-white truncate max-w-[200px]">{user.email}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-bg rounded border border-border/50">
                                    <span className="text-text-secondary">MEMBER SINCE</span>
                                    <span className="text-white">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex gap-3">
                                <button className="flex-1 bg-action hover:bg-blue-600 text-white font-bold py-3 rounded font-mono text-xs transition shadow-lg shadow-action/20">
                                    CHANGE PHOTO
                                </button>
                                <button className="flex-1 bg-bear/10 hover:bg-bear text-bear hover:text-white border border-bear/20 hover:border-bear font-bold py-3 rounded font-mono text-xs transition">
                                    REMOVE PHOTO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-surface border-t border-border mt-auto py-6">
                <div className="container mx-auto px-4 text-center text-text-secondary text-sm">
                    <p>&copy; {new Date().getFullYear()} IUT Marketplace. Made for IUTians.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
