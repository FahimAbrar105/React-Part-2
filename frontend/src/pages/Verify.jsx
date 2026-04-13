import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Verify = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [searchParams] = useSearchParams();
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
        const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleResend = async () => {
      try {
          await resendOtp(email);
          setTimeLeft(120);
          setError('');
          alert('A new 6-digit code has been transmitted.');
      } catch (err) {
          setError(err.response?.data?.error || 'Failed to resend code');
      }
  };

  const formatTime = () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
        return setError('OTP must be 6 digits');
    }

    try {
      const res = await verifyOtp(email, otp);
      
      if (res.redirect) {
          navigate(res.redirect);
      } else {
          navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center font-mono relative overflow-hidden bg-bg text-text-primary">
        {/* Scanline Overlay */}
        <div className="scanline"></div>

        {/* Background Grid */}
        <div className="absolute inset-0 z-0 opacity-20"
            style={{
                backgroundImage: 'linear-gradient(#2d3748 1px, transparent 1px), linear-gradient(90deg, #2d3748 1px, transparent 1px)',
                backgroundSize: '30px 30px'
            }}>
        </div>

        {/* Verify Terminal */}
        <div className="relative z-10 w-full max-w-sm bg-surface border border-border rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
            
            {/* Terminal Header */}
            <div className="bg-black/50 border-b border-border p-3 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-[10px] text-text-secondary tracking-widest">SECURE_VERIFICATION_NODE</div>
            </div>

            <div className="p-8">
                <div className="text-center mb-6">
                    <i className="fas fa-shield-alt text-4xl text-action mb-4 animate-pulse"></i>
                    <h2 className="text-2xl font-bold text-white tracking-widest">VERIFY SIGNAL</h2>
                    <p className="text-text-secondary text-[10px] mt-2">A 6-DIGIT CLEARANCE CODE HAS BEEN SENT TO <span className="text-action">{email}</span></p>
                </div>

                {error && (
                    <div className="bg-bear/10 border border-bear/50 text-bear text-xs p-3 mb-6 rounded flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] text-text-secondary mb-1">TRANSMISSION_CODE</label>
                        <div className="relative">
                            <i className="fas fa-key absolute left-3 top-3 text-text-secondary"></i>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                maxLength={6}
                                required
                                placeholder="000000"
                                className="w-full bg-bg border border-border rounded py-3 pl-9 pr-3 text-center text-xl tracking-[1em] text-white focus:border-action focus:ring-1 focus:ring-action outline-none font-mono placeholder-text-secondary/30" 
                            />
                        </div>
                    </div>

                    <button type="submit"
                        className="w-full bg-action hover:bg-blue-600 text-white font-bold py-2.5 rounded text-sm transition tracking-widest border border-action/50 shadow-[0_0_15px_rgba(41,98,255,0.3)] mt-4">
                        AUTHENTICATE
                    </button>
                </form>

                <div className="mt-6 text-center border-t border-border pt-4">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={timeLeft > 0}
                        className={`text-[10px] font-bold tracking-widest transition ${timeLeft > 0 ? 'text-text-secondary cursor-not-allowed' : 'text-action hover:text-white hover:animate-pulse'}`}
                    >
                        {timeLeft > 0 ? `RESEND SIGNAL IN ${formatTime()}` : 'RESEND SIGNAL (NEW_KEY)'}
                    </button>
                </div>
            </div>

            {/* Footer Status */}
            <div className="bg-bg border-t border-border p-2 flex justify-between text-[8px] text-text-secondary font-mono">
                <span>SYS.STATUS: <span className="text-bull text-yellow-500">PENDING_VERIFY</span></span>
                <span>CNX: <span className="text-action animate-pulse">SECURE</span></span>
            </div>
        </div>
    </div>
  );
};

export default Verify;
