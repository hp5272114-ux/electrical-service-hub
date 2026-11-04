import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, doc, setDoc, getDoc, 
  onSnapshot, updateDoc 
} from 'firebase/firestore';
import { 
  Zap, Wrench, ShoppingBag, ShoppingCart, Heart, Bell, Search, 
  MapPin, ChevronDown, ChevronRight, ArrowLeft, Star, PhoneCall, 
  Shield, AlertTriangle, Clock, Truck, CheckCircle2, User, 
  LayoutGrid, ClipboardList, SlidersHorizontal, ArrowUpDown, 
  Flame, Share2, Plus, Minus, Trash2, Camera, QrCode, FileText, 
  Check, Lock, RotateCcw, Sparkles, Filter, Grid, List 
} from 'lucide-react';

const ADMIN_PHONE = "6367626276";
const ADMIN_PIN = "2026";

// हेमंत जी की लाइव Firebase Keys
const firebaseConfig = {
  apiKey: "AIzaSyDzD7cmC7h_uSOB22uNBvPlaO7U1w6Y1_k",
  authDomain: "electrical-service-hub-742d9.firebaseapp.com",
  projectId: "electrical-service-hub-742d9",
  storageBucket: "electrical-service-hub-742d9.firebasestorage.app",
  messagingSenderId: "311450205670",
  appId: "1:311450205670:web:33f31485bdbd55ba272a27"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // User State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('esh_user_v4');
      return saved ? JSON.parse(saved) : { name: "Guest User", phone: "9829012345", role: "customer" };
    } catch (e) {
      return null;
    }
  });

  // Navigation State matching Bottom Nav
  // 'home' | 'categories' | 'cart' | 'orders' | 'account' | 'store'
  const [activeTab, setActiveTab] = useState('home');

  // Customer Marketplace States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [deliveryLocation, setDeliveryLocation] = useState('Jaipur, Rajasthan');

  // Cart & Wishlist
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('esh_cart_v4');
      return saved ? JSON.parse(saved) : [
        { docId: 'p1', name: "Orient Ceiling Fan (1200mm)", price: 1399, mrp: 1999, discount: "-30%", quantity: 1, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400" },
        { docId: 'p2', name: "Philips LED Bulb (9W)", price: 89, mrp: 149, discount: "-40%", quantity: 1, image: "https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=400" }
      ];
    } catch (e) {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(['p1', 'p3']);

  // Modals
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailService, setDetailService] = useState(null);
  const [bookingStepService, setBookingStepService] = useState(null);
  const [custDetailBooking, setCustDetailBooking] = useState(null);
  const [customerPayBooking, setCustomerPayBooking] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);

  // Real-time Firestore Collections
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);

  // 1. Splash Screen
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  // Save Cart
  useEffect(() => {
    try {
      localStorage.setItem('esh_cart_v4', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // 2. Real-Time Cloud Listeners with UI-Matched Seed Data
  useEffect(() => {
    // Products matching screenshot exactly
    const unsubProducts = onSnapshot(collection(db, "products"), async (snap) => {
      if (snap.empty) {
        const seedProducts = [
          { 
            name: "Orient Ceiling Fan (1200mm)", 
            brand: "Orient", 
            category: "fans", 
            price: 1399, 
            mrp: 1999, 
            discount: "-30%", 
            rating: "4.6 (5.2k)", 
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
            description: "हाई-स्पीड 1200mm सीलिंग फैन, 100% कॉपर वाइंडिंग और रिब्ड एल्युमिनियम ब्लेड्स।"
          },
          { 
            name: "Philips LED Bulb (9W)", 
            brand: "Philips", 
            category: "lights", 
            price: 89, 
            mrp: 149, 
            discount: "-40%", 
            rating: "4.7 (8.7k)", 
            image: "https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=400",
            description: "क्रिस्टल व्हाइट कूल डेलाइट, आईकम्फर्ट तकनीक, 90% बिजली बचत।"
          },
          { 
            name: "Havells Switch Board (6 Module)", 
            brand: "Havells", 
            category: "switches", 
            price: 299, 
            mrp: 399, 
            discount: "-25%", 
            rating: "4.5 (3.1k)", 
            image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400",
            description: "मॉड्यूलर प्लेट और सुरक्षा सॉकेट, फ्लेम रिटार्डेंट पॉलीकार्बोनेट।"
          },
          { 
            name: "Finolex Wire (1.5 sqmm)", 
            brand: "Finolex", 
            category: "wires", 
            price: 649, 
            mrp: 999, 
            discount: "-35%", 
            rating: "4.6 (4.8k)", 
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
            description: "100% शुद्ध कॉपर वायर 90 मीटर, आईएसआई प्रमाणित।"
          },
          { 
            name: "Luminous Inverter 900VA", 
            brand: "Luminous", 
            category: "inverters", 
            price: 5499, 
            mrp: 6999, 
            discount: "-21%", 
            rating: "4.8 (2.1k)", 
            image: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=400",
            description: "प्योर साइन वेव इन्वर्टर, स्मार्ट डिस्प्ले।"
          },
          { 
            name: "Schneider 32A DP MCB", 
            brand: "Schneider", 
            category: "mcb", 
            price: 499, 
            mrp: 650, 
            discount: "-23%", 
            rating: "4.7 (1.9k)", 
            image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400",
            description: "10kA ब्रेकिंग कैपेसिटी, शॉर्ट सर्किट व ओवरलोड प्रोटेक्शन।"
          }
        ];
        for (const p of seedProducts) await addDoc(collection(db, "products"), p);
      } else {
        setProducts(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    });

    // Services matching screenshot exactly
    const unsubServices = onSnapshot(collection(db, "services"), async (snap) => {
      if (snap.empty) {
        const seedServices = [
          { 
            name: "Fan Repair", 
            nameHi: "सीलिंग पंखा रिपेयर",
            category: "fan_repair",
            price: 199, 
            startingText: "₹199 onwards", 
            rating: "★ 4.8 (12k+)", 
            image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500",
            description: "आवाज बंद करना, कैपेसिटर बदलाव, बैरिंग ग्रीसिंग और स्पीड चेकिंग।",
            includes: ["फॉल्ट डायग्नोसिस", "30 दिन की आधिकारिक गारंटी", "स्पीड टेस्ट"]
          },
          { 
            name: "Wiring Repair", 
            nameHi: "वायरिंग रिपेयर व फॉल्ट",
            category: "wiring_repair",
            price: 149, 
            startingText: "₹149 onwards", 
            rating: "★ 4.7 (8k+)", 
            image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500",
            description: "शॉर्ट सर्किट, स्पार्किंग, न्यूट्रल लीकेज व ट्रिपिंग एमसीबी की डिजिटल जांच।",
            includes: ["मल्टीमीटर पॉइंट टेस्टिंग", "लोड बैलेंसिंग ऑडिट", "अर्थिंग टेस्टर जांच"]
          },
          { 
            name: "MCB Repair", 
            nameHi: "एमसीबी व डीपी रिपेयर",
            category: "mcb_repair",
            price: 199, 
            startingText: "₹199 onwards", 
            rating: "★ 4.8 (6k+)", 
            image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500",
            description: "जल चुके स्विच, ट्रिपिंग एमसीबी व न्यूट्रल फॉल्ट का स्थायी समाधान।",
            includes: ["सुरक्षित कनेक्शन", "लोड टेस्टिंग", "30 दिन वारंटी"]
          },
          { 
            name: "Inverter Installation", 
            nameHi: "इन्वर्टर इंस्टालेशन",
            category: "inverter_install",
            price: 499, 
            startingText: "₹499 onwards", 
            rating: "★ 4.9 (4k+)", 
            image: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=500",
            description: "घर के मेन लोड के साथ इन्वर्टर व बैटरी का हैवी केबल बाईपास कनेक्शन।",
            includes: ["हैवी लग क्रिम्पिंग", "लोड डिस्ट्रीब्यूशन", "फुल टेस्टिंग"]
          }
        ];
        for (const s of seedServices) await addDoc(collection(db, "services"), s);
      } else {
        setServices(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    });

    // Bookings listener for tracking
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      const list = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setBookings(list);
    });

    return () => {
      unsubProducts();
      unsubServices();
      unsubBookings();
    };
  }, []);

  // Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
  }, [cart]);

  // Wishlist toggle
  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Add to cart
  const addToCart = (product) => {
    const existingIndex = cart.findIndex(i => (i.docId || i.name) === (product.docId || product.name));
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Service Booking Submit
  const handleServiceBooking = async (e) => {
    e.preventDefault();
    const form = e.target;
    const refCode = "ESH-" + Math.floor(100000 + Math.random() * 900000);

    const bookingData = {
      bookingId: refCode,
      serviceName: bookingStepService.name,
      price: bookingStepService.price,
      customerName: user?.name || "ग्राहक",
      customerPhone: user?.phone || "9829012345",
      slot: form.slot.value,
      scheduledDate: form.serviceDate.value,
      address: form.address.value,
      status: "Confirmed",
      paymentStatus: "unpaid",
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "bookings"), bookingData);
      setBookingStepService(null);
      setActiveTab('orders');
      alert(`🎉 बुकिंग दर्ज! रिफरेंस आईडी: #${refCode}`);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // Product Checkout Submit
  const handleProductCheckout = async (e) => {
    e.preventDefault();
    if (!cart.length) return alert("कार्ट खाली है!");
    const form = e.target;
    const orderNumber = "OD-" + Math.floor(100000 + Math.random() * 900000);

    const orderData = {
      orderNumber,
      customerPhone: user?.phone || "9829012345",
      customerName: user?.name || "ग्राहक",
      items: cart,
      address: { line1: form.addressLine.value, city: form.city.value, pincode: form.pincode.value },
      finalAmount: cartSubtotal,
      paymentMode: form.paymentMode.value,
      orderStatus: 'Placed',
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "orders"), orderData);
      setCart([]);
      setCheckoutModal(false);
      setActiveTab('orders');
      alert(`🎉 आर्डर सफल! आर्डर नंबर: #${orderNumber}`);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // Categories Grid Definition matching UI Screen 1 & 2
  const productCategoriesList = [
    { id: 'fans', name: 'Fans', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120' },
    { id: 'lights', name: 'Lights', img: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=120' },
    { id: 'switches', name: 'Switches', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=120' },
    { id: 'wires', name: 'Wires', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120' },
    { id: 'mcb', name: 'MCB', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=120' },
    { id: 'inverters', name: 'Inverter', img: 'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=120' },
    { id: 'battery', name: 'Battery', img: 'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=120' },
    { id: 'more', name: 'More', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=120' },
  ];

  const serviceCategoriesList = [
    { id: 'fan_repair', name: 'Fan Repair', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120' },
    { id: 'wiring_repair', name: 'Wiring Repair', img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=120' },
    { id: 'mcb_repair', name: 'MCB Repair', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=120' },
    { id: 'switch_repair', name: 'Switch Repair', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=120' },
    { id: 'inverter_install', name: 'Inverter Installation', img: 'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=120' },
    { id: 'emergency', name: 'Emergency Service', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120', isEmergency: true },
  ];

  // 1. SPLASH SCREEN
  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center p-6 text-white text-center font-sans">
        <div className="bg-[#FF9900] p-6 rounded-3xl shadow-2xl animate-bounce mb-5 border-4 border-amber-300">
          <Zap className="w-16 h-16 text-[#0A1128] fill-[#0A1128]" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Electrical Hub</h1>
        <p className="text-[#FF9900] font-bold text-sm mt-1">विद्युत सेवा हब</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER (EXACTLY MATCHING SCREENSHOT 1)                  */}
      {/* ============================================================== */}
      <header className="bg-[#0B1528] text-white pt-3 pb-4 px-4 sticky top-0 z-30 shadow-md">
        
        {/* Top Brand & Icons Bar */}
        <div className="flex justify-between items-center mb-2.5">
          {/* Logo with Shield + Lightning */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-[#FF9900] rounded-2xl flex items-center justify-center shadow-lg border border-amber-200">
              <Zap className="w-6 h-6 text-[#0B1528] fill-[#0B1528]" />
            </div>
            <div>
              <span className="font-black text-base block leading-none text-white tracking-tight">Electrical Hub</span>
              <span className="text-[11px] text-slate-300 font-semibold">विद्युत सेवा हब</span>
            </div>
          </div>

          {/* Right Action Icons: Notification Bell + Cart */}
          <div className="flex items-center gap-3">
            <button className="relative p-1 text-slate-200 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            <button onClick={() => setActiveTab('cart')} className="relative p-1 text-slate-200 hover:text-white">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length || 2}
              </span>
            </button>
          </div>
        </div>

        {/* Location Picker Row */}
        <div 
          onClick={() => {
            const loc = prompt("अपना शहर / राज्य दर्ज करें:", deliveryLocation);
            if (loc) setDeliveryLocation(loc);
          }}
          className="flex items-center gap-1.5 text-xs text-slate-300 mb-3 cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-[#FF9900] flex-shrink-0" />
          <span className="font-semibold text-white">{deliveryLocation}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Global Pill Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (activeTab === 'home') setActiveTab('store'); }}
            placeholder="Search Products & Services..."
            className="w-full pl-11 pr-4 py-2.5 bg-white text-slate-900 rounded-full text-xs font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
          />
        </div>
      </header>

      {/* ============================================================== */}
      {/* SCREEN 1: HOME SCREEN (EXACTLY MATCHING LEFT SCREEN)          */}
      {/* ============================================================== */}
      {activeTab === 'home' && (
        <main className="p-3.5 space-y-4">
          
          {/* 1. Hero Promotional Banner */}
          <div className="bg-gradient-to-r from-[#0C1B33] via-[#0F2B5C] to-[#12397B] text-white rounded-3xl p-5 relative overflow-hidden shadow-xl border border-blue-900/50">
            <div className="max-w-[65%] space-y-2 relative z-10">
              <h2 className="text-base font-black leading-tight tracking-tight text-white">
                Upgrade Your Home with Smart Electrical Solutions
              </h2>
              <button 
                onClick={() => setActiveTab('store')}
                className="bg-[#FF9900] hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-md flex items-center gap-1 mt-2 active:scale-95 transition"
              >
                Shop Now <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Banner Floating Products Image Composite */}
            <div className="absolute right-1 -bottom-2 w-[42%] flex items-end justify-center pointer-events-none">
              <img 
                src="https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=300" 
                alt="Smart Lighting" 
                className="w-24 h-24 object-contain drop-shadow-2xl" 
              />
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-1.5 mt-4 pt-1">
              <div className="w-2.5 h-1.5 bg-[#FF9900] rounded-full" />
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
            </div>
          </div>

          {/* 2. Shop by Category Section */}
          <section className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-sm text-slate-900 tracking-tight">Shop by Category</h3>
              <button 
                onClick={() => setActiveTab('categories')} 
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4x2 Category Grid with Soft Grey Cards */}
            <div className="grid grid-cols-4 gap-2.5">
              {productCategoriesList.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setActiveTab('store');
                  }}
                  className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition active:scale-95"
                >
                  <img src={c.img} alt={c.name} className="w-11 h-11 object-contain mb-1 rounded-lg" />
                  <span className="text-[11px] font-bold text-slate-700 text-center">{c.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Popular Services Section (Horizontal Cards) */}
          <section className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-sm text-slate-900 tracking-tight">Popular Services</h3>
              <button 
                onClick={() => setActiveTab('categories')} 
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {services.slice(0, 2).map((srv) => (
                <div 
                  key={srv.docId}
                  onClick={() => setDetailService(srv)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <img src={srv.image} alt={srv.name} className="w-full h-28 object-cover" />
                  <div className="p-3">
                    <h4 className="font-black text-xs text-slate-900 truncate">{srv.name}</h4>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{srv.startingText || `₹${srv.price} onwards`}</div>
                    <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-amber-500">{srv.rating || "★ 4.8 (12k+)"}</span>
                      <div className="w-6 h-6 rounded-full bg-[#FF9900] text-white flex items-center justify-center shadow">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Emergency Electrical Assistance 24x7 Banner */}
          <div className="bg-[#FF9900] text-slate-950 rounded-2xl p-3.5 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow">
                <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
              </div>
              <div>
                <h4 className="font-black text-xs leading-snug">Emergency Electrical<br />Assistance 24×7</h4>
              </div>
            </div>

            <a 
              href={`tel:${ADMIN_PHONE}`}
              className="bg-white hover:bg-slate-50 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 active:scale-95 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#FF9900] fill-[#FF9900]" /> Call Now
            </a>
          </div>

          {/* 5. Best Selling Products Preview */}
          <section className="space-y-2.5 pt-1">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-sm text-slate-900 tracking-tight">Best Selling Products</h3>
              <button 
                onClick={() => setActiveTab('store')} 
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {products.slice(0, 2).map((p) => (
                <div key={p.docId} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div className="relative">
                    <span className="bg-[#FF9900] text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                      {p.discount || "-30%"}
                    </span>
                    <button onClick={() => toggleWishlist(p.docId)} className="absolute right-0 top-0 text-slate-400">
                      <Heart className={`w-4 h-4 ${wishlist.includes(p.docId) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                    <img src={p.image} alt={p.name} className="w-full h-28 object-contain my-2" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 truncate">{p.name}</h4>
                    <span className="text-[10px] text-amber-500 font-bold block mt-0.5">★ {p.rating}</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="font-black text-sm text-slate-900">₹{p.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{p.mrp}</span>
                    </div>
                    <button 
                      onClick={() => addToCart(p)}
                      className="w-full mt-2.5 bg-[#FF9900] hover:bg-amber-500 text-slate-950 font-black py-2 rounded-xl text-xs shadow flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>
      )}

      {/* ============================================================== */}
      {/* SCREEN 2: CATEGORIES SCREEN (EXACTLY MATCHING MIDDLE SCREEN)   */}
      {/* ============================================================== */}
      {activeTab === 'categories' && (
        <main className="p-3.5 space-y-4">
          
          {/* Top Categories Navigation Header */}
          <div className="flex justify-between items-center px-1">
            <button onClick={() => setActiveTab('home')} className="p-1">
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </button>
            <h2 className="font-black text-base text-slate-900">Categories</h2>
            <button onClick={() => setActiveTab('store')} className="p-1">
              <Search className="w-5 h-5 text-slate-800" />
            </button>
          </div>

          {/* Top Promotional Banner */}
          <div className="bg-gradient-to-r from-amber-400 via-[#FF9900] to-orange-500 text-slate-950 rounded-3xl p-4.5 relative overflow-hidden shadow-lg">
            <div className="max-w-[65%] space-y-1">
              <h3 className="font-black text-base leading-tight">Electrical Products at Best Prices</h3>
              <p className="text-[11px] font-bold text-slate-800">Quality • Savings • Trust</p>
              <button 
                onClick={() => setActiveTab('store')}
                className="bg-[#0B1528] text-white font-black text-xs px-4 py-2 rounded-full shadow mt-2 flex items-center gap-1"
              >
                Shop Now <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex justify-center gap-1 mt-3">
              <div className="w-2.5 h-1.5 bg-slate-900 rounded-full" />
              <div className="w-1.5 h-1.5 bg-slate-900/30 rounded-full" />
              <div className="w-1.5 h-1.5 bg-slate-900/30 rounded-full" />
            </div>
          </div>

          {/* Product Categories Grid (3 Columns) */}
          <section className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-sm text-slate-900">Product Categories</h3>
              <button onClick={() => setActiveTab('store')} className="text-xs font-bold text-blue-600 flex items-center">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {productCategoriesList.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setActiveTab('store');
                  }}
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition active:scale-95"
                >
                  <img src={c.img} alt={c.name} className="w-12 h-12 object-contain mb-1.5" />
                  <span className="text-xs font-bold text-slate-800">{c.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Service Categories Grid (3 Columns) */}
          <section className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-sm text-slate-900">Service Categories</h3>
              <span className="text-xs font-bold text-blue-600 flex items-center cursor-pointer">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {serviceCategoriesList.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => {
                    const matched = services.find(x => x.category === s.id) || services[0];
                    setDetailService(matched);
                  }}
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition active:scale-95"
                >
                  <img src={s.img} alt={s.name} className="w-12 h-12 object-contain mb-1.5 rounded-lg" />
                  <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">{s.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Electrician Promo Card */}
          <div className="bg-gradient-to-r from-[#0C1B33] to-[#12397B] text-white rounded-3xl p-4 flex items-center justify-between shadow-xl">
            <div className="space-y-1">
              <h4 className="font-black text-sm leading-tight text-[#FF9900]">
                Get Professional Electrician at Your Doorstep
              </h4>
              <button 
                onClick={() => setDetailService(services[0])}
                className="bg-[#FF9900] text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow mt-1 flex items-center gap-1 active:scale-95 transition"
              >
                Book Now <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200" 
              alt="Electrician" 
              className="w-16 h-16 object-cover rounded-2xl border border-amber-300/40"
            />
          </div>

        </main>
      )}

      {/* ============================================================== */}
      {/* SCREEN 3: STORE & PRODUCTS (EXACTLY MATCHING RIGHT SCREEN)     */}
      {/* ============================================================== */}
      {activeTab === 'store' && (
        <main className="p-3.5 space-y-3.5">
          
          {/* Top Search & Filter Bar */}
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('home')} className="p-1">
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </button>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Products..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Sort By & Filter Dropdown Controls */}
          <div className="flex justify-between items-center text-xs px-1">
            <div className="flex gap-2">
              <button 
                onClick={() => setSortBy(sortBy === 'price_asc' ? 'price_desc' : 'price_asc')}
                className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 text-slate-700 shadow-sm"
              >
                Sort By <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 text-slate-700 shadow-sm">
                Filter <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-1 text-slate-400">
              <button className="p-1.5 bg-white border rounded-lg text-slate-900 shadow-sm"><Grid className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 bg-white border rounded-lg"><List className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Up to 50% OFF Top Banner */}
          <div className="bg-gradient-to-r from-[#0C1B33] via-[#0F2B5C] to-[#12397B] text-white rounded-3xl p-4 relative overflow-hidden shadow-md">
            <div className="max-w-[65%] space-y-1">
              <span className="text-[#FF9900] font-black text-sm block">Up to 50% OFF</span>
              <p className="text-xs font-bold text-white leading-tight">on Electrical Products</p>
              <button className="bg-[#FF9900] text-slate-950 font-black text-[11px] px-3.5 py-1.5 rounded-full shadow mt-2 flex items-center gap-1">
                Shop Now <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200" 
              alt="Promo" 
              className="w-20 h-20 object-contain absolute right-2 -bottom-1"
            />
          </div>

          {/* 2-Column Product Grid exactly matching Screen 3 */}
          <div className="grid grid-cols-2 gap-3">
            {products
              .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .sort((a, b) => {
                if (sortBy === 'price_asc') return a.price - b.price;
                if (sortBy === 'price_desc') return b.price - a.price;
                return 0;
              })
              .map((p) => (
                <div 
                  key={p.docId}
                  className="bg-white rounded-3xl p-3 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="relative">
                    {/* Discount badge */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                      p.discount?.includes('40') || p.discount?.includes('35') 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-[#FF9900] text-slate-950'
                    }`}>
                      {p.discount || "-30%"}
                    </span>

                    {/* Wishlist Heart */}
                    <button onClick={() => toggleWishlist(p.docId)} className="absolute right-0 top-0 text-slate-400 p-0.5">
                      <Heart className={`w-4 h-4 ${wishlist.includes(p.docId) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Product Image */}
                    <div onClick={() => setDetailProduct(p)} className="cursor-pointer my-2 flex items-center justify-center">
                      <img src={p.image} alt={p.name} className="w-full h-28 object-contain" />
                    </div>
                  </div>

                  <div>
                    <h4 onClick={() => setDetailProduct(p)} className="font-bold text-xs text-slate-900 line-clamp-2 cursor-pointer">
                      {p.name}
                    </h4>
                    <span className="text-[10px] text-amber-500 font-black block mt-0.5">
                      ★ {p.rating || "4.6 (5.2k)"}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="font-black text-sm text-slate-900">₹{p.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{p.mrp}</span>
                    </div>

                    <button 
                      onClick={() => addToCart(p)}
                      className="w-full mt-2 bg-[#FF9900] hover:bg-amber-500 text-slate-950 font-black py-2 rounded-xl text-xs shadow flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
          </div>

        </main>
      )}

      {/* ============================================================== */}
      {/* SCREEN 4: SHOPPING CART & CHECKOUT                             */}
      {/* ============================================================== */}
      {activeTab === 'cart' && (
        <main className="p-4 space-y-4">
          <h2 className="font-black text-lg text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#FF9900]" /> शॉपिंग कार्ट ({cart.length})
          </h2>

          {cart.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center border space-y-3">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">आपकी कार्ट अभी खाली है!</p>
              <button onClick={() => setActiveTab('store')} className="bg-[#0B1528] text-[#FF9900] font-bold px-5 py-2.5 rounded-xl text-xs">
                सामान खरीदें
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-3xl border flex justify-between items-center text-xs">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-contain rounded-xl" />
                  <div className="flex-1 px-3">
                    <h4 className="font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                    <span className="text-slate-900 font-black">₹{item.price * item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const updated = cart.map((x, i) => i === idx ? { ...x, quantity: x.quantity - 1 } : x).filter(x => x.quantity > 0);
                        setCart(updated);
                      }} 
                      className="w-6 h-6 bg-slate-100 rounded-lg font-bold flex items-center justify-center"
                    >-</button>
                    <span className="font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => {
                        const updated = cart.map((x, i) => i === idx ? { ...x, quantity: x.quantity + 1 } : x);
                        setCart(updated);
                      }} 
                      className="w-6 h-6 bg-slate-100 rounded-lg font-bold flex items-center justify-center"
                    >+</button>
                  </div>
                </div>
              ))}

              {/* Bill Details */}
              <div className="bg-white p-4 rounded-3xl border space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>कुल राशि (Subtotal):</span>
                  <span className="text-slate-900">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>डिलीवरी:</span>
                  <span className="text-emerald-600">फ्री</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-black text-sm text-slate-900">
                  <span>फाइनल देय राशि:</span>
                  <span className="text-emerald-700 text-base">₹{cartSubtotal}</span>
                </div>
                <button 
                  onClick={() => setCheckoutModal(true)}
                  className="w-full mt-2 bg-[#FF9900] text-slate-950 font-black py-3 rounded-2xl shadow-lg active:scale-95 transition"
                >
                  चेकआउट करें (Proceed to Buy)
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ============================================================== */}
      {/* SCREEN 5: ORDERS & LIVE TRACKING                               */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <main className="p-4 space-y-3.5">
          <h2 className="font-black text-base text-slate-900">मेरे आर्डर व लाइव ट्रैकिंग</h2>

          {bookings.map((b) => (
            <div key={b.docId} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-xs text-blue-900">#{b.bookingId}</span>
                  <h4 className="font-black text-sm text-slate-900 mt-0.5">{b.serviceName}</h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {b.createdAt ? new Date(b.createdAt).toLocaleString('hi-IN') : 'हाल ही में'}
                  </div>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${
                  b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {b.status}
                </span>
              </div>

              {/* Progress Timeline */}
              <div className="bg-slate-50 p-3 rounded-2xl border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-blue-900">स्वीकृत</span>
                  <span className={b.status === 'On The Way' || b.status === 'Completed' ? 'text-purple-700' : 'text-slate-300'}>रास्ते में</span>
                  <span className={b.status === 'Completed' ? 'text-emerald-600' : 'text-slate-300'}>पूरा हुआ</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${
                    b.status === 'Confirmed' ? 'w-1/3 bg-blue-600' :
                    b.status === 'On The Way' ? 'w-2/3 bg-purple-600' : 'w-full bg-emerald-600'
                  }`} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setCustDetailBooking(b)} 
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-900" /> फोटो व रसीद
                </button>
                {b.isBilled && b.paymentStatus !== 'paid' && (
                  <button 
                    onClick={() => setCustomerPayBooking(b)} 
                    className="flex-1 bg-emerald-600 text-white font-black py-2 rounded-xl text-xs shadow flex items-center justify-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" /> बिल भरें (₹{b.finalTotal})
                  </button>
                )}
              </div>
            </div>
          ))}
        </main>
      )}

      {/* ============================================================== */}
      {/* SCREEN 6: ACCOUNT SCREEN                                       */}
      {/* ============================================================== */}
      {activeTab === 'account' && (
        <main className="p-4 space-y-4">
          <div className="bg-[#0B1528] text-white p-5 rounded-3xl shadow-lg flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF9900] text-slate-950 font-black text-xl flex items-center justify-center shadow">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <h3 className="font-black text-base">{user?.name}</h3>
              <p className="text-xs text-slate-300">📞 +91 {user?.phone}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border divide-y text-xs font-bold text-slate-700 shadow-sm">
            <div onClick={() => setActiveTab('orders')} className="p-4 flex justify-between items-center cursor-pointer">
              <span>मेरे आर्डर व बुकिंग्स</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div onClick={() => setActiveTab('cart')} className="p-4 flex justify-between items-center cursor-pointer">
              <span>शॉपिंग कार्ट</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div onClick={() => alert("हेल्पलाइन: 6367626276 पर संपर्क करें")} className="p-4 flex justify-between items-center cursor-pointer">
              <span>24x7 ग्राहक सहायता व शिकायत</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* MODALS: PRODUCT DETAILS, SERVICE BOOKING, CHECKOUT             */}
      {/* ============================================================== */}

      {/* Modal 1: Product Details */}
      {detailProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative">
            <button onClick={() => setDetailProduct(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <img src={detailProduct.image} alt={detailProduct.name} className="w-full h-36 object-contain" />
            <h3 className="font-black text-sm text-slate-900">{detailProduct.name}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">₹{detailProduct.price}</span>
              <span className="text-xs text-slate-400 line-through">₹{detailProduct.mrp}</span>
              <span className="text-emerald-600 font-bold">{detailProduct.discount} OFF</span>
            </div>
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border">{detailProduct.description}</p>
            <button 
              onClick={() => { addToCart(detailProduct); setDetailProduct(null); }}
              className="w-full bg-[#FF9900] text-slate-950 font-black py-3 rounded-2xl shadow-lg"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Service Details */}
      {detailService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative">
            <button onClick={() => setDetailService(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <img src={detailService.image} alt={detailService.name} className="w-full h-36 object-cover rounded-2xl" />
            <h3 className="font-black text-sm text-slate-900">{detailService.name}</h3>
            <div className="text-sm font-black text-blue-900">{detailService.startingText || `₹${detailService.price} onwards`}</div>
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border">{detailService.description}</p>
            <button 
              onClick={() => { setBookingStepService(detailService); setDetailService(null); }}
              className="w-full bg-[#FF9900] text-slate-950 font-black py-3 rounded-2xl shadow-lg flex items-center justify-center gap-1"
            >
              तारीख व स्लॉट चुनें <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal 3: Booking Form */}
      {bookingStepService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleServiceBooking} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setBookingStepService(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">सर्विस स्लॉट व पता चुनें</h3>
            <p className="font-bold text-blue-900">{bookingStepService.name}</p>
            <input required name="serviceDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
            <select name="slot" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50">
              <option>सुबह (9:00 AM - 1:00 PM)</option>
              <option>दोपहर (1:00 PM - 5:00 PM)</option>
              <option>शाम (5:00 PM - 8:00 PM)</option>
            </select>
            <textarea required name="address" rows={2} placeholder="मकान नं., फ्लैट, गली, इलाका, जयपुर" className="w-full p-2 border rounded-xl bg-slate-50"></textarea>
            <button type="submit" className="w-full bg-[#FF9900] text-slate-950 font-black py-3 rounded-2xl shadow-lg">
              कन्फर्म बुकिंग
            </button>
          </form>
        </div>
      )}

      {/* Modal 4: Checkout Form */}
      {checkoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleProductCheckout} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setCheckoutModal(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">डिलीवरी चेकआउट फॉर्म</h3>
            <input required name="addressLine" placeholder="मकान नं., फ्लैट, गली" className="w-full p-2.5 border rounded-xl bg-slate-50" />
            <div className="grid grid-cols-2 gap-2">
              <input required name="city" defaultValue="जयपुर" className="p-2 border rounded-xl bg-slate-50 font-bold" />
              <input required name="pincode" defaultValue="302020" className="p-2 border rounded-xl bg-slate-50 font-bold" />
            </div>
            <select name="paymentMode" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50">
              <option value="cod">कैश ऑन डिलीवरी (Cash on Delivery)</option>
              <option value="online_upi">ऑनलाइन UPI (PhonePe/GPay)</option>
            </select>
            <button type="submit" className="w-full bg-[#FF9900] text-slate-950 font-black py-3 rounded-2xl shadow-lg">
              ऑर्डर कन्फर्म करें (₹{cartSubtotal})
            </button>
          </form>
        </div>
      )}

      {/* Modal 5: Photo Proof & Receipt View */}
      {custDetailBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative my-8">
            <button onClick={() => setCustDetailBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">#{custDetailBooking.bookingId} - {custDetailBooking.serviceName}</h3>
            
            {(custDetailBooking.beforePhoto || custDetailBooking.afterPhoto) ? (
              <div className="grid grid-cols-2 gap-2">
                {custDetailBooking.beforePhoto && (
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold">काम से पहले:</span>
                    <img src={custDetailBooking.beforePhoto} alt="Before" className="h-24 w-full object-cover rounded-xl mt-0.5 border" />
                  </div>
                )}
                {custDetailBooking.afterPhoto && (
                  <div>
                    <span className="text-[9px] text-emerald-600 block font-bold">काम के बाद:</span>
                    <img src={custDetailBooking.afterPhoto} alt="After" className="h-24 w-full object-cover rounded-xl mt-0.5 border" />
                  </div>
                )}
              </div>
            ) : <p className="text-slate-400 italic text-center py-2">काम पूरा होने पर फोटो यहाँ दिखेगा।</p>}

            {custDetailBooking.isBilled && (
              <div className="bg-slate-50 p-3 rounded-2xl border space-y-1">
                <div className="flex justify-between"><span>लेबर चार्ज:</span><span>₹{custDetailBooking.labourFee}</span></div>
                <div className="flex justify-between"><span>पार्ट्स का खर्चा:</span><span>₹{custDetailBooking.materialFee || 0}</span></div>
                <div className="flex justify-between font-black text-sm text-slate-900 border-t pt-1">
                  <span>कुल फाइनल बिल:</span><span className="text-emerald-700">₹{custDetailBooking.finalTotal}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 6: Customer Pay Bill */}
      {customerPayBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative text-xs text-center">
            <button onClick={() => setCustomerPayBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-base text-slate-900">सर्विस बिल भुगतान</h3>
            <div className="text-xl font-black text-emerald-700">देय राशि: ₹{customerPayBooking.finalTotal}</div>
            
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=6367626276@upi%26pn=ElectricalHub%26am=${customerPayBooking.finalTotal}%26cu=INR`} 
              alt="UPI QR Code" 
              className="w-36 h-36 mx-auto rounded-2xl border bg-white p-1"
            />

            <div className="flex gap-2">
              <button 
                onClick={async () => {
                  await updateDoc(doc(db, "bookings", customerPayBooking.docId), { paymentMode: 'cash', paymentStatus: 'cash_selected' });
                  setCustomerPayBooking(null);
                  alert("नकद भुगतान चुना गया!");
                }}
                className="flex-1 bg-slate-800 text-white font-bold py-2.5 rounded-xl"
              >
                💵 नकद (Cash)
              </button>
              <button 
                onClick={async () => {
                  await updateDoc(doc(db, "bookings", customerPayBooking.docId), { paymentMode: 'upi', paymentStatus: 'paid' });
                  setCustomerPayBooking(null);
                  alert("UPI भुगतान दर्ज हुआ!");
                }}
                className="flex-1 bg-emerald-700 text-white font-bold py-2.5 rounded-xl"
              >
                ✔ UPI पेड किया
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. BOTTOM NAVIGATION BAR (EXACTLY MATCHING SCREENSHOT)         */}
      {/* ============================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 z-40 max-w-md mx-auto shadow-2xl">
        
        {/* Tab 1: Home */}
        <button 
          onClick={() => setActiveTab('home')} 
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-[#FF9900]' : 'text-slate-400'}`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* Tab 2: Categories */}
        <button 
          onClick={() => setActiveTab('categories')} 
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'categories' ? 'text-[#FF9900]' : 'text-slate-400'}`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-bold">Categories</span>
        </button>

        {/* Tab 3: Cart */}
        <button 
          onClick={() => setActiveTab('cart')} 
          className={`flex flex-col items-center gap-0.5 relative ${activeTab === 'cart' ? 'text-[#FF9900]' : 'text-slate-400'}`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] font-bold">Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>

        {/* Tab 4: Orders */}
        <button 
          onClick={() => setActiveTab('orders')} 
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'orders' ? 'text-[#FF9900]' : 'text-slate-400'}`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] font-bold">Orders</span>
        </button>

        {/* Tab 5: Account */}
        <button 
          onClick={() => setActiveTab('account')} 
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'account' ? 'text-[#FF9900]' : 'text-slate-400'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Account</span>
        </button>

      </nav>

    </div>
  );
}
