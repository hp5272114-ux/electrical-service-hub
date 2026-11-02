import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, doc, setDoc, getDoc, 
  onSnapshot, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { 
  Zap, Wrench, ShoppingBag, LayoutDashboard, LogIn, LogOut, 
  PhoneCall, MessageCircle, AlertTriangle, User, X, CheckCircle2, 
  Clock, Truck, Star, AlertCircle, Edit3, Trash2, PlusCircle, 
  Megaphone, Shield, Search, TrendingUp, DollarSign, Users, 
  CheckSquare, ArrowUpRight, Filter, Send, Share2 
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
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('esh_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'orders' | 'admin'
  const [adminSubTab, setAdminSubTab] = useState('metrics'); // 'metrics' | 'orders' | 'services' | 'products' | 'broadcast'
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'complaints'
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time Cloud Collections
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [broadcast, setBroadcast] = useState({ text: "गर्मी स्पेशल: पंखा रिपेयरिंग पर 20% की छूट!", active: true });

  // Modals & Action States
  const [selectedService, setSelectedService] = useState(null);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showAddService, setShowAddService] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [assignTechBooking, setAssignTechBooking] = useState(null);

  // Auth Inputs
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Review Inputs
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [complaintText, setComplaintText] = useState('');

  // 1. SPLASH SCREEN (2.5 Seconds)
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // 2. REAL-TIME CLOUD LISTENERS
  useEffect(() => {
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      const live = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      live.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setBookings(live);
    });

    const unsubServices = onSnapshot(collection(db, "services"), async (snap) => {
      if (snap.empty) {
        const initial = [
          { name: "Ceiling Fan Repair / पंखा रिपेयर", price: 199, category: "Fans" },
          { name: "Short Circuit Check / वायरिंग जांच", price: 399, category: "Wiring" },
          { name: "Inverter Setup / इनवर्टर व बैटरी", price: 499, category: "Power" },
          { name: "MCB Box & Wiring / स्विच बोर्ड फिटिंग", price: 299, category: "Switchgear" }
        ];
        for (const s of initial) await addDoc(collection(db, "services"), s);
      } else {
        setServices(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    });

    const unsubProducts = onSnapshot(collection(db, "products"), async (snap) => {
      if (snap.empty) {
        const initial = [
          { name: "Polycab 2.5 Sq mm Wire (90m)", brand: "Polycab", price: 1899 },
          { name: "Havells 32A DP MCB Switch", brand: "Havells", price: 520 },
          { name: "Anchor Roma 6A Modular Switch Set", brand: "Anchor", price: 310 }
        ];
        for (const p of initial) await addDoc(collection(db, "products"), p);
      } else {
        setProducts(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    });

    const unsubBroadcast = onSnapshot(doc(db, "settings", "broadcast"), (snap) => {
      if (snap.exists()) setBroadcast(snap.data());
      else setDoc(doc(db, "settings", "broadcast"), { text: "विशेष ऑफर: सभी सर्विस पर 30 दिन की आधिकारिक गारंटी!", active: true });
    });

    return () => {
      unsubBookings();
      unsubServices();
      unsubProducts();
      unsubBroadcast();
    };
  }, []);

  // 3. FINANCIAL & DASHBOARD METRICS CALCULATION
  const totalRevenue = bookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  const pendingBookingsCount = bookings.filter(b => b.status === 'Placed').length;
  const activeJobsCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'On The Way').length;
  const complaintsCount = bookings.filter(b => b.complaint && b.complaintStatus !== 'Resolved').length;
  
  const ratedBookings = bookings.filter(b => b.rating);
  const avgRating = ratedBookings.length 
    ? (ratedBookings.reduce((sum, b) => sum + b.rating, 0) / ratedBookings.length).toFixed(1)
    : "5.0";

  // 4. SECURE AUTH: REGISTRATION
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return alert("कृपया अपना पूरा नाम लिखें!");
    if (phoneInput.length !== 10) return alert("कृपया 10 अंकों का फोन नंबर डालें!");
    if (pinInput.length !== 4) return alert("4 अंकों का पिन बनाएं!");
    if (pinInput !== confirmPinInput) return alert("दोनों पिन एक जैसे होने चाहिए!");

    setAuthLoading(true);
    const cleanPhone = phoneInput.trim();

    try {
      const userRef = doc(db, "users", cleanPhone);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        alert("यह मोबाइल नंबर पहले से रजिस्टर्ड है! कृपया सीधे 'लॉगिन' करें।");
        setAuthMode('login');
        setAuthLoading(false);
        return;
      }

      const newUser = {
        name: nameInput.trim(),
        phone: cleanPhone,
        pin: pinInput.trim(),
        role: cleanPhone === ADMIN_PHONE ? 'admin' : 'customer',
        createdAt: Date.now()
      };

      await setDoc(userRef, newUser);
      setUser(newUser);
      localStorage.setItem('esh_user', JSON.stringify(newUser));
      alert(`🎉 बधाई हो ${newUser.name}! आपका अकाउंट बन गया है।`);
    } catch (err) {
      alert("रजिस्ट्रेशन एरर: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // 5. SECURE AUTH: LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    if (phoneInput.length !== 10 || pinInput.length !== 4) return alert("10 अंकों का नंबर और 4 अंकों का पिन डालें!");

    setAuthLoading(true);
    const cleanPhone = phoneInput.trim();

    if (cleanPhone === ADMIN_PHONE && pinInput === ADMIN_PIN) {
      const adminData = { name: "मास्टर एडमिन", phone: ADMIN_PHONE, role: 'admin' };
      setUser(adminData);
      localStorage.setItem('esh_user', JSON.stringify(adminData));
      setActiveTab('admin');
      setAuthLoading(false);
      alert("नमस्ते एडमिन! आपका एग्जीक्यूटिव कंट्रोल रूम खुल चुका है।");
      return;
    }

    try {
      const userRef = doc(db, "users", cleanPhone);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("❌ यह नंबर रजिस्टर्ड नहीं है! कृपया पहले 'नया खाता बनाएं' पर टैप करें।");
        setAuthMode('register');
        setAuthLoading(false);
        return;
      }

      const userData = userSnap.data();
      if (userData.pin !== pinInput.trim()) {
        alert("❌ गलत पिन! कृपया सही 4-अंकों का पिन डालें।");
        setAuthLoading(false);
        return;
      }

      setUser(userData);
      localStorage.setItem('esh_user', JSON.stringify(userData));
      alert(`नमस्ते ${userData.name}! लॉगिन सफल हुआ।`);
    } catch (err) {
      alert("लॉगिन एरर: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('esh_user');
    setPhoneInput('');
    setPinInput('');
    setAuthMode('login');
    setActiveTab('home');
  };

  // 6. BOOKING SUBMISSION
  const handleBooking = async (e) => {
    e.preventDefault();
    const form = e.target;
    const refCode = "ESH-" + Math.floor(1000 + Math.random() * 9000);

    const bookingData = {
      bookingId: refCode,
      customerName: user.name,
      customerPhone: user.phone,
      serviceName: selectedService.name,
      price: selectedService.price,
      slot: form.custSlot.value,
      address: form.custAddr.value,
      status: "Placed",
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "bookings"), bookingData);
      setSelectedService(null);
      setActiveTab('orders');
      alert(`🎉 बुकिंग दर्ज हो चुकी है! रिफरेंस: #${refCode}`);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // 7. DISPATCH JOB TO TECHNICIAN VIA WHATSAPP
  const dispatchToTechnician = (e) => {
    e.preventDefault();
    const techPhone = e.target.techPhone.value;
    const techName = e.target.techName.value;
    const b = assignTechBooking;

    const msg = `⚡ *इलेक्ट्रिकल जॉब असाइनमेंट (विद्युत सेवा हब)*\n\n` +
      `नमस्ते ${techName}, आपको नया काम सौंपा गया है:\n` +
      `🆔 *बुकिंग आईडी:* #${b.bookingId}\n` +
      `👤 *ग्राहक:* ${b.customerName} (📞 ${b.customerPhone})\n` +
      `🔧 *काम:* ${b.serviceName}\n` +
      `💰 *चार्ज:* ₹${b.price}\n` +
      `⏰ *समय स्लॉट:* ${b.slot}\n` +
      `📍 *पता:* ${b.address}\n\n` +
      `कृपया तुरंत ग्राहक से संपर्क करके समय पर पहुंचें।`;

    updateDoc(doc(db, "bookings", b.docId), { 
      status: "On The Way",
      assignedTo: techName
    });

    window.open(`https://wa.me/91${techPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    setAssignTechBooking(null);
    alert(`काम ${techName} को WhatsApp पर भेज दिया गया है और स्टेटस 'रास्ते में' हो गया है।`);
  };

  // 8. RATING & COMPLAINT SUBMISSION
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
      alert("आपकी रेटिंग और प्रतिक्रिया दर्ज कर ली गई है। धन्यवाद!");
      setReviewModalBooking(null);
      setReviewText('');
      setComplaintText('');
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // ================= 1. SPLASH SCREEN DISPLAY =================
  if (showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1E3D] via-[#102A56] to-[#1E3A8A] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-yellow-400 p-5 rounded-3xl shadow-2xl animate-bounce mb-6 border-4 border-yellow-300">
          <Zap className="w-16 h-16 text-[#0B1E3D] fill-[#0B1E3D]" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">विद्युत सेवा हब</h1>
        <p className="text-yellow-300 font-bold tracking-widest text-xs uppercase mt-1">Electrical Service Hub</p>
        <div className="mt-8 flex items-center gap-2 text-xs text-blue-100 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
          <Shield className="w-4 h-4 text-yellow-400" />
          <span>100% वेरिफाइड इलेक्ट्रीशियन व असली सामान</span>
        </div>
        <div className="mt-12 flex gap-2">
          <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
          <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
          <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
        </div>
      </div>
    );
  }

  // ================= 2. MANDATORY AUTH SCREEN =================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          
          <div className="bg-gradient-to-r from-[#0B1E3D] to-[#1E3A8A] text-white p-6 text-center">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-2 text-[#0B1E3D] font-black shadow-lg">
              <Zap className="w-7 h-7 fill-[#0B1E3D]" />
            </div>
            <h2 className="text-xl font-black tracking-tight">विद्युत सेवा हब</h2>
            <p className="text-xs text-yellow-300 font-medium">Certified Electrical Services & Store</p>
          </div>

          <div className="flex border-b border-slate-200 bg-slate-50">
            <button 
              onClick={() => setAuthMode('login')} 
              className={`flex-1 py-3.5 text-xs font-black transition ${authMode === 'login' ? 'bg-white text-blue-900 border-b-2 border-blue-900 shadow-sm' : 'text-slate-400'}`}
            >
              लॉगिन (Login)
            </button>
            <button 
              onClick={() => setAuthMode('register')} 
              className={`flex-1 py-3.5 text-xs font-black transition ${authMode === 'register' ? 'bg-white text-blue-900 border-b-2 border-blue-900 shadow-sm' : 'text-slate-400'}`}
            >
              नया खाता बनाएं (Register)
            </button>
          </div>

          <div className="p-6">
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">मोबाइल नंबर</label>
                  <input 
                    required 
                    type="tel" 
                    maxLength={10} 
                    value={phoneInput} 
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))} 
                    placeholder="10 अंकों का मोबाइल नंबर" 
                    className="w-full p-2.5 border rounded-xl font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">एडमिन लॉगिन: <strong>6367626276</strong></span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">4-अंकों का गुप्त पिन</label>
                  <input 
                    required 
                    type="password" 
                    maxLength={4} 
                    value={pinInput} 
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} 
                    placeholder="****" 
                    className="w-full p-2.5 border rounded-xl text-center tracking-widest font-black text-base bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-900" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">एडमिन पिन: <strong>2026</strong></span>
                </div>

                <button 
                  disabled={authLoading} 
                  type="submit" 
                  className="w-full bg-[#1E3A8A] hover:bg-[#0B1E3D] text-white py-3 rounded-xl font-black text-xs shadow-lg transition active:scale-95"
                >
                  {authLoading ? "जांच हो रही है..." : "लॉगिन करें"}
                </button>

                <p className="text-[11px] text-center text-slate-500 pt-2">
                  नया अकाउंट बनाना है?{" "}
                  <button type="button" onClick={() => setAuthMode('register')} className="text-blue-900 font-bold underline">
                    यहाँ रजिस्टर करें
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">पूरा नाम</label>
                  <input 
                    required 
                    type="text" 
                    value={nameInput} 
                    onChange={(e) => setNameInput(e.target.value)} 
                    placeholder="जैसे: राहुल शर्मा" 
                    className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" 
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">10 अंकों का मोबाइल नंबर</label>
                  <input 
                    required 
                    type="tel" 
                    maxLength={10} 
                    value={phoneInput} 
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))} 
                    placeholder="मोबाइल नंबर डालें" 
                    className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">4-अंकों का पिन</label>
                    <input 
                      required 
                      type="password" 
                      maxLength={4} 
                      value={pinInput} 
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} 
                      placeholder="****" 
                      className="w-full p-2 border rounded-xl text-center font-black bg-slate-50" 
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">पिन कन्फर्म करें</label>
                    <input 
                      required 
                      type="password" 
                      maxLength={4} 
                      value={confirmPinInput} 
                      onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))} 
                      placeholder="****" 
                      className="w-full p-2 border rounded-xl text-center font-black bg-slate-50" 
                    />
                  </div>
                </div>

                <button 
                  disabled={authLoading} 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-xs shadow-lg transition mt-2 active:scale-95"
                >
                  {authLoading ? "अकाउंट बन रहा है..." : "खाता बनाएं (Register)"}
                </button>

                <p className="text-[11px] text-center text-slate-500 pt-2">
                  पहले से अकाउंट है?{" "}
                  <button type="button" onClick={() => setAuthMode('login')} className="text-blue-900 font-bold underline">
                    सीधे लॉगिन करें
                  </button>
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ================= 3. MAIN LOGGED-IN APP =================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans">
      
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[#0B1E3D] to-[#1E3A8A] text-white p-3.5 shadow-md flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-yellow-400 p-1.5 rounded-xl text-[#0B1E3D] shadow">
            <Zap className="w-5 h-5 fill-[#0B1E3D]" />
          </div>
          <div>
            <span className="font-black text-base block leading-none">विद्युत सेवा हब</span>
            <span className="text-[9px] text-yellow-300 font-bold uppercase tracking-wider">Executive Cloud Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black flex items-center gap-1 shadow-sm ${user.role === 'admin' ? 'bg-yellow-400 text-blue-950' : 'bg-emerald-600 text-white'}`}>
            <User className="w-3 h-3" />
            {user.role === 'admin' ? 'MASTER ADMIN' : user.name.split(' ')[0]}
          </span>
          <button onClick={handleLogout} title="लॉगआउट" className="text-red-300 hover:text-white p-1 rounded-lg">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Broadcast Offer Ribbon for Customers */}
      {broadcast.active && broadcast.text && (
        <div className="bg-yellow-400 text-blue-950 px-4 py-2 font-black text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <Megaphone className="w-4 h-4 flex-shrink-0 fill-blue-950 animate-bounce" />
            <span className="truncate">{broadcast.text}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider bg-blue-950 text-white px-2 py-0.5 rounded-full font-bold ml-2 flex-shrink-0">
            ऑफर
          </span>
        </div>
      )}

      {/* Main Body */}
      <main className="max-w-xl mx-auto p-4 space-y-4">

        {/* SOS Alert */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-3.5 rounded-2xl shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-xl animate-pulse">
              <AlertTriangle className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-sm">24x7 इमरजेंसी बिजली फॉल्ट?</h3>
              <p className="text-[11px] text-red-100">15 मिनट में इलेक्ट्रीशियन सहायता</p>
            </div>
          </div>
          <a href={`tel:${ADMIN_PHONE}`} className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-black text-xs px-3.5 py-2 rounded-xl shadow active:scale-95 transition">
            SOS कॉल
          </a>
        </div>

        {/* ============================================================== */}
        {/* ============= 🏆 EXECUTIVE ADMIN CONTROL ROOM ================ */}
        {/* ============================================================== */}
        {activeTab === 'admin' && user.role === 'admin' && (
          <div className="space-y-4">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-[#0B1E3D] via-[#102A56] to-[#1E3A8A] text-white p-5 rounded-3xl shadow-xl border border-yellow-400/30">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-yellow-400 text-blue-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Executive Control Center
                  </span>
                  <h2 className="text-xl font-black mt-1.5">मास्टर एडमिन डैशबोर्ड</h2>
                  <p className="text-xs text-blue-200">हेल्पलाइन: +91 {ADMIN_PHONE}</p>
                </div>
                <button 
                  onClick={() => setActiveTab('home')} 
                  className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl font-bold backdrop-blur border border-white/20"
                >
                  कस्टमर व्यू
                </button>
              </div>

              {/* Quick Summary Pill */}
              <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-blue-200">सिस्टम स्थिति: <strong className="text-emerald-400">● ऑनलाइन (क्लाउड सिंक)</strong></span>
                <span className="text-yellow-300 font-bold">पिन: 2026</span>
              </div>
            </div>

            {/* 4 Professional KPI Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Metric 1: Revenue */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">कुल कमाई (Revenue)</span>
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">₹{totalRevenue}</div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                  ✔ पूरे हुए कामों से
                </span>
              </div>

              {/* Metric 2: Active / Running Jobs */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">चालू काम (Active)</span>
                  <div className="p-1.5 bg-blue-50 rounded-lg text-blue-800">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-blue-900 mt-1">{activeJobsCount}</div>
                <span className="text-[10px] text-blue-700 font-bold mt-1 block">स्वीकृत व रास्ते में</span>
              </div>

              {/* Metric 3: Pending Approvals */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">नये आर्डर (Pending)</span>
                  <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-600 mt-1">{pendingBookingsCount}</div>
                <span className="text-[10px] text-amber-700 font-bold mt-1 block">तुरंत स्वीकार करें</span>
              </div>

              {/* Metric 4: Ratings & Complaints */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">रेटिंग व शिकायतें</span>
                  <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
                    <Star className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">{avgRating}★</div>
                <span className="text-[10px] font-bold text-rose-600 mt-1 block">
                  {complaintsCount ? `⚠ ${complaintsCount} खुली शिकायतें` : `✔ सब ठीक है`}
                </span>
              </div>
            </div>

            {/* Admin Sub-Navigation Workspace Tabs */}
            <div className="bg-white p-1 rounded-2xl border border-slate-200 flex justify-between shadow-sm overflow-x-auto">
              <button 
                onClick={() => setAdminSubTab('metrics')} 
                className={`flex-1 py-2 px-2 text-[11px] font-bold rounded-xl whitespace-nowrap transition ${adminSubTab === 'metrics' ? 'bg-[#0B1E3D] text-yellow-400 shadow' : 'text-slate-500'}`}
              >
                📊 ओवरव्यू
              </button>
              <button 
                onClick={() => setAdminSubTab('orders')} 
                className={`flex-1 py-2 px-2 text-[11px] font-bold rounded-xl whitespace-nowrap transition ${adminSubTab === 'orders' ? 'bg-[#0B1E3D] text-yellow-400 shadow' : 'text-slate-500'}`}
              >
                📋 आर्डर्स ({bookings.length})
              </button>
              <button 
                onClick={() => setAdminSubTab('services')} 
                className={`flex-1 py-2 px-2 text-[11px] font-bold rounded-xl whitespace-nowrap transition ${adminSubTab === 'services' ? 'bg-[#0B1E3D] text-yellow-400 shadow' : 'text-slate-500'}`}
              >
                ⚡ सर्विसेज
              </button>
              <button 
                onClick={() => setAdminSubTab('products')} 
                className={`flex-1 py-2 px-2 text-[11px] font-bold rounded-xl whitespace-nowrap transition ${adminSubTab === 'products' ? 'bg-[#0B1E3D] text-yellow-400 shadow' : 'text-slate-500'}`}
              >
                📦 स्टोर
              </button>
              <button 
                onClick={() => setAdminSubTab('broadcast')} 
                className={`flex-1 py-2 px-2 text-[11px] font-bold rounded-xl whitespace-nowrap transition ${adminSubTab === 'broadcast' ? 'bg-[#0B1E3D] text-yellow-400 shadow' : 'text-slate-500'}`}
              >
                📢 ऑफर्स
              </button>
            </div>

            {/* --- WORKSPACE 1: ORDERS & COMPLAINTS MANAGEMENT --- */}
            {(adminSubTab === 'orders' || adminSubTab === 'metrics') && (
              <div className="bg-white p-4 rounded-3xl border border-slate-200 space-y-3 shadow-sm">
                
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xs text-slate-800">लाइव आर्डर्स व शिकायतें</h3>
                  
                  {/* Order Filter Pills */}
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                    <button onClick={() => setOrderFilter('all')} className={`px-2 py-0.5 rounded ${orderFilter === 'all' ? 'bg-white shadow text-blue-900' : 'text-slate-500'}`}>सभी</button>
                    <button onClick={() => setOrderFilter('pending')} className={`px-2 py-0.5 rounded ${orderFilter === 'pending' ? 'bg-white shadow text-blue-900' : 'text-slate-500'}`}>नये</button>
                    <button onClick={() => setOrderFilter('complaints')} className={`px-2 py-0.5 rounded ${orderFilter === 'complaints' ? 'bg-white shadow text-rose-600' : 'text-slate-500'}`}>शिकायतें</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {bookings
                    .filter(b => {
                      if (orderFilter === 'pending') return b.status === 'Placed';
                      if (orderFilter === 'complaints') return b.complaint;
                      return true;
                    })
                    .map((b) => (
                      <div key={b.docId} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-blue-900 text-sm">#{b.bookingId}</span>
                              <span className="text-slate-400">•</span>
                              <strong className="text-slate-800">{b.customerName}</strong>
                            </div>
                            <div className="text-slate-800 font-bold mt-0.5">{b.serviceName} (₹{b.price})</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">📞 {b.customerPhone} | 📍 {b.address}</div>
                            {b.assignedTo && (
                              <div className="text-[10px] text-blue-700 font-bold mt-0.5">
                                👷 इलेक्ट्रीशियन: {b.assignedTo}
                              </div>
                            )}
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${
                            b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            b.status === 'On The Way' ? 'bg-purple-100 text-purple-800' :
                            b.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        {/* Customer Rating Display */}
                        {b.rating && (
                          <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-xl space-y-1">
                            <div className="flex items-center gap-1 text-amber-500 font-black">
                              {"★".repeat(b.rating)}{"☆".repeat(5 - b.rating)} 
                              <span className="text-[10px] text-slate-700 ml-1">({b.rating}/5 स्टार)</span>
                            </div>
                            {b.review && <p className="text-[11px] text-slate-700 italic">"{b.review}"</p>}
                          </div>
                        )}

                        {/* Customer Complaint Box & Action */}
                        {b.complaint && (
                          <div className="bg-red-50 border border-red-200 p-2.5 rounded-xl space-y-1 text-red-900">
                            <div className="flex justify-between items-center font-bold text-[11px]">
                              <span className="flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-red-600" /> ग्राहक की शिकायत:
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${b.complaintStatus === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-200 text-red-900'}`}>
                                {b.complaintStatus === 'Resolved' ? '✔ हल हो गई' : 'लंबित (Pending)'}
                              </span>
                            </div>
                            <p className="text-[11px]">{b.complaint}</p>
                            {b.complaintStatus !== 'Resolved' && (
                              <button 
                                onClick={() => updateDoc(doc(db, "bookings", b.docId), { complaintStatus: "Resolved" })} 
                                className="text-[10px] bg-red-700 hover:bg-red-800 text-white font-bold px-2.5 py-1 rounded-lg mt-1"
                              >
                                शिकायत का समाधान मार्क करें
                              </button>
                            )}
                          </div>
                        )}

                        {/* Operational Action Buttons */}
                        <div className="flex gap-1.5 pt-2 border-t border-slate-200 flex-wrap">
                          <button 
                            onClick={() => updateDoc(doc(db, "bookings", b.docId), { status: "Confirmed" })} 
                            className="bg-blue-800 hover:bg-blue-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-bold"
                          >
                            स्वीकारें
                          </button>
                          
                          {/* 1-Click WhatsApp Dispatch to Electrician */}
                          <button 
                            onClick={() => setAssignTechBooking(b)}
                            className="bg-purple-700 hover:bg-purple-800 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> लड़के को सौंपें
                          </button>

                          <button 
                            onClick={() => updateDoc(doc(db, "bookings", b.docId), { status: "Completed" })} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-bold ml-auto"
                          >
                            काम पूरा (Done)
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* --- WORKSPACE 2: SERVICES MANAGEMENT --- */}
            {adminSubTab === 'services' && (
              <div className="bg-white p-4 rounded-3xl border border-slate-200 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-xs text-slate-800">सर्विस लिस्ट व रेट कार्ड</h3>
                    <p className="text-[10px] text-slate-400">यहाँ से रेट बदलते ही ग्राहकों के फोन में तुरंत बदलेगा</p>
                  </div>
                  <button 
                    onClick={() => setShowAddService(true)} 
                    className="bg-blue-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-yellow-400" /> नई सर्विस
                  </button>
                </div>

                <div className="space-y-2">
                  {services.map((s) => (
                    <div key={s.docId} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{s.name}</span>
                        <span className="text-blue-900 font-black text-sm">₹{s.price}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => setEditItem({ type: 'service', data: s })}
                          className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 text-[11px]"
                        >
                          <Edit3 className="w-3 h-3" /> बदलें
                        </button>
                        <button 
                          onClick={() => deleteDoc(doc(db, "services", s.docId))} 
                          className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- WORKSPACE 3: PRODUCTS & INVENTORY --- */}
            {adminSubTab === 'products' && (
              <div className="bg-white p-4 rounded-3xl border border-slate-200 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-xs text-slate-800">प्रोडक्ट्स व सामान स्टोर</h3>
                    <p className="text-[10px] text-slate-400">तार, स्विच, MCB की कीमतें लाइव कंट्रोल करें</p>
                  </div>
                  <button 
                    onClick={() => setShowAddProduct(true)} 
                    className="bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-yellow-300" /> नया सामान
                  </button>
                </div>

                <div className="space-y-2">
                  {products.map((p) => (
                    <div key={p.docId} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">{p.brand}</span>
                        <span className="font-bold text-slate-800">{p.name}</span>
                        <div className="text-slate-900 font-black text-sm mt-0.5">₹{p.price}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => setEditItem({ type: 'product', data: p })}
                          className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 text-[11px]"
                        >
                          <Edit3 className="w-3 h-3" /> बदलें
                        </button>
                        <button 
                          onClick={() => deleteDoc(doc(db, "products", p.docId))} 
                          className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- WORKSPACE 4: BROADCAST OFFER BANNER --- */}
            {adminSubTab === 'broadcast' && (
              <div className="bg-white p-5 rounded-3xl border border-yellow-300 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <Megaphone className="w-5 h-5 text-amber-600" />
                  <h3 className="font-black text-sm">ऑफर / सेल ब्रॉडकास्टर</h3>
                </div>
                <p className="text-xs text-slate-500">
                  यहाँ आप जो भी डिस्काउंट या घोषणा लिखेंगे, वह 1 सेकंड में सभी ग्राहकों के ऐप के ऊपर चमकने लगेगी!
                </p>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const text = e.target.broadcastText.value;
                  await setDoc(doc(db, "settings", "broadcast"), { text, active: true, updatedAt: Date.now() });
                  alert("🎉 यह संदेश तुरंत सभी ग्राहकों के ऐप पर लाइव हो गया है!");
                }} className="space-y-3 text-xs">
                  <textarea 
                    required 
                    name="broadcastText" 
                    rows={3}
                    defaultValue={broadcast.text} 
                    placeholder="जैसे: 🔥 गर्मी ऑफर: सभी पंखा रिपेयर पर 20% छूट!" 
                    className="w-full p-3 border rounded-2xl font-bold bg-slate-50"
                  />
                  <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-blue-950 font-black py-3 rounded-xl shadow-md text-xs transition">
                    ✔ सभी ग्राहकों के ऐप पर यह ऑफर लाइव करें
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* ==================== CUSTOMER ORDERS VIEW ==================== */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <h2 className="font-black text-base text-slate-800">मेरे आर्डर व लाइव ट्रैकिंग</h2>

            {bookings.filter(b => b.customerPhone === user.phone).length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center border text-xs text-slate-500 space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p>आपने अभी तक कोई सर्विस बुक नहीं की है।</p>
                <button onClick={() => setActiveTab('home')} className="bg-[#1E3A8A] text-white font-bold px-4 py-2 rounded-xl text-xs">
                  सर्विस बुक करें
                </button>
              </div>
            ) : (
              bookings.filter(b => b.customerPhone === user.phone).map((b) => (
                <div key={b.docId} className="bg-white p-4 rounded-3xl border shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-xs text-blue-900">#{b.bookingId}</span>
                      <h4 className="font-black text-sm text-slate-900">{b.serviceName}</h4>
                      {b.assignedTo && <span className="text-[10px] text-blue-700 font-bold">👷 इलेक्ट्रीशियन: {b.assignedTo}</span>}
                    </div>
                    <span className="text-sm font-black text-slate-900">₹{b.price}</span>
                  </div>

                  {/* Amazon Progress Bar */}
                  <div className="bg-slate-50 p-3 rounded-2xl border space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">लाइव ट्रैकिंग</span>
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-blue-900 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> दर्ज हुई</span>
                      <span className={b.status !== 'Placed' ? 'text-blue-900' : 'text-slate-300'}>स्वीकृत</span>
                      <span className={b.status === 'On The Way' || b.status === 'Completed' ? 'text-purple-700 flex items-center gap-1' : 'text-slate-300'}><Truck className="w-3.5 h-3.5" /> रास्ते में</span>
                      <span className={b.status === 'Completed' ? 'text-emerald-600 flex items-center gap-1' : 'text-slate-300'}><CheckCircle2 className="w-3.5 h-3.5" /> पूरा</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${
                        b.status === 'Placed' ? 'w-1/4 bg-yellow-400' :
                        b.status === 'Confirmed' ? 'w-2/4 bg-blue-600' :
                        b.status === 'On The Way' ? 'w-3/4 bg-purple-600' : 'w-full bg-emerald-600'
                      }`} />
                    </div>
                  </div>

                  {/* Rating & Complaint Trigger when Completed */}
                  {b.status === 'Completed' && (
                    <div className="border-t pt-2 flex justify-between items-center">
                      {b.rating ? (
                        <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> आपने {b.rating}★ रेटिंग दी है
                        </div>
                      ) : (
                        <button 
                          onClick={() => setReviewModalBooking(b)} 
                          className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow"
                        >
                          <Star className="w-3.5 h-3.5 fill-blue-950" /> सर्विस को रेटिंग दें / शिकायत दर्ज करें
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ===================== CUSTOMER HOME VIEW ===================== */}
        {/* ============================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            
            {/* Instant Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="सर्च करें: पंखा, इनवर्टर, तार, स्विच..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 shadow-sm"
              />
            </div>

            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-[#0B1E3D] via-[#102A56] to-[#1E3A8A] text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
              <span className="bg-yellow-400 text-blue-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ★ 45 मिनट में इलेक्ट्रीशियन घर पर
              </span>
              <h1 className="text-xl font-black mt-2 leading-tight">प्रमाणित इलेक्ट्रीशियन और 100% असली सामान</h1>
              <p className="text-xs text-blue-200 mt-1">शॉर्ट सर्किट, पंखा, मोटर, इनवर्टर व वायरिंग रिपेयर</p>
              
              <div className="flex gap-2 mt-4">
                <a href={`tel:${ADMIN_PHONE}`} className="bg-yellow-400 text-blue-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1 shadow">
                  <PhoneCall className="w-3.5 h-3.5" /> {ADMIN_PHONE}
                </a>
                <a href={`https://wa.me/91${ADMIN_PHONE}?text=नमस्ते,%20मुझे%20इलेक्ट्रीशियन%20चाहिए`} className="bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 shadow">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </div>

            {/* Services List */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <h2 className="font-black text-sm text-slate-800">इलेक्ट्रिकल सेवाएं (Services)</h2>
                <span className="text-[10px] text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded-full">डोरस्टेप सेवा</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {services
                  .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((s) => (
                    <div key={s.docId} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
                      <div>
                        <h3 className="font-bold text-xs text-slate-900">{s.name}</h3>
                        <div className="text-xs font-black text-blue-800 mt-0.5">₹{s.price}</div>
                      </div>
                      <button 
                        onClick={() => setSelectedService(s)} 
                        className="bg-[#1E3A8A] hover:bg-[#0B1E3D] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow active:scale-95 transition"
                      >
                        बुक करें
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Products Store */}
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between items-center">
                <h2 className="font-black text-sm text-slate-800">इलेक्ट्रिकल सामान स्टोर (Products)</h2>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">100% ओरिजिनल</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {products
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => (
                    <div key={p.docId} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{p.brand}</span>
                        <h3 className="font-bold text-xs text-slate-900">{p.name}</h3>
                        <div className="text-sm font-black text-slate-900 mt-0.5">₹{p.price}</div>
                      </div>
                      <button 
                        onClick={() => {
                          const msg = `🛒 *सामान आर्डर:* ${p.name} (मूल्य: ₹${p.price})`;
                          window.open(`https://wa.me/91${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
                        }} 
                        className="bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow active:scale-95 transition"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> खरीदें
                      </button>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ================= MODAL: ASSIGN TECHNICIAN ================= */}
      {assignTechBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={dispatchToTechnician} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setAssignTechBooking(null)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">इलेक्ट्रीशियन को काम सौंपें (Dispatch)</h3>
            <p className="text-[11px] text-slate-500">बुकिंग: #{assignTechBooking.bookingId} - {assignTechBooking.serviceName}</p>

            <div>
              <label className="block font-bold mb-1">इलेक्ट्रीशियन का नाम</label>
              <input required name="techName" placeholder="जैसे: विनोद कुमार" className="w-full p-2.5 border rounded-xl" />
            </div>

            <div>
              <label className="block font-bold mb-1">इलेक्ट्रीशियन का WhatsApp नंबर</label>
              <input required name="techPhone" type="tel" maxLength={10} placeholder="10 अंकों का फोन नंबर" className="w-full p-2.5 border rounded-xl font-bold" />
            </div>

            <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2.5 rounded-xl font-bold shadow flex items-center justify-center gap-1 text-xs">
              <Send className="w-3.5 h-3.5" /> WhatsApp पर जॉब डिटेल्स भेजें
            </button>
          </form>
        </div>
      )}

      {/* ================= MODAL: EDIT SERVICE / PRODUCT ================= */}
      {editItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target;
            if (editItem.type === 'service') {
              await updateDoc(doc(db, "services", editItem.data.docId), { name: f.name.value, price: Number(f.price.value) });
            } else {
              await updateDoc(doc(db, "products", editItem.data.docId), { name: f.name.value, brand: f.brand.value, price: Number(f.price.value) });
            }
            setEditItem(null);
            alert("सफलतापूर्वक अपडेट हो गया!");
          }} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setEditItem(null)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">
              {editItem.type === 'service' ? 'सर्विस संशोधन (Edit Service)' : 'सामान संशोधन (Edit Product)'}
            </h3>

            <div>
              <label className="block font-bold mb-1">नाम</label>
              <input required name="name" defaultValue={editItem.data.name} className="w-full p-2 border rounded-xl font-bold" />
            </div>

            {editItem.type === 'product' && (
              <div>
                <label className="block font-bold mb-1">ब्रांड</label>
                <input required name="brand" defaultValue={editItem.data.brand} className="w-full p-2 border rounded-xl font-bold" />
              </div>
            )}

            <div>
              <label className="block font-bold mb-1">कीमत (₹)</label>
              <input required type="number" name="price" defaultValue={editItem.data.price} className="w-full p-2 border rounded-xl font-bold" />
            </div>

            <button type="submit" className="w-full bg-blue-900 text-white py-2.5 rounded-xl font-bold shadow text-xs">
              बदलाव सेव करें (Update Live)
            </button>
          </form>
        </div>
      )}

      {/* ================= MODAL: ADD SERVICE ================= */}
      {showAddService && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target;
            await addDoc(collection(db, "services"), { name: f.name.value, price: Number(f.price.value) });
            setShowAddService(false);
            alert("नई सर्विस जुड़ गई!");
          }} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-xl relative">
            <button type="button" onClick={() => setShowAddService(false)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">नई सर्विस जोड़ें</h3>
            <div>
              <label className="block font-bold mb-1">सर्विस का नाम</label>
              <input required name="name" placeholder="जैसे: मोटर वाइंडिंग रिपेयर" className="w-full p-2 border rounded-xl" />
            </div>
            <div>
              <label className="block font-bold mb-1">शुरुआती चार्ज (₹)</label>
              <input required type="number" name="price" placeholder="जैसे: 350" className="w-full p-2 border rounded-xl" />
            </div>
            <button type="submit" className="w-full bg-blue-900 text-white py-2.5 rounded-xl font-bold shadow text-xs">
              सर्विस लाइव करें
            </button>
          </form>
        </div>
      )}

      {/* ================= MODAL: ADD PRODUCT ================= */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target;
            await addDoc(collection(db, "products"), { name: f.name.value, brand: f.brand.value, price: Number(f.price.value) });
            setShowAddProduct(false);
            alert("सामान स्टोर में जुड़ गया!");
          }} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-xl relative">
            <button type="button" onClick={() => setShowAddProduct(false)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">नया सामान स्टोर में जोड़ें</h3>
            <div>
              <label className="block font-bold mb-1">प्रोडक्ट का नाम</label>
              <input required name="name" placeholder="जैसे: LED Batten 20W" className="w-full p-2 border rounded-xl" />
            </div>
            <div>
              <label className="block font-bold mb-1">ब्रांड का नाम</label>
              <input required name="brand" placeholder="जैसे: Philips" className="w-full p-2 border rounded-xl" />
            </div>
            <div>
              <label className="block font-bold mb-1">कीमत (₹)</label>
              <input required type="number" name="price" placeholder="जैसे: 240" className="w-full p-2 border rounded-xl" />
            </div>
            <button type="submit" className="w-full bg-emerald-700 text-white py-2.5 rounded-xl font-bold shadow text-xs">
              सामान स्टोर में जोड़ें
            </button>
          </form>
        </div>
      )}

      {/* ================= MODAL: BOOKING ================= */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleBooking} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setSelectedService(null)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">सर्विस बुकिंग</h3>
            <p className="text-xs text-blue-800 font-bold">{selectedService.name} (₹{selectedService.price})</p>

            <div className="bg-slate-50 p-2.5 rounded-xl border text-slate-600">
              <div><strong>ग्राहक:</strong> {user.name}</div>
              <div><strong>मोबाइल:</strong> {user.phone}</div>
            </div>

            <div>
              <label className="block font-bold mb-1">समय स्लॉट चुनें</label>
              <select name="custSlot" className="w-full p-2 border rounded-xl font-semibold">
                <option>सुबह (9:00 AM - 1:00 PM)</option>
                <option>दोपहर (1:00 PM - 5:00 PM)</option>
                <option>शाम (5:00 PM - 8:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">मकान नंबर, गली व लैंडमार्क</label>
              <textarea required name="custAddr" rows={2} placeholder="पूरा पता दर्ज करें" className="w-full p-2 border rounded-xl"></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-900 hover:bg-blue-950 text-white py-2.5 rounded-xl font-bold shadow text-xs">
              कन्फर्म बुकिंग (Live Cloud Sync)
            </button>
          </form>
        </div>
      )}

      {/* ================= MODAL: RATING & COMPLAINT ================= */}
      {reviewModalBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={submitReview} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setReviewModalBooking(null)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">रेटिंग और फीडबैक</h3>
            <p className="text-xs text-slate-500">सर्विस: {reviewModalBooking.serviceName}</p>

            <div>
              <label className="block font-bold mb-1">रेटिंग दें:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRatingVal(star)} className={`text-2xl ${star <= ratingVal ? 'text-amber-400' : 'text-slate-300'}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">आपकी राय (Review)</label>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={2} placeholder="काम कैसा हुआ?" className="w-full p-2 border rounded-xl" />
            </div>

            <div className="border-t pt-2">
              <label className="block font-bold text-red-700 mb-1">शिकायत बॉक्स (Complaint Box)</label>
              <textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)} rows={2} placeholder="अगर कोई खराबी दोबारा आई है तो लिखें (एडमिन तुरंत देखेगा)" className="w-full p-2 border border-red-200 rounded-xl text-red-900 bg-red-50/50" />
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold shadow text-xs">
              सबमिट करें
            </button>
          </form>
        </div>
      )}

      {/* ================= BOTTOM NAVIGATION ================= */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 flex justify-around py-2.5 z-40 shadow-lg">
        <button onClick={() => setActiveTab('home')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-blue-900' : 'text-slate-400'}`}>
          <Zap className="w-4 h-4" /> होम
        </button>
        <button onClick={() => setActiveTab('orders')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'orders' ? 'text-blue-900' : 'text-slate-400'}`}>
          <Clock className="w-4 h-4" /> मेरे आर्डर
        </button>
        {user?.role === 'admin' && (
          <button onClick={() => setActiveTab('admin')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'admin' ? 'text-yellow-600' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-4 h-4" /> एडमिन डैशबोर्ड
          </button>
        )}
      </nav>

    </div>
  );
}
