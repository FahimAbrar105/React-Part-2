import { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Books',
    description: '',
    isAnonymous: false
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isAnonymous: e.target.checked
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);

      // Create previews
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('isAnonymous', formData.isAnonymous.toString());

      images.forEach((image) => {
        data.append('images', image);
      });

      await axios.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="bg-surface border border-border rounded-lg shadow-2xl overflow-hidden">
                {/* IPO Header */}
                <div className="bg-bg border-b border-border p-6 flex justify-between items-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
                            <i className="fas fa-file-signature text-action"></i>
                            NEW IPO FILING
                        </h2>
                        <p className="text-text-secondary text-xs font-mono mt-1">INITIAL PRODUCT OFFERING REGISTRATION // SEC FORM S-1</p>
                    </div>
                    <div className="text-right hidden md:block z-10">
                        <p className="text-[10px] text-text-secondary font-mono">STATUS</p>
                        <p className="text-bull font-bold font-mono animate-pulse">● DRAFTING</p>
                    </div>
                    {/* Decorative BG */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-action/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                </div>

                <div className="p-8">
                    {error &&
          <div className="bg-bear/10 border border-bear/20 text-bear px-4 py-3 rounded mb-6 text-sm font-mono flex items-center gap-2">
                            <i className="fas fa-exclamation-triangle"></i>
                            {error}
                        </div>
          }

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Asset Details Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-text-secondary font-mono uppercase">Asset Name (Title)</label>
                                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-bg border border-border rounded px-4 py-3 text-white focus:border-action focus:outline-none focus:ring-1 focus:ring-action transition font-mono"
                  placeholder="e.g. SCIENTIFIC CALCULATOR FX-991" />
                
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-text-secondary font-mono uppercase">Initial Price (BDT)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-text-secondary">৳</span>
                                    <input
                    type="number"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-bg border border-border rounded pl-8 pr-4 py-3 text-white focus:border-action focus:outline-none focus:ring-1 focus:ring-action transition font-mono"
                    placeholder="500.00" />
                  
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-text-secondary font-mono uppercase">Market Sector (Category)</label>
                            <div className="relative">
                                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-bg border border-border rounded px-4 py-3 text-white focus:border-action focus:outline-none focus:ring-1 focus:ring-action transition font-mono appearance-none cursor-pointer">
                  
                                    <option value="Books">BOOKS & MANUALS</option>
                                    <option value="Electronics">ELECTRONICS</option>
                                    <option value="Furniture">DORM FURNITURE</option>
                                    <option value="Clothing">APPAREL</option>
                                    <option value="Stationery">STATIONERY</option>
                                    <option value="Other">OTHER ASSETS</option>
                                </select>
                                <div className="absolute right-4 top-3 text-text-secondary pointer-events-none">
                                    <i className="fas fa-chevron-down text-xs"></i>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-text-secondary font-mono uppercase">Full Prospectus (Description)</label>
                            <textarea
                name="description"
                rows={5}
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-bg border border-border rounded px-4 py-3 text-white focus:border-action focus:outline-none focus:ring-1 focus:ring-action transition font-mono text-sm leading-relaxed"
                placeholder="Provide detailed disclosure of asset condition, history, and specifications...">
              </textarea>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-text-secondary font-mono uppercase">Asset Images (Max 5)</label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-bg/50 transition cursor-pointer relative group">
                                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                
                                <div className="text-text-secondary group-hover:text-action transition">
                                    <i className="fas fa-cloud-upload-alt text-3xl mb-2"></i>
                                    <p className="text-sm font-mono">DRAG FILES OR CLICK TO UPLOAD</p>
                                    <p className="text-[10px] opacity-70 mt-1">SUPPORTED: JPG, PNG, WEBP</p>
                                </div>

                                {previews.length > 0 &&
                <div className="mt-4 grid grid-cols-3 gap-2 relative z-0 pointer-events-none">
                                        {previews.map((preview, idx) =>
                  <div key={idx} className="relative aspect-square bg-black border border-border rounded overflow-hidden">
                                                <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                                            </div>
                  )}
                                    </div>
                }
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-bg/50 border border-border rounded">
                            <input
                type="checkbox"
                name="isAnonymous"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleCheckboxChange}
                className="w-4 h-4 rounded border-border bg-bg text-action focus:ring-0" />
              
                            <div>
                                <label htmlFor="isAnonymous" className="text-sm font-bold text-white font-mono cursor-pointer block">DARK POOL LISTING (ANONYMOUS)</label>
                                <p className="text-[10px] text-text-secondary">Hide your identity on the public ledger. Buyers can still contact you securely.</p>
                            </div>
                        </div>

                        <button
              type="submit"
              disabled={loading}
              className={`w-full bg-action hover:bg-blue-600 text-white font-mono font-bold py-4 rounded shadow-lg shadow-action/20 transition transform active:scale-[0.99] flex items-center justify-center space-x-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              
                            {loading ?
              <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>PROCESSING FILING...</span>
                                </> :

              <>
                                    <i className="fas fa-paper-plane"></i>
                                    <span>SUBMIT FOR PUBLIC TRADING</span>
                                </>
              }
                        </button>
                    </form>
                </div>
            </div>
        </div>);

};

export default CreateProduct;