import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    contactNumber: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const { completeProfile } = useAuth();
  const navigate = useNavigate();

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

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      if (avatar) {
        data.append('avatar', avatar);
      }

      const res = await completeProfile(data);
      
      if (res.redirect) {
          navigate(res.redirect);
      } else {
          navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Profile completion failed');
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

        {/* Form Terminal */}
        <div className="relative z-10 w-full max-w-lg bg-surface border border-border rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Terminal Header */}
            <div className="bg-black/50 border-b border-border p-3 flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-[10px] text-text-secondary tracking-widest">PROFILE_SYNC_REQUIRED</div>
            </div>

            <div className="p-8 overflow-y-auto">
                <div className="text-center mb-6">
                    <i className="fas fa-user-edit text-4xl text-action mb-4 animate-pulse"></i>
                    <h2 className="text-2xl font-bold text-white tracking-widest">COMPLETE PROFILE</h2>
                    <p className="text-text-secondary text-[10px] mt-2">SOCIAL LOGIN DETECTED. ADDITIONAL CLEARANCE DATA REQUIRED.</p>
                </div>

                {error && (
                    <div className="bg-bear/10 border border-bear/50 text-bear text-xs p-3 mb-6 rounded flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] text-text-secondary mb-1">STUDENT ID</label>
                        <div className="relative">
                            <i className="fas fa-id-card absolute left-3 top-3 text-text-secondary text-[10px]"></i>
                            <input type="text" name="studentId" value={formData.studentId} onChange={handleInputChange} required placeholder="210042101" pattern="\d{9}" title="Must be exactly 9 digits"
                                className="w-full bg-bg border border-border rounded py-2 pl-8 pr-3 text-sm text-white focus:border-action focus:ring-1 focus:ring-action outline-none font-mono placeholder-text-secondary/30" />
                        </div>
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
                        <label className="block text-[10px] text-text-secondary mb-1">VISUAL IDENTIFIER (AVATAR) - OPTIONAL</label>
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
                        SYNC DATA
                    </button>
                </form>
            </div>

            {/* Footer Status */}
            <div className="bg-bg border-t border-border p-2 flex justify-between text-[8px] text-text-secondary font-mono shrink-0">
                <span>SYS.STATUS: <span className="text-bull text-yellow-500">PENDING_SYNC</span></span>
                <span>CNX: <span className="text-action animate-pulse">SECURE</span></span>
            </div>
        </div>
    </div>
  );
};

export default CompleteProfile;
