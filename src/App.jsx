import React, { useState, useEffect, useMemo } from 'react';
import { 
  db, ADMIN_PHONE, ADMIN_PIN, compressImage 
} from './firebase';
import { 
  collection, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { 
  Zap, Wrench, ShoppingBag, LayoutDashboard, LogIn, LogOut, 
  PhoneCall, MessageCircle, AlertTriangle, User, X, CheckCircle2, 
  Clock, Truck, Star, AlertCircle, Edit3, Trash2, PlusCircle, 
  Megaphone, Shield, Search, TrendingUp, Camera, QrCode, 
  FileText, Check, Send, RotateCcw, Lock, ChevronRight, Calendar, 
  Info, MapPin, ChevronDown, Award, Sparkles, ArrowLeft, CheckSquare, 
  Heart, ShoppingCart, Percent, Share2, HelpCircle, Package, 
  ClipboardList, Navigation, RefreshCw, Printer 
} from 'lucide-react';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // User Authentication & Role Management
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('esh_user_v2');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authLoading, setAuthLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  // Primary Navigation State
  // 'home' | 'store' | 'services' | 'cart' | 'orders' | 'account' | 'admin' | 'electrician'
  const [activeTab, setActiveTab] = useState('home');

  // Customer Marketplace States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('esh_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('esh_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [deliveryPincode, setDeliveryPincode] = useState('302020 (Jaipur)');

  // Modals
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailService, setDetailService] = useState(null);
  const [bookingStepService, setBookingStepService] = useState(null);
  const [activeOrderModal, setActiveOrderModal] = useState(null);
  const [activeBookingModal, setActiveBookingModal] = useState(null);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(null); // 'cart' | 'buy_now'

  // Admin Operational States
  const [adminSubTab, setAdminSubTab] = useState('overview'); 
  // 'overview' | 'orders' | 'bookings' | 'services' | 'products' | 'electricians' | 'marketing' | 'settings'
  const [orderFilter, setOrderFilter] = useState('all');
  const [editItem, setEditItem] = useState(null);
  const [showAddService, setShowAddService] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddElectrician, setShowAddElectrician] = useState(false);
  const [assignTechBooking, setAssignTechBooking] = useState(null);
  const [adminBillModal, setAdminBillModal] = useState(null);

  // Firestore Realtime Collections
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [electricians, setElectricians] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [broadcast, setBroadcast] = useState({ text: "दिवाली व समर स्पेशल: पंखा रिपेयरिंग पर 20% की छूट!", active: true });
  const [paymentConfig, setPaymentConfig] = useState({ upiId: "6367626276@upi", upiName: "Electrical Hub" });

  // 1. SPLASH SCREEN LIFECYCLE
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Save Cart & Wishlist to LocalStorage
  useEffect(() => {
    localStorage.setItem('esh_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('esh_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // 2. REAL-TIME FIRESTORE DATA STREAMS
  useEffect(() => {
    // A. Listen Products
    const unsubProducts = onSnapshot(collection(db, "products"), async (snap) => {
      if (snap.empty) {
        const seedProducts = [
          { name: "Polycab 2.5 Sq mm FR Wire (90m, Red)", nameHi: "पॉलीकैब 2.5 वर्ग मिमी वायर (लाल)", brand: "Polycab", mrp: 2450, price: 1899, stock: 45, category: "wires", rating: 4.9, reviewsCount: 342, description: "100% शुद्ध कॉपर वायर, आग प्रतिरोधी इंसुलेशन, IS/IEC 60898 प्रमाणित।", specs: { "Conductor": "Electrolytic Bare Copper", "Voltage": "1100V", "Length": "90m" } },
          { name: "Havells 32A Double Pole C-Curve MCB", nameHi: "हैवेल्स 32A डबल पोल एमसीबी", brand: "Havells", mrp: 680, price: 520, stock: 80, category: "switchgear", rating: 4.8, reviewsCount: 198, description: "10kA ब्रेकिंग क्षमता, शॉर्ट सर्किट और ओवरलोड सुरक्षा।", specs: { "Poles": "Double Pole", "Rating": "32 Amp", "Standard": "IS/IEC 60898-1" } },
          { name: "Anchor Roma 6A Modular Switch (Pack of 10)", nameHi: "एंकर रोमा 6A मॉड्युलर स्विच", brand: "Anchor", mrp: 480, price: 310, stock: 150, category: "switches", rating: 4.7, reviewsCount: 520, description: "सिल्की स्मूथ क्लिक, हाई ग्रेड पॉलीकार्बोनेट मटेरियल।", specs: { "Current": "6A", "Color": "White", "Warranty": "5 Years" } },
          { name: "Luminous Zelio+ 1100 Pure Sine Wave Inverter", nameHi: "ल्यूमिनस जेलियो+ 1100 इन्वर्टर", brand: "Luminous", mrp: 8500, price: 6890, stock: 18, category: "inverters", rating: 4.9, reviewsCount: 275, description: "डिजिटल डिस्प्ले के साथ स्मार्ट इन्वर्टर, इन्वर्टर बैटरी सुरक्षा तकनीक।", specs: { "Capacity": "900VA / 12V", "Warranty": "24 Months" } }
        ];
        for (const p of seedProducts) await addDoc(collection(db, "products"), p);
      } else {
        setProducts(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    });

    // B. Listen Services
    const unsubServices = onSnapshot(collection(db, "services"), async (snap) => {
      if (snap.empty) {
        const seedServices = [
          { name: "Ceiling Fan Repair & Bearing Replacement", nameHi: "सीलिंग पंखा रिपेयर व बैरिंग बदलाव", category: "fans", price: 199, mrp: 299, visiting: 99, duration: "45 mins", rating: 4.8, bookedCount: "2,400+", description: "पंखे की आवाज, कैपेसिटर बदलाव, जाम बैरिंग व स्पीड समस्या का संपूर्ण समाधान।", includes: ["फॉल्ट डायग्नोसिस", "कैपेसिटर जांच", "30 दिन की रिपेयर गारंटी", "वाइब्रेशन व नॉइज़ फिक्स"] },
          { name: "Complete House Short Circuit & Fault Detection", nameHi: "शॉर्ट सर्किट व फॉल्ट टेस्टिंग", category: "wiring", price: 399, mrp: 599, visiting: 149, duration: "60 mins", rating: 4.9, bookedCount: "1,120+", description: "एमसीबी ट्रिपिंग, न्यूट्रल लीकेज व हिडन वायरिंग स्पार्किंग की डिजिटल मल्टीमीटर जांच।", includes: ["मल्टीमीटर पॉइंट टेस्टिंग", "लोड बैलेंसिंग ऑडिट", "अर्थिंग टेस्टर जांच", "30 दिन पोस्ट-सर्विस गारंटी"] },
          { name: "Inverter and Dual Battery Setup", nameHi: "इन्वर्टर व डबल बैटरी इंस्टालेशन", category: "inverters", price: 499, mrp: 750, visiting: 149, duration: "90 mins", rating: 4.9, bookedCount: "780+", description: "घर के मेन डीबी लोड के साथ बाईपास स्विच, ट्रॉली व हैवी लग क्रिम्पिंग कनेक्शन।", includes: ["हैवी केबल क्रिम्पिंग", "इन्वर्टर बाईपास कॉन्फ़िगरेशन", "बैटरी वाटर व वोल्टेज टेस्ट"] },
          { name: "Distribution Board (DB) & MCB Replacement", nameHi: "एमसीबी बॉक्स व डीपी स्विच रिप्लेसमेंट", category: "switchgear", price: 299, mrp: 450, visiting: 99, duration: "45 mins", rating: 4.7, bookedCount: "1,650+", description: "पुराने जल चुके फ्यूज को आधुनिक सुरक्षा एमसीबी और डीपी आइसोलेटर में बदलना।", includes: ["फेस न्यूट्रल सेपरेशन", "सुरक्षित अर्थिंग टर्मिनल", "लोड टेस्ट"] }
        ];
        for (const s of seedServices) await addDoc(collection(db, "services"), s);
      } else {
        setServices(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    });

    // C. Listen Product Orders
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const list = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(list);
    });

    // D. Listen Service Bookings
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      const list = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setBookings(list);
    });

    // E. Listen Electricians
    const unsubElectricians = onSnapshot(collection(db, "electricians"), async (snap) => {
      if (snap.empty) {
        const defaultTech = { name: "विनोद कुमार (वरिष्ठ तकनीशियन)", phone: "9829012345", pin: "1122", rating: 4.9, jobsDone: 142, active: true };
        await addDoc(collection(db, "electricians"), defaultTech);
      } else {
        setElectricians(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    });

    // F. Listen Settings & Banners
    const unsubBroadcast = onSnapshot(doc(db, "settings", "broadcast"), (snap) => {
      if (snap.exists()) setBroadcast(snap.data());
    });

    const unsubPayment = onSnapshot(doc(db, "settings", "payment"), (snap) => {
      if (snap.exists()) setPaymentConfig(snap.data());
    });

    return () => {
      unsubProducts();
      unsubServices();
      unsubOrders();
      unsubBookings();
      unsubElectricians();
      unsubBroadcast();
      unsubPayment();
    };
  }, []);

  // 3. EXECUTIVE ANALYTICS CALCULATION
  const totalRevenue = useMemo(() => {
    const ordersRev = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);
    const bookingsRev = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (Number(b.finalTotal || b.price) || 0), 0);
    return ordersRev + bookingsRev;
  }, [orders, bookings]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);
  const cartDeliveryFee = cartSubtotal > 999 || cartSubtotal === 0 ? 0 : 70;
  const cartTotal = cartSubtotal + cartDeliveryFee;

  // 4. AUTHENTICATION HANDLERS
  const handleAuth = async (e) => {
    e.preventDefault();
    if (phoneInput.length !== 10 || pinInput.length !== 4) {
      return alert("कृपया 10 अंकों का फोन नंबर व 4 अंकों का पिन दर्ज करें!");
    }

    setAuthLoading(true);
    const cleanPhone = phoneInput.trim();

    // Check Master Admin
    if (cleanPhone === ADMIN_PHONE && pinInput === ADMIN_PIN) {
      const adminData = { name: "मास्टर एडमिन", phone: ADMIN_PHONE, role: 'admin' };
      setUser(adminData);
      localStorage.setItem('esh_user_v2', JSON.stringify(adminData));
      setActiveTab('admin');
      setAuthLoading(false);
      return;
    }

    // Check Electrician Login
    const matchedElectrician = electricians.find(tech => tech.phone === cleanPhone && tech.pin === pinInput);
    if (matchedElectrician) {
      const techUser = { ...matchedElectrician, role: 'electrician' };
      setUser(techUser);
      localStorage.setItem('esh_user_v2', JSON.stringify(techUser));
      setActiveTab('electrician');
      setAuthLoading(false);
      return;
    }

    // Customer Authentication against Firestore
    try {
      const userRef = doc(db, "users", cleanPhone);
      const userSnap = await getDoc(userRef);

      if (authMode === 'register') {
        if (!nameInput.trim()) {
          setAuthLoading(false);
          return alert("कृपया अपना पूरा नाम लिखें!");
        }
        if (pinInput !== confirmPinInput) {
          setAuthLoading(false);
          return alert("दोनों पिन समान होने चाहिए!");
        }
        if (userSnap.exists()) {
          setAuthLoading(false);
          setAuthMode('login');
          return alert("यह नंबर पहले से रजिस्टर्ड है! कृपया सीधे लॉगिन करें।");
        }

        const newUser = {
          name: nameInput.trim(),
          phone: cleanPhone,
          pin: pinInput.trim(),
          role: 'customer',
          createdAt: Date.now()
        };
        await setDoc(userRef, newUser);
        setUser(newUser);
        localStorage.setItem('esh_user_v2', JSON.stringify(newUser));
        alert(`स्वागत है ${newUser.name}! आपका अकाउंट तैयार है।`);
      } else {
        if (!userSnap.exists()) {
          setAuthLoading(false);
          setAuthMode('register');
          return alert("खाता नहीं मिला! कृपया पहले नया खाता बनाएं।");
        }
        const data = userSnap.data();
        if (data.pin !== pinInput.trim()) {
          setAuthLoading(false);
          return alert("गलत पिन! कृपया सही पिन दर्ज करें।");
        }
        setUser(data);
        localStorage.setItem('esh_user_v2', JSON.stringify(data));
      }
    } catch (err) {
      alert("प्रमाणीकरण त्रुटि: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('esh_user_v2');
    setActiveTab('home');
  };

  // 5. CART & WISHLIST ACTIONS
  const addToCart = (product, quantity = 1) => {
    const existingIndex = cart.findIndex(item => item.docId === product.docId);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    alert(`"${product.name}" कार्ट में जोड़ दिया गया है!`);
  };

  const updateCartQty = (docId, delta) => {
    const updated = cart.map(item => {
      if (item.docId === docId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    setCart(updated);
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.some(item => item.docId === product.docId);
    if (exists) {
      setWishlist(wishlist.filter(item => item.docId !== product.docId));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  // 6. CHECKOUT & ORDER SUBMISSION
  const handleProductCheckout = async (e) => {
    e.preventDefault();
    if (!cart.length) return alert("कार्ट खाली है!");
    const form = e.target;
    const orderNumber = "OD-" + Math.floor(100000 + Math.random() * 900000);

    const orderData = {
      orderNumber,
      customerPhone: user.phone,
      customerName: user.name,
      items: cart,
      address: {
        line1: form.addressLine.value,
        city: form.city.value,
        pincode: form.pincode.value
      },
      subtotal: cartSubtotal,
      deliveryCharge: cartDeliveryFee,
      finalAmount: cartTotal,
      paymentMode: form.paymentMode.value, // 'cod' | 'online_upi'
      paymentStatus: 'pending',
      orderStatus: 'Placed', // Placed -> Confirmed -> Shipped -> Out for Delivery -> Delivered
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "orders"), orderData);
      setCart([]);
      setCheckoutModal(null);
      setActiveTab('orders');
      alert(`🎉 ऑर्डर सफलतापूर्वक दर्ज हुआ! ऑर्डर क्रमांक: #${orderNumber}`);
    } catch (err) {
      alert("ऑर्डर सबमिट एरर: " + err.message);
    }
  };

  // 7. SERVICE BOOKING SUBMISSION
  const handleServiceBooking = async (e) => {
    e.preventDefault();
    const form = e.target;
    const bookingNumber = "SRV-" + Math.floor(100000 + Math.random() * 900000);

    const bookingData = {
      bookingId: bookingNumber,
      serviceId: bookingStepService.docId,
      serviceName: bookingStepService.name,
      price: bookingStepService.price,
      customerName: user.name,
      customerPhone: user.phone,
      slot: form.slot.value,
      scheduledDate: form.serviceDate.value,
      address: form.address.value,
      status: "Confirmed", // Confirmed -> Electrician Assigned -> On The Way -> Work Started -> Completed
      paymentStatus: "unpaid",
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "bookings"), bookingData);
      setBookingStepService(null);
      setActiveTab('orders');
      alert(`🎉 इलेक्ट्रिकल सर्विस बुक हो गई है! बुकिंग आईडी: #${bookingNumber}`);
    } catch (err) {
      alert("बुकिंग एरर: " + err.message);
    }
  };

  // =========================================================================
  // VIEW 1: SPLASH SCREEN
  // =========================================================================
  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0F1111] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-[#FF9900] p-6 rounded-3xl shadow-2xl animate-bounce mb-6">
          <Zap className="w-16 h-16 text-[#0F1111] fill-[#0F1111]" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">विद्युत सेवा हब</h1>
        <p className="text-[#FF9900] font-bold tracking-widest text-xs uppercase mt-1">Electrical Hub • Certified Marketplace</p>
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-300 bg-white/10 px-4 py-2 rounded-full border border-white/20">
          <Shield className="w-4 h-4 text-[#FF9900]" />
          <span>Government Certified Electricians & 100% Genuine Store</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATION ENFORCEMENT (REGISTER / LOGIN)
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-[#131921] text-white p-6 text-center">
            <div className="w-12 h-12 bg-[#FF9900] rounded-2xl flex items-center justify-center mx-auto mb-2 text-[#0F1111] font-black">
              <Zap className="w-7 h-7 fill-[#0F1111]" />
            </div>
            <h2 className="text-xl font-black">विद्युत सेवा हब</h2>
            <p className="text-xs text-amber-300 font-medium">India's Verified Electrical Hub</p>
          </div>

          <div className="flex border-b border-slate-200 bg-slate-50">
            <button 
              onClick={() => setAuthMode('login')} 
              className={`flex-1 py-3 text-xs font-black transition ${authMode === 'login' ? 'bg-white text-blue-900 border-b-2 border-blue-900' : 'text-slate-400'}`}
            >
              लॉगिन (Login)
            </button>
            <button 
              onClick={() => setAuthMode('register')} 
              className={`flex-1 py-3 text-xs font-black transition ${authMode === 'register' ? 'bg-white text-blue-900 border-b-2 border-blue-900' : 'text-slate-400'}`}
            >
              नया खाता (Register)
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleAuth} className="space-y-3.5 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">पूरा नाम (Full Name)</label>
                  <input 
                    required 
                    type="text" 
                    value={nameInput} 
                    onChange={(e) => setNameInput(e.target.value)} 
                    placeholder="जैसे: राहुल शर्मा" 
                    className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" 
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">10 अंकों का मोबाइल नंबर</label>
                <input 
                  required 
                  type="tel" 
                  maxLength={10} 
                  value={phoneInput} 
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))} 
                  placeholder="मोबाइल नंबर दर्ज करें" 
                  className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" 
                />
                <span className="text-[10px] text-slate-400 mt-1 block">एडमिन लॉगिन: <strong>6367626276</strong></span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">4-अंकों का गुप्त पिन (PIN)</label>
                <input 
                  required 
                  type="password" 
                  maxLength={4} 
                  value={pinInput} 
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} 
                  placeholder="****" 
                  className="w-full p-2.5 border rounded-xl text-center tracking-widest font-black text-base bg-slate-50" 
                />
                <span className="text-[10px] text-slate-400 mt-1 block">एडमिन पिन: <strong>2026</strong></span>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">पिन कन्फर्म करें</label>
                  <input 
                    required 
                    type="password" 
                    maxLength={4} 
                    value={confirmPinInput} 
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))} 
                    placeholder="****" 
                    className="w-full p-2.5 border rounded-xl text-center tracking-widest font-black text-base bg-slate-50" 
                  />
                </div>
              )}

              <button 
                disabled={authLoading} 
                type="submit" 
                className="w-full bg-[#131921] hover:bg-[#0F1111] text-[#FF9900] py-3 rounded-xl font-black text-xs shadow-lg transition active:scale-95"
              >
                {authLoading ? "जांच हो रही है..." : authMode === 'login' ? "लॉगिन करें (Sign In)" : "नया खाता बनाएं (Register)"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: FULL PRODUCTION APPLICATION SHELL
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans">
      
      {/* 1. AMAZON SLATE DUAL HEADER */}
      <header className="bg-[#131921] text-white shadow-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-[#FF9900] p-1.5 rounded-xl text-[#0F1111] shadow">
              <Zap className="w-5 h-5 fill-[#0F1111]" />
            </div>
            <div>
              <span className="font-black text-base block leading-none tracking-tight">विद्युत सेवा हब</span>
              <span className="text-[9px] text-[#FF9900] font-bold uppercase tracking-wider">Electrical Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Wishlist Icon */}
            <button onClick={() => setActiveTab('store')} className="relative p-1 text-slate-300 hover:text-white">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button onClick={() => setActiveTab('cart')} className="relative p-1 text-slate-300 hover:text-white flex items-center gap-1">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold text-xs text-[#FF9900]">₹{cartSubtotal}</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#FF9900] text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* User Profile Badge */}
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-black flex items-center gap-1 ${user.role === 'admin' ? 'bg-[#FF9900] text-slate-950' : 'bg-emerald-600 text-white'}`}>
              <User className="w-3 h-3" />
              {user.role === 'admin' ? 'MASTER ADMIN' : user.role === 'electrician' ? 'TECHNICIAN' : user.name.split(' ')[0]}
            </span>

            <button onClick={handleLogout} title="लॉगआउट" className="text-slate-400 hover:text-white p-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Amazon Pincode & Express Delivery Strip */}
        <div className="bg-[#232F3E] text-slate-200 px-4 py-1.5 text-[11px] flex items-center justify-between border-t border-slate-700">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#FF9900] flex-shrink-0" />
            <span className="truncate">डिलीवरी व सर्विस: <strong>{deliveryPincode}</strong></span>
            <ChevronDown className="w-3 h-3 text-slate-400 cursor-pointer" onClick={() => {
              const pin = prompt("अपना डिलीवरी पिनकोड दर्ज करें:", "302020");
              if (pin) setDeliveryPincode(`${pin} (सत्यापित)`);
            }} />
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex-shrink-0">● 45 मिनट एक्सप्रेस सर्विस</span>
        </div>
      </header>

      {/* Promotional Broadcast Ribbon */}
      {broadcast.active && broadcast.text && (
        <div className="bg-[#FF9900] text-slate-950 px-4 py-2 font-black text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <Megaphone className="w-4 h-4 flex-shrink-0 fill-slate-950 animate-bounce" />
            <span className="truncate">{broadcast.text}</span>
          </div>
          <span className="text-[10px] uppercase bg-[#131921] text-white px-2 py-0.5 rounded-full font-bold ml-2">ऑफर</span>
        </div>
      )}

      {/* Main Responsive Body View */}
      <main className="max-w-4xl mx-auto p-4 space-y-5">
        
        {/* SOS Emergency Assistance */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-3.5 rounded-2xl shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-xl animate-pulse">
              <AlertTriangle className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-sm">24x7 इमरजेंसी शॉर्ट सर्किट व बिजली फॉल्ट?</h3>
              <p className="text-[11px] text-red-100">15 मिनट में ऑन-ड्यूटी इलेक्ट्रीशियन सहायता</p>
            </div>
          </div>
          <a href={`tel:${ADMIN_PHONE}`} className="bg-[#FF9900] text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow active:scale-95 transition">
            SOS कॉल
          </a>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: CUSTOMER HOME MARKETPLACE                              */}
        {/* ============================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-5">
            
            {/* Global Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="सर्च करें: पंखा रिपेयर, 2.5mm वायर, इन्वर्टर, एमसीबी, स्विच..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#131921]" 
              />
            </div>

            {/* Urban Company Style Circular Category Navigation */}
            <div className="flex gap-3 overflow-x-auto py-1 no-scrollbar">
              {[
                { id: 'all', name: 'सभी' },
                { id: 'fans', name: 'पंखा व कूलर' },
                { id: 'wiring', name: 'वायरिंग' },
                { id: 'inverters', name: 'इन्वर्टर' },
                { id: 'switchgear', name: 'स्विच व MCB' },
                { id: 'wires', name: 'तार व केबल' }
              ].map((c) => (
                <button 
                  key={c.id} 
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === c.id ? 'bg-[#131921] text-[#FF9900] shadow' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Amazon Banner Carousel */}
            <div className="bg-gradient-to-r from-[#131921] via-[#232F3E] to-[#131921] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
              <span className="bg-[#FF9900] text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ★ 100% वेरिफाइड इलेक्ट्रीशियन सेवा
              </span>
              <h1 className="text-xl md:text-2xl font-black mt-2 leading-tight">
                घर बैठे इलेक्ट्रीशियन बुक करें और ओरिजिनल सामान मंगाएं
              </h1>
              <p className="text-xs text-slate-300 mt-1">शॉर्ट सर्किट, पंखा, मोटर, इन्वर्टर व वायरिंग रिपेयर • 30 दिन वारंटी</p>
              
              <div className="flex gap-2.5 mt-4">
                <a href={`tel:${ADMIN_PHONE}`} className="bg-[#FF9900] text-slate-950 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1 shadow">
                  <PhoneCall className="w-3.5 h-3.5" /> कॉल: {ADMIN_PHONE}
                </a>
                <a href={`https://wa.me/91${ADMIN_PHONE}?text=नमस्ते,%20मुझे%20इलेक्ट्रिकल%20सर्विस%20चाहिए`} className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp चैट
                </a>
              </div>
            </div>

            {/* Popular Electrical Services (Urban Company Style) */}
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-black text-base text-slate-900">लोकप्रिय विद्युत सेवाएं (Doorstep Services)</h2>
                  <p className="text-xs text-slate-500">फिक्स रेट कार्ड • 30 दिन की रिपेयर गारंटी</p>
                </div>
                <button onClick={() => setActiveTab('services')} className="text-xs font-bold text-blue-900 flex items-center gap-0.5">
                  सभी देखें <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services
                  .filter(s => selectedCategory === 'all' || s.category === selectedCategory)
                  .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((s) => (
                    <div key={s.docId} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center hover:shadow-md transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            ★ {s.rating || "4.8"}
                          </span>
                          <span className="text-[10px] text-slate-400">({s.bookedCount || "1,200+"} बुकिंग्स)</span>
                        </div>
                        <h3 className="font-bold text-xs text-slate-900">{s.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-slate-900">₹{s.price}</span>
                          <span className="text-xs text-slate-400 line-through">₹{s.mrp || s.price + 100}</span>
                          <span className="text-[10px] text-emerald-600 font-bold">विजिट: ₹{s.visiting || 99}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => setDetailService(s)} 
                        className="bg-[#131921] hover:bg-[#0F1111] text-[#FF9900] font-black text-xs px-3.5 py-2.5 rounded-2xl shadow active:scale-95 transition flex items-center gap-1"
                      >
                        विवरण व बुक <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            </section>

            {/* Electrical Store Products (Amazon E-Commerce Card Style) */}
            <section className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-black text-base text-slate-900">इलेक्ट्रिकल सामान स्टोर (Original Store)</h2>
                  <p className="text-xs text-slate-500">100% ओरिजिनल पॉलीकैब, हैवल्स व एंकर उत्पाद</p>
                </div>
                <button onClick={() => setActiveTab('store')} className="text-xs font-bold text-blue-900 flex items-center gap-0.5">
                  स्टोर खोलें <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products
                  .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => (
                    <div key={p.docId} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.brand}</span>
                          <button onClick={() => toggleWishlist(p)} className="p-1">
                            <Heart className={`w-4 h-4 ${wishlist.some(item => item.docId === p.docId) ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
                          </button>
                        </div>
                        <h3 className="font-bold text-xs text-slate-900 line-clamp-2">{p.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-slate-900">₹{p.price}</span>
                          {p.mrp && <span className="text-xs text-slate-400 line-through">₹{p.mrp}</span>}
                          {p.mrp && (
                            <span className="text-[10px] font-bold text-emerald-600">
                              {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% छूट
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => setDetailProduct(p)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs"
                        >
                          विवरण
                        </button>
                        <button 
                          onClick={() => addToCart(p)}
                          className="flex-1 bg-[#FF9900] hover:bg-[#E88B00] text-slate-950 font-black py-2 rounded-xl text-xs shadow flex items-center justify-center gap-1"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> कार्ट
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SHOPPING CART & CHECKOUT                                */}
        {/* ============================================================== */}
        {activeTab === 'cart' && (
          <div className="space-y-4">
            <h2 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#FF9900]" /> शॉपिंग कार्ट ({cart.length} उत्पाद)
            </h2>

            {cart.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center border space-y-3">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-bold">आपकी कार्ट अभी खाली है!</p>
                <button onClick={() => setActiveTab('home')} className="bg-[#131921] text-[#FF9900] font-bold px-5 py-2.5 rounded-xl text-xs">
                  सामान खरीदें
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  {cart.map((item) => (
                    <div key={item.docId} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{item.brand}</span>
                        <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                        <div className="text-sm font-black text-slate-900 mt-1">₹{item.price * item.quantity}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => updateCartQty(item.docId, -1)} className="w-7 h-7 bg-slate-100 rounded-lg font-black text-sm flex items-center justify-center">-</button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.docId, 1)} className="w-7 h-7 bg-slate-100 rounded-lg font-black text-sm flex items-center justify-center">+</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Price Breakdown */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3 shadow-sm h-fit">
                  <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider">मूल्य विवरण</h3>
                  <div className="text-xs space-y-2 border-b pb-3">
                    <div className="flex justify-between text-slate-600">
                      <span>उत्पाद मूल्य:</span>
                      <span>₹{cartSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>डिलीवरी शुल्क:</span>
                      <span>{cartDeliveryFee === 0 ? <strong className="text-emerald-600">फ्री</strong> : `₹${cartDeliveryFee}`}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center font-black text-sm text-slate-900 pt-1">
                    <span>कुल देय राशि:</span>
                    <span className="text-emerald-700 text-base">₹{cartTotal}</span>
                  </div>
                  <button 
                    onClick={() => setCheckoutModal('cart')}
                    className="w-full bg-[#FF9900] hover:bg-[#E88B00] text-slate-950 font-black py-3 rounded-2xl text-xs shadow-lg"
                  >
                    चेकआउट करें (Proceed to Buy)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DUAL ORDER & SERVICE TRACKING (AMAZON PROGRESS BAR)     */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <h2 className="font-black text-lg text-slate-900">मेरे आर्डर व सर्विस ट्रैकिंग</h2>

            {/* Bookings Section */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">इलेक्ट्रिकल सर्विस बुकिंग्स ({bookings.filter(b => b.customerPhone === user.phone).length})</h3>
              {bookings.filter(b => b.customerPhone === user.phone).map((b) => (
                <div key={b.docId} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-blue-900">#{b.bookingId}</span>
                      <h4 className="font-black text-sm text-slate-900 mt-0.5">{b.serviceName}</h4>
                      <p className="text-[11px] text-slate-500">स्लॉट: {b.slot} | तारीख: {b.scheduledDate || 'आज'}</p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${
                      b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  {/* Amazon Step Tracker */}
                  <div className="bg-slate-50 p-3 rounded-2xl border space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-blue-900 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> स्वीकृत</span>
                      <span className={b.status === 'On The Way' || b.status === 'Completed' ? 'text-purple-700 flex items-center gap-1' : 'text-slate-300'}>
                        <Truck className="w-3.5 h-3.5" /> रास्ते में
                      </span>
                      <span className={b.status === 'Completed' ? 'text-emerald-600 flex items-center gap-1' : 'text-slate-300'}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> पूरा
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${
                        b.status === 'Confirmed' ? 'w-1/3 bg-blue-600' :
                        b.status === 'On The Way' ? 'w-2/3 bg-purple-600' : 'w-full bg-emerald-600'
                      }`} />
                    </div>
                  </div>

                  {/* Photo Proof & Bill Trigger */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveBookingModal(b)} 
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-900" /> फोटो प्रूफ व रसीद
                    </button>
                    {b.isBilled && b.paymentStatus !== 'paid' && (
                      <button 
                        onClick={() => setCustomerPayBooking(b)} 
                        className="flex-1 bg-emerald-600 text-white font-black py-2 rounded-xl text-xs shadow flex items-center justify-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" /> बिल भुगतान (₹{b.finalTotal})
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Product Orders Section */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">सामान ऑर्डर्स ({orders.filter(o => o.customerPhone === user.phone).length})</h3>
              {orders.filter(o => o.customerPhone === user.phone).map((o) => (
                <div key={o.docId} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-blue-900">#{o.orderNumber}</span>
                      <h4 className="font-black text-sm text-slate-900 mt-0.5">{o.items.length} उत्पाद (₹{o.finalAmount})</h4>
                      <p className="text-[11px] text-slate-500">डिलीवरी पता: {o.address.line1}, {o.address.city}</p>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                      {o.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: ELECTRICIAN / TECHNICIAN PORTAL                        */}
        {/* ============================================================== */}
        {activeTab === 'electrician' && user.role === 'electrician' && (
          <div className="space-y-4">
            <div className="bg-[#131921] text-white p-5 rounded-3xl shadow-lg border border-[#FF9900]/40 flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-[#FF9900] text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">On Duty Tech</span>
                <h2 className="text-lg font-black mt-1">{user.name}</h2>
                <p className="text-xs text-slate-300">हेल्पलाइन: +91 {ADMIN_PHONE}</p>
              </div>
              <button onClick={() => setActiveTab('home')} className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-xl">
                ग्राहक दृश्य
              </button>
            </div>

            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">आपको सौंपे गए काम (Assigned Tickets)</h3>
            <div className="space-y-3">
              {bookings.filter(b => b.assignedToPhone === user.phone || b.status === 'Confirmed' || b.status === 'On The Way').map((b) => (
                <div key={b.docId} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-black text-blue-900">#{b.bookingId}</span>
                      <h4 className="font-bold text-sm text-slate-900 mt-0.5">{b.serviceName}</h4>
                      <p className="text-slate-600">👤 {b.customerName} (📞 {b.customerPhone})</p>
                      <p className="text-slate-600">📍 {b.address}</p>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-800">{b.status}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <a href={`tel:${b.customerPhone}`} className="flex-1 bg-[#131921] text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1 text-center">
                      <PhoneCall className="w-3.5 h-3.5 text-[#FF9900]" /> ग्राहक को कॉल करें
                    </a>
                    <button 
                      onClick={() => {
                        setAdminBillModal(b);
                        setLabourFee(b.price || 199);
                      }}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1 shadow"
                    >
                      <Camera className="w-3.5 h-3.5" /> फोटो व काम पूरा करें
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: 🏆 EXECUTIVE MASTER ADMIN CONTROL CENTER                */}
        {/* ============================================================== */}
        {activeTab === 'admin' && user.role === 'admin' && (
          <div className="space-y-4">
            
            {/* Admin Header */}
            <div className="bg-gradient-to-br from-[#131921] via-[#232F3E] to-[#131921] text-white p-5 rounded-3xl shadow-xl border border-yellow-400/30 flex justify-between items-start">
              <div>
                <span className="bg-[#FF9900] text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Executive Master Portal</span>
                <h2 className="text-xl font-black mt-1">सेंट्रल मार्केटप्लेस एडमिन</h2>
                <p className="text-xs text-blue-200">सिस्टम नियंत्रण: +91 {ADMIN_PHONE}</p>
              </div>
              <button onClick={() => setActiveTab('home')} className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-xl font-bold border border-white/20">
                कस्टमर व्यू
              </button>
            </div>

            {/* 4 Professional KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">कुल प्राप्त रेवेन्यू</span>
                <div className="text-xl font-black text-slate-900 mt-1">₹{totalRevenue}</div>
                <span className="text-[10px] text-emerald-600 font-bold">सत्यापित भुगतान</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">सर्विस बुकिंग्स</span>
                <div className="text-xl font-black text-blue-900 mt-1">{bookings.length}</div>
                <span className="text-[10px] text-blue-700 font-bold">लाइव टिकट्स</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">सामान ऑर्डर्स</span>
                <div className="text-xl font-black text-emerald-700 mt-1">{orders.length}</div>
                <span className="text-[10px] text-slate-500 font-bold">स्टोर बिक्री</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">तकनीशियन दल</span>
                <div className="text-xl font-black text-purple-900 mt-1">{electricians.length}</div>
                <span className="text-[10px] text-purple-700 font-bold">वेरिफाइड इलेक्ट्रीशियन</span>
              </div>
            </div>

            {/* Admin Subtabs Navigation */}
            <div className="bg-white p-1 rounded-2xl border flex justify-between shadow-sm overflow-x-auto text-[11px] font-bold">
              <button onClick={() => setAdminSubTab('overview')} className={`flex-1 py-2 px-2.5 rounded-xl whitespace-nowrap ${adminSubTab === 'overview' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>📋 बुकिंग्स ({bookings.length})</button>
              <button onClick={() => setAdminSubTab('orders')} className={`flex-1 py-2 px-2.5 rounded-xl whitespace-nowrap ${adminSubTab === 'orders' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>📦 ऑर्डर्स ({orders.length})</button>
              <button onClick={() => setAdminSubTab('services')} className={`flex-1 py-2 px-2.5 rounded-xl whitespace-nowrap ${adminSubTab === 'services' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>⚡ सर्विसेज ({services.length})</button>
              <button onClick={() => setAdminSubTab('products')} className={`flex-1 py-2 px-2.5 rounded-xl whitespace-nowrap ${adminSubTab === 'products' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>🛍️ प्रोडक्ट्स ({products.length})</button>
              <button onClick={() => setAdminSubTab('electricians')} className={`flex-1 py-2 px-2.5 rounded-xl whitespace-nowrap ${adminSubTab === 'electricians' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>👷 इलेक्ट्रीशियन</button>
              <button onClick={() => setAdminSubTab('marketing')} className={`flex-1 py-2 px-2.5 rounded-xl whitespace-nowrap ${adminSubTab === 'marketing' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>📢 मार्केटिंग</button>
            </div>

            {/* SUBTAB 1: LIVE BOOKINGS WITH PHOTO UPLOAD & REOPEN */}
            {adminSubTab === 'overview' && (
              <div className="bg-white p-4 rounded-3xl border space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xs text-slate-800">लाइव सर्विस टिकट्स (आर्डर पर क्लिक करके फुल इंस्पेक्ट करें)</h3>
                  <span className="text-[10px] text-blue-900 font-bold">क्लिक = फुल व्यू</span>
                </div>

                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.docId} className="p-3.5 bg-slate-50 border rounded-2xl space-y-2 text-xs">
                      <div onClick={() => setActiveBookingModal(b)} className="flex justify-between items-start cursor-pointer hover:bg-slate-100 p-1 rounded-xl transition">
                        <div>
                          <span className="font-black text-blue-900">#{b.bookingId}</span> • <strong>{b.customerName}</strong>
                          <div className="text-slate-800 font-bold mt-0.5">{b.serviceName}</div>
                          <div className="text-[11px] text-slate-500">📞 {b.customerPhone} | 📍 {b.address}</div>
                          {b.assignedToName && <div className="text-[10px] text-purple-700 font-bold mt-0.5">👷 नियुक्त तकनीशियन: {b.assignedToName}</div>}
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black block ${
                            b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {b.status}
                          </span>
                          <span className={`text-[9px] font-bold mt-1 inline-block ${b.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {b.paymentStatus === 'paid' ? '✔ पेड' : '⏳ अनपेड'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 pt-2 border-t flex-wrap items-center">
                        <button onClick={() => updateDoc(doc(db, "bookings", b.docId), { status: "Confirmed" })} className="bg-blue-800 text-white text-[10px] px-2.5 py-1 rounded font-bold">
                          स्वीकारें
                        </button>
                        
                        {/* Assign Electrician */}
                        <button 
                          onClick={() => setAssignTechBooking(b)}
                          className="bg-purple-700 text-white text-[10px] px-2.5 py-1 rounded font-bold flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> तकनीशियन नियुक्त करें
                        </button>

                        {/* Bill & Work Proof Modal Trigger */}
                        {b.isBilled && b.status === 'Completed' ? (
                          <div className="flex items-center gap-1">
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                              <Lock className="w-3 h-3" /> बिल लॉक है
                            </span>
                            <button 
                              onClick={() => handleReopenService(b)}
                              className="bg-[#FF9900] text-slate-950 font-black text-[10px] px-2 py-1 rounded flex items-center gap-1 shadow"
                            >
                              <RotateCcw className="w-3 h-3" /> री-ओपन
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setAdminBillModal(b);
                              setLabourFee(b.labourFee || b.price || 199);
                              setMaterialFee(b.materialFee || 0);
                              setVisitFee(b.visitFee || 99);
                              setBeforePhoto(b.beforePhoto || '');
                              setAfterPhoto(b.afterPhoto || '');
                              setWorkDetails(b.workDetails || '');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2.5 py-1 rounded font-bold flex items-center gap-1 shadow"
                          >
                            <Camera className="w-3 h-3 text-yellow-300" /> फोटो व बिल जारी करें
                          </button>
                        )}

                        <button 
                          onClick={() => handleTogglePaymentStatus(b, b.paymentStatus === 'paid' ? 'unpaid' : 'paid')}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded ml-auto ${
                            b.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-600 text-white'
                          }`}
                        >
                          {b.paymentStatus === 'paid' ? '✔ पेड (Mark Unpaid)' : 'पेमेंट प्राप्त हुआ मार्क करें'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 2: PRODUCT ORDERS MANAGEMENT */}
            {adminSubTab === 'orders' && (
              <div className="bg-white p-4 rounded-3xl border space-y-3 shadow-sm text-xs">
                <h3 className="font-black text-xs text-slate-800">स्टोर ऑर्डर्स मैनेजमेंट ({orders.length})</h3>
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.docId} className="p-3 bg-slate-50 border rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-black text-blue-900">#{o.orderNumber}</span> • <strong>{o.customerName}</strong>
                          <div className="text-slate-700 font-bold mt-0.5">{o.items.length} उत्पाद • कुल: ₹{o.finalAmount}</div>
                          <div className="text-[11px] text-slate-500">📞 {o.customerPhone} | मोड: {o.paymentMode}</div>
                        </div>
                        <select 
                          value={o.orderStatus} 
                          onChange={(e) => updateDoc(doc(db, "orders", o.docId), { orderStatus: e.target.value })}
                          className="p-1 border rounded font-bold text-[10px] bg-white"
                        >
                          <option>Placed</option>
                          <option>Confirmed</option>
                          <option>Shipped</option>
                          <option>Out for Delivery</option>
                          <option>Delivered</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 3: SERVICES MANAGEMENT (ADD & EDIT) */}
            {adminSubTab === 'services' && (
              <div className="bg-white p-4 rounded-3xl border space-y-3 shadow-sm text-xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xs text-slate-800">सर्विस कैटलॉग व रेट्स</h3>
                  <button onClick={() => setShowAddService(true)} className="bg-blue-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow">
                    <PlusCircle className="w-3.5 h-3.5 text-yellow-400" /> नई सर्विस जोड़ें
                  </button>
                </div>
                <div className="space-y-2">
                  {services.map((s) => (
                    <div key={s.docId} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 block">{s.name}</span>
                        <span className="text-blue-900 font-black">₹{s.price}</span>
                        <span className="text-[10px] text-slate-400 ml-2">विजिट: ₹{s.visiting || 99}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditItem({ type: 'service', data: s })} className="bg-blue-100 text-blue-900 px-2 py-1 rounded font-bold text-[10px]">संशोधन</button>
                        <button onClick={() => deleteDoc(doc(db, "services", s.docId))} className="text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 4: PRODUCTS MANAGEMENT (ADD & EDIT) */}
            {adminSubTab === 'products' && (
              <div className="bg-white p-4 rounded-3xl border space-y-3 shadow-sm text-xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xs text-slate-800">उत्पाद इन्वेंटरी व कीमतें</h3>
                  <button onClick={() => setShowAddProduct(true)} className="bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow">
                    <PlusCircle className="w-3.5 h-3.5 text-yellow-300" /> नया उत्पाद जोड़ें
                  </button>
                </div>
                <div className="space-y-2">
                  {products.map((p) => (
                    <div key={p.docId} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{p.brand}</span>
                        <span className="font-bold text-slate-800 block">{p.name}</span>
                        <div className="text-slate-900 font-black mt-0.5">₹{p.price} <span className="text-slate-400 font-normal">| स्टॉक: {p.stock || 50}</span></div>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditItem({ type: 'product', data: p })} className="bg-emerald-100 text-emerald-900 px-2 py-1 rounded font-bold text-[10px]">संशोधन</button>
                        <button onClick={() => deleteDoc(doc(db, "products", p.docId))} className="text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 5: ELECTRICIAN MANAGEMENT */}
            {adminSubTab === 'electricians' && (
              <div className="bg-white p-4 rounded-3xl border space-y-3 shadow-sm text-xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xs text-slate-800">इलेक्ट्रीशियन टीम ({electricians.length})</h3>
                  <button onClick={() => setShowAddElectrician(true)} className="bg-purple-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow">
                    <PlusCircle className="w-3.5 h-3.5 text-yellow-300" /> नया इलेक्ट्रीशियन जोड़ें
                  </button>
                </div>
                <div className="space-y-2">
                  {electricians.map((tech) => (
                    <div key={tech.docId} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900">{tech.name}</strong>
                        <div className="text-slate-600">📞 {tech.phone} | पिन: {tech.pin}</div>
                        <div className="text-[10px] text-amber-600 font-bold">★ {tech.rating || 4.9} • {tech.jobsDone || 0} काम पूर्ण</div>
                      </div>
                      <button onClick={() => deleteDoc(doc(db, "electricians", tech.docId))} className="text-red-500 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 6: MARKETING & BROADCAST BANNER */}
            {adminSubTab === 'marketing' && (
              <div className="bg-white p-5 rounded-3xl border border-yellow-300 space-y-3 text-xs">
                <h3 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-amber-600" /> सेल / ऑफर संदेश ब्रॉडकास्टर
                </h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const text = e.target.broadcastText.value;
                  await setDoc(doc(db, "settings", "broadcast"), { text, active: true, updatedAt: Date.now() });
                  alert("🎉 ऑफर संदेश सभी ग्राहकों के ऐप पर लाइव हो गया!");
                }} className="space-y-3">
                  <textarea 
                    required 
                    name="broadcastText" 
                    rows={2} 
                    defaultValue={broadcast.text}
                    className="w-full p-3 border rounded-xl font-bold bg-slate-50" 
                  />
                  <button type="submit" className="w-full bg-[#FF9900] text-slate-950 font-black py-2.5 rounded-xl shadow">
                    ✔ सभी ग्राहकों के ऐप पर लाइव करें
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* GLOBAL MODALS (PRODUCT DETAILS, SERVICE DETAILS, CHECKOUT, BILLING)     */}
      {/* ========================================================================= */}

      {/* MODAL 1: PRODUCT DETAILS MODAL */}
      {detailProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative text-xs">
            <button onClick={() => setDetailProduct(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full uppercase">{detailProduct.brand}</span>
            <h3 className="font-black text-base text-slate-900 mt-1">{detailProduct.name}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">₹{detailProduct.price}</span>
              {detailProduct.mrp && <span className="text-xs text-slate-400 line-through">₹{detailProduct.mrp}</span>}
              <span className="text-emerald-600 font-bold">100% ओरिजिनल वारंटी</span>
            </div>
            <p className="text-slate-600 bg-slate-50 p-3 rounded-2xl border">{detailProduct.description}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  addToCart(detailProduct);
                  setDetailProduct(null);
                }} 
                className="flex-1 bg-[#FF9900] text-slate-950 font-black py-3 rounded-xl shadow flex items-center justify-center gap-1"
              >
                <ShoppingCart className="w-4 h-4" /> कार्ट में जोड़ें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SERVICE DETAILS SPECIFICATIONS */}
      {detailService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative text-xs">
            <button onClick={() => setDetailService(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <span className="text-[10px] bg-blue-100 text-blue-900 font-black px-2.5 py-0.5 rounded-full uppercase">सेवा विवरण व गारंटी</span>
            <h3 className="font-black text-base text-slate-900 mt-1">{detailService.name}</h3>
            <div className="text-base font-black text-slate-900">शुरुआती चार्ज: ₹{detailService.price} <span className="text-xs text-slate-400 font-normal">(जांच: ₹{detailService.visiting || 99})</span></div>
            <p className="text-slate-600 bg-slate-50 p-3 rounded-2xl border">{detailService.description}</p>
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block">इस सेवा में क्या शामिल है:</span>
              {(detailService.includes || ["30 दिन की आधिकारिक गारंटी", "सुरक्षा व लोड टेस्टिंग", "ओरिजिनल स्पेयर पार्ट्स"]).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => {
                setBookingStepService(detailService);
                setDetailService(null);
              }}
              className="w-full bg-[#131921] text-[#FF9900] font-black py-3 rounded-2xl shadow-lg flex items-center justify-center gap-1.5"
            >
              तारीख व स्लॉट चुनें <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: STEP 2 SERVICE BOOKING FORM */}
      {bookingStepService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleServiceBooking} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setBookingStepService(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">सर्विस स्लॉट व पता चुनें</h3>
            <p className="text-blue-900 font-bold">{bookingStepService.name} (अनुमानित: ₹{bookingStepService.price})</p>
            
            <div>
              <label className="block font-bold mb-1">सर्विस की तारीख</label>
              <input required name="serviceDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
            </div>

            <div>
              <label className="block font-bold mb-1">समय स्लॉट</label>
              <select name="slot" className="w-full p-2.5 border rounded-xl font-semibold bg-slate-50">
                <option>सुबह (9:00 AM - 1:00 PM)</option>
                <option>दोपहर (1:00 PM - 5:00 PM)</option>
                <option>शाम (5:00 PM - 8:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">पूरा पता व लैंडमार्क</label>
              <textarea required name="address" rows={2} placeholder="मकान नंबर, गली, इलाका, जयपुर" className="w-full p-2 border rounded-xl bg-slate-50"></textarea>
            </div>

            <button type="submit" className="w-full bg-[#131921] text-[#FF9900] font-black py-3 rounded-2xl shadow-lg">
              कन्फर्म बुकिंग (Live Cloud Sync)
            </button>
          </form>
        </div>
      )}

      {/* MODAL 4: CHECKOUT FORM (CART) */}
      {checkoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleProductCheckout} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setCheckoutModal(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">डिलीवरी पता व भुगतान मोड</h3>
            <div className="bg-slate-50 p-2.5 rounded-xl border text-slate-700">कुल देय राशि: <strong className="text-base text-emerald-700">₹{cartTotal}</strong></div>
            
            <input required name="addressLine" placeholder="मकान नं., फ्लैट, गली" className="w-full p-2.5 border rounded-xl bg-slate-50" />
            <div className="grid grid-cols-2 gap-2">
              <input required name="city" defaultValue="जयपुर" placeholder="शहर" className="p-2 border rounded-xl bg-slate-50 font-bold" />
              <input required name="pincode" defaultValue="302020" placeholder="पिनकोड" className="p-2 border rounded-xl bg-slate-50 font-bold" />
            </div>

            <div>
              <label className="block font-bold mb-1">भुगतान का माध्यम (Payment Mode)</label>
              <select name="paymentMode" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50">
                <option value="cod">कैश ऑन डिलीवरी (Cash on Delivery)</option>
                <option value="online_upi">ऑनलाइन UPI (PhonePe / GPay / QR)</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-[#FF9900] text-slate-950 font-black py-3 rounded-2xl shadow-lg">
              ऑर्डर कन्फर्म करें (Place Order)
            </button>
          </form>
        </div>
      )}

      {/* MODAL 5: ADMIN FINAL BILL & BEFORE/AFTER PHOTO PROOF */}
      {adminBillModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleGenerateFinalBill} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative my-8">
            <button type="button" onClick={() => setAdminBillModal(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">फाइनल बिल व फोटो प्रूफ जारी करें</h3>
            <p className="text-slate-500">बुकिंग ID: #{adminBillModal.bookingId} ({adminBillModal.customerName})</p>

            <div className="p-3 bg-slate-50 border rounded-2xl space-y-1.5">
              <label className="block font-bold text-slate-700">1. काम से पहले की फोटो (खराब पार्ट):</label>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => compressImage(e.target.files[0], setBeforePhoto)} className="w-full text-[11px]" />
              {beforePhoto && <img src={beforePhoto} alt="Before" className="h-20 rounded-lg mt-1 object-cover" />}
            </div>

            <div className="p-3 bg-slate-50 border rounded-2xl space-y-1.5">
              <label className="block font-bold text-emerald-800">2. काम के बाद की फोटो (ठीक होने पर):</label>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => compressImage(e.target.files[0], setAfterPhoto)} className="w-full text-[11px]" />
              {afterPhoto && <img src={afterPhoto} alt="After" className="h-20 rounded-lg mt-1 object-cover" />}
            </div>

            <textarea required value={workDetails} onChange={(e) => setWorkDetails(e.target.value)} placeholder="काम का विवरण (जैसे: कैपेसिटर बदला और नई केबल जोड़ी)" rows={2} className="w-full p-2 border rounded-xl" />

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span>सर्विस / लेबर चार्ज:</span>
                <input required type="number" value={labourFee} onChange={(e) => setLabourFee(e.target.value)} className="w-20 p-1 border rounded font-bold text-right" />
              </div>
              <div className="flex justify-between items-center">
                <span>स्पेयर पार्ट्स / सामान:</span>
                <input required type="number" value={materialFee} onChange={(e) => setMaterialFee(e.target.value)} className="w-20 p-1 border rounded font-bold text-right" />
              </div>
              <div className="flex justify-between items-center">
                <span>विजिटिंग फीस:</span>
                <input required type="number" value={visitFee} onChange={(e) => setVisitFee(e.target.value)} className="w-20 p-1 border rounded font-bold text-right" />
              </div>
              <div className="border-t pt-1 flex justify-between items-center font-black text-sm text-blue-950">
                <span>कुल फाइनल बिल:</span>
                <span className="text-emerald-700">₹{Number(labourFee) + Number(materialFee) + Number(visitFee)}</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white font-black py-3 rounded-2xl shadow-lg">
              ✔ फाइनल बिल जारी करें (अपलोड लॉक होगा)
            </button>
          </form>
        </div>
      )}

      {/* MODAL 6: ASSIGN TECHNICIAN TO BOOKING */}
      {assignTechBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative">
            <button onClick={() => setAssignTechBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">इलेक्ट्रीशियन को काम सौंपें</h3>
            <p className="text-slate-500">बुकिंग ID: #{assignTechBooking.bookingId} - {assignTechBooking.serviceName}</p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {electricians.map((tech) => (
                <div key={tech.docId} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center">
                  <div>
                    <strong className="text-slate-900">{tech.name}</strong>
                    <div className="text-[11px] text-slate-500">📞 {tech.phone}</div>
                  </div>
                  <button 
                    onClick={async () => {
                      await updateDoc(doc(db, "bookings", assignTechBooking.docId), {
                        assignedToName: tech.name,
                        assignedToPhone: tech.phone,
                        status: "On The Way"
                      });
                      const msg = `⚡ *इलेक्ट्रिकल जॉब असाइनमेंट (विद्युत सेवा हब)*\n\n` +
                        `नमस्ते ${tech.name}, आपको नया कार्य सौंपा गया है:\n` +
                        `🆔 *बुकिंग ID:* #${assignTechBooking.bookingId}\n` +
                        `👤 *ग्राहक:* ${assignTechBooking.customerName} (📞 ${assignTechBooking.customerPhone})\n` +
                        `🔧 *काम:* ${assignTechBooking.serviceName}\n` +
                        `📍 *पता:* ${assignTechBooking.address}\n\n` +
                        `कृपया ग्राहक से संपर्क करके समय पर पहुंचें।`;
                      window.open(`https://wa.me/91${tech.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                      setAssignTechBooking(null);
                      alert(`काम ${tech.name} को सौंप दिया गया है!`);
                    }}
                    className="bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl shadow"
                  >
                    असाइन करें
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: CUSTOMER PAY BILL (CASH OR DYNAMIC UPI QR) */}
      {customerPayBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative text-xs">
            <button onClick={() => setCustomerPayBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <div className="text-center">
              <h3 className="font-black text-base text-slate-900">सर्विस बिल भुगतान</h3>
              <p className="text-slate-500">इनवॉइस: #{customerPayBooking.bookingId}</p>
            </div>

            <div className="bg-slate-50 border p-3 rounded-2xl space-y-1">
              <div className="flex justify-between"><span>लेबर चार्ज:</span><span>₹{customerPayBooking.labourFee}</span></div>
              <div className="flex justify-between"><span>सामान / पार्ट्स:</span><span>₹{customerPayBooking.materialFee || 0}</span></div>
              <div className="flex justify-between"><span>विजिटिंग:</span><span>₹{customerPayBooking.visitFee || 0}</span></div>
              <div className="border-t pt-1 flex justify-between font-black text-sm text-slate-900">
                <span>कुल देय:</span><span className="text-emerald-700">₹{customerPayBooking.finalTotal}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">PhonePe / GPay / Paytm से स्कैन करें:</span>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=${paymentConfig.upiId}%26pn=${encodeURIComponent(paymentConfig.upiName)}%26am=${customerPayBooking.finalTotal}%26cu=INR`} 
                alt="UPI QR Code" 
                className="w-36 h-36 mx-auto rounded-xl border bg-white p-1"
              />
              <a 
                href={`upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.upiName)}&am=${customerPayBooking.finalTotal}&cu=INR`}
                className="block bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs shadow"
              >
                1-क्लिक में फोन की UPI ऐप खोलें
              </a>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleCustomerPayment('cash')} className="flex-1 bg-slate-800 text-white font-bold py-2.5 rounded-xl">💵 नकद (Cash)</button>
              <button onClick={() => handleCustomerPayment('upi')} className="flex-1 bg-emerald-700 text-white font-bold py-2.5 rounded-xl">✔ UPI पेड किया</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: ADD ELECTRICIAN */}
      {showAddElectrician && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target;
            await addDoc(collection(db, "electricians"), {
              name: f.techName.value.trim(),
              phone: f.techPhone.value.trim(),
              pin: f.techPin.value.trim(),
              rating: 5.0,
              jobsDone: 0,
              active: true
            });
            setShowAddElectrician(false);
            alert("नया इलेक्ट्रीशियन सफलतापूर्वक जोड़ा गया!");
          }} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setShowAddElectrician(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">नया इलेक्ट्रीशियन जोड़ें</h3>
            <input required name="techName" placeholder="इलेक्ट्रीशियन का पूरा नाम" className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold" />
            <input required name="techPhone" type="tel" maxLength={10} placeholder="10 अंकों का फोन नंबर (लॉगिन हेतु)" className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold" />
            <input required name="techPin" type="password" maxLength={4} placeholder="4 अंकों का सीक्रेट पिन" className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold text-center tracking-widest" />
            <button type="submit" className="w-full bg-purple-700 text-white font-black py-2.5 rounded-xl shadow">
              टीम में शामिल करें
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. AMAZON 5-TAB MOBILE & DESKTOP NAVIGATION BAR                          */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 flex justify-around py-2.5 z-40 shadow-xl max-w-4xl mx-auto">
        <button onClick={() => setActiveTab('home')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-[#FF9900]' : 'text-slate-400'}`}>
          <Zap className="w-4 h-4" /> होम
        </button>
        <button onClick={() => setActiveTab('store')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'store' ? 'text-[#FF9900]' : 'text-slate-400'}`}>
          <ShoppingBag className="w-4 h-4" /> स्टोर
        </button>
        <button onClick={() => setActiveTab('cart')} className={`text-xs font-bold flex flex-col items-center gap-0.5 relative ${activeTab === 'cart' ? 'text-[#FF9900]' : 'text-slate-400'}`}>
          <ShoppingCart className="w-4 h-4" /> कार्ट
          {cart.length > 0 && <span className="absolute top-0 right-3 bg-[#FF9900] text-slate-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">{cart.length}</span>}
        </button>
        <button onClick={() => setActiveTab('orders')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'orders' ? 'text-[#FF9900]' : 'text-slate-400'}`}>
          <Clock className="w-4 h-4" /> आर्डर्स
        </button>
        {user?.role === 'admin' ? (
          <button onClick={() => setActiveTab('admin')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'admin' ? 'text-[#FF9900]' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-4 h-4" /> एडमिन
          </button>
        ) : user?.role === 'electrician' ? (
          <button onClick={() => setActiveTab('electrician')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'electrician' ? 'text-purple-700' : 'text-slate-400'}`}>
            <Wrench className="w-4 h-4" /> ड्यूटी
          </button>
        ) : (
          <button onClick={() => setActiveTab('orders')} className="text-xs font-bold flex flex-col items-center gap-0.5 text-slate-400">
            <User className="w-4 h-4" /> खाता
          </button>
        )}
      </nav>

    </div>
  );
}
