import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';























const Dashboard = () => {
  const { user, logout, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [myProducts, setMyProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [holdings, setHoldings] = useState([]); // Client-side holdings from localStorage
  const [loading, setLoading] = useState(true);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const formData = new FormData();
        formData.append('avatar', file);
        await updateAvatar(formData);
    } catch (err) {
        console.error("Failed to update avatar", err);
        alert("Failed to update profile picture");
    }
  };

  useEffect(() => {
    if (searchParams.get('incomplete') === 'true') {
        navigate('/complete-profile');
        return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get('/dashboard');
        // The backend returns { user, myProducts, myOrders }
        if (res.data) {
          setMyProducts(res.data.myProducts || []);
          setMyOrders(res.data.myOrders || []);
        }

        // Load Holdings from LocalStorage
        const savedHoldings = JSON.parse(localStorage.getItem('terminal_portfolio') || '[]');
        setHoldings(savedHoldings);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, searchParams]);

  const calculateTotalAssetValue = () => {
    return myProducts.reduce((acc, curr) => acc + curr.price, 0).toLocaleString();
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('LIQUIDATE asset? This cannot be undone.')) return;
    try {
      await axios.post(`/products/${id}/delete`); // Using POST as per backup, though DELETE is RESTful
      setMyProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to liquidate asset.');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('Cancel this limit order?')) return;
    try {
      await axios.post(`/products/orders/${id}/delete`);
      setMyOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to cancel order.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-text-secondary font-mono animate-pulse">LOADING TERMINAL DATA...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
            {/* Portfolio Header */}
            <div className="mb-8 border-b border-border pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex items-center space-x-6">
                        <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-border hover:border-action transition flex-shrink-0 bg-bg">
                            {user?.avatar ? (
                                <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface border border-dashed border-border text-text-secondary">
                                    <i className="fas fa-user"></i>
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
                                <i className="fas fa-camera text-white text-xl"></i>
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                            </label>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white font-mono tracking-tight mb-2">PORTFOLIO MANAGER</h1>
                            <p className="text-text-secondary text-sm font-mono">
                                ACCOUNT: <span className="text-white">{user?.name?.toUpperCase().replace(/\d+/g, '').trim() || 'USER'}</span> // ID: {user?.studentId || 'UNKNOWN'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-6">
                        <div className="text-right">
                            <p className="text-[10px] text-text-secondary font-mono">CREDIT RATING</p>
                            <p className="text-2xl font-bold text-bull font-mono">AAA <span className="text-xs text-text-secondary font-normal">(PRIME)</span></p>
                        </div>
                        <div className="text-right border-l border-border pl-6">
                            <p className="text-[10px] text-text-secondary font-mono">ASSETS UNDER MANAGEMENT</p>
                            <p className="text-2xl font-bold text-white font-mono">৳{calculateTotalAssetValue()}</p>
                        </div>
                        <Link to="/products/create" className="px-6 py-3 bg-action hover:bg-blue-600 text-white font-mono font-bold rounded shadow-lg shadow-action/20 transition flex items-center space-x-2">
                            <i className="fas fa-plus"></i>
                            <span>INITIATE IPO</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <aside className="lg:col-span-1">
                    <nav className="bg-surface border border-border rounded-lg overflow-hidden">
                        <div className="p-4 bg-bg border-b border-border">
                            <h3 className="text-xs font-bold text-text-secondary font-mono">TERMINAL COMMANDS</h3>
                        </div>
                        <ul className="divide-y divide-border">
                            <li>
                                <Link to="/products/create" className="block px-4 py-3 text-sm text-text-secondary hover:bg-bg hover:text-white transition flex items-center space-x-3">
                                    <i className="fas fa-plus-circle w-4"></i>
                                    <span>New IPO Listing</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="block px-4 py-3 text-sm text-text-secondary hover:bg-bg hover:text-white transition flex items-center space-x-3">
                                    <i className="fas fa-globe w-4"></i>
                                    <span>Global Markets</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/chat" className="block px-4 py-3 text-sm text-text-secondary hover:bg-bg hover:text-white transition flex items-center space-x-3">
                                    <i className="fas fa-envelope w-4"></i>
                                    <span>Secure Comms</span>
                                </Link>
                            </li>
                            <li>
                                <button onClick={() => {logout();navigate('/');}} className="w-full text-left block px-4 py-3 text-sm text-bear hover:bg-bear/10 transition flex items-center space-x-3">
                                    <i className="fas fa-power-off w-4"></i>
                                    <span>Terminate Session</span>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Portfolio Content */}
                <main className="lg:col-span-3">

                    {/* My Listings */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                                <span className="w-1 h-5 bg-bull block"></span>
                                <span>ACTIVE POSITIONS (listings)</span>
                            </h2>
                            <span className="text-xs text-text-secondary font-mono">{myProducts.length} POSITIONS OPEN</span>
                        </div>

                        {myProducts.length > 0 ?
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myProducts.map((product) =>
              <div key={product._id} className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col group hover:border-text-secondary transition">
                                        <div className="flex p-4">
                                            <div className="w-24 h-24 bg-bg rounded overflow-hidden flex-shrink-0 border border-border relative">
                                                {product.images && product.images.length > 0 ?
                    <img src={product.images[0]} className="w-full h-full object-cover" /> :

                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 relative overflow-hidden group-hover:bg-zinc-800 transition">
                                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(135deg, #333 25%, transparent 25%, transparent 50%, #333 50%, #333 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }}></div>
                                                        <i className="fas fa-cube text-text-secondary/50 text-xl mb-1 relative z-10"></i>
                                                        <span className="text-[8px] font-mono text-text-secondary/70 tracking-widest relative z-10">NO ASSET</span>
                                                    </div>
                    }
                                            </div>
                                            <div className="ml-4 flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-white font-bold truncate w-32 md:w-48">{product.title}</h3>
                                                    <span className="text-bull font-mono font-bold">৳{product.price}</span>
                                                </div>
                                                <p className="text-xs text-text-secondary font-mono mt-1 mb-3">SECTOR: {product.category.toUpperCase()}</p>

                                                <div className="flex items-center space-x-2 mt-auto">
                                                    <Link to={`/products/${product._id}`} className="px-3 py-1 bg-border hover:bg-white/10 text-xs text-white rounded transition">VIEW</Link>
                                                    <button onClick={() => handleDeleteProduct(product._id)} className="px-3 py-1 bg-bear/10 hover:bg-bear text-bear hover:text-white border border-bear/20 hover:border-bear text-xs rounded transition uppercase">
                                                        Liquidate
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Mini Sparkline Decoration */}
                                        <div className="h-1 w-full flex">
                                            <div className="bg-bull h-full" style={{ width: `${Math.floor(Math.random() * 60 + 20)}%` }}></div>
                                            <div className="bg-bg h-full flex-grow"></div>
                                        </div>
                                    </div>
              )}
                            </div> :

            <div className="bg-surface border border-border border-dashed rounded-lg p-8 text-center">
                                <p className="text-text-secondary font-mono text-sm">NO ACTIVE SELL ORDERS (IPO) LISTED</p>
                            </div>
            }
                    </div>

                    {/* Open Orders */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                                <span className="w-1 h-5 bg-action block"></span>
                                <span>OPEN ORDERS (bids)</span>
                            </h2>
                            <span className="text-xs text-text-secondary font-mono">{myOrders.length} ORDERS PENDING</span>
                        </div>

                        <div className="bg-surface border border-border rounded-lg overflow-hidden">
                            {myOrders.length > 0 ?
              <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm font-mono">
                                        <thead className="bg-bg text-text-secondary border-b border-border">
                                            <tr>
                                                <th className="px-4 py-3 font-bold text-xs uppercase">Date</th>
                                                <th className="px-4 py-3 font-bold text-xs uppercase">Sector</th>
                                                <th className="px-4 py-3 font-bold text-xs uppercase">Max Strike Price</th>
                                                <th className="px-4 py-3 font-bold text-xs uppercase">Status</th>
                                                <th className="px-4 py-3 font-bold text-xs uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {myOrders.map((order) =>
                    <>
                                                    <tr key={order._id} className="hover:bg-white/5 transition cursor-pointer">
                                                        <td className="px-4 py-3 text-white">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                            <span className="text-text-secondary text-[10px] ml-1">
                                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-action font-bold uppercase">{order.sector}</td>
                                                        <td className="px-4 py-3 text-white">৳{order.maxPrice}</td>
                                                        <td className="px-4 py-3">
                                                            {order.matches && order.matches.length > 0 ?
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-bull/10 text-bull border border-bull/20">FILLED</span> :
                          order.status === 'ACTIVE' ?
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-action/10 text-action border border-action/20">ACTIVE</span> :

                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-text-secondary/10 text-text-secondary border border-border">CANCELLED</span>
                          }
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button onClick={() => handleDeleteOrder(order._id)} className="text-text-secondary hover:text-bear transition p-1 rounded hover:bg-bear/10">
                                                                <i className="fas fa-trash-alt"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {order.matches && order.matches.length > 0 &&
                      <tr className="bg-surface/50 border-b border-border">
                                                            <td colSpan={5} className="p-4">
                                                                <p className="text-[10px] font-mono text-bull font-bold mb-2 flex items-center gap-2">
                                                                    <i className="fas fa-check-circle"></i>
                                                                    MATCHING ASSETS FOUND ({order.matches.length})
                                                                </p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                    {order.matches.map((match) =>
                            <div key={match._id} className="flex items-center gap-3 bg-bg border border-border rounded p-2 hover:border-text-secondary transition">
                                                                            <div className="w-10 h-10 bg-black rounded overflow-hidden flex-shrink-0">
                                                                                {match.images && match.images.length > 0 ?
                                <img src={match.images[0]} className="w-full h-full object-cover" /> :

                                <div className="w-full h-full flex items-center justify-center text-text-secondary">
                                                                                        <i className="fas fa-cube text-xs"></i>
                                                                                    </div>
                                }
                                                                            </div>
                                                                            <div className="flex-grow min-w-0">
                                                                                <h4 className="text-white text-xs font-bold truncate">{match.title}</h4>
                                                                                <p className="text-[10px] text-bull font-mono">৳{match.price}</p>
                                                                            </div>
                                                                            <Link to={`/products/${match._id}`} className="px-2 py-1 text-[10px] bg-action text-white rounded hover:bg-blue-600 transition">VIEW</Link>
                                                                        </div>
                            )}
                                                                </div>
                                                            </td>
                                                        </tr>
                      }
                                                </>
                    )}
                                        </tbody>
                                    </table>
                                </div> :

              <div className="p-8 flex flex-col items-center justify-center border border-dashed border-border/50 rounded-lg bg-bg/30">
                                    <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mb-3">
                                        <i className="fas fa-radar text-text-secondary/50 text-xl"></i>
                                    </div>
                                    <p className="text-text-secondary font-mono text-xs tracking-wider mb-1">NO OPEN PRICE ALERTS</p>
                                    <span className="text-[10px] text-text-secondary/50 font-mono">system.status === idle</span>
                                </div>
              }
                        </div>
                    </div>

                    {/* Client-Side Holdings */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                                <span className="w-1 h-5 bg-action block"></span>
                                <span>SAVED HOLDINGS & POSITIONS</span>
                            </h2>
                            <button onClick={() => {localStorage.removeItem('terminal_portfolio');setHoldings([]);}} className="text-[10px] text-text-secondary hover:text-bear transition">CLEAR RECORD</button>
                        </div>

                        {holdings.length === 0 ?
            <div className="bg-surface border border-border border-dashed rounded-lg p-8 text-center">
                                <p className="text-text-secondary font-mono text-sm">NO LONG POSITIONS HELD</p>
                            </div> :

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {holdings.map((item, index) =>
              <div key={index} className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col relative group">
                                        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono border ${item.type === 'LONG' ? 'bg-bull/10 text-bull border-bull/20' : 'bg-action/10 text-action border-action/20'}`}>
                                            {item.type}
                                        </div>

                                        <div className="flex p-4">
                                            <div className="w-16 h-16 bg-bg rounded overflow-hidden flex-shrink-0 border border-border">
                                                {item.image ?
                    <img src={item.image} className="w-full h-full object-cover" /> :

                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 relative overflow-hidden">
                                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(135deg, #333 25%, transparent 25%, transparent 50%, #333 50%, #333 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }}></div>
                                                        <i className="fas fa-cube text-text-secondary/50 text-xs mb-1 relative z-10"></i>
                                                        <span className="text-[6px] font-mono text-text-secondary/70 tracking-widest relative z-10">NO ASSET</span>
                                                    </div>
                    }
                                            </div>
                                            <div className="ml-4 flex-grow">
                                                <h3 className="text-white font-bold text-sm">{item.title}</h3>
                                                <span className="text-white font-mono font-bold text-sm">৳{item.price}</span>
                                                <p className="text-[10px] text-text-secondary font-mono mt-1">EXECUTED: {new Date(item.timestamp).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="px-4 pb-3">
                                            <Link to={`/products/${item.id}`} className="block w-full text-center py-1.5 bg-bg hover:bg-border text-xs text-text-secondary hover:text-white rounded transition">VIEW ASSET</Link>
                                        </div>
                                    </div>
              )}
                            </div>
            }
                    </div>

                </main>
            </div>
        </div>);

};

export default Dashboard;