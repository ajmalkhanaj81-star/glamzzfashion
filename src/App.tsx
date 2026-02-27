import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Heart,
  Star,
  ArrowRight,
  Filter,
  Truck,
  ShieldCheck,
  Smartphone,
  MessageCircle,
  Mail,
  Sparkles,
  Loader2,
  User
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from './constants';
import { Product } from './types';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<{ name: string; email: string; phone?: string; address?: string; } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [aiStyle, setAiStyle] = useState<'studio' | 'street' | 'traditional' | 'lifestyle'>('studio');
  const [productAiImages, setProductAiImages] = useState<Record<string, string>>({});
  const [generatingProductIds, setGeneratingProductIds] = useState<string[]>([]);
  const [addHoneyConch, setAddHoneyConch] = useState(false);
  const [productReviews, setProductReviews] = useState<Record<string, { rating: number, comment: string, date: string }[]>>({});
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState<'home' | 'cart' | 'orders' | 'account'>('home');
  const [cart, setCart] = useState<{ product: Product, size: string, quantity: number }[]>([]);
  const [orders, setOrders] = useState<{ id: string, date: string, items: any[], total: number, status: string }[]>([]);
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);

  useEffect(() => {
    if (user && selectedProduct) {
      setCustomerName(user.name || '');
      setCustomerPhone(user.phone || '');
      setCustomerAddress(user.address || '');
    }
  }, [user, selectedProduct]);

  useEffect(() => {
    const generateAllProductImages = async () => {
      setGeneratingProductIds(PRODUCTS.map(p => p.id));
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      for (const product of PRODUCTS) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [
                {
                  text: `A high-quality fashion photography of a beautiful Indian girl model wearing ${product.name}. The product name "${product.name}" is elegantly written on the clothing. The product is ${product.description}. Professional studio lighting, realistic, 8k resolution, fashion catalog style.`,
                },
              ],
            },
            config: {
              imageConfig: {
                aspectRatio: "3:4",
              },
            },
          });

          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              const base64EncodeString = part.inlineData.data;
              const newImage = `data:image/png;base64,${base64EncodeString}`;
              setProductAiImages(prev => ({ ...prev, [product.id]: newImage }));
              break;
            }
          }
        } catch (error) {
          console.error(`Error generating AI image for ${product.name}:`, error);
        }
        setGeneratingProductIds(prev => prev.filter(id => id !== product.id));
      }
    };

    generateAllProductImages();
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    setUser({ name: 'Guest User', email: 'guest@example.com' });
    setIsAuthModalOpen(false);
    alert(`${authMode === 'login' ? 'Logged in' : 'Signed up'} successfully!`);
  };

  const handleLogout = () => {
    setUser(null);
    alert('Logged out successfully!');
  };

  const handleAddReview = (productId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (newRating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    const review = {
      rating: newRating,
      comment: newComment,
      date: new Date().toLocaleDateString()
    };

    setProductReviews(prev => ({
      ...prev,
      [productId]: [review, ...(prev[productId] || [])]
    }));

    setNewRating(0);
    setNewComment('');
  };

  const generateAiModelForGrid = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setGeneratingProductIds(prev => [...prev, product.id]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A high-quality fashion photography of a beautiful Indian girl model wearing ${product.name}. The product is ${product.description}. Professional studio lighting, realistic, 8k resolution, fashion catalog style.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4",
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const newImage = `data:image/png;base64,${base64EncodeString}`;
          setProductAiImages(prev => ({ ...prev, [product.id]: newImage }));
          break;
        }
      }
    } catch (error) {
      console.error("Error generating AI image:", error);
    } finally {
      setGeneratingProductIds(prev => prev.filter(id => id !== product.id));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductAiImages(prev => ({ ...prev, [productId]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAiModel = async (product: Product) => {
    setIsGenerating(true);
    setAiImage(null);
    try {
      const stylePrompts = {
        studio: "Professional studio lighting, clean solid background, high-end fashion catalog style.",
        street: "Outdoor urban street setting, natural sunlight, candid fashion pose, city background.",
        traditional: "Elegant traditional Indian setting, warm festive lighting, ethnic decor background.",
        lifestyle: "Cozy indoor lifestyle setting, soft natural lighting, relaxed and approachable pose."
      };

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A high-quality fashion photography of a beautiful Indian girl model wearing ${product.name}. The product is ${product.description}. ${stylePrompts[aiStyle]} Realistic, 8k resolution, highly detailed fabric texture.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4",
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setAiImage(`data:image/png;base64,${base64EncodeString}`);
          break;
        }
      }
    } catch (error) {
      console.error("Error generating AI image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addToCart = (product: Product, size: string | null) => {
    if (!size) {
      alert('Please select a size first');
      return;
    }
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id && item.size === size);
      if (existingItem) {
        return prev.map(item => 
          (item.product.id === product.id && item.size === size) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    alert(`${product.name} (Size: ${size}) added to cart!`);
    closeProductModal();
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
  };

  const updateCartQuantity = (productId: string, size: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.size === size) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0);
  }, [cart]);

  const handleCheckout = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (cart.length === 0) return;

    const discount = cart.length * 100;
    const finalTotal = cartTotal - discount;

    const newOrder = {
      id: `ORD${Math.floor(Math.random() * 1000000)}`,
      date: new Date().toLocaleDateString(),
      items: [...cart],
      total: finalTotal,
      status: 'Processing'
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    alert(`Order Confirmed!\n\nYour order ${newOrder.id} has been placed successfully.`);
    setCurrentView('orders');
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setAiImage(null);
    setIsGenerating(false);
    setSelectedSize(null);
    setSelectedPayment(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
  };

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(PRODUCTS.map(p => p.category))];
    return cats;
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar - Meesho Style */}
      <div className="bg-white border-b border-stone-100 py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs text-stone-500 font-medium">
          <div className="flex gap-6">
            <span className="flex items-center gap-1"><Smartphone size={14} /> Download App</span>
            <span 
              onClick={() => setIsSellerModalOpen(true)}
              className="cursor-pointer hover:text-brand-pink transition-colors"
            >
              Become a Seller
            </span>
            <span 
              onClick={() => setIsModelModalOpen(true)}
              className="cursor-pointer hover:text-brand-pink transition-colors"
            >
              Model Opportunities
            </span>
            <span 
              onClick={() => {
                if (!user) setIsAuthModalOpen(true);
                else setCurrentView('orders');
              }}
              className="cursor-pointer hover:text-brand-pink transition-colors"
            >
              Track Order
            </span>
            <span className="cursor-pointer hover:text-brand-pink transition-colors">Return/Exchange</span>
          </div>
          <div className="flex gap-6">
            <div className="relative group">
              <span 
                onClick={() => user ? setCurrentView('account') : setIsAuthModalOpen(true)}
                className="cursor-pointer hover:text-brand-pink transition-colors flex items-center gap-1"
              >
                <User size={14} /> {user ? user.name : 'Login / Sign Up'}
              </span>
            </div>
            <span 
              onClick={() => setCurrentView('cart')}
              className="cursor-pointer hover:text-brand-pink transition-colors"
            >
              Cart
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="glass-nav bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20 gap-4 md:gap-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 hover:bg-stone-100 rounded-full lg:hidden"
              >
                <Menu size={24} className="text-brand-pink" />
              </button>
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setCurrentView('home')}>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-pink rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
                  <span className="text-white font-black text-xs md:text-sm tracking-tighter">GLAMZZ</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl md:text-2xl font-black tracking-tighter text-stone-800 leading-none">
                    GLAMZZ
                  </h1>
                  <p className="text-[8px] font-bold text-brand-pink uppercase tracking-widest">Fashion Hub</p>
                </div>
              </div>
            </div>

            <div className="flex-grow max-w-2xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                placeholder="Try Saree, Kurti or Search by Product Code"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'home') setCurrentView('home');
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-md text-sm focus:ring-1 focus:ring-brand-pink focus:border-brand-pink outline-none transition-all"
              />
            </div>

            <div className="hidden lg:flex items-center gap-8">
              <div 
                onClick={() => user ? setCurrentView('account') : setIsAuthModalOpen(true)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <User size={22} className={`transition-colors ${currentView === 'account' ? 'text-brand-pink' : 'group-hover:text-brand-pink'}`} />
                <span className="text-[10px] font-bold mt-1">{user ? 'Account' : 'Login'}</span>
              </div>
              <div 
                onClick={() => setCurrentView('orders')}
                className="flex flex-col items-center cursor-pointer group"
              >
                <ChevronRight size={22} className={`rotate-90 transition-colors ${currentView === 'orders' ? 'text-brand-pink' : 'group-hover:text-brand-pink'}`} />
                <span className="text-[10px] font-bold mt-1">Orders</span>
              </div>
              <div 
                onClick={() => setCurrentView('cart')}
                className="flex flex-col items-center cursor-pointer group"
              >
                <ShoppingBag size={22} className={`transition-colors ${currentView === 'cart' ? 'text-brand-pink' : 'group-hover:text-brand-pink'}`} />
                <span className="text-[10px] font-bold mt-1">Cart</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Category Bar */}
        <div className="hidden lg:block border-t border-stone-100">
          <div className="max-w-7xl mx-auto px-4 flex justify-center gap-12 py-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-sm font-semibold transition-colors hover:text-brand-pink pb-1 border-b-2 ${
                  selectedCategory === cat ? 'text-brand-pink border-brand-pink' : 'text-stone-600 border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              className="fixed inset-y-0 left-0 w-full max-w-xs bg-white z-[70] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-brand-pink uppercase">GLAMZZ FASHION</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left py-2 text-lg font-medium border-b border-stone-50 ${
                      selectedCategory === cat ? 'text-brand-pink' : 'text-stone-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {currentView === 'home' && (
          <>
            {/* Hero Banner - Meesho Style */}
            <section className="max-w-7xl mx-auto px-4 py-6">
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-brand-pink to-pink-400 h-48 md:h-80 flex items-center">
                <div className="absolute inset-0 opacity-20">
                  <img src="https://picsum.photos/seed/meesho/1200/400" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="relative px-8 md:px-16 text-white">
                  <h2 className="text-2xl md:text-5xl font-black mb-2 md:mb-4">Lowest Prices</h2>
                  <h2 className="text-2xl md:text-5xl font-black mb-4 md:mb-6">Best Quality Shopping</h2>
                  <div className="flex flex-wrap gap-4 md:gap-8">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs md:text-sm font-bold">
                      <Truck size={16} /> Free Delivery
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs md:text-sm font-bold">
                      <ShieldCheck size={16} /> Cash on Delivery
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block absolute right-16 bottom-0 w-64 h-64 bg-white/10 rounded-full -mb-32 -mr-32 blur-3xl"></div>
              </div>
            </section>

            {/* Product Section */}
            <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-stone-800">Products For You</h3>
                <div className="flex items-center gap-2 text-brand-pink font-bold text-sm cursor-pointer">
                  View All <ChevronRight size={16} />
                </div>
              </div>

              <motion.div 
                layout
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="product-card group cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="product-image-container">
                        <img 
                          src={productAiImages[product.id] || product.image} 
                          alt={product.name} 
                          className="product-image"
                          referrerPolicy="no-referrer"
                        />
                        
                        {generatingProductIds.includes(product.id) && (
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 size={24} className="animate-spin text-brand-pink" />
                          </div>
                        )}

                        <button 
                          onClick={(e) => toggleWishlist(e, product.id)}
                          className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
                        >
                          <Heart 
                            size={18} 
                            className={wishlist.includes(product.id) ? 'fill-brand-pink text-brand-pink' : 'text-stone-400'} 
                          />
                        </button>
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-stone-500 truncate mb-1">
                          {product.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-lg font-bold">₹{product.price}</span>
                          <span className="text-xs text-stone-400 line-through">₹{Number(product.price) + 100}</span>
                          <span className="text-[10px] font-bold text-green-600">30% off</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="badge-free-delivery">Free Delivery</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                            4.2 <Star size={10} fill="white" />
                          </div>
                          <span className="text-[10px] text-stone-400 font-medium">1.2k Reviews</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {filteredProducts.length === 0 && (
                <div className="py-20 text-center">
                  <h4 className="text-xl font-bold mb-2">No results found</h4>
                  <p className="text-stone-500">Try searching for something else</p>
                </div>
              )}
            </section>
          </>
        )}

        {currentView === 'cart' && (
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setCurrentView('home')}
                className="p-2 hover:bg-stone-100 rounded-full transition-all"
              >
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <h2 className="text-2xl md:text-3xl font-black text-stone-800 uppercase tracking-tighter">Shopping Cart ({cart.length} Items)</h2>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={48} className="text-brand-pink" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-2">Your cart is empty</h3>
                <p className="text-stone-500 mb-8 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
                <button 
                  onClick={() => setCurrentView('home')}
                  className="bg-brand-pink text-white px-10 py-3 rounded-md font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-100"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item, idx) => (
                    <div key={`${item.product.id}-${item.size}-${idx}`} className="bg-white border border-stone-100 rounded-xl p-4 md:p-6 shadow-sm flex gap-4 md:gap-6">
                      <div className="w-24 h-32 md:w-32 md:h-40 bg-stone-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={productAiImages[item.product.id] || item.product.image} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-stone-800 text-base md:text-lg">{item.product.name}</h4>
                            <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Size: {item.size}</p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.product.id, item.size)}
                            className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-lg font-bold">₹{item.product.price}</span>
                          <span className="text-xs text-stone-400 line-through">₹{Number(item.product.price) + 100}</span>
                        </div>

                        <div className="mt-auto flex justify-between items-center">
                          <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, item.size, -1)}
                              className="px-3 py-1 hover:bg-stone-50 text-stone-600 transition-colors"
                            >
                              -
                            </button>
                            <span className="px-4 py-1 text-sm font-bold border-x border-stone-200 min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateCartQuantity(item.product.id, item.size, 1)}
                              className="px-3 py-1 hover:bg-stone-50 text-stone-600 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-bold text-brand-pink">Total: ₹{Number(item.product.price) * item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-stone-100 rounded-xl p-6 shadow-sm sticky top-24">
                    <h3 className="text-lg font-bold text-stone-800 mb-6 border-b border-stone-50 pb-4">Price Details</h3>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm text-stone-600">
                        <span>Total Product Price</span>
                        <span>₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-sm text-stone-600">
                        <span>Total Discounts</span>
                        <span className="text-green-600">-₹{cart.length * 100}</span>
                      </div>
                      <div className="flex justify-between text-sm text-stone-600">
                        <span>Delivery Charges</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                      <div className="pt-4 border-t border-stone-100 flex justify-between text-lg font-black text-stone-900">
                        <span>Order Total</span>
                        <span>₹{cartTotal - (cart.length * 100)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg mb-6 flex items-center gap-2">
                      <Sparkles size={16} className="text-green-600" />
                      <span className="text-xs font-bold text-green-700">Yay! You are saving ₹{cart.length * 100} on this order</span>
                    </div>

                    <button 
                      onClick={handleCheckout}
                      className="w-full bg-brand-pink text-white py-4 rounded-lg font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-100 flex items-center justify-center gap-2"
                    >
                      Continue to Checkout <ArrowRight size={18} />
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-4 opacity-50 grayscale">
                      <ShieldCheck size={24} />
                      <Truck size={24} />
                      <Smartphone size={24} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'orders' && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-black text-stone-800 mb-8 uppercase tracking-tighter">My Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <Truck size={64} className="mx-auto text-stone-300 mb-4" />
                <p className="text-stone-500 font-medium mb-6">You haven't placed any orders yet.</p>
                <button 
                  onClick={() => setCurrentView('home')}
                  className="bg-brand-pink text-white px-8 py-3 rounded-md font-bold hover:bg-pink-600 transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white border border-stone-100 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Order ID: {order.id}</p>
                        <p className="text-sm font-bold text-stone-800">Placed on {order.date}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-widest">
                        {order.status}
                      </span>
                    </div>
                    <div className="flex gap-4 items-center py-4 border-y border-stone-50">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <img src={item.product.image} className="w-16 h-16 object-cover rounded-lg" alt="" />
                          <div>
                            <p className="text-sm font-bold text-stone-800">{item.product.name}</p>
                            <p className="text-xs text-stone-500">Size: {item.size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-lg font-black text-stone-900">Total: ₹{order.total}</p>
                      <button 
                        onClick={() => setTrackingOrder(order)}
                        className="text-brand-pink text-sm font-bold hover:underline"
                      >
                        Track Shipping
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'account' && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-black text-stone-800 mb-8 uppercase tracking-tighter">Account Center</h2>
            {!user ? (
              <div className="text-center py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <User size={64} className="mx-auto text-stone-300 mb-4" />
                <p className="text-stone-500 font-medium mb-6">Please login to view your account details.</p>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-brand-pink text-white px-8 py-3 rounded-md font-bold hover:bg-pink-600 transition-all"
                >
                  Login Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-white border border-stone-100 rounded-2xl p-8 shadow-sm text-center">
                  <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={48} className="text-brand-pink" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800">{user.name}</h3>
                  <p className="text-sm text-stone-400 mb-6">{user.email}</p>
                  <button 
                    onClick={handleLogout}
                    className="w-full py-2 border border-stone-200 rounded-lg text-sm font-bold text-stone-600 hover:bg-stone-50 transition-all"
                  >
                    Logout
                  </button>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div 
                    onClick={() => setCurrentView('orders')}
                    className="bg-white border border-stone-100 rounded-xl p-6 shadow-sm flex items-center justify-between cursor-pointer hover:border-brand-pink transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center text-stone-600 group-hover:text-brand-pink">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-800">My Orders</p>
                        <p className="text-xs text-stone-400">View and track your orders</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-stone-300" />
                  </div>
                  <div className="bg-white border border-stone-100 rounded-xl p-6 shadow-sm flex items-center justify-between cursor-pointer hover:border-brand-pink transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center text-stone-600 group-hover:text-brand-pink">
                        <Heart size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-800">My Wishlist</p>
                        <p className="text-xs text-stone-400">Products you've saved for later</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-stone-300" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer - Meesho Style */}
      <footer className="bg-white border-t border-stone-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-pink rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-sm tracking-tighter">GLAMZZ</span>
                </div>
                <h2 className="text-2xl font-black text-stone-800 uppercase tracking-tighter">GLAMZZ FASHION</h2>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed">
                Shop on GLAMZZ FASHION and get the best quality products at lowest prices. 
                Free delivery, Cash on Delivery and easy returns.
              </p>
            </div>
            
            <div>
              <h6 className="text-sm font-bold text-stone-800 mb-4">Shop By Category</h6>
              <ul className="space-y-3 text-sm text-stone-500">
                {categories.slice(1).map(cat => (
                  <li key={cat}>
                    <button onClick={() => setSelectedCategory(cat)} className="hover:text-brand-pink transition-colors">
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h6 className="text-sm font-bold text-stone-800 mb-4">Contact Us</h6>
              <ul className="space-y-3 text-sm text-stone-500">
                <li className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-brand-pink" />
                  <a href="https://wa.me/916382866105" target="_blank" rel="noreferrer" className="hover:text-brand-pink transition-colors">
                    +91 6382866105
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} className="text-brand-pink" />
                  <a href="mailto:glamzzfashion@gmail.com" className="hover:text-brand-pink transition-colors">
                    glamzzfashion@gmail.com
                  </a>
                </li>
                <li className="cursor-pointer hover:text-brand-pink transition-colors">Track Order</li>
                <li className="cursor-pointer hover:text-brand-pink transition-colors">Return/Exchange</li>
                <li>Help Center</li>
                <li>Returns & Refunds</li>
              </ul>
            </div>

            <div>
              <h6 className="text-sm font-bold text-stone-800 mb-4">Seller Hub</h6>
              <ul className="space-y-3 text-sm text-stone-500">
                <li 
                  onClick={() => setIsSellerModalOpen(true)}
                  className="cursor-pointer hover:text-brand-pink transition-colors"
                >
                  Become a Supplier
                </li>
                <li className="cursor-pointer hover:text-brand-pink transition-colors">Seller Login</li>
                <li className="cursor-pointer hover:text-brand-pink transition-colors">Seller Success Stories</li>
                <li className="cursor-pointer hover:text-brand-pink transition-colors">Shipping & Returns for Sellers</li>
              </ul>
            </div>

            <div>
              <h6 className="text-sm font-bold text-stone-800 mb-4">Model Hub</h6>
              <ul className="space-y-3 text-sm text-stone-500">
                <li 
                  onClick={() => setIsModelModalOpen(true)}
                  className="cursor-pointer hover:text-brand-pink transition-colors"
                >
                  Apply for Photoshoot
                </li>
                <li className="cursor-pointer hover:text-brand-pink transition-colors">Model Portfolio Tips</li>
                <li className="cursor-pointer hover:text-brand-pink transition-colors">Upcoming Casting Calls</li>
                <li className="cursor-pointer hover:text-brand-pink transition-colors">Model Success Stories</li>
              </ul>
            </div>

            <div>
              <h6 className="text-sm font-bold text-stone-800 mb-4">Download App</h6>
              <div className="flex flex-col gap-3">
                <div className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer">
                  <div className="text-[10px] leading-none">GET IT ON <br /><span className="text-sm font-bold">Google Play</span></div>
                </div>
                <div className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer">
                  <div className="text-[10px] leading-none">Download on the <br /><span className="text-sm font-bold">App Store</span></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-400">
              © 2026 GLAMZZ FASHION. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProductModal}
              className="fixed inset-0 bg-black/60 z-[100]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl bg-white z-[110] md:rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={closeProductModal}
                className="absolute top-4 right-4 z-10 p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-all"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-1/2 h-80 md:h-auto overflow-hidden bg-stone-50 relative group/image">
                <img 
                  src={aiImage || productAiImages[selectedProduct.id] || selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-contain transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {isGenerating && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <Loader2 className="text-brand-pink animate-spin" size={40} />
                    <p className="text-sm font-bold text-brand-pink">Generating {aiStyle} Style View...</p>
                  </div>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 w-full px-4">
                  {!aiImage && !isGenerating && (
                    <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-brand-pink/20 flex gap-2 overflow-x-auto max-w-full no-scrollbar">
                      {(['studio', 'street', 'traditional', 'lifestyle'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => setAiStyle(style)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold capitalize transition-all whitespace-nowrap ${
                            aiStyle === style 
                              ? 'bg-brand-pink text-white' 
                              : 'text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={() => generateAiModel(selectedProduct)}
                    disabled={isGenerating}
                    className="bg-brand-pink text-white px-6 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-sm font-bold hover:bg-pink-600 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Sparkles size={16} />
                    {aiImage ? 'Try Another Style' : `Generate ${aiStyle.charAt(0).toUpperCase() + aiStyle.slice(1)} View`}
                  </button>

                  {aiImage && (
                    <button 
                      onClick={() => {
                        setProductAiImages(prev => ({ ...prev, [selectedProduct.id]: aiImage }));
                        alert('Photo updated successfully!');
                      }}
                      className="bg-green-600 text-white px-6 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-sm font-bold hover:bg-green-700 transition-all transform hover:scale-105 active:scale-95"
                    >
                      <ShieldCheck size={16} />
                      Set as Main Photo
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-stone-800 mb-2">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-0.5 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                      4.2 <Star size={12} fill="white" />
                    </div>
                    <span className="text-xs text-stone-400">1,245 Ratings, 342 Reviews</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-bold">₹{selectedProduct.price}</p>
                    <p className="text-sm text-stone-400 line-through">₹{Number(selectedProduct.price) + 100}</p>
                    <span className="text-sm font-bold text-green-600">30% off</span>
                  </div>
                  <div className="mt-2 inline-block px-2 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold rounded">
                    ₹{Number(selectedProduct.price) - 20} with 1st Order Discount
                  </div>
                  <div className="mt-4 text-sm text-stone-500 space-y-2">
                    <p><span className="font-bold text-stone-600">50+ colours available</span></p>
                    <p><span className="font-bold text-stone-600">Made in South India</span></p>
                  </div>
                </div>

                {/* 1. Select Size (Reordered) */}
                <div className="mb-8">
                  <h6 className="text-sm font-bold text-stone-800 mb-4">Select Size</h6>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded border text-sm font-medium transition-all ${
                          selectedSize === size 
                            ? 'border-brand-pink bg-pink-50 text-brand-pink ring-1 ring-brand-pink' 
                            : 'border-stone-300 text-stone-600 hover:border-brand-pink'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Payment Options (Reordered) */}
                <div className="mb-8">
                  <h6 className="text-sm font-bold text-stone-800 mb-4">Payment Options</h6>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setSelectedPayment('COD')}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPayment === 'COD' 
                          ? 'border-brand-pink bg-pink-50 ring-1 ring-brand-pink' 
                          : 'border-stone-200 bg-stone-50 hover:border-brand-pink'
                      }`}
                    >
                      <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                        <span className="text-[10px] font-bold text-brand-pink">COD</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">Cash on Delivery</span>
                        <span className="text-[10px] text-brand-pink font-bold">+ ₹50 Extra</span>
                      </div>
                    </div>
                    <div 
                      onClick={() => setSelectedPayment('UPI')}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPayment === 'UPI' 
                          ? 'border-brand-pink bg-pink-50 ring-1 ring-brand-pink' 
                          : 'border-stone-200 bg-stone-50 hover:border-brand-pink'
                      }`}
                    >
                      <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                        <span className="text-[10px] font-bold text-blue-600">UPI</span>
                      </div>
                      <span className="text-xs font-medium">UPI / GPay / PhonePe</span>
                    </div>
                  </div>
                </div>

                {/* 3. Customer Details (New) */}
                <div className="mb-8 border-t border-stone-100 pt-8">
                  <h6 className="text-sm font-bold text-stone-800 mb-4">Delivery Address & Contact</h6>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-pink focus:border-brand-pink outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Enter 10 digit mobile number"
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-pink focus:border-brand-pink outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Full Address</label>
                      <textarea 
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="House No, Street, Area, City, Pincode"
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-pink focus:border-brand-pink outline-none h-20 resize-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Delivery Info */}
                <div className="mb-6 p-4 bg-green-50 rounded-lg flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Truck className="text-green-600" size={20} />
                    <span className="text-sm font-bold text-green-700">Free Delivery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-green-600" size={20} />
                    <span className="text-sm font-bold text-green-700">Cash on Delivery (COD) Available (₹50 extra)</span>
                  </div>
                </div>

                {/* 4. Product Details */}
                <div className="mb-8">
                  <h6 className="text-sm font-bold text-stone-800 mb-2">Product Details</h6>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Name: {selectedProduct.name}<br />
                    Fabric: Premium Cotton Blend<br />
                    Net Quantity: 1<br />
                    Sizes: {selectedProduct.sizes.join(', ')}<br />
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="mb-8 border-t border-stone-100 pt-8">
                  <h6 className="text-sm font-bold text-stone-800 mb-4">Customer Reviews</h6>
                  
                  {/* Review Form */}
                  <div className="bg-stone-50 p-4 rounded-xl mb-6">
                    <p className="text-xs font-bold text-stone-500 uppercase mb-3">Rate this product</p>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            size={24}
                            className={star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300'}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your feedback about the product..."
                      className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-pink focus:border-brand-pink outline-none h-24 resize-none mb-3"
                    />
                    <button
                      onClick={() => handleAddReview(selectedProduct.id)}
                      className="w-full bg-stone-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-stone-900 transition-all"
                    >
                      Submit Review
                    </button>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {(productReviews[selectedProduct.id] || []).length > 0 ? (
                      (productReviews[selectedProduct.id] || []).map((review, idx) => (
                        <div key={idx} className="border-b border-stone-100 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={12}
                                  className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-stone-200'}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-stone-400 font-medium">{review.date}</span>
                          </div>
                          <p className="text-sm text-stone-600 leading-relaxed">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-stone-400 italic">No reviews yet. Be the first to review!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Honey Conch Gift */}
                <div className="mb-8">
                  <label className="flex items-center gap-3 p-4 border border-yellow-300 bg-yellow-50 rounded-lg cursor-pointer hover:border-yellow-400 transition-all">
                    <input 
                      type="checkbox" 
                      checked={addHoneyConch}
                      onChange={(e) => setAddHoneyConch(e.target.checked)}
                      className="h-5 w-5 rounded text-brand-pink focus:ring-brand-pink border-stone-300"
                    />
                    <div>
                      <p className="font-bold text-sm text-yellow-800">Add a Surprise Gift (Honey Conch) for ₹99</p>
                      <p className="text-xs text-yellow-600">Make their day extra special!</p>
                    </div>
                  </label>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <button 
                    onClick={() => addToCart(selectedProduct, selectedSize)}
                    className="flex-grow border border-brand-pink text-brand-pink py-3 rounded-md font-bold hover:bg-pink-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={18} /> Add to Cart
                  </button>
                  <button 
                    onClick={() => {
                      if (!selectedSize) {
                        alert('Please select a size first');
                        return;
                      }
                      if (!selectedPayment) {
                        alert('Please select a payment method');
                        return;
                      }
                      if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
                        alert('Please fill in your delivery details (Name, Phone, and Address)');
                        return;
                      }
                      if (customerPhone.length < 10) {
                        alert('Please enter a valid 10-digit phone number');
                        return;
                      }
                      if (!user) {
                        setIsAuthModalOpen(true);
                        return;
                      }

                      const codCharge = selectedPayment === 'COD' ? 50 : 0;
                      const totalPrice = Number(selectedProduct.price) + codCharge;
                      
                      const newOrder = {
                        id: `ORD${Math.floor(Math.random() * 1000000)}`,
                        date: new Date().toLocaleDateString(),
                        items: [{ product: selectedProduct, size: selectedSize }],
                        total: totalPrice,
                        status: 'Shipped'
                      };
                      setOrders(prev => [newOrder, ...prev]);

                      // Save address for logged in user
                      if (user) {
                        setUser(prev => prev ? ({ ...prev, name: customerName, phone: customerPhone, address: customerAddress }) : null);
                      }

                      alert(`Order Confirmed!\n\nYour order ${newOrder.id} has been launched.\nYou can track its shipping from the Orders page.`);
                      closeProductModal();
                      setCurrentView('orders');
                    }}
                    className="flex-grow bg-brand-pink text-white py-3 rounded-md font-bold hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={18} /> Launch Order
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tracking Modal */}
      <AnimatePresence>
        {trackingOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrackingOrder(null)}
              className="fixed inset-0 bg-black/60 z-[140]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white z-[150] rounded-2xl overflow-hidden shadow-2xl p-8"
            >
              <button 
                onClick={() => setTrackingOrder(null)}
                className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="text-brand-pink" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-stone-800">Track Shipment</h2>
                <p className="text-stone-500 text-sm mt-2">Order ID: {trackingOrder.id}</p>
              </div>

              <div className="space-y-6 relative pl-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-stone-200"></div>
                
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-6 h-6 bg-brand-pink rounded-full flex items-center justify-center">
                    <ShieldCheck size={14} className="text-white" />
                  </div>
                  <p className="font-bold text-sm text-stone-800">Order Confirmed</p>
                  <p className="text-xs text-stone-400">Your order has been confirmed.</p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-6 h-6 bg-brand-pink rounded-full flex items-center justify-center">
                    <ShieldCheck size={14} className="text-white" />
                  </div>
                  <p className="font-bold text-sm text-stone-800">Shipped</p>
                  <p className="text-xs text-stone-400">Your item has been shipped.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-6 h-6 bg-stone-200 rounded-full"></div>
                  <p className="font-bold text-sm text-stone-400">Out for Delivery</p>
                  <p className="text-xs text-stone-400">Your item is out for delivery.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-6 h-6 bg-stone-200 rounded-full"></div>
                  <p className="font-bold text-sm text-stone-400">Delivered</p>
                  <p className="text-xs text-stone-400">Estimated delivery date.</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-[140]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-[150] rounded-2xl overflow-hidden shadow-2xl p-8"
            >
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="text-brand-pink" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-stone-800">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-stone-500 text-sm mt-2">
                  {authMode === 'login' ? 'Login to access your profile and orders' : 'Sign up to start your fashion journey'}
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleAuth}>
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-brand-pink text-white py-3 rounded-lg font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-200"
                >
                  {authMode === 'login' ? 'Login' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-stone-500">
                  {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-brand-pink font-bold hover:underline"
                  >
                    {authMode === 'login' ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Model Registration Modal */}
      <AnimatePresence>
        {isModelModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModelModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-[120]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-[130] rounded-2xl overflow-hidden shadow-2xl p-8"
            >
              <button 
                onClick={() => setIsModelModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-brand-pink" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-stone-800">Model Opportunities</h2>
                <p className="text-stone-500 text-sm mt-2">Make a splash! Apply for our upcoming photoshoots.</p>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    placeholder="Enter your 10 digit mobile number"
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Portfolio Link (Instagram/Drive)</label>
                  <input 
                    type="url" 
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                  />
                </div>
                <button 
                  className="w-full bg-brand-pink text-white py-3 rounded-lg font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-200"
                  onClick={() => {
                    alert('Application submitted! Our casting team will review your portfolio and contact you.');
                    setIsModelModalOpen(false);
                  }}
                >
                  Apply Now
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-stone-100 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-brand-pink font-bold text-lg">50+</div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Shoots/Mo</div>
                </div>
                <div>
                  <div className="text-brand-pink font-bold text-lg">Top</div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Photographers</div>
                </div>
                <div>
                  <div className="text-brand-pink font-bold text-lg">Global</div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Exposure</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Seller Registration Modal */}
      <AnimatePresence>
        {isSellerModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSellerModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-[120]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-[130] rounded-2xl overflow-hidden shadow-2xl p-8"
            >
              <button 
                onClick={() => setIsSellerModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="text-brand-pink" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-stone-800">Become a Seller</h2>
                <p className="text-stone-500 text-sm mt-2">Join 10 Lakh+ suppliers selling on GLAMZZ FASHION</p>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    placeholder="Enter your 10 digit mobile number"
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink outline-none transition-all"
                  />
                </div>
                <button 
                  className="w-full bg-brand-pink text-white py-3 rounded-lg font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-200"
                  onClick={() => {
                    alert('Thank you for your interest! Our team will contact you soon.');
                    setIsSellerModalOpen(false);
                  }}
                >
                  Start Selling
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-stone-100 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-brand-pink font-bold text-lg">0%</div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Commission</div>
                </div>
                <div>
                  <div className="text-brand-pink font-bold text-lg">10L+</div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Suppliers</div>
                </div>
                <div>
                  <div className="text-brand-pink font-bold text-lg">24/7</div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Support</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/916382866105" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
        title="Chat on WhatsApp"
      >
        <MessageCircle size={28} fill="white" />
      </a>
    </div>
  );
}
