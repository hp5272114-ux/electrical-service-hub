import React, { useState, useEffect, useMemo, Component } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, doc, setDoc, getDoc, 
  onSnapshot, updateDoc 
} from 'firebase/firestore';
import { 
  Zap, Wrench, ShoppingBag, ShoppingCart, Heart, Bell, Search, 
  MapPin, ChevronDown, ChevronRight, ArrowLeft, Star, PhoneCall, 
  Shield, AlertTriangle, Clock, Truck, CheckCircle2, User, 
  LayoutGrid, ClipboardList, SlidersHorizontal, Plus, Minus, 
  Trash2, QrCode, FileText, Check, Lock, Sparkles, Filter, 
  Tag, HelpCircle, X, LogOut, Calendar, Package, Info 
} from 'lucide-react';

// ============================================================================
// 1. FIREBASE CONFIGURATION (100% PURE CUSTOMER APP)
// ============================================================================
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

// ============================================================================
// 2. ERROR SHIELD (ZERO WHITE SCREEN GUARANTEE)
// ============================================================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error?.message || 'सिस्टम रिकवरी' };
  }
  componentDidCatch(error, info) {
    console.error("App Crash Log:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1528] text-white p-6 flex flex-col items-center justify-center text-center font-sans max-w-md mx-auto">
          <AlertTriangle className="w-16 h-16 text-[#FF9900] mb-4 animate-bounce" />
          <h2 className="text-xl font-black">विद्युत सेवा हब • रिकवरी</h2>
          <p className="text-xs text-slate-300 mt-2 bg-white/10 p-3 rounded-2xl border border-white/10">
            {this.state.errorMsg}
          </p>
          <button 
            onClick={() => {
              localStorage.removeItem('esh_cart_v6');
              window.location.reload();
            }}
            className="mt-6 bg-[#FF9900] text-slate-950 font-black px-6 py-3 rounded-2xl text-xs shadow-xl active:scale-95 transition"
          >
            ऐप पुनः लोड करें
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// 3. MAIN CUSTOMER MARKETPLACE APPLICATION
// ============================================================================
function CustomerMarketplace() {
  const [showSplash, setShowSplash] = useState(true);

  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('esh_customer_v6');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authPhone, setAuthPhone] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [authName, setAuthName] = useState('');
  const [authConfirmPin, setAuthConfirmPin] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Navigation: 'home' | 'categories' | 'store' | 'cart' | 'orders' | 'account'
  const [activeTab, setActiveTab] = useState('home');
  const [ordersSubTab, setOrdersSubTab] = useState('products'); // 'products' | 'services'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('Jaipur, Rajasthan');

  // Interactive Detail Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingService, setBookingService] = useState(null);
  const [activeBookingDetail, setActiveBookingDetail] = useState(null);
  const [customerPayBooking, setCustomerPayBooking] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);

  // Cart & Wishlist with Local Persistence
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('esh_cart_v6');
      return saved ? JSON.parse(saved) : [
        { docId: 'p1', name: "Orient Ceiling Fan (1200mm)", price: 1399, mrp: 1999, discount: "-30%", quantity: 1, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400" },
        { docId: 'p2', name: "Philips LED Bulb (9W)", price: 89, mrp: 149, discount: "-40%", quantity: 1, image: "https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=400" }
      ];
    } catch (e) {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(['p1']);

  // Saved Addresses
  const [savedAddresses] = useState([
    { id: 'addr_1', line: '42, Shanti Kunj, Civil Lines', city: 'Jaipur', pincode: '302006' }
  ]);

  // Firestore Realtime Data
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);

  // Notifications
  const [notifications] = useState([
    { id: 'n1', title: 'स्वागत है!', desc: 'विद्युत सेवा हब में आपका स्वागत है। 100% ओरिजिनल सामान व सेवाएँ उपलब्ध।', time: 'अभी', unread: true },
    { id: 'n2', title: 'समर डिस्काउंट लाइव', desc: 'सीलिंग फैन रिपेयर पर 20% तक की विशेष छूट पाएं।', time: '1 घंटा पहले', unread: true }
  ]);

  // 1. Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('esh_cart_v6', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // 2. Real-Time Cloud Synchronization
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), async (snap) => {
      if (snap.empty) {
        const seedProducts = [
          { name: "Orient Ceiling Fan (1200mm)", brand: "Orient", category: "fans", price: 1399, mrp: 1999, discount: "-30%", rating: "4.6", reviewsCount: "5.2k", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500", description: "1200mm हाई-स्पीड सीलिंग फैन, 100% शुद्ध कॉपर वाइंडिंग और रिब्ड एल्युमिनियम ब्लेड्स।" },
          { name: "Philips LED Bulb (9W)", brand: "Philips", category: "lights", price: 89, mrp: 149, discount: "-40%", rating: "4.7", reviewsCount: "8.7k", image: "https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=500", description: "क्रिस्टल व्हाइट कूल डेलाइट, आईकम्फर्ट तकनीक, 90% बिजली की बचत।" },
          { name: "Havells Switch Board (6 Module)", brand: "Havells", category: "switches", price: 299, mrp: 399, discount: "-25%", rating: "4.5", reviewsCount: "3.1k", image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500", description: "मॉड्यूलर प्लेट और सुरक्षा सॉकेट, फ्लेम रिटार्डेंट पॉलीकार्बोनेट शीट।" },
          { name: "Finolex Wire (1.5 sqmm)", brand: "Finolex", category: "wires", price: 649, mrp: 999, discount: "-35%", rating: "4.6", reviewsCount: "4.8k", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500", description: "100% शुद्ध कॉपर वायर 90 मीटर कॉइल, आग प्रतिरोधी IS/IEC प्रमाणित।" }
        ];
        for (const p of seedProducts) await addDoc(collection(db, "products"), p);
      } else {
        setProducts(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    }, (err) => console.log("Products Fetch Error:", err));

    const unsubServices = onSnapshot(collection(db, "services"), async (snap) => {
      if (snap.empty) {
        const seedServices = [
          { name: "Fan Repair", nameHi: "सीलिंग पंखा रिपेयर", category: "fans", price: 199, startingText: "₹199 onwards", rating: "4.8", bookedCount: "12k+", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500", description: "पंखे की आवाज, कैपेसिटर बदलाव, जाम बैरिंग, वाइब्रेशन व स्पीड समस्या का समाधान।", includes: ["फॉल्ट डायग्नोसिस", "कैपेसिटर चेकिंग", "30 दिन की गारंटी"] },
          { name: "Wiring Repair", nameHi: "वायरिंग रिपेयर व फॉल्ट जांच", category: "wiring", price: 149, startingText: "₹149 onwards", rating: "4.7", bookedCount: "8k+", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500", description: "शॉर्ट सर्किट, स्पार्किंग, न्यूट्रल लीकेज व हिडन वायरिंग स्पार्किंग की डिजिटल जांच।", includes: ["मल्टीमीटर पॉइंट टेस्टिंग", "लोड बैलेंसिंग टेस्ट", "30 दिन वारंटी"] },
          { name: "MCB Repair", nameHi: "एमसीबी व डीपी रिपेयर", category: "switchgear", price: 199, startingText: "₹199 onwards", rating: "4.8", bookedCount: "6k+", image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500", description: "जल चुके स्विच, ट्रिपिंग एमसीबी व न्यूट्रल फॉल्ट का स्थायी समाधान।", includes: ["सुरक्षित कनेक्शन", "लोड टेस्टिंग", "30 दिन वारंटी"] },
          { name: "Inverter Installation", nameHi: "इन्वर्टर इंस्टालेशन", category: "inverters", price: 499, startingText: "₹499 onwards", rating: "4.9", bookedCount: "4k+", image: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=500", description: "घर के मेन लोड के साथ इन्वर्टर व बैटरी का हैवी केबल बाईपास कनेक्शन।", includes: ["हैवी लग क्रिम्पिंग", "लोड डिस्ट्रीब्यूशन", "फुल टेस्टिंग"] }
        ];
        for (const s of seedServices) await addDoc(collection(db, "services"), s);
      } else {
        setServices(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    }, (err) => console.log("Services Fetch Error:", err));

    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      const list = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setBookings(list);
    }, (err) => console.log("Bookings Fetch Error:", err));

    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const list = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(list);
    }, (err) => console.log("Orders Fetch Error:", err));

    return () => {
      unsubProducts();
      unsubServices();
      unsubBookings();
      unsubOrders();
    };
  }, []);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
  }, [cart]);
  const cartDeliveryFee = cartSubtotal > 999 || cartSubtotal === 0 ? 0 : 70;
  const cartFinalTotal = cartSubtotal + cartDeliveryFee;

  // 3. Customer Authentication
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (authPhone.length !== 10 || authPin.length !== 4) {
      return alert("कृपया 10 अंकों का फोन नंबर व 4 अंकों का पिन दर्ज करें!");
    }

    setAuthLoading(true);
    const cleanPhone = authPhone.trim();

    try {
      const userRef = doc(db, "users", cleanPhone);
      const userSnap = await getDoc(userRef);

      if (authMode === 'register') {
        if (!authName.trim()) {
          setAuthLoading(false);
          return alert("कृपया अपना पूरा नाम लिखें!");
        }
        if (authPin !== authConfirmPin) {
          setAuthLoading(false);
          return alert("दोनों पिन समान होने चाहिए!");
        }
        if (userSnap.exists()) {
          setAuthLoading(false);
          setAuthMode('login');
          return alert("यह मोबाइल नंबर पहले से रजिस्टर्ड है! सीधे लॉगिन करें।");
        }

        const newUser = {
          name: authName.trim(),
          phone: cleanPhone,
          pin: authPin.trim(),
          role: 'customer',
          createdAt: Date.now()
        };

        await setDoc(userRef, newUser);
        setUser(newUser);
        localStorage.setItem('esh_customer_v6', JSON.stringify(newUser));
        setAuthModal(false);
        alert(`स्वागत है ${newUser.name}! आपका अकाउंट तैयार है।`);
      } else {
        if (!userSnap.exists()) {
          setAuthLoading(false);
          setAuthMode('register');
          return alert("यह नंबर रजिस्टर्ड नहीं है! पहले नया खाता बनाएं।");
        }
        const userData = userSnap.data();
        if (userData.pin !== authPin.trim()) {
          setAuthLoading(false);
          return alert("गलत पिन! सही 4-अंकों का पिन डालें।");
        }
        setUser(userData);
        localStorage.setItem('esh_customer_v6', JSON.stringify(userData));
        setAuthModal(false);
        alert(`नमस्ते ${userData.name}! लॉगिन सफल हुआ।`);
      }
    } catch (err) {
      alert("प्रमाणीकरण एरर: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('esh_customer_v6');
    setActiveTab('home');
  };

  // 4. Cart & Wishlist Actions
  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    const existingIndex = cart.findIndex(i => (i.docId || i.name) === (product.docId || product.name));
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    alert(`"${product.name}" कार्ट में जोड़ दिया गया है!`);
  };

  const handleUpdateCartQty = (idx, delta) => {
    const updated = cart.map((item, i) => {
      if (i === idx) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    setCart(updated);
  };

  const handleToggleWishlist = (product, e) => {
    if (e) e.stopPropagation();
    const id = product.docId || product.name;
    const exists = wishlist.includes(id);
    if (exists) {
      setWishlist(wishlist.filter(i => i !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  // 5. Service Booking Submission
  const handleConfirmServiceBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModal(true);
      return;
    }
    const form = e.target;
    const bookingRef = "ESH-" + Math.floor(100000 + Math.random() * 900000);

    const bookingData = {
      bookingId: bookingRef,
      serviceName: bookingService.name,
      price: bookingService.price,
      customerName: user.name,
      customerPhone: user.phone,
      slot: form.slot.value,
      scheduledDate: form.serviceDate.value,
      address: form.address.value,
      status: "Placed", // Placed -> Confirmed -> On The Way -> In Progress -> Completed
      paymentStatus: "unpaid",
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "bookings"), bookingData);
      setBookingService(null);
      setActiveTab('orders');
      setOrdersSubTab('services');
      alert(`🎉 बुकिंग सफल! रिफरेंस: #${bookingRef}\nलाइव ट्रैकिंग शुरू हो गई है।`);
    } catch (err) {
      alert("बुकिंग सेव एरर: " + err.message);
    }
  };

  // 6. Product Order Submission
  const handleConfirmProductOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModal(true);
      return;
    }
    if (!cart.length) return alert("कार्ट खाली है!");
    const form = e.target;
    const orderNumber = "OD-" + Math.floor(100000 + Math.random() * 900000);

    const orderData = {
      orderNumber,
      customerPhone: user.phone,
      customerName: user.name,
      items: cart,
      address: {
        line: form.addressLine.value,
        city: form.city.value,
        pincode: form.pincode.value
      },
      subtotal: cartSubtotal,
      deliveryCharge: cartDeliveryFee,
      finalAmount: cartFinalTotal,
      paymentMode: form.paymentMode.value,
      orderStatus: 'Placed',
      paymentStatus: form.paymentMode.value === 'online_upi' ? 'pending_verification' : 'unpaid',
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "orders"), orderData);
      setCart([]);
      setCheckoutModal(false);
      setActiveTab('orders');
      setOrdersSubTab('products');
      alert(`🎉 ऑर्डर दर्ज हुआ! ऑर्डर क्रमांक: #${orderNumber}`);
    } catch (err) {
      alert("ऑर्डर सबमिट एरर: " + err.message);
    }
  };

  // Categories Metadata
  const categoryTiles = [
    { id: 'fans', name: 'Fans', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=160' },
    { id: 'lights', name: 'Lights', img: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=160' },
    { id: 'switches', name: 'Switches', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=160' },
    { id: 'wires', name: 'Wires', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=160' },
    { id: 'switchgear', name: 'MCB', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=160' },
    { id: 'inverters', name: 'Inverter', img: 'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=160' },
    { id: 'battery', name: 'Battery', img: 'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=160' },
    { id: 'all', name: 'More', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=160' }
  ];

  // Splash Screen
  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex flex-col items-center justify-center p-6 text-white text-center font-sans max-w-md mx-auto">
        <div className="bg-[#FF9900] p-6 rounded-3xl shadow-2xl animate-bounce mb-5 border-4 border-amber-300">
          <Zap className="w-16 h-16 text-[#0A1128] fill-[#0A1128]" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Electrical Hub</h1>
        <p className="text-[#FF9900] font-bold text-sm mt-1">विद्युत सेवा हब • Official App</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* ==================================================================== */}
      {/* 1. TOP HEADER                                                       */}
      {/* ==================================================================== */}
      <header className="bg-[#0B1528] text-white pt-3 pb-3.5 px-4 sticky top-0 z-30 shadow-md">
        
        {/* Logo and Right Icons */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-[#FF9900] rounded-2xl flex items-center justify-center shadow-lg border border-amber-200">
              <Zap className="w-6 h-6 text-[#0B1528] fill-[#0B1528]" />
            </div>
            <div>
              <span className="font-black text-base block leading-none text-white tracking-tight">Electrical Hub</span>
              <span className="text-[11px] text-slate-300 font-semibold">विद्युत सेवा हब</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button onClick={() => setNotificationModal(true)} className="relative p-1.5 text-slate-200 hover:text-white rounded-xl">
              <Bell className="w-5 h-5" />
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
            </button>

            <button onClick={() => setActiveTab('cart')} className="relative p-1.5 text-slate-200 hover:text-white rounded-xl">
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#FF9900] text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Location Picker */}
        <div 
          onClick={() => {
            const loc = prompt("अपना शहर या पिनकोड दर्ज करें:", deliveryLocation);
            if (loc) setDeliveryLocation(loc);
          }}
          className="flex items-center gap-1 text-xs text-slate-300 mb-2.5 cursor-pointer w-fit"
        >
          <MapPin className="w-3.5 h-3.5 text-[#FF9900] flex-shrink-0" />
          <span className="font-bold text-white">{deliveryLocation}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-emerald-400 font-bold ml-1">● 45m एक्सप्रेस</span>
        </div>

        {/* Global Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (activeTab === 'home') setActiveTab('store'); }}
            placeholder="Search Products & Services..."
            className="w-full pl-11 pr-4 py-2.5 bg-white text-slate-900 rounded-full text-xs font-semibold shadow-inner focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
          />
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. TAB: HOME SCREEN                                                 */}
      {/* ==================================================================== */}
      {activeTab === 'home' && (
        <main className="p-3.5 space-y-4">
          
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-[#0C1B33] via-[#0F2B5C] to-[#12397B] text-white rounded-3xl p-5 relative overflow-hidden shadow-xl border border-blue-900/50">
            <div className="max-w-[65%] space-y-2 relative z-10">
              <h2 className="text-base font-black leading-tight text-white">
                Upgrade Your Home with Smart Electrical Solutions
              </h2>
              <button 
                onClick={() => setActiveTab('store')}
                className="bg-[#FF9900] hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow flex items-center gap-1 active:scale-95 transition"
              >
                Shop Now <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=300" 
              alt="Promo" 
              className="w-24 h-24 object-contain absolute right-1 -bottom-1 drop-shadow-2xl" 
            />
          </div>

          {/* Shop by Category */}
          <section className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-sm text-slate-900 tracking-tight">Shop by Category</h3>
              <button onClick={() => setActiveTab('categories')} className="text-xs font-bold text-blue-600 flex items-center">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {categoryTiles.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setActiveTab('store');
                  }}
                  className="bg-white rounded-2xl p-2 border border-slate-100 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition active:scale-95"
                >
                  <img src={c.img} alt={c.name} className="w-10 h-10 object-contain mb-1 rounded-lg" />
                  <span className="text-[11px] font-bold text-slate-700 text-center">{c.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Services */}
          <section className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-sm text-slate-900 tracking-tight">Popular Services</h3>
              <button onClick={() => setActiveTab('categories')} className="text-xs font-bold text-blue-600 flex items-center">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {services.slice(0, 2).map((srv) => (
                <div 
                  key={srv.docId}
                  onClick={() => setSelectedService(srv)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <img src={srv.image} alt={srv.name} className="w-full h-28 object-cover" />
                  <div className="p-3">
                    <h4 className="font-black text-xs text-slate-900 truncate">{srv.name}</h4>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{srv.startingText || `₹${srv.price} onwards`}</div>
                    <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-amber-500">★ {srv.rating || "4.8"}</span>
                      <div className="w-6 h-6 rounded-full bg-[#FF9900] text-white flex items-center justify-center shadow">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Emergency 24x7 Assistance Banner */}
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
              href="tel:18001234567"
              className="bg-white hover:bg-slate-50 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 active:scale-95 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#FF9900] fill-[#FF9900]" /> Call Now
            </a>
          </div>

          {/* Best Selling Products */}
          <section className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-sm text-slate-900 tracking-tight">Best Selling Products</h3>
              <button onClick={() => setActiveTab('store')} className="text-xs font-bold text-blue-600 flex items-center">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {products.slice(0, 4).map((p) => (
                <div 
                  key={p.docId} 
                  onClick={() => setSelectedProduct(p)}
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition"
                >
                  <div className="relative">
                    <span className="bg-[#FF9900] text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                      {p.discount || "-30%"}
                    </span>
                    <button onClick={(e) => handleToggleWishlist(p, e)} className="absolute right-0 top-0 text-slate-400 p-1">
                      <Heart className={`w-4 h-4 ${wishlist.includes(p.docId || p.name) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                    <img src={p.image} alt={p.name} className="w-full h-24 object-contain my-2" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{p.name}</h4>
                    <span className="text-[10px] text-amber-500 font-bold block mt-0.5">★ {p.rating}</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="font-black text-sm text-slate-900">₹{p.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{p.mrp}</span>
                    </div>
                    <button 
                      onClick={(e) => handleAddToCart(p, e)}
                      className="w-full mt-2 bg-[#FF9900] hover:bg-amber-500 text-slate-950 font-black py-2 rounded-xl text-xs shadow flex items-center justify-center gap-1 active:scale-95 transition"
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

      {/* ==================================================================== */}
      {/* 3. TAB: CATEGORIES SCREEN                                           */}
      {/* ==================================================================== */}
      {activeTab === 'categories' && (
        <main className="p-3.5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <button onClick={() => setActiveTab('home')} className="p-1">
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </button>
            <h2 className="font-black text-base text-slate-900">कैटलॉग व श्रेणियाँ</h2>
            <button onClick={() => setActiveTab('store')} className="p-1">
              <Search className="w-5 h-5 text-slate-800" />
            </button>
          </div>

          <section className="space-y-2">
            <h3 className="font-black text-sm text-slate-900 px-1">सामान श्रेणियाँ (Product Categories)</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {categoryTiles.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setActiveTab('store');
                  }}
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center cursor-pointer active:scale-95 transition"
                >
                  <img src={c.img} alt={c.name} className="w-12 h-12 object-contain mb-1" />
                  <span className="text-xs font-bold text-slate-800">{c.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2 pt-1">
            <h3 className="font-black text-sm text-slate-900 px-1">सर्विस श्रेणियाँ (Service Categories)</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {services.map((s) => (
                <div 
                  key={s.docId}
                  onClick={() => setSelectedService(s)}
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-2.5 cursor-pointer active:scale-95 transition"
                >
                  <img src={s.image} alt={s.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{s.name}</h4>
                    <span className="text-[11px] font-black text-blue-900">₹{s.price} onwards</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ==================================================================== */}
      {/* 4. TAB: STORE SCREEN                                                */}
      {/* ==================================================================== */}
      {activeTab === 'store' && (
        <main className="p-3.5 space-y-3.5">
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
                placeholder="सर्च करें..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold focus:ring-2 focus:ring-[#FF9900]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {products
              .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((p) => (
                <div 
                  key={p.docId}
                  onClick={() => setSelectedProduct(p)}
                  className="bg-white rounded-3xl p-3 border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition"
                >
                  <div className="relative">
                    <span className="bg-[#FF9900] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                      {p.discount || "-30%"}
                    </span>
                    <button onClick={(e) => handleToggleWishlist(p, e)} className="absolute right-0 top-0 text-slate-400 p-1">
                      <Heart className={`w-4 h-4 ${wishlist.includes(p.docId || p.name) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                    <img src={p.image} alt={p.name} className="w-full h-28 object-contain my-2" />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{p.brand}</span>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{p.name}</h4>
                    <span className="text-[10px] text-amber-500 font-black block mt-0.5">★ {p.rating}</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="font-black text-sm text-slate-900">₹{p.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{p.mrp}</span>
                    </div>

                    <button 
                      onClick={(e) => handleAddToCart(p, e)}
                      className="w-full mt-2.5 bg-[#FF9900] hover:bg-amber-500 text-slate-950 font-black py-2 rounded-xl text-xs shadow flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </main>
      )}

      {/* ==================================================================== */}
      {/* 5. TAB: CART SCREEN                                                 */}
      {/* ==================================================================== */}
      {activeTab === 'cart' && (
        <main className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#FF9900]" /> शॉपिंग कार्ट ({cart.length})
            </h2>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs text-rose-600 font-bold flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> खाली करें
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center border space-y-3 shadow-sm">
              <ShoppingCart className="w-14 h-14 text-slate-300 mx-auto" />
              <h3 className="font-black text-sm text-slate-800">आपकी कार्ट अभी खाली है!</h3>
              <p className="text-xs text-slate-400">स्टोर से पंखे, तार, एमसीबी व अन्य सामान चुनें</p>
              <button onClick={() => setActiveTab('store')} className="bg-[#0B1528] text-[#FF9900] font-black px-6 py-2.5 rounded-xl text-xs shadow-md mt-2">
                सामान स्टोर खोलें ➔
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-3xl border shadow-sm flex items-center justify-between text-xs gap-3">
                  <img src={item.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=160"} alt={item.name} className="w-14 h-14 object-contain rounded-xl bg-slate-50 border p-1" />
                  <div className="flex-1">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">{item.brand || 'Electrical Hub'}</span>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                    <div className="text-sm font-black text-slate-900 mt-0.5">₹{item.price * item.quantity}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border rounded-xl p-1">
                    <button onClick={() => handleUpdateCartQty(idx, -1)} className="w-6 h-6 bg-white rounded-lg font-black text-slate-700 flex items-center justify-center shadow-sm">-</button>
                    <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                    <button onClick={() => handleUpdateCartQty(idx, 1)} className="w-6 h-6 bg-white rounded-lg font-black text-slate-700 flex items-center justify-center shadow-sm">+</button>
                  </div>
                </div>
              ))}

              <div className="bg-white p-4 rounded-3xl border space-y-2.5 text-xs shadow-sm">
                <div className="flex justify-between font-bold text-slate-600">
                  <span>सामान का मूल्य:</span><span className="text-slate-900 font-black">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-600">
                  <span>डिलीवरी शुल्क:</span><span className="text-emerald-600 font-bold">{cartSubtotal > 999 ? "फ्री" : "₹70"}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-black text-sm text-slate-900">
                  <span>कुल देय राशि:</span><span className="text-emerald-700 text-base">₹{cartFinalTotal}</span>
                </div>
                <button onClick={() => setCheckoutModal(true)} className="w-full mt-2 bg-[#FF9900] hover:bg-amber-500 text-slate-950 font-black py-3 rounded-2xl shadow-lg active:scale-95 transition text-xs">
                  चेकआउट करें (Proceed to Buy) ➔
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ==================================================================== */}
      {/* 6. TAB: ORDERS & BOOKINGS SCREEN                                    */}
      {/* ==================================================================== */}
      {activeTab === 'orders' && (
        <main className="p-4 space-y-4">
          <h2 className="font-black text-base text-slate-900">मेरे आर्डर व लाइव ट्रैकिंग</h2>

          {/* Sub-Tab Selector: Products vs Services */}
          <div className="flex bg-slate-200 p-1 rounded-2xl text-xs font-black shadow-inner">
            <button 
              onClick={() => setOrdersSubTab('products')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                ordersSubTab === 'products' ? 'bg-[#0B1528] text-[#FF9900] shadow' : 'text-slate-600'
              }`}
            >
              <Package className="w-4 h-4" /> सामान ऑर्डर्स ({orders.length})
            </button>
            <button 
              onClick={() => setOrdersSubTab('services')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                ordersSubTab === 'services' ? 'bg-[#0B1528] text-[#FF9900] shadow' : 'text-slate-600'
              }`}
            >
              <Zap className="w-4 h-4" /> सर्विस बुकिंग्स ({bookings.length})
            </button>
          </div>

          {/* VIEW 1: PRODUCT ORDERS */}
          {ordersSubTab === 'products' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl text-center border space-y-2 text-xs text-slate-400">
                  <Package className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-600">आपने अभी तक कोई सामान ऑर्डर नहीं किया है।</p>
                  <button onClick={() => setActiveTab('store')} className="text-[#FF9900] font-black underline">स्टोर से सामान खरीदें</button>
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.docId} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
                    <div className="flex justify-between items-start border-b pb-2">
                      <div>
                        <span className="font-bold text-blue-900">ऑर्डर ID: #{o.orderNumber}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {o.createdAt ? new Date(o.createdAt).toLocaleString('hi-IN') : 'हाल ही में'}
                        </div>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-black text-[10px]">
                        {o.orderStatus || 'Placed'}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-700">
                      {o.items?.map((it, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="truncate max-w-[200px]">{it.name} (x{it.quantity})</span>
                          <span className="font-bold">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-slate-50 p-3 rounded-2xl border space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-blue-900">ऑर्डर दर्ज</span>
                        <span className={o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery' || o.orderStatus === 'Delivered' ? 'text-blue-900' : 'text-slate-300'}>डिस्पैच</span>
                        <span className={o.orderStatus === 'Out for Delivery' || o.orderStatus === 'Delivered' ? 'text-purple-700' : 'text-slate-300'}>रास्ते में</span>
                        <span className={o.orderStatus === 'Delivered' ? 'text-emerald-600' : 'text-slate-300'}>डिलीवर</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${
                          o.orderStatus === 'Delivered' ? 'w-full bg-emerald-600' :
                          o.orderStatus === 'Out for Delivery' ? 'w-3/4 bg-purple-600' :
                          o.orderStatus === 'Shipped' ? 'w-2/4 bg-blue-600' : 'w-1/4 bg-[#FF9900]'
                        }`} />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 font-bold text-slate-800">
                      <span>कुल भुगतान:</span>
                      <span className="text-emerald-700 text-sm font-black">₹{o.finalAmount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* VIEW 2: SERVICE BOOKINGS */}
          {ordersSubTab === 'services' && (
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl text-center border space-y-2 text-xs text-slate-400">
                  <Wrench className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-600">कोई सर्विस बुकिंग दर्ज नहीं है।</p>
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b.docId} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-blue-900">#{b.bookingId}</span>
                        <h4 className="font-black text-sm text-slate-900 mt-0.5">{b.serviceName}</h4>
                        <p className="text-[11px] text-slate-500">स्लॉट: {b.slot} | तारीख: {b.scheduledDate || 'आज'}</p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${
                        b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-blue-900">स्वीकृत</span>
                        <span className={b.status === 'On The Way' || b.status === 'In Progress' || b.status === 'Completed' ? 'text-purple-700' : 'text-slate-300'}>रास्ते में</span>
                        <span className={b.status === 'Completed' ? 'text-emerald-600' : 'text-slate-300'}>पूरा हुआ</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${
                          b.status === 'Completed' ? 'w-full bg-emerald-600' :
                          b.status === 'On The Way' || b.status === 'In Progress' ? 'w-2/3 bg-purple-600' : 'w-1/3 bg-blue-600'
                        }`} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => setActiveBookingDetail(b)} className="flex-1 bg-slate-100 text-slate-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-900" /> फोटो व रसीद देखें
                      </button>
                      {b.isBilled && b.paymentStatus !== 'paid' && (
                        <button onClick={() => setCustomerPayBooking(b)} className="flex-1 bg-emerald-600 text-white font-black py-2 rounded-xl text-xs shadow">
                          बिल भरें (₹{b.finalTotal})
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </main>
      )}

      {/* ==================================================================== */}
      {/* 7. TAB: ACCOUNT SCREEN                                              */}
      {/* ==================================================================== */}
      {activeTab === 'account' && (
        <main className="p-4 space-y-4">
          <div className="bg-[#0B1528] text-white p-5 rounded-3xl shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FF9900] text-slate-950 font-black text-xl flex items-center justify-center shadow">
                {user ? user.name[0] : 'G'}
              </div>
              <div>
                <h3 className="font-black text-base">{user ? user.name : "अतिथि ग्राहक (Guest)"}</h3>
                <p className="text-xs text-slate-300">📞 +91 {user ? user.phone : "रजिस्टर करें"}</p>
              </div>
            </div>
            {user ? (
              <button onClick={handleLogout} className="text-slate-400 hover:text-white p-2">
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={() => setAuthModal(true)} className="bg-[#FF9900] text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs">
                लॉगिन
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl border divide-y text-xs font-bold text-slate-700 shadow-sm">
            <div onClick={() => setActiveTab('orders')} className="p-4 flex justify-between items-center cursor-pointer">
              <span>मेरे आर्डर व बुकिंग्स</span><ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div onClick={() => setActiveTab('cart')} className="p-4 flex justify-between items-center cursor-pointer">
              <span>शॉपिंग कार्ट ({cart.length})</span><ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div onClick={() => alert("कूपन कोड उपलब्ध: WELCOME50 (₹50 छूट) व ELECTRICAL10 (10% छूट)")} className="p-4 flex justify-between items-center cursor-pointer">
              <span>कूपन व ऑफर्स</span><ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div onClick={() => alert("हेल्पलाइन: 1800-123-4567 पर कॉल करें")} className="p-4 flex justify-between items-center cursor-pointer">
              <span>24×7 सहायता व शिकायत</span><ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </main>
      )}

      {/* ==================================================================== */}
      {/* 8. MODALS (PRODUCT DETAILS, SERVICE DETAILS, CHECKOUT)               */}
      {/* ==================================================================== */}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative my-8 text-xs">
            <button onClick={() => setSelectedProduct(null)} className="absolute right-4 top-4 text-slate-400 p-1"><X className="w-5 h-5" /></button>
            <span className="bg-[#FF9900] text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">{selectedProduct.brand}</span>
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-40 object-contain my-2" />
            <h3 className="font-black text-base text-slate-900 leading-tight">{selectedProduct.name}</h3>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">₹{selectedProduct.price}</span>
              <span className="text-xs text-slate-400 line-through">₹{selectedProduct.mrp}</span>
              <span className="text-emerald-600 font-bold">{selectedProduct.discount || "-30%"} छूट</span>
            </div>

            <p className="text-slate-600 bg-slate-50 p-3 rounded-2xl border">{selectedProduct.description}</p>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }}
                className="flex-1 bg-[#0B1528] text-white font-black py-3 rounded-2xl shadow flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-4 h-4 text-[#FF9900]" /> कार्ट में डालें
              </button>
              <button 
                onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); setActiveTab('cart'); }}
                className="flex-1 bg-[#FF9900] text-slate-950 font-black py-3 rounded-2xl shadow active:scale-95 transition"
              >
                अभी खरीदें (Buy Now)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative my-8 text-xs">
            <button onClick={() => setSelectedService(null)} className="absolute right-4 top-4 text-slate-400 p-1"><X className="w-5 h-5" /></button>
            <img src={selectedService.image} alt={selectedService.name} className="w-full h-36 object-cover rounded-2xl" />
            <h3 className="font-black text-base text-slate-900 leading-tight">{selectedService.name}</h3>
            
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-blue-900">₹{selectedService.price}</span>
              <span className="text-xs text-slate-400">जांच शुल्क: ₹99</span>
            </div>

            <p className="text-slate-600 bg-slate-50 p-3 rounded-2xl border">{selectedService.description}</p>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-800 block">इस सेवा में शामिल है:</span>
              {(selectedService.includes || ["30 दिन की गारंटी", "सुरक्षा टेस्ट"]).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                setBookingService(selectedService);
                setSelectedService(null);
              }}
              className="w-full bg-[#FF9900] text-slate-950 font-black py-3 rounded-2xl shadow-lg flex items-center justify-center gap-1.5"
            >
              सर्विस बुक करें (Book Now) <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Service Booking Modal */}
      {bookingService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleConfirmServiceBooking} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setBookingService(null)} className="absolute right-4 top-4 text-slate-400 p-1"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">सर्विस बुकिंग फॉर्म</h3>
            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 text-blue-950 font-bold">
              {bookingService.name} • शुरुआती चार्ज: ₹{bookingService.price}
            </div>

            <div>
              <label className="block font-bold mb-1">सर्विस तारीख (Select Date)</label>
              <input required name="serviceDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
            </div>

            <div>
              <label className="block font-bold mb-1">समय स्लॉट (Select Slot)</label>
              <select name="slot" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50">
                <option>सुबह (9:00 AM - 1:00 PM)</option>
                <option>दोपहर (1:00 PM - 5:00 PM)</option>
                <option>शाम (5:00 PM - 8:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">पूरा पता व लैंडमार्क</label>
              <textarea required name="address" rows={2} defaultValue={savedAddresses[selectedAddressIndex]?.line} placeholder="मकान नं., फ्लैट, गली, इलाका, जयपुर" className="w-full p-2 border rounded-xl bg-slate-50 font-semibold"></textarea>
            </div>

            <button type="submit" className="w-full bg-[#FF9900] text-slate-950 font-black py-3 rounded-2xl shadow-lg">
              बुकिंग कन्फर्म करें (Confirm Booking)
            </button>
          </form>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleConfirmProductOrder} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setCheckoutModal(false)} className="absolute right-4 top-4 text-slate-400 p-1"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">डिलीवरी चेकआउट</h3>
            <div className="bg-slate-50 p-2.5 rounded-xl border text-slate-700 flex justify-between font-bold">
              <span>कुल देय राशि:</span>
              <span className="text-emerald-700 text-sm">₹{cartFinalTotal}</span>
            </div>

            <input required name="addressLine" placeholder="मकान नं., फ्लैट, गली" defaultValue={savedAddresses[selectedAddressIndex]?.line} className="w-full p-2.5 border rounded-xl bg-slate-50" />
            <div className="grid grid-cols-2 gap-2">
              <input required name="city" defaultValue="जयपुर" className="p-2 border rounded-xl bg-slate-50 font-bold" />
              <input required name="pincode" defaultValue="302020" className="p-2 border rounded-xl bg-slate-50 font-bold" />
            </div>

            <div>
              <label className="block font-bold mb-1">भुगतान का माध्यम</label>
              <select name="paymentMode" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50">
                <option value="cod">कैश ऑन डिलीवरी (Cash on Delivery)</option>
                <option value="online_upi">ऑनलाइन UPI (PhonePe / GPay)</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-[#FF9900] text-slate-950 font-black py-3 rounded-2xl shadow-lg">
              ऑर्डर कन्फर्म करें (Place Order)
            </button>
          </form>
        </div>
      )}

      {/* Notifications Modal */}
      {notificationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button onClick={() => setNotificationModal(false)} className="absolute right-4 top-4 text-slate-400 p-1"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#FF9900]" /> सूचनाएं (Notifications)
            </h3>
            <div className="divide-y max-h-60 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="py-2.5 space-y-0.5">
                  <strong className="text-slate-900 block">{n.title}</strong>
                  <p className="text-slate-500">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customer Login / Register Modal */}
      {authModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative text-xs">
            <button onClick={() => setAuthModal(false)} className="absolute right-4 top-4 text-slate-400 p-1"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-base text-center text-slate-900">
              {authMode === 'login' ? 'लॉगिन करें' : 'नया खाता बनाएं'}
            </h3>

            <div className="flex border-b border-slate-200">
              <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 font-bold ${authMode === 'login' ? 'border-b-2 border-[#FF9900] text-slate-900' : 'text-slate-400'}`}>लॉगिन</button>
              <button onClick={() => setAuthMode('register')} className={`flex-1 py-2 font-bold ${authMode === 'register' ? 'border-b-2 border-[#FF9900] text-slate-900' : 'text-slate-400'}`}>रजिस्टर</button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <input required type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="पूरा नाम" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
              )}
              <input required type="tel" maxLength={10} value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} placeholder="10 अंकों का फोन नंबर" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
              <input required type="password" maxLength={4} value={authPin} onChange={(e) => setAuthPin(e.target.value)} placeholder="4 अंकों का पिन" className="w-full p-2.5 border rounded-xl text-center tracking-widest font-black text-base bg-slate-50" />
              {authMode === 'register' && (
                <input required type="password" maxLength={4} value={authConfirmPin} onChange={(e) => setAuthConfirmPin(e.target.value)} placeholder="पिन कन्फर्म करें" className="w-full p-2 border rounded-xl text-center font-black bg-slate-50" />
              )}
              <button disabled={authLoading} type="submit" className="w-full bg-[#FF9900] text-slate-950 font-black py-3 rounded-2xl shadow">
                {authLoading ? "जांच जारी..." : authMode === 'login' ? "लॉगिन करें" : "खाता बनाएं"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Details & Photo Proof View */}
      {activeBookingDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative my-8">
            <button onClick={() => setActiveBookingDetail(null)} className="absolute right-4 top-4 text-slate-400 p-1"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-base text-slate-900">#{activeBookingDetail.bookingId} - {activeBookingDetail.serviceName}</h3>
            
            {(activeBookingDetail.beforePhoto || activeBookingDetail.afterPhoto) ? (
              <div className="grid grid-cols-2 gap-2">
                {activeBookingDetail.beforePhoto && (
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold">काम से पहले:</span>
                    <img src={activeBookingDetail.beforePhoto} alt="Before" className="h-24 w-full object-cover rounded-xl mt-0.5 border" />
                  </div>
                )}
                {activeBookingDetail.afterPhoto && (
                  <div>
                    <span className="text-[9px] text-emerald-600 block font-bold">काम के बाद:</span>
                    <img src={activeBookingDetail.afterPhoto} alt="After" className="h-24 w-full object-cover rounded-xl mt-0.5 border" />
                  </div>
                )}
              </div>
            ) : <p className="text-slate-400 italic text-center py-2">काम पूरा होने पर फोटो यहाँ दिखेगा।</p>}

            {activeBookingDetail.isBilled && (
              <div className="bg-slate-50 p-3 rounded-2xl border space-y-1">
                <div className="flex justify-between"><span>लेबर चार्ज:</span><span>₹{activeBookingDetail.labourFee}</span></div>
                <div className="flex justify-between"><span>पार्ट्स का खर्चा:</span><span>₹{activeBookingDetail.materialFee || 0}</span></div>
                <div className="flex justify-between font-black text-sm text-slate-900 border-t pt-1">
                  <span>कुल फाइनल बिल:</span><span className="text-emerald-700">₹{activeBookingDetail.finalTotal}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Payment Sheet */}
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

      {/* ==================================================================== */}
      {/* 9. BOTTOM NAVIGATION BAR (MATCHING SCREENSHOT)                      */}
      {/* ==================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 z-40 max-w-md mx-auto shadow-2xl">
        <button 
          onClick={() => setActiveTab('home')} 
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-[#FF9900]' : 'text-slate-400'}`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('categories')} 
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'categories' ? 'text-[#FF9900]' : 'text-slate-400'}`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-bold">Categories</span>
        </button>

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

        <button 
          onClick={() => setActiveTab('orders')} 
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'orders' ? 'text-[#FF9900]' : 'text-slate-400'}`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] font-bold">Orders</span>
        </button>

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

export default function App() {
  return (
    <ErrorBoundary>
      <CustomerMarketplace />
    </ErrorBoundary>
  );
}
