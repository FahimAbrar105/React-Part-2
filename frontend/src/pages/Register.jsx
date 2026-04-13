import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    contactNumber: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend strict check for IUT email just as a UX improvement
    if (!formData.email.endsWith('@iut-dhaka.edu')) {
      return setError('Please use a valid @iut-dhaka.edu email');
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      if (avatar) {
        data.append('avatar', avatar);
      }

      const res = await register(data);
      
      if (res.redirect) {
        if (res.email) {
          navigate(res.redirect + `?email=${res.email}`);
        } else {
          navigate(res.redirect);
        }
      } else {
        // Fallback
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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

        {/* Register Terminal */}
        <div className="relative z-10 w-full max-w-lg bg-surface border border-border rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Terminal Header */}
            <div className="bg-black/50 border-b border-border p-3 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-[10px] text-text-secondary tracking-widest">AUTH_PROTOCOL_V2.0_NEW_NODE</div>
            </div>

            <div className="p-8 overflow-y-auto">
                <div className="text-center mb-6">
                    <i className="fas fa-user-plus text-4xl text-action mb-4 animate-pulse"></i>
                    <h2 className="text-2xl font-bold text-white tracking-widest">ENROLL TERMINAL</h2>
                    <p className="text-text-secondary text-xs mt-2">SUBMIT CREDENTIALS FOR CLEARANCE</p>
                </div>

                {error && (
                    <div className="bg-bear/10 border border-bear/50 text-bear text-xs p-3 mb-6 rounded flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <a href="http://localhost:5000/auth/google"
                        className="flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-gray-900 py-2 rounded text-xs font-bold transition border border-gray-300">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg> GOOGLE
                    </a>

                    <a href="http://localhost:5000/auth/github"
                        className="flex items-center justify-center gap-2 bg-[#2b3137] hover:bg-[#24292e] text-white py-2 rounded text-xs font-bold transition border border-border">
                        <i className="fab fa-github"></i> GITHUB
                    </a>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-surface text-text-secondary font-mono">OR CREATE ACCESS KEY</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-text-secondary mb-1">DESIGNATION (NAME)</label>
                            <div className="relative">
                                <i className="fas fa-tag absolute left-3 top-3 text-text-secondary text-[10px]"></i>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="John Doe"
                                    className="w-full bg-bg border border-border rounded py-2 pl-8 pr-3 text-sm text-white focus:border-action focus:ring-1 focus:ring-action outline-none font-mono placeholder-text-secondary/30" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] text-text-secondary mb-1">STUDENT ID</label>
                            <div className="relative">
                                <i className="fas fa-id-card absolute left-3 top-3 text-text-secondary text-[10px]"></i>
                                <input type="text" name="studentId" value={formData.studentId} onChange={handleInputChange} required placeholder="210042101" pattern="\d{9}" title="Must be exactly 9 digits"
                                    className="w-full bg-bg border border-border rounded py-2 pl-8 pr-3 text-sm text-white focus:border-action focus:ring-1 focus:ring-action outline-none font-mono placeholder-text-secondary/30" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] text-text-secondary mb-1">USER_ID / EMAIL</label>
                        <div className="relative">
                            <i className="fas fa-envelope absolute left-3 top-3 text-text-secondary text-[10px]"></i>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="student@iut-dhaka.edu"
                                className="w-full bg-bg border border-border rounded py-2 pl-8 pr-3 text-sm text-white focus:border-action focus:ring-1 focus:ring-action outline-none font-mono placeholder-text-secondary/30" />
                        </div>
                        <p className="text-[8px] text-text-secondary/60 mt-1">ONLY @iut-dhaka.edu DOMAIN ALLOWED</p>
                    </div>

                    <div>
                        <label className="block text-[10px] text-text-secondary mb-1">CONTACT NUM</label>
                        <div className="relative">
                            <i className="fas fa-phone absolute left-3 top-3 text-text-secondary text-[10px]"></i>
                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} required placeholder="01700000000" pattern="^(?:\+88|88)?(01[3-9]\d{8})$" title="Must be a valid BD phone number"
                                className="w-full bg-bg border border-border rounded py-2 pl-8 pr-3 text-sm text-white focus:border-action focus:ring-1 focus:ring-action outline-none font-mono placeholder-text-secondary/30" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] text-text-secondary mb-1">ACCESS_CODE</label>
                        <div className="relative">
                            <i className="fas fa-lock absolute left-3 top-3 text-text-secondary text-[10px]"></i>
                            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="••••••••"
                                className="w-full bg-bg border border-border rounded py-2 pl-8 pr-3 text-sm text-white focus:border-action focus:ring-1 focus:ring-action outline-none font-mono placeholder-text-secondary/30" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] text-text-secondary mb-1">VISUAL IDENTIFIER (AVATAR)</label>
                        <div className="relative">
                            <input type="file" name="avatar" onChange={handleFileChange} accept="image/*"
                                className="w-full bg-bg border border-border rounded py-1.5 px-3 text-xs text-white focus:border-action focus:ring-1 focus:ring-action outline-none font-mono file:mr-4 file:py-1 file:px-2 file:border-0 file:text-xs file:bg-action file:text-white hover:file:bg-blue-600" />
                        </div>
                        {avatarPreview && (
                            <div className="mt-3 flex justify-center">
                                <img src={avatarPreview} alt="Preview" className="w-20 h-20 rounded overflow-hidden border border-action/50 object-cover shadow-[0_0_10px_rgba(41,98,255,0.2)]" />
                            </div>
                        )}
                    </div>

                    <button type="submit"
                        className="w-full bg-action hover:bg-blue-600 text-white font-bold py-2.5 rounded text-sm transition tracking-widest border border-action/50 shadow-[0_0_15px_rgba(41,98,255,0.3)] mt-4">
                        REQUEST CLEARANCE
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-text-secondary">
                    HAVE CLEARANCE? <a href="/login"
                        className="text-action hover:text-white underline decoration-dashed underline-offset-4">INITIALIZE SESSION</a>
                </div>
            </div>

            {/* Footer Status */}
            <div className="bg-bg border-t border-border p-2 flex justify-between text-[8px] text-text-secondary font-mono shrink-0">
                <span>SYS.STATUS: <span className="text-bull">STABLE</span></span>
                <span>CNX: <span className="text-action animate-pulse">SECURE</span></span>
            </div>
        </div>
    </div>
  );
};

export default Register;
