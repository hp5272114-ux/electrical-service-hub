import React, { useState, useEffect, useMemo, Component } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, doc, setDoc, getDoc, 
  onSnapshot, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { 
  Zap, Wrench, ShoppingBag, LayoutDashboard, LogIn, LogOut, 
  PhoneCall, MessageCircle, AlertTriangle, User, X, CheckCircle2, 
  Clock, Truck, Star, AlertCircle, Edit3, Trash2, PlusCircle, 
  Megaphone, Shield, Search, TrendingUp, Camera, QrCode, 
  FileText, Check, Send, RotateCcw, Lock, ChevronRight, Calendar, 
  Info, MapPin, ChevronDown, Award, Sparkles, ArrowLeft, CheckSquare, 
  Heart, ShoppingCart, RefreshCw 
} from 'lucide-react';

const ADMIN_PHONE = "6367626276";
const ADMIN_PIN = "2026";

// हेमंत जी की लाइव Firebase Cloud Keys
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

// इमेज कंप्रेसर
const compressImage = (file, callback) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 400;
      let w = img.width, h = img.height;
      if (w > h && w > maxDim) { h = (h * maxDim) / w; w = maxDim; }
      else if (h > maxDim) { w = (w * maxDim) / h; h = maxDim; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

// एरर शील्ड (व्हाइट स्क्रीन से बचाव)
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error?.message || 'अज्ञात त्रुटि' };
  }
  componentDidCatch(error, info) {
    console.error("App Crash Log:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mb-3" />
          <h2 className="text-xl font-black">सिस्टम रिकवरी मोड</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">{this.state.errorMsg}</p>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="mt-5 bg-yellow-400 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-xs"
          >
            ऐप रिफ्रेश करें
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('esh_user_v2') || localStorage.getItem('esh_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('home');
  const [adminSubTab, setAdminSubTab] = useState('metrics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('esh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [deliveryPincode] = useState('302020 (Jaipur)');

  // Collections State
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [broadcast, setBroadcast] = useState({ text: "गर्मी स्पेशल: पंखा रिपेयरिंग पर 20% की छूट!", active: true });
  const [paymentConfig, setPaymentConfig] = useState({ upiId: "6367626276@upi", upiName: "Electrical Hub" });

  // Modals State
  const [detailService, setDetailService] = useState(null);
  const [bookingStepService, setBookingStepService] = useState(null);
  const [billModalBooking, setBillModalBooking] = useState(null);
  const [customerPayBooking, setCustomerPayBooking] = useState(null);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [custDetailBooking, setCustDetailBooking] = useState(null);
  const [adminDetailBooking, setAdminDetailBooking] = useState(null);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showAddService, setShowAddService] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Billing Inputs
  const [beforePhoto, setBeforePhoto] = useState('');
  const [afterPhoto, setAfterPhoto] = useState('');
  const [workDetails, setWorkDetails] = useState('');
  const [labourFee, setLabourFee] = useState(199);
  const [materialFee, setMaterialFee] = useState(0);
  const [visitFee, setVisitFee] = useState(99);

  // Auth Inputs
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Rating Inputs
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [complaintText, setComplaintText] = useState('');

  // 1. Splash Screen
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Save Cart
  useEffect(() => {
    try {
      localStorage.setItem('esh_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // 2. Real-Time Listeners
  useEffect(() => {
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      const live = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      live.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setBookings(live);
    }, (err) => console.log("Bookings Sync:", err));

    const unsubServices = onSnapshot(collection(db, "services"), async (snap) => {
      if (snap.empty) {
        const initial = [
          { name: "Ceiling Fan Repair & Service", nameHi: "सीलिंग पंखा रिपेयर व सर्विस", category: "fans", price: 199, mrp: 299, visiting: 99, duration: "45m", rating: "4.8", description: "आवाज बंद करना, बैरिंग रिप्लेसमेंट, कैपेसिटर चेंज व हाई स्पीड चेकिंग।" },
          { name: "House Short Circuit & Rewiring", nameHi: "शॉर्ट सर्किट व फॉल्ट चेकिंग", category: "wiring", price: 399, mrp: 599, visiting: 149, duration: "60m", rating: "4.9", description: "एमसीबी ट्रिपिंग, न्यूट्रल लीकेज व हिडन वायरिंग स्पार्किंग की डिजिटल जांच।" },
          { name: "Inverter & Dual Battery Setup", nameHi: "इनवर्टर व डबल बैटरी फिटिंग", category: "inverters", price: 499, mrp: 750, visiting: 149, duration: "90m", rating: "4.9", description: "घर के मेन डीबी लोड के साथ बाईपास स्विच, ट्रॉली व हैवी लग क्रिम्पिंग कनेक्शन।" },
          { name: "Modular MCB & Switchboard Fit", nameHi: "मॉड्यूलर स्विच व एमसीबी फिटिंग", category: "switchgear", price: 299, mrp: 450, visiting: 99, duration: "45m", rating: "4.7", description: "पुराने जल चुके फ्यूज को आधुनिक सुरक्षा एमसीबी और डीपी आइसोलेटर में बदलना।" }
        ];
        for (const s of initial) await addDoc(collection(db, "services"), s);
      } else {
        setServices(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    }, (err) => console.log("Services Sync:", err));

    const unsubProducts = onSnapshot(collection(db, "products"), async (snap) => {
      if (snap.empty) {
        const initial = [
          { name: "Polycab 2.5 Sq mm FR Wire (90m, Red)", brand: "Polycab", mrp: 2450, price: 1899, category: "wires" },
          { name: "Havells 32A Double Pole C-Curve MCB", brand: "Havells", mrp: 680, price: 520, category: "switchgear" },
          { name: "Anchor Roma 6A Modular Switch (Pack of 10)", brand: "Anchor", mrp: 480, price: 310, category: "switches" }
        ];
        for (const p of initial) await addDoc(collection(db, "products"), p);
      } else {
        setProducts(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    }, (err) => console.log("Products Sync:", err));

    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const list = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(list);
    }, (err) => console.log("Orders Sync:", err));

    const unsubBroadcast = onSnapshot(doc(db, "settings", "broadcast"), (snap) => {
      if (snap.exists()) setBroadcast(snap.data());
    }, (err) => console.log("Broadcast Sync:", err));

    const unsubPayment = onSnapshot(doc(db, "settings", "payment"), (snap) => {
      if (snap.exists()) setPaymentConfig(snap.data());
    }, (err) => console.log("Payment Sync:", err));

    return () => {
      unsubBookings();
      unsubServices();
      unsubProducts();
      unsubOrders();
      unsubBroadcast();
      unsubPayment();
    };
  }, []);

  // Metrics
  const totalRevenue = useMemo(() => {
    return bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (Number(b.finalTotal || b.price) || 0), 0);
  }, [bookings]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
  }, [cart]);
  const cartDeliveryFee = cartSubtotal > 999 || cartSubtotal === 0 ? 0 : 70;
  const cartTotal = cartSubtotal + cartDeliveryFee;

  // Auth Handler
  const handleAuth = async (e) => {
    e.preventDefault();
    if (phoneInput.length !== 10 || pinInput.length !== 4) return alert("10 अंकों का फोन नंबर व 4 अंकों का पिन डालें!");

    setAuthLoading(true);
    const cleanPhone = phoneInput.trim();

    if (cleanPhone === ADMIN_PHONE && pinInput === ADMIN_PIN) {
      const adminData = { name: "मास्टर एडमिन", phone: ADMIN_PHONE, role: 'admin' };
      setUser(adminData);
      localStorage.setItem('esh_user_v2', JSON.stringify(adminData));
      setActiveTab('admin');
      setAuthLoading(false);
      return;
    }

    try {
      const userRef = doc(db, "users", cleanPhone);
      const userSnap = await getDoc(userRef);

      if (authMode === 'register') {
        if (!nameInput.trim()) { setAuthLoading(false); return alert("पूरा नाम लिखें!"); }
        if (pinInput !== confirmPinInput) { setAuthLoading(false); return alert("दोनों पिन समान होने चाहिए!"); }
        if (userSnap.exists()) { setAuthLoading(false); setAuthMode('login'); return alert("नंबर पहले से रजिस्टर्ड है! लॉगिन करें।"); }

        const newUser = { name: nameInput.trim(), phone: cleanPhone, pin: pinInput.trim(), role: 'customer', createdAt: Date.now() };
        await setDoc(userRef, newUser);
        setUser(newUser);
        localStorage.setItem('esh_user_v2', JSON.stringify(newUser));
      } else {
        if (!userSnap.exists()) { setAuthLoading(false); setAuthMode('register'); return alert("खाता नहीं मिला! पहले नया खाता बनाएं।"); }
        const data = userSnap.data();
        if (data.pin !== pinInput.trim()) { setAuthLoading(false); return alert("गलत पिन!"); }
        setUser(data);
        localStorage.setItem('esh_user_v2', JSON.stringify(data));
      }
    } catch (err) {
      alert("लॉगिन एरर: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('esh_user_v2');
    localStorage.removeItem('esh_user');
    setActiveTab('home');
  };

  // Cart
  const addToCart = (product) => {
    const existingIndex = cart.findIndex(i => i.docId === product.docId);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    alert(`"${product.name}" कार्ट में जोड़ दिया गया है!`);
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
      customerPhone: user?.phone || "",
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
      alert(`🎉 बुकिंग सफल! क्रमांक: #${refCode}`);
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
      customerPhone: user?.phone || "",
      customerName: user?.name || "",
      items: cart,
      address: { line1: form.addressLine.value, city: form.city.value, pincode: form.pincode.value },
      subtotal: cartSubtotal,
      deliveryCharge: cartDeliveryFee,
      finalAmount: cartTotal,
      paymentMode: form.paymentMode.value,
      paymentStatus: 'pending',
      orderStatus: 'Placed',
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "orders"), orderData);
      setCart([]);
      setCheckoutModal(false);
      setActiveTab('orders');
      alert(`🎉 ऑर्डर दर्ज! क्रमांक: #${orderNumber}`);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // Final Bill Generation
  const handleGenerateFinalBill = async (e) => {
    e.preventDefault();
    if (!billModalBooking) return;
    const total = Number(labourFee) + Number(materialFee) + Number(visitFee);

    try {
      await updateDoc(doc(db, "bookings", billModalBooking.docId), {
        beforePhoto: beforePhoto || billModalBooking.beforePhoto || null,
        afterPhoto: afterPhoto || billModalBooking.afterPhoto || null,
        workDetails: workDetails || billModalBooking.workDetails || "कार्य पूर्ण हुआ।",
        labourFee: Number(labourFee),
        materialFee: Number(materialFee),
        visitFee: Number(visitFee),
        finalTotal: total,
        status: "Completed",
        isBilled: true,
        paymentStatus: billModalBooking.paymentStatus || "unpaid"
      });
      alert(`✔ फाइनल बिल ₹${total} जारी हो चुका है!`);
      setBillModalBooking(null);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // Reopen Service
  const handleReopenService = async (booking) => {
    if (!window.confirm("क्या आप इस सर्विस को दोबारा खोलना चाहते हैं?")) return;
    try {
      await updateDoc(doc(db, "bookings", booking.docId), { status: "On The Way", isBilled: false });
      alert("✔ सर्विस दोबारा खोल दी गई है!");
      if (adminDetailBooking) setAdminDetailBooking(null);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // Toggle Payment Status
  const handleTogglePaymentStatus = async (booking, targetStatus) => {
    try {
      await updateDoc(doc(db, "bookings", booking.docId), { paymentStatus: targetStatus });
      alert(`✔ पेमेंट स्थिति '${targetStatus === 'paid' ? 'पेड' : 'अनपेड'}' सेट हुई!`);
      if (adminDetailBooking) setAdminDetailBooking({ ...adminDetailBooking, paymentStatus: targetStatus });
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // Rating Submit
  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalBooking) return;
    try {
      await updateDoc(doc(db, "bookings", reviewModalBooking.docId), {
        rating: ratingVal,
        review: reviewText,
        complaint: complaintText || null,
        complaintStatus: complaintText ? "Pending" : null
      });
      alert("रेटिंग दर्ज हुई। धन्यवाद!");
      setReviewModalBooking(null);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // Splash
  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0F1111] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-[#FF9900] p-6 rounded-3xl shadow-2xl animate-bounce mb-6">
          <Zap className="w-16 h-16 text-[#0F1111] fill-[#0F1111]" />
        </div>
        <h1 className="text-3xl font-black text-white">विद्युत सेवा हब</h1>
        <p className="text-[#FF9900] font-bold text-xs uppercase mt-1">Electrical Hub • Certified Marketplace</p>
      </div>
    );
  }

  // Mandatory Auth
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
            <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 text-xs font-black ${authMode === 'login' ? 'bg-white text-blue-900 border-b-2 border-blue-900' : 'text-slate-400'}`}>लॉगिन</button>
            <button onClick={() => setAuthMode('register')} className={`flex-1 py-3 text-xs font-black ${authMode === 'register' ? 'bg-white text-blue-900 border-b-2 border-blue-900' : 'text-slate-400'}`}>नया खाता</button>
          </div>

          <div className="p-6">
            <form onSubmit={handleAuth} className="space-y-3.5 text-xs">
              {authMode === 'register' && (
                <input required type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="पूरा नाम" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
              )}
              <input required type="tel" maxLength={10} value={phoneInput} onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))} placeholder="10 अंकों का फोन नंबर" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
              <input required type="password" maxLength={4} value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} placeholder="4 अंकों का पिन" className="w-full p-2.5 border rounded-xl text-center tracking-widest font-black text-base bg-slate-50" />
              {authMode === 'register' && (
                <input required type="password" maxLength={4} value={confirmPinInput} onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))} placeholder="पिन कन्फर्म करें" className="w-full p-2 border rounded-xl text-center font-black bg-slate-50" />
              )}
              <button disabled={authLoading} type="submit" className="w-full bg-[#131921] text-[#FF9900] py-3 rounded-xl font-black text-xs shadow-lg">
                {authLoading ? "जांच जारी..." : authMode === 'login' ? "लॉगिन करें" : "खाता बनाएं"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard Shell
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans">
      
      {/* Header */}
      <header className="bg-[#131921] text-white shadow-md sticky top-0 z-30">
        <div className="max-w-xl mx-auto px-4 py-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-[#FF9900] p-1.5 rounded-xl text-[#0F1111] shadow">
              <Zap className="w-5 h-5 fill-[#0F1111]" />
            </div>
            <div>
              <span className="font-black text-base block leading-none">विद्युत सेवा हब</span>
              <span className="text-[9px] text-[#FF9900] font-bold uppercase">Electrical Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button onClick={() => setActiveTab('cart')} className="relative p-1 text-slate-300 hover:text-white flex items-center gap-1">
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="bg-[#FF9900] text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${user.role === 'admin' ? 'bg-[#FF9900] text-slate-950' : 'bg-emerald-600 text-white'}`}>
              {user.role === 'admin' ? 'ADMIN' : (user.name || 'User').split(' ')[0]}
            </span>
            <button onClick={handleLogout} className="text-slate-400 p-1"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Location Bar */}
        <div className="bg-[#232F3E] text-slate-200 px-4 py-1.5 text-[11px] flex items-center justify-between border-t border-slate-700">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#FF9900] flex-shrink-0" />
            <span className="truncate">डिलीवरी व सर्विस: <strong>{deliveryPincode}</strong></span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">● 45m एक्सप्रेस</span>
        </div>
      </header>

      {/* Offer Ribbon */}
      {broadcast.active && broadcast.text && (
        <div className="bg-[#FF9900] text-slate-950 px-4 py-2 font-black text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <Megaphone className="w-4 h-4 flex-shrink-0 fill-slate-950" />
            <span className="truncate">{broadcast.text}</span>
          </div>
          <span className="text-[10px] uppercase bg-[#131921] text-white px-2 py-0.5 rounded-full font-bold ml-2">ऑफर</span>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-xl mx-auto p-3.5 space-y-4">
        
        {/* SOS Button */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-3.5 rounded-2xl shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-xl animate-pulse">
              <AlertTriangle className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-sm">24x7 इमरजेंसी बिजली फॉल्ट?</h3>
              <p className="text-[11px] text-red-100">15 मिनट में ऑन-ड्यूटी सहायता</p>
            </div>
          </div>
          <a href={`tel:${ADMIN_PHONE}`} className="bg-[#FF9900] text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow">SOS कॉल</a>
        </div>

        {/* ================= TAB: ADMIN ================= */}
        {activeTab === 'admin' && user.role === 'admin' && (
          <div className="space-y-4">
            <div className="bg-[#131921] text-white p-5 rounded-3xl shadow-xl flex justify-between items-center">
              <div>
                <span className="bg-[#FF9900] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Admin Center</span>
                <h2 className="text-lg font-black mt-1">मास्टर कंट्रोल डैशबोर्ड</h2>
              </div>
              <button onClick={() => setActiveTab('home')} className="text-xs bg-white/10 px-3 py-1.5 rounded-xl font-bold">कस्टमर व्यू</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">कुल प्राप्त कमाई</span>
                <div className="text-xl font-black text-slate-900 mt-1">₹{totalRevenue}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">सर्विस टिकट्स</span>
                <div className="text-xl font-black text-blue-900 mt-1">{bookings.length}</div>
              </div>
            </div>

            {/* Subtabs */}
            <div className="bg-white p-1 rounded-2xl border flex justify-between shadow-sm overflow-x-auto text-[11px] font-bold">
              <button onClick={() => setAdminSubTab('metrics')} className={`flex-1 py-2 px-2 rounded-xl whitespace-nowrap ${adminSubTab === 'metrics' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>📋 बुकिंग्स ({bookings.length})</button>
              <button onClick={() => setAdminSubTab('services')} className={`flex-1 py-2 px-2 rounded-xl whitespace-nowrap ${adminSubTab === 'services' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>⚡ सर्विसेज</button>
              <button onClick={() => setAdminSubTab('products')} className={`flex-1 py-2 px-2 rounded-xl whitespace-nowrap ${adminSubTab === 'products' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>📦 स्टोर</button>
              <button onClick={() => setAdminSubTab('payment')} className={`flex-1 py-2 px-2 rounded-xl whitespace-nowrap ${adminSubTab === 'payment' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>💳 UPI सेटिंग्स</button>
            </div>

            {/* Orders Tab */}
            {adminSubTab === 'metrics' && (
              <div className="bg-white p-4 rounded-3xl border space-y-3 shadow-sm text-xs">
                <h3 className="font-black text-slate-800">लाइव सर्विस टिकट्स (आर्डर पर क्लिक करें)</h3>
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.docId} className="p-3 bg-slate-50 border rounded-2xl space-y-2">
                      <div onClick={() => setAdminDetailBooking(b)} className="flex justify-between items-start cursor-pointer hover:bg-slate-100 p-1 rounded-xl">
                        <div>
                          <span className="font-black text-blue-900">#{b.bookingId}</span> • <strong>{b.customerName}</strong>
                          <div className="text-slate-800 font-bold mt-0.5">{b.serviceName}</div>
                          <div className="text-[11px] text-slate-500">📞 {b.customerPhone} | 📍 {b.address}</div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {b.status}
                          </span>
                          <span className={`text-[9px] font-bold block mt-1 ${b.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {b.paymentStatus === 'paid' ? '✔ पेड' : '⏳ अनपेड'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 pt-2 border-t flex-wrap items-center">
                        <button onClick={() => updateDoc(doc(db, "bookings", b.docId), { status: "Confirmed" })} className="bg-blue-800 text-white text-[10px] px-2.5 py-1 rounded font-bold">स्वीकारें</button>
                        
                        {b.isBilled && b.status === 'Completed' ? (
                          <div className="flex items-center gap-1">
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"><Lock className="w-3 h-3" /> बिल लॉक</span>
                            <button onClick={() => handleReopenService(b)} className="bg-[#FF9900] text-slate-950 font-black text-[10px] px-2 py-1 rounded flex items-center gap-1"><RotateCcw className="w-3 h-3" /> री-ओपन</button>
                          </div>
                        ) : (
                          <button onClick={() => { setBillModalBooking(b); setLabourFee(b.price || 199); }} className="bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded font-bold flex items-center gap-1"><Camera className="w-3 h-3" /> फोटो व बिल</button>
                        )}

                        <button onClick={() => handleTogglePaymentStatus(b, b.paymentStatus === 'paid' ? 'unpaid' : 'paid')} className={`text-[10px] font-bold px-2.5 py-1 rounded ml-auto ${b.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-600 text-white'}`}>
                          {b.paymentStatus === 'paid' ? '✔ पेड (Mark Unpaid)' : 'पेमेंट मिला'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Tab */}
            {adminSubTab === 'services' && (
              <div className="bg-white p-4 rounded-3xl border space-y-3 shadow-sm text-xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-800">सर्विस लिस्ट व चार्ज</h3>
                  <button onClick={() => setShowAddService(true)} className="bg-blue-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5 text-yellow-400" /> नई सर्विस
                  </button>
                </div>
                {services.map((s) => (
                  <div key={s.docId} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 block">{s.name}</span>
                      <span className="text-blue-900 font-black">₹{s.price}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditItem({ type: 'service', data: s })} className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg font-bold text-[10px]">बदलें</button>
                      <button onClick={() => deleteDoc(doc(db, "services", s.docId))} className="text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products Tab */}
            {adminSubTab === 'products' && (
              <div className="bg-white p-4 rounded-3xl border space-y-3 shadow-sm text-xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-800">स्टोर सामान व कीमतें</h3>
                  <button onClick={() => setShowAddProduct(true)} className="bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5 text-yellow-300" /> नया सामान
                  </button>
                </div>
                {products.map((p) => (
                  <div key={p.docId} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 block">{p.name}</span>
                      <span className="text-slate-900 font-black">₹{p.price}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditItem({ type: 'product', data: p })} className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg font-bold text-[10px]">बदलें</button>
                      <button onClick={() => deleteDoc(doc(db, "products", p.docId))} className="text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Settings Tab */}
            {adminSubTab === 'payment' && (
              <div className="bg-white p-5 rounded-3xl border space-y-3 text-xs">
                <h3 className="font-black text-slate-800">UPI व QR सेटिंग्स</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const f = e.target;
                  await setDoc(doc(db, "settings", "payment"), { upiId: f.upiId.value.trim(), upiName: f.upiName.value.trim() });
                  alert("✔ UPI सेव हो गई!");
                }} className="space-y-3">
                  <input required name="upiId" defaultValue={paymentConfig.upiId} placeholder="UPI ID" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
                  <input required name="upiName" defaultValue={paymentConfig.upiName} placeholder="नाम" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
                  <button type="submit" className="w-full bg-emerald-700 text-white font-black py-2.5 rounded-xl">सेव करें</button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: ORDERS (CUSTOMER VIEW) ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <h2 className="font-black text-base text-slate-900">मेरे आर्डर व लाइव ट्रैकिंग</h2>
            {bookings.filter(b => b.customerPhone === user.phone).map((b) => (
              <div key={b.docId} className="bg-white p-4 rounded-3xl border shadow-sm space-y-3">
                <div onClick={() => setCustDetailBooking(b)} className="flex justify-between items-start cursor-pointer hover:bg-slate-50 p-1 rounded-2xl">
                  <div>
                    <span className="font-bold text-xs text-blue-900">#{b.bookingId}</span>
                    <h4 className="font-black text-sm text-slate-900 mt-0.5">{b.serviceName}</h4>
                  </div>
                  <span className="text-sm font-black text-slate-900">₹{b.finalTotal || b.price}</span>
                </div>

                {/* Progress bar */}
                <div className="bg-slate-50 p-3 rounded-2xl border space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-blue-900">स्वीकृत</span>
                    <span className={b.status === 'On The Way' || b.status === 'Completed' ? 'text-purple-700' : 'text-slate-300'}>रास्ते में</span>
                    <span className={b.status === 'Completed' ? 'text-emerald-600' : 'text-slate-300'}>पूरा हुआ</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${b.status === 'Confirmed' ? 'w-1/3 bg-blue-600' : b.status === 'On The Way' ? 'w-2/3 bg-purple-600' : 'w-full bg-emerald-600'}`} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setCustDetailBooking(b)} className="flex-1 bg-slate-100 text-slate-800 font-bold py-2 rounded-xl text-xs">फोटो प्रूफ व रसीद</button>
                  {b.isBilled && b.paymentStatus !== 'paid' && (
                    <button onClick={() => setCustomerPayBooking(b)} className="flex-1 bg-emerald-600 text-white font-black py-2 rounded-xl text-xs">बिल भुगतान (₹{b.finalTotal})</button>
                  )}
                </div>

                {b.status === 'Completed' && !b.rating && (
                  <button onClick={() => setReviewModalBooking(b)} className="w-full bg-[#FF9900] text-slate-950 font-black text-xs py-2 rounded-xl">रेटिंग व फीडबैक दें</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB: CART ================= */}
        {activeTab === 'cart' && (
          <div className="space-y-4">
            <h2 className="font-black text-base text-slate-900">शॉपिंग कार्ट ({cart.length})</h2>
            {cart.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">आपकी कार्ट अभी खाली है।</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.docId} className="bg-white p-3.5 rounded-2xl border flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{item.name}</h4>
                      <span className="text-slate-900 font-black">₹{item.price * item.quantity} (मात्रा: {item.quantity})</span>
                    </div>
                  </div>
                ))}
                <div className="bg-white p-4 rounded-2xl border text-xs space-y-2">
                  <div className="flex justify-between font-bold"><span>कुल राशि:</span><span className="text-emerald-700 text-sm">₹{cartTotal}</span></div>
                  <button onClick={() => setCheckoutModal(true)} className="w-full bg-[#FF9900] text-slate-950 font-black py-2.5 rounded-xl">चेकआउट करें</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: HOME ================= */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="सर्च करें: पंखा रिपेयर, 2.5mm वायर..." className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-2xl text-xs font-semibold shadow-sm" />
            </div>

            <div className="bg-gradient-to-r from-[#131921] via-[#232F3E] to-[#131921] text-white p-5 rounded-3xl shadow-lg">
              <span className="bg-[#FF9900] text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">★ 45 मिनट में इलेक्ट्रीशियन</span>
              <h1 className="text-xl font-black mt-2 leading-tight">प्रमाणित इलेक्ट्रीशियन और 100% असली सामान</h1>
              <div className="flex gap-2 mt-4">
                <a href={`tel:${ADMIN_PHONE}`} className="bg-[#FF9900] text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1 shadow"><PhoneCall className="w-3.5 h-3.5" /> {ADMIN_PHONE}</a>
                <a href={`https://wa.me/91${ADMIN_PHONE}?text=नमस्ते`} className="bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 shadow"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
              </div>
            </div>

            <div className="space-y-2.5">
              <h2 className="font-black text-sm text-slate-900">विद्युत सेवाएं (Services)</h2>
              {services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((s) => (
                <div key={s.docId} className="bg-white p-3.5 rounded-2xl border flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{s.name}</h3>
                    <div className="text-xs font-black text-blue-800 mt-0.5">₹{s.price} <span className="text-[10px] text-slate-400 font-normal">(जांच: ₹{s.visiting || 99})</span></div>
                  </div>
                  <button onClick={() => setDetailService(s)} className="bg-[#131921] text-[#FF9900] font-black text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1">
                    विवरण व बुक <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 pt-2">
              <h2 className="font-black text-sm text-slate-900">सामान स्टोर (Products)</h2>
              {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
                <div key={p.docId} className="bg-white p-3.5 rounded-2xl border flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">{p.brand}</span>
                    <h3 className="font-bold text-xs text-slate-900">{p.name}</h3>
                    <div className="text-sm font-black text-slate-900 mt-0.5">₹{p.price}</div>
                  </div>
                  <button onClick={() => addToCart(p)} className="bg-[#FF9900] text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow">
                    <ShoppingCart className="w-3.5 h-3.5" /> कार्ट में जोड़ें
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ================= MODALS ================= */}

      {/* Service Details Modal */}
      {detailService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative text-xs">
            <button onClick={() => setDetailService(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-base text-slate-900">{detailService.name}</h3>
            <div className="text-sm font-black text-blue-900">चार्ज: ₹{detailService.price} (विजिट: ₹{detailService.visiting || 99})</div>
            <p className="text-slate-600 bg-slate-50 p-3 rounded-2xl border">{detailService.description}</p>
            <button onClick={() => { setBookingStepService(detailService); setDetailService(null); }} className="w-full bg-[#131921] text-[#FF9900] font-black py-3 rounded-2xl shadow">
              तारीख व स्लॉट चुनें <ChevronRight className="w-4 h-4 inline" />
            </button>
          </div>
        </div>
      )}

      {/* Service Booking Modal */}
      {bookingStepService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleServiceBooking} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setBookingStepService(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">सर्विस बुकिंग फॉर्म</h3>
            <p className="text-blue-900 font-bold">{bookingStepService.name} (₹{bookingStepService.price})</p>
            <input required name="serviceDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
            <select name="slot" className="w-full p-2.5 border rounded-xl font-semibold bg-slate-50">
              <option>सुबह (9:00 AM - 1:00 PM)</option>
              <option>दोपहर (1:00 PM - 5:00 PM)</option>
              <option>शाम (5:00 PM - 8:00 PM)</option>
            </select>
            <textarea required name="address" rows={2} placeholder="पूरा पता व लैंडमार्क" className="w-full p-2 border rounded-xl bg-slate-50"></textarea>
            <button type="submit" className="w-full bg-[#131921] text-[#FF9900] font-black py-3 rounded-2xl shadow">कन्फर्म बुकिंग</button>
          </form>
        </div>
      )}

      {/* Customer Full Order/Bill Modal */}
      {custDetailBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative my-8 text-xs">
            <button onClick={() => setCustDetailBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-base text-slate-900">#{custDetailBooking.bookingId} - {custDetailBooking.serviceName}</h3>
            
            {(custDetailBooking.beforePhoto || custDetailBooking.afterPhoto) && (
              <div className="grid grid-cols-2 gap-2">
                {custDetailBooking.beforePhoto && <img src={custDetailBooking.beforePhoto} alt="Before" className="h-28 w-full object-cover rounded-xl border" />}
                {custDetailBooking.afterPhoto && <img src={custDetailBooking.afterPhoto} alt="After" className="h-28 w-full object-cover rounded-xl border" />}
              </div>
            )}
            
            {custDetailBooking.isBilled && (
              <div className="bg-slate-50 p-3 rounded-2xl border space-y-1">
                <div className="flex justify-between"><span>लेबर चार्ज:</span><span>₹{custDetailBooking.labourFee}</span></div>
                <div className="flex justify-between"><span>स्पेयर पार्ट्स:</span><span>₹{custDetailBooking.materialFee || 0}</span></div>
                <div className="flex justify-between font-black text-sm"><span>कुल फाइनल बिल:</span><span className="text-emerald-700">₹{custDetailBooking.finalTotal}</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Order Inspector Modal */}
      {adminDetailBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative my-8 text-xs">
            <button onClick={() => setAdminDetailBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-base text-slate-900">#{adminDetailBooking.bookingId} - {adminDetailBooking.serviceName}</h3>
            <p className="text-slate-600">ग्राहक: {adminDetailBooking.customerName} (📞 {adminDetailBooking.customerPhone})</p>
            <p className="text-slate-600">पता: {adminDetailBooking.address}</p>
            <button onClick={() => handleReopenService(adminDetailBooking)} className="w-full bg-[#FF9900] text-slate-950 font-black py-2.5 rounded-xl shadow">
              सर्विस दोबारा खोलें (Reopen)
            </button>
          </div>
        </div>
      )}

      {/* Admin Bill & Photo Modal */}
      {billModalBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleGenerateFinalBill} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative my-8">
            <button type="button" onClick={() => setBillModalBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">फोटो व फाइनल बिल जारी करें</h3>
            
            <div className="space-y-1">
              <label className="font-bold block">1. काम से पहले की फोटो:</label>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => compressImage(e.target.files[0], setBeforePhoto)} />
              {beforePhoto && <img src={beforePhoto} alt="Before preview" className="h-20 rounded-lg mt-1 object-cover" />}
            </div>

            <div className="space-y-1">
              <label className="font-bold block text-emerald-800">2. काम के बाद की फोटो:</label>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => compressImage(e.target.files[0], setAfterPhoto)} />
              {afterPhoto && <img src={afterPhoto} alt="After preview" className="h-20 rounded-lg mt-1 object-cover" />}
            </div>

            <textarea required value={workDetails} onChange={(e) => setWorkDetails(e.target.value)} placeholder="काम का विवरण" rows={2} className="w-full p-2 border rounded-xl" />

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span>लेबर चार्ज:</span>
                <input required type="number" value={labourFee} onChange={(e) => setLabourFee(e.target.value)} className="w-20 p-1 border rounded text-right font-bold" />
              </div>
              <div className="flex justify-between items-center">
                <span>पार्ट्स का खर्चा:</span>
                <input required type="number" value={materialFee} onChange={(e) => setMaterialFee(e.target.value)} className="w-20 p-1 border rounded text-right font-bold" />
              </div>
              <div className="flex justify-between items-center font-black">
                <span>कुल बिल:</span>
                <span className="text-emerald-700 text-sm">₹{Number(labourFee) + Number(materialFee) + Number(visitFee)}</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl shadow">जारी करें</button>
          </form>
        </div>
      )}

      {/* Customer Payment Modal */}
      {customerPayBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative text-xs text-center">
            <button onClick={() => setCustomerPayBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-base text-slate-900">बिल भुगतान</h3>
            <div className="text-xl font-black text-emerald-700">देय राशि: ₹{customerPayBooking.finalTotal}</div>
            
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${paymentConfig.upiId}%26pn=${encodeURIComponent(paymentConfig.upiName)}%26am=${customerPayBooking.finalTotal}%26cu=INR`} 
              alt="UPI QR Code" 
              className="w-36 h-36 mx-auto rounded-xl border bg-white p-1"
            />

            <div className="flex gap-2">
              <button onClick={() => { updateDoc(doc(db, "bookings", customerPayBooking.docId), { paymentMode: 'cash', paymentStatus: 'cash_selected' }); setCustomerPayBooking(null); alert("कैश विकल्प चुना गया!"); }} className="flex-1 bg-slate-800 text-white font-bold py-2.5 rounded-xl">नकद (Cash)</button>
              <button onClick={() => { updateDoc(doc(db, "bookings", customerPayBooking.docId), { paymentMode: 'upi', paymentStatus: 'paid' }); setCustomerPayBooking(null); alert("UPI पेमेंट दर्ज हुआ!"); }} className="flex-1 bg-emerald-700 text-white font-bold py-2.5 rounded-xl">✔ UPI पेड</button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleProductCheckout} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setCheckoutModal(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">चेकआउट फॉर्म</h3>
            <input required name="addressLine" placeholder="मकान नं., फ्लैट, गली" className="w-full p-2.5 border rounded-xl bg-slate-50" />
            <div className="grid grid-cols-2 gap-2">
              <input required name="city" defaultValue="जयपुर" className="p-2 border rounded-xl bg-slate-50 font-bold" />
              <input required name="pincode" defaultValue="302020" className="p-2 border rounded-xl bg-slate-50 font-bold" />
            </div>
            <select name="paymentMode" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50">
              <option value="cod">कैश ऑन डिलीवरी (COD)</option>
              <option value="online_upi">ऑनलाइन UPI</option>
            </select>
            <button type="submit" className="w-full bg-[#FF9900] text-slate-950 font-black py-3 rounded-2xl shadow">ऑर्डर कन्फर्म करें</button>
          </form>
        </div>
      )}

      {/* Rating Modal */}
      {reviewModalBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={submitReview} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setReviewModalBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">रेटिंग व फीडबैक</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRatingVal(star)} className={`text-2xl ${star <= ratingVal ? 'text-amber-400' : 'text-slate-300'}`}>★</button>
              ))}
            </div>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={2} placeholder="काम कैसा हुआ?" className="w-full p-2 border rounded-xl" />
            <textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)} rows={2} placeholder="कोई शिकायत है तो लिखें" className="w-full p-2 border border-red-200 rounded-xl text-red-900 bg-red-50" />
            <button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold shadow">सबमिट करें</button>
          </form>
        </div>
      )}

      {/* Edit Service/Product Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target;
            if (editItem.type === 'service') {
              await updateDoc(doc(db, "services", editItem.data.docId), { name: f.name.value, price: Number(f.price.value) });
            } else {
              await updateDoc(doc(db, "products", editItem.data.docId), { name: f.name.value, price: Number(f.price.value) });
            }
            setEditItem(null);
            alert("अपडेट हो गया!");
          }} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setEditItem(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm">संशोधन करें</h3>
            <input required name="name" defaultValue={editItem.data.name} className="w-full p-2 border rounded-xl font-bold" />
            <input required type="number" name="price" defaultValue={editItem.data.price} className="w-full p-2 border rounded-xl font-bold" />
            <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded-xl font-bold">सेव करें</button>
          </form>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target;
            await addDoc(collection(db, "services"), { name: f.name.value, price: Number(f.price.value), visiting: 99 });
            setShowAddService(false);
          }} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs relative">
            <button type="button" onClick={() => setShowAddService(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm">नई सर्विस जोड़ें</h3>
            <input required name="name" placeholder="सर्विस का नाम" className="w-full p-2 border rounded-xl" />
            <input required type="number" name="price" placeholder="चार्ज (₹)" className="w-full p-2 border rounded-xl" />
            <button type="submit" className="w-full bg-blue-900 text-white py-2.5 rounded-xl font-bold">सेव करें</button>
          </form>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target;
            await addDoc(collection(db, "products"), { name: f.name.value, brand: f.brand.value, price: Number(f.price.value) });
            setShowAddProduct(false);
          }} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs relative">
            <button type="button" onClick={() => setShowAddProduct(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm">नया सामान जोड़ें</h3>
            <input required name="name" placeholder="नाम" className="w-full p-2 border rounded-xl" />
            <input required name="brand" placeholder="ब्रांड" className="w-full p-2 border rounded-xl" />
            <input required type="number" name="price" placeholder="कीमत (₹)" className="w-full p-2 border rounded-xl" />
            <button type="submit" className="w-full bg-emerald-700 text-white py-2.5 rounded-xl font-bold">स्टोर में जोड़ें</button>
          </form>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 flex justify-around py-2.5 z-40 shadow-xl max-w-xl mx-auto">
        <button onClick={() => setActiveTab('home')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-[#FF9900]' : 'text-slate-400'}`}>
          <Zap className="w-4 h-4" /> होम
        </button>
        <button onClick={() => setActiveTab('cart')} className={`text-xs font-bold flex flex-col items-center gap-0.5 relative ${activeTab === 'cart' ? 'text-[#FF9900]' : 'text-slate-400'}`}>
          <ShoppingCart className="w-4 h-4" /> कार्ट
          {cart.length > 0 && <span className="absolute top-0 right-3 bg-[#FF9900] text-slate-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">{cart.length}</span>}
        </button>
        <button onClick={() => setActiveTab('orders')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'orders' ? 'text-[#FF9900]' : 'text-slate-400'}`}>
          <Clock className="w-4 h-4" /> आर्डर्स
        </button>
        {user?.role === 'admin' && (
          <button onClick={() => setActiveTab('admin')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'admin' ? 'text-[#FF9900]' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-4 h-4" /> एडमिन
          </button>
        )}
      </nav>

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
