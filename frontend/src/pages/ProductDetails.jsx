import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler } from
'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);























const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState('');

  // Terminal Simulation State
  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [percentChange, setPercentChange] = useState('0.00');
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/products/${id}`);
        const prod = res.data.product;
        setProduct(prod);
        setActiveImage(prod.images && prod.images.length > 0 ? prod.images[0] : '');

        // Initialize Terminal Data
        initializeTerminal(prod.price);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load asset data');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const initializeTerminal = (basePrice) => {
    setCurrentPrice(basePrice.toFixed(2));

    // Generate initial Order Book
    const initialAsks = [];
    const initialBids = [];
    for (let i = 0; i < 5; i++) {
      initialAsks.push({
        id: i,
        trader: 'Trader_' + Math.floor(Math.random() * 9000 + 1000),
        size: Math.floor(Math.random() * 5) + 1,
        price: (basePrice + (i + 1) * 5 + Math.random()).toFixed(2)
      });
      initialBids.push({
        id: i,
        trader: 'Student_' + Math.floor(Math.random() * 9000 + 1000),
        size: Math.floor(Math.random() * 5) + 1,
        price: (basePrice - (i + 1) * 5 - Math.random()).toFixed(2)
      });
    }
    setAsks(initialAsks);
    setBids(initialBids);

    // Generate Chart Data (Random Walk)
    const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    let dataPoints = [];
    let price = basePrice * 0.8;
    for (let i = 0; i < 30; i++) {
      price = price * (1 + (Math.random() - 0.45) * 0.1);
      dataPoints.push(price);
    }
    dataPoints[29] = basePrice; // Ensure ends at current

    setChartData({
      labels,
      datasets: [{
        label: 'Price History',
        data: dataPoints,
        borderColor: '#2962ff',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(41, 98, 255, 0.5)');
          gradient.addColorStop(1, 'rgba(41, 98, 255, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    });

    // Start Jitter Interval
    const interval = setInterval(() => {
      const jitter = (Math.random() - 0.5) * 5;
      const newPrice = basePrice + jitter;
      setCurrentPrice(newPrice.toFixed(2));

      const change = (newPrice - basePrice) / basePrice * 100;
      setPercentChange((change > 0 ? '+' : '') + change.toFixed(2));

      // Randomly update order book
      if (Math.random() > 0.5) {
        setAsks((prev) => {
          const newAsks = [...prev];
          if (newAsks[0]) newAsks[0].price = (newPrice + Math.random() * 2).toFixed(2);
          return newAsks;
        });
      } else {
        setBids((prev) => {
          const newBids = [...prev];
          if (newBids[0]) newBids[0].price = (newPrice - Math.random() * 2).toFixed(2);
          return newBids;
        });
      }

    }, 2000);

    return () => clearInterval(interval);
  };

  const addToPortfolio = (type) => {
    if (!product) return;
    const item = {
      id: product._id,
      title: product.title,
      price: product.price,
      image: product.images[0] || "",
      type: type,
      timestamp: Date.now()
    };

    const portfolio = JSON.parse(localStorage.getItem('terminal_portfolio') || '[]');
    if (!portfolio.find((p) => p.id === item.id)) {
      portfolio.push(item);
      localStorage.setItem('terminal_portfolio', JSON.stringify(portfolio));
      alert(`${type} ORDER CONFIRMED`);

      // Play Sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } else {
      alert('POSITION ALREADY OPEN');
    }
  };

  const handleLiquidate = async () => {
    if (!confirm('Are you sure you want to LIQUIDATE this position?')) return;
    try {
      await axios.post(`/products/${id}/delete`); // Using POST as per backup/API
      alert('ASSET LIQUIDATED');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('LIQUIDATION FAILED');
    }
  };

  if (loading) return <div className="p-8 text-center text-text-secondary font-mono animate-pulse">ESTABLISHING SECURE CONNECTION...</div>;
  if (error) return <div className="p-8 text-center text-bear font-mono">{error}</div>;
  if (!product) return <div className="p-8 text-center text-text-secondary font-mono">ASSET NOT FOUND</div>;

  return (
    <div className="container mx-auto px-4 py-8">
            {/* Top Bar: Asset Name & Quick Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-border pb-4">
                <div>
                    <div className="flex items-center space-x-3 mb-1">
                        <h1 className="text-3xl font-bold text-white font-mono tracking-tighter">
                            {product.title.toUpperCase()}
                        </h1>
                        <span className="px-2 py-0.5 rounded bg-action/20 text-action text-xs font-mono border border-action/30">SPOT</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-mono text-text-secondary">
                        <span>SECTOR: <span className="text-white">{product.category.toUpperCase()}</span></span>
                        <span>ID: <span className="text-white">{product._id.substring(0, 8)}</span></span>
                    </div>
                </div>

                <div className="flex items-end flex-col mt-4 md:mt-0">
                    <div className="flex items-baseline space-x-3">
                        <span className="text-xl font-bold text-bull font-mono">৳{currentPrice}</span>
                        <span className="text-sm text-bull flex items-center">
                            <i className="fas fa-caret-up mr-1"></i>
                            <span>{percentChange}%</span>
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">
                        BASE PRICE: <span className="text-white font-bold">৳{product.price}</span> • REAL-TIME FEED
                    </p>
                </div>
            </div>

            {/* Main Terminal Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">

                {/* Left Col: Visuals (3 cols) */}
                <div className="lg:col-span-3 flex flex-col gap-4 h-full">
                    <div className="bg-surface border border-border rounded-lg p-2 h-64 lg:h-auto flex-grow relative overflow-hidden group">
                        {/* Scanline Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-action/5 to-transparent z-10 animate-scan pointer-events-none" style={{ animation: 'scan 2s linear infinite' }}></div>
                        <style>{`
                            @keyframes scan {
                                0% { transform: translateY(-100%); }
                                100% { transform: translateY(100%); }
                            }
                        `}</style>

                        {activeImage ?
            <img
              src={activeImage}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
              }} /> :

            null}

                        <div className={`w-full h-full flex flex-col items-center justify-center bg-black/50 border border-border/50 fallback-icon absolute inset-0 ${activeImage ? 'hidden' : ''}`}>
                            <i className="fas fa-cube text-4xl text-border mb-2 opacity-50"></i>
                            <span className="text-xs font-mono text-bear tracking-widest">[REDACTED]</span>
                        </div>

                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-[10px] font-mono text-white border border-white/20">
                            IMG_SOURCE: TRADER_UPLOAD
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {product.images && product.images.length > 1 &&
          <div className="grid grid-cols-5 gap-2">
                            {product.images.map((img, idx) =>
            <div
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`aspect-square bg-bg border rounded cursor-pointer overflow-hidden relative ${activeImage === img ? 'border-action opacity-100' : 'border-border opacity-50 hover:opacity-100'}`}>
              
                                    <img src={img} className="w-full h-full object-cover" />
                                </div>
            )}
                        </div>
          }

                    {/* Asset Fundamentals */}
                    <div className="bg-surface border border-border rounded-lg p-4 flex-grow overflow-y-auto">
                        <h3 className="text-xs font-bold text-text-secondary border-b border-border pb-2 mb-2">ASSET FUNDAMENTALS</h3>
                        <p className="text-sm text-white font-mono leading-relaxed opacity-80">
                            {product.description}
                        </p>

                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-text-secondary">SELLER RATING</span>
                                <div className="flex space-x-1">
                                    <i className="fas fa-star text-bull text-xs"></i>
                                    <i className="fas fa-star text-bull text-xs"></i>
                                    <i className="fas fa-star text-bull text-xs"></i>
                                    <i className="fas fa-star text-bull text-xs"></i>
                                    <i className="fas fa-star text-gray-600 text-xs"></i>
                                </div>
                            </div>
                            {user && product.user && user._id !== product.user._id &&
              <Link to={`/chat/${product.user._id}`} className="block w-full text-center py-2 mt-4 border border-text-secondary text-text-secondary hover:text-white hover:border-white text-xs font-mono transition">
                                    INITIATE SECURE COMMS
                                </Link>
              }
                        </div>
                    </div>
                </div>

                {/* Center Col: Order Book (3 cols) */}
                <div className="lg:col-span-3 bg-surface border border-border rounded-lg flex flex-col h-full overflow-hidden">
                    <div className="p-3 border-b border-border flex justify-between items-center bg-bg/50">
                        <h3 className="text-xs font-bold text-white">ORDER BOOK</h3>
                        <span className="text-[10px] text-bull animate-pulse">● LIVE</span>
                    </div>

                    <div className="flex-grow overflow-hidden relative flex flex-col">
                        <div className="grid grid-cols-3 text-[10px] text-text-secondary p-2 border-b border-border bg-bg">
                            <span>TRADER</span>
                            <span className="text-center">SIZE</span>
                            <span className="text-right">PRICE (৳)</span>
                        </div>

                        {/* Asks (Sells) */}
                        <div className="flex flex-col-reverse h-1/2 overflow-hidden border-b border-border border-dashed">
                            {asks.map((ask) =>
              <div key={ask.id} className="grid grid-cols-3 text-xs p-1 hover:bg-white/5 cursor-pointer font-mono">
                                    <span className="text-bear opacity-70 truncate">{ask.trader}</span>
                                    <span className="text-center text-white">{ask.size}</span>
                                    <span className="text-right text-bear">{ask.price}</span>
                                </div>
              )}
                        </div>

                        {/* Spread */}
                        <div className="bg-bg py-1 text-center border-y border-border">
                            <span className="text-xs font-mono text-text-secondary">SPREAD: 5.00</span>
                        </div>

                        {/* Bids (Buys) */}
                        <div className="h-1/2 overflow-hidden">
                            {bids.map((bid) =>
              <div key={bid.id} className="grid grid-cols-3 text-xs p-1 hover:bg-white/5 cursor-pointer font-mono">
                                    <span className="text-bull opacity-70 truncate">{bid.trader}</span>
                                    <span className="text-center text-white">{bid.size}</span>
                                    <span className="text-right text-bull">{bid.price}</span>
                                </div>
              )}
                        </div>
                    </div>
                </div>

                {/* Right Col: Analytics & Chart (6 cols) */}
                <div className="lg:col-span-6 flex flex-col gap-4 h-full">
                    {/* Chart Container */}
                    <div className="bg-surface border border-border rounded-lg p-4 flex-grow flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-white">PRICE PERFORMANCE (30D)</h3>
                            <div className="flex space-x-2">
                                <span className="text-[10px] bg-bg px-2 py-1 rounded text-text-secondary cursor-pointer hover:text-white">1H</span>
                                <span className="text-[10px] bg-bg px-2 py-1 rounded text-text-secondary cursor-pointer hover:text-white">1D</span>
                                <span className="text-[10px] bg-action px-2 py-1 rounded text-white font-bold cursor-pointer">30D</span>
                            </div>
                        </div>
                        <div className="flex-grow w-full relative min-h-[300px]">
                            {chartData &&
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { intersect: false, mode: 'index' },
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { display: false },
                    y: {
                      grid: { color: '#2a2e39' },
                      ticks: { color: '#b2b5be', font: { family: 'IBM Plex Mono' } }
                    }
                  }
                }} />

              }
                        </div>
                    </div>

                    {/* Execution Panel */}
                    <div className="bg-surface border border-border rounded-lg p-6 h-auto">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            {user && product.user && user._id === product.user._id ?
              <div className="col-span-2">
                                    <button
                  onClick={handleLiquidate}
                  className="w-full h-12 bg-bear hover:bg-red-600 text-white font-mono font-bold text-sm rounded transition flex items-center justify-center space-x-2">
                  
                                        <i className="fas fa-trash"></i>
                                        <span>LIQUIDATE ASSET (DELETE)</span>
                                    </button>
                                </div> :

              <>
                                    <button
                  onClick={() => addToPortfolio('LONG')}
                  className="h-14 bg-bull hover:bg-green-400 text-black font-mono font-bold text-lg rounded shadow-lg shadow-bull/20 transition flex flex-col items-center justify-center border-b-4 border-green-700 active:border-b-0 active:translate-y-1">
                  
                                        <span>LONG POSITION</span>
                                        <span className="text-[10px] font-normal opacity-80 font-sans">BUY NOW @ MKT</span>
                                    </button>
                                    <button
                  onClick={() => addToPortfolio('HOLD')}
                  className="h-14 bg-action hover:bg-blue-600 text-white font-mono font-bold text-lg rounded shadow-lg shadow-action/20 transition flex flex-col items-center justify-center border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">
                  
                                        <span>HOLD</span>
                                        <span className="text-[10px] font-normal opacity-80 font-sans">ADD TO PORTFOLIO</span>
                                    </button>
                                </>
              }
                        </div>
                    </div>
                </div>
            </div>
        </div>);

};

export default ProductDetails;