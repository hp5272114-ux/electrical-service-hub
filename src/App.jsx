import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, doc, setDoc, getDoc, 
  onSnapshot, updateDoc, deleteDoc, getDocs 
} from 'firebase/firestore';
import { 
  Zap, Wrench, ShoppingBag, LayoutDashboard, LogIn, LogOut, 
  PhoneCall, MessageCircle, AlertTriangle, User, X, CheckCircle2, 
  Clock, Truck, Star, AlertCircle, Edit3, Trash2, PlusCircle, 
  Megaphone, Shield 
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
  const [activeTab, setActiveTab] = useState('home');

  // Real-time Cloud Data
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [broadcast, setBroadcast] = useState({ text: "गर्मी स्पेशल: पंखा रिपेयरिंग पर 20% की छूट!", active: true });

  // Modals & Active Edit States
  const [selectedService, setSelectedService] = useState(null);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [editItem, setEditItem] = useState(null); // { type: 'service' | 'product', data }
  const [showAddService, setShowAddService] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

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

  // 2. REAL-TIME CLOUD LISTENERS (Services, Products, Bookings & Broadcast)
  useEffect(() => {
    // A. Listen Bookings
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      const live = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      live.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setBookings(live);
    });

    // B. Listen Services (with auto-seed if empty)
    const unsubServices = onSnapshot(collection(db, "services"), async (snap) => {
      if (snap.empty) {
        // Auto-seed initial services if empty
        const initial = [
          { name: "Ceiling Fan Repair / पंखा रिपेयर", price: 199, visiting: 99 },
          { name: "Short Circuit Check / वायरिंग जांच", price: 399, visiting: 149 },
          { name: "Inverter Setup / इनवर्टर फिटिंग", price: 499, visiting: 149 },
          { name: "MCB Box & Wiring / स्विच बोर्ड फिटिंग", price: 299, visiting: 99 }
        ];
        for (const s of initial) {
          await addDoc(collection(db, "services"), s);
        }
      } else {
        setServices(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    });

    // C. Listen Products (with auto-seed if empty)
    const unsubProducts = onSnapshot(collection(db, "products"), async (snap) => {
      if (snap.empty) {
        const initial = [
          { name: "Polycab 2.5 Sq mm Wire (90m)", brand: "Polycab", price: 1899 },
          { name: "Havells 32A DP MCB Switch", brand: "Havells", price: 520 },
          { name: "Anchor Roma 6A Modular Switch Set", brand: "Anchor", price: 310 }
        ];
        for (const p of initial) {
          await addDoc(collection(db, "products"), p);
        }
      } else {
        setProducts(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    });

    // D. Listen Broadcast Offer Banner
    const unsubBroadcast = onSnapshot(doc(db, "settings", "broadcast"), (snap) => {
      if (snap.exists()) {
        setBroadcast(snap.data());
      } else {
        setDoc(doc(db, "settings", "broadcast"), { text: "विशेष ऑफर: सभी सर्विस पर 30 दिन की आधिकारिक गारंटी!", active: true });
      }
    });

    return () => {
      unsubBookings();
      unsubServices();
      unsubProducts();
      unsubBroadcast();
    };
  }, []);

  // 3. SECURE AUTH: REGISTRATION
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
      alert(`🎉 बधाई हो ${newUser.name}! आपका अकाउंट सफलतापूर्वक बन गया है।`);
    } catch (err) {
      alert("रजिस्ट्रेशन एरर: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // 4. SECURE AUTH: LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    if (phoneInput.length !== 10) return alert("10 अंकों का फोन नंबर डालें!");
    if (pinInput.length !== 4) return alert("4 अंकों का पिन डालें!");

    setAuthLoading(true);
    const cleanPhone = phoneInput.trim();

    if (cleanPhone === ADMIN_PHONE && pinInput === ADMIN_PIN) {
      const adminData = { name: "मास्टर एडमिन", phone: ADMIN_PHONE, role: 'admin' };
      setUser(adminData);
      localStorage.setItem('esh_user', JSON.stringify(adminData));
      setActiveTab('admin');
      setAuthLoading(false);
      alert("नमस्ते एडमिन! कंट्रोल रूम खुल चुका है।");
      return;
    }

    try {
      const userRef = doc(db, "users", cleanPhone);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("❌ यह नंबर रजिस्टर्ड नहीं है! कृपया पहले 'नया खाता बनाएं' पर क्लिक करें।");
        setAuthMode('register');
        setAuthLoading(false);
        return;
      }

      const userData = userSnap.data();
      if (userData.pin !== pinInput.trim()) {
        alert("❌ गलत पिन! सही 4-अंकों का पिन डालें।");
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

  // 5. BOOKING SUBMISSION
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

  // 6. RATING & COMPLAINT SUBMISSION
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

  // 7. ADMIN: BROADCAST SALE OFFER MESSAGE
  const updateBroadcastMessage = async (e) => {
    e.preventDefault();
    const text = e.target.broadcastText.value;
    try {
      await setDoc(doc(db, "settings", "broadcast"), {
        text,
        active: true,
        updatedAt: Date.now()
      });
      alert("🎉 बधाई! यह ऑफर संदेश तुरंत सभी ग्राहकों के ऐप पर लाइव हो गया है।");
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // 8. ADMIN: EDIT & SAVE SERVICE / PRODUCT
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      if (editItem.type === 'service') {
        await updateDoc(doc(db, "services", editItem.data.docId), {
          name: f.name.value,
          price: Number(f.price.value)
        });
        alert("सर्विस सफलतापूर्वक अपडेट हो गई!");
      } else {
        await updateDoc(doc(db, "products", editItem.data.docId), {
          name: f.name.value,
          brand: f.brand.value,
          price: Number(f.price.value)
        });
        alert("सामान (Product) सफलतापूर्वक अपडेट हो गया!");
      }
      setEditItem(null);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // 9. ADMIN: ADD NEW SERVICE
  const handleAddService = async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await addDoc(collection(db, "services"), {
        name: f.name.value,
        price: Number(f.price.value)
      });
      setShowAddService(false);
      alert("नई सर्विस सफलतापूर्वक जुड़ गई!");
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // 10. ADMIN: ADD NEW PRODUCT
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await addDoc(collection(db, "products"), {
        name: f.name.value,
        brand: f.brand.value,
        price: Number(f.price.value)
      });
      setShowAddProduct(false);
      alert("नया सामान स्टोर में जुड़ गया!");
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // ================= 1. SPLASH SCREEN DISPLAY =================
  if (showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1E3D] to-[#1E3A8A] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-yellow-400 p-5 rounded-3xl shadow-2xl animate-bounce mb-6">
          <Zap className="w-16 h-16 text-[#0B1E3D] fill-[#0B1E3D]" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">विद्युत सेवा हब</h1>
        <p className="text-yellow-300 font-bold tracking-widest text-xs uppercase mt-1">Electrical Service Hub</p>
        <div className="mt-8 flex items-center gap-2 text-xs text-blue-200 bg-white/10 px-4 py-2 rounded-full border border-white/20">
          <Shield className="w-4 h-4 text-yellow-400" />
          <span>100% वेरिफाइड इलेक्ट्रीशियन व असली सामान</span>
        </div>
        <div className="mt-12 flex gap-1.5">
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
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          
          <div className="bg-[#1E3A8A] text-white p-6 text-center">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-2 text-[#0B1E3D] font-black">
              <Zap className="w-7 h-7 fill-[#0B1E3D]" />
            </div>
            <h2 className="text-xl font-black">विद्युत सेवा हब</h2>
            <p className="text-xs text-yellow-300 font-medium">Electrical Service Hub</p>
          </div>

          <div className="flex border-b border-slate-200 bg-slate-50">
            <button 
              onClick={() => setAuthMode('login')} 
              className={`flex-1 py-3 text-xs font-black transition ${authMode === 'login' ? 'bg-white text-blue-900 border-b-2 border-blue-900' : 'text-slate-500'}`}
            >
              लॉगिन (Login)
            </button>
            <button 
              onClick={() => setAuthMode('register')} 
              className={`flex-1 py-3 text-xs font-black transition ${authMode === 'register' ? 'bg-white text-blue-900 border-b-2 border-blue-900' : 'text-slate-500'}`}
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
                    className="w-full p-2.5 border rounded-xl font-bold" 
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
                    className="w-full p-2.5 border rounded-xl text-center tracking-widest font-black text-base" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">एडमिन पिन: <strong>2026</strong></span>
                </div>

                <button 
                  disabled={authLoading} 
                  type="submit" 
                  className="w-full bg-[#1E3A8A] hover:bg-[#0B1E3D] text-white py-3 rounded-xl font-black text-xs shadow-md transition"
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
                    className="w-full p-2.5 border rounded-xl font-bold" 
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
                    className="w-full p-2.5 border rounded-xl font-bold" 
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
                      className="w-full p-2 border rounded-xl text-center font-black" 
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
                      className="w-full p-2 border rounded-xl text-center font-black" 
                    />
                  </div>
                </div>

                <button 
                  disabled={authLoading} 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-xs shadow-md transition mt-2"
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
      <header className="bg-[#1E3A8A] text-white p-3.5 shadow-md flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-yellow-400 p-1.5 rounded-lg text-[#0B1E3D]">
            <Zap className="w-5 h-5 fill-[#0B1E3D]" />
          </div>
          <div>
            <span className="font-black text-base block leading-none">विद्युत सेवा हब</span>
            <span className="text-[9px] text-yellow-300 font-bold uppercase">Live Cloud Sync</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded font-black ${user.role === 'admin' ? 'bg-yellow-400 text-blue-900' : 'bg-emerald-600 text-white'}`}>
            {user.role === 'admin' ? 'MASTER ADMIN' : user.name.split(' ')[0]}
          </span>
          <button onClick={handleLogout} title="लॉगआउट" className="text-red-300 hover:text-white p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Broadcast Offer Ribbon for Customers */}
      {broadcast.active && broadcast.text && (
        <div className="bg-yellow-400 text-blue-950 px-4 py-2 font-black text-xs flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-2 truncate">
            <Megaphone className="w-4 h-4 flex-shrink-0 fill-blue-950" />
            <span className="truncate">{broadcast.text}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider bg-blue-900 text-white px-2 py-0.5 rounded font-bold ml-2 flex-shrink-0">
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
          <a href={`tel:${ADMIN_PHONE}`} className="bg-yellow-400 text-blue-950 font-black text-xs px-3.5 py-2 rounded-xl shadow">
            SOS कॉल
          </a>
        </div>

        {/* ================= ADMIN VIEW ================= */}
        {activeTab === 'admin' && user.role === 'admin' && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg border border-yellow-400/30">
              <div>
                <span className="text-[10px] bg-yellow-400 text-blue-950 font-black px-2 py-0.5 rounded-full uppercase">Master Admin Room</span>
                <h2 className="text-lg font-black mt-1">एडमिन कंट्रोल डैशबोर्ड</h2>
                <p className="text-xs text-slate-400">हेल्पलाइन: +91 {ADMIN_PHONE}</p>
              </div>
              <button onClick={() => setActiveTab('home')} className="text-xs bg-blue-800 text-white px-3 py-1.5 rounded-lg font-bold">
                कस्टमर व्यू
              </button>
            </div>

            {/* 1. BROADCAST SALE / DISCOUNT MESSAGE MANAGER */}
            <div className="bg-white p-4 rounded-2xl border border-yellow-300 shadow-sm space-y-3">
              <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-amber-600" />
                सेल / ऑफर ब्रॉडकास्ट (सभी ग्राहकों को संदेश भेजें)
              </h3>
              <form onSubmit={updateBroadcastMessage} className="space-y-2 text-xs">
                <input 
                  required 
                  name="broadcastText" 
                  defaultValue={broadcast.text} 
                  placeholder="जैसे: दिवाली ऑफर: आज वायरिंग रिपेयर पर 20% छूट!" 
                  className="w-full p-2.5 border rounded-xl font-bold bg-slate-50"
                />
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-blue-950 font-black py-2 rounded-xl shadow text-xs">
                  ✔ सभी ग्राहकों के ऐप पर यह ऑफर लाइव करें
                </button>
              </form>
            </div>

            {/* 2. SERVICES CRUD & EDIT (लाइव संशोधन) */}
            <div className="bg-white p-4 rounded-2xl border space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1">
                  <Wrench className="w-4 h-4 text-blue-800" />
                  सर्विस लिस्ट व रेट संशोधन ({services.length})
                </h3>
                <button 
                  onClick={() => setShowAddService(true)} 
                  className="bg-blue-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-yellow-400" /> नई सर्विस
                </button>
              </div>

              <div className="space-y-2">
                {services.map((s) => (
                  <div key={s.docId} className="p-2.5 bg-slate-50 border rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{s.name}</span>
                      <span className="text-blue-900 font-black">₹{s.price}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setEditItem({ type: 'service', data: s })}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-900 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 text-[11px]"
                      >
                        <Edit3 className="w-3 h-3" /> बदलें
                      </button>
                      <button 
                        onClick={() => deleteDoc(doc(db, "services", s.docId))} 
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. PRODUCTS CRUD & EDIT (लाइव संशोधन) */}
            <div className="bg-white p-4 rounded-2xl border space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  प्रोडक्ट्स व सामान रेट संशोधन ({products.length})
                </h3>
                <button 
                  onClick={() => setShowAddProduct(true)} 
                  className="bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-yellow-300" /> नया सामान
                </button>
              </div>

              <div className="space-y-2">
                {products.map((p) => (
                  <div key={p.docId} className="p-2.5 bg-slate-50 border rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{p.brand}</span>
                      <span className="font-bold text-slate-800">{p.name}</span>
                      <div className="text-slate-900 font-black mt-0.5">₹{p.price}</div>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setEditItem({ type: 'product', data: p })}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 text-[11px]"
                      >
                        <Edit3 className="w-3 h-3" /> बदलें
                      </button>
                      <button 
                        onClick={() => deleteDoc(doc(db, "products", p.docId))} 
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. LIVE BOOKINGS, RATINGS & COMPLAINTS */}
            <div className="bg-white p-4 rounded-2xl border space-y-3 shadow-sm">
              <h3 className="font-bold text-xs text-slate-800">ग्राहकों के लाइव आर्डर व शिकायतें ({bookings.length})</h3>

              {bookings.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">अभी कोई बुकिंग दर्ज नहीं हुई है।</p>
              ) : (
                bookings.map((b) => (
                  <div key={b.docId} className="p-3 bg-slate-50 border rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-black text-blue-900">#{b.bookingId}</span> • <strong>{b.customerName}</strong>
                        <div className="text-slate-800 font-bold mt-0.5">{b.serviceName} (₹{b.price})</div>
                        <div className="text-[11px] text-slate-500">📞 {b.customerPhone} | 📍 {b.address}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                        b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'On The Way' ? 'bg-purple-100 text-purple-800' :
                        b.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    {/* Customer Rating Display */}
                    {b.rating && (
                      <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-lg space-y-1">
                        <div className="flex items-center gap-1 text-amber-500 font-black">
                          {"★".repeat(b.rating)}{"☆".repeat(5 - b.rating)} 
                          <span className="text-[10px] text-slate-700 ml-1">({b.rating}/5 स्टार)</span>
                        </div>
                        {b.review && <p className="text-[11px] text-slate-700 italic">"{b.review}"</p>}
                      </div>
                    )}

                    {/* Customer Complaint Display */}
                    {b.complaint && (
                      <div className="bg-red-50 border border-red-200 p-2 rounded-lg space-y-1 text-red-900">
                        <div className="flex justify-between items-center font-bold text-[11px]">
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" /> ग्राहक की शिकायत:
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${b.complaintStatus === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-200 text-red-900'}`}>
                            {b.complaintStatus === 'Resolved' ? '✔ हल हो गई' : 'लंबित (Pending)'}
                          </span>
                        </div>
                        <p className="text-[11px]">{b.complaint}</p>
                        {b.complaintStatus !== 'Resolved' && (
                          <button 
                            onClick={() => updateDoc(doc(db, "bookings", b.docId), { complaintStatus: "Resolved" })} 
                            className="text-[10px] bg-red-700 text-white font-bold px-2 py-0.5 rounded mt-1"
                          >
                            शिकायत का समाधान मार्क करें
                          </button>
                        )}
                      </div>
                    )}

                    {/* Status Action Buttons */}
                    <div className="flex gap-1.5 pt-2 border-t flex-wrap">
                      <button onClick={() => updateDoc(doc(db, "bookings", b.docId), { status: "Confirmed" })} className="bg-blue-800 text-white text-[10px] px-2.5 py-1 rounded font-bold">
                        स्वीकारें
                      </button>
                      <button onClick={() => updateDoc(doc(db, "bookings", b.docId), { status: "On The Way" })} className="bg-purple-700 text-white text-[10px] px-2.5 py-1 rounded font-bold">
                        रास्ते में
                      </button>
                      <button onClick={() => updateDoc(doc(db, "bookings", b.docId), { status: "Completed" })} className="bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded font-bold">
                        काम पूरा (Done)
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= CUSTOMER ORDERS VIEW ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <h2 className="font-black text-base text-slate-800">मेरे आर्डर व लाइव ट्रैकिंग</h2>

            {bookings.filter(b => b.customerPhone === user.phone).length === 0 ? (
              <div className="bg-white p-6 rounded-2xl text-center border text-xs text-slate-500">
                आपने अभी तक कोई सर्विस बुक नहीं की है।
              </div>
            ) : (
              bookings.filter(b => b.customerPhone === user.phone).map((b) => (
                <div key={b.docId} className="bg-white p-4 rounded-2xl border shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-xs text-blue-900">#{b.bookingId}</span>
                      <h4 className="font-black text-sm text-slate-900">{b.serviceName}</h4>
                    </div>
                    <span className="text-sm font-black text-slate-900">₹{b.price}</span>
                  </div>

                  {/* Amazon Progress Bar */}
                  <div className="bg-slate-50 p-3 rounded-xl border space-y-2">
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

        {/* ================= HOME VIEW ================= */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            
            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-5 rounded-2xl shadow-lg">
              <span className="bg-yellow-400 text-blue-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                ★ 45 मिनट में इलेक्ट्रीशियन घर पर
              </span>
              <h1 className="text-xl font-black mt-2">प्रमाणित इलेक्ट्रीशियन और 100% असली सामान</h1>
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

            {/* Services List (Real-time Cloud Sync) */}
            <div className="space-y-2.5">
              <h2 className="font-black text-sm text-slate-800">इलेक्ट्रिकल सेवाएं (Doorstep Services)</h2>
              {services.map((s) => (
                <div key={s.docId} className="bg-white p-3.5 rounded-xl border flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{s.name}</h3>
                    <div className="text-xs font-black text-blue-800 mt-0.5">₹{s.price}</div>
                  </div>
                  <button onClick={() => setSelectedService(s)} className="bg-blue-900 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow">
                    बुक करें
                  </button>
                </div>
              ))}
            </div>

            {/* Products List (Real-time Cloud Sync) */}
            <div className="space-y-2.5 pt-2">
              <h2 className="font-black text-sm text-slate-800">इलेक्ट्रिकल सामान स्टोर (Products)</h2>
              {products.map((p) => (
                <div key={p.docId} className="bg-white p-3.5 rounded-xl border flex justify-between items-center shadow-sm">
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
                    className="bg-yellow-400 text-blue-950 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 shadow"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> खरीदें
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}
      </main>

      {/* ================= EDIT SERVICE / PRODUCT MODAL (ADMIN ONLY) ================= */}
      {editItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveEdit} className="bg-white p-5 rounded-2xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setEditItem(null)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">
              {editItem.type === 'service' ? 'सर्विस संशोधन (Edit Service)' : 'सामान संशोधन (Edit Product)'}
            </h3>

            <div>
              <label className="block font-bold mb-1">नाम</label>
              <input required name="name" defaultValue={editItem.data.name} className="w-full p-2 border rounded-lg font-bold" />
            </div>

            {editItem.type === 'product' && (
              <div>
                <label className="block font-bold mb-1">ब्रांड</label>
                <input required name="brand" defaultValue={editItem.data.brand} className="w-full p-2 border rounded-lg font-bold" />
              </div>
            )}

            <div>
              <label className="block font-bold mb-1">कीमत (₹)</label>
              <input required type="number" name="price" defaultValue={editItem.data.price} className="w-full p-2 border rounded-lg font-bold" />
            </div>

            <button type="submit" className="w-full bg-blue-900 hover:bg-blue-950 text-white py-2.5 rounded-lg font-bold shadow text-xs">
              बदलाव सेव करें (Update Live)
            </button>
          </form>
        </div>
      )}

      {/* ================= ADD NEW SERVICE MODAL ================= */}
      {showAddService && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddService} className="bg-white p-5 rounded-2xl w-full max-w-sm space-y-3 text-xs shadow-xl relative">
            <button type="button" onClick={() => setShowAddService(false)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">नई सर्विस जोड़ें</h3>
            <div>
              <label className="block font-bold mb-1">सर्विस का नाम</label>
              <input required name="name" placeholder="जैसे: मोटर वाइंडिंग रिपेयर" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-bold mb-1">शुरुआती चार्ज (₹)</label>
              <input required type="number" name="price" placeholder="जैसे: 350" className="w-full p-2 border rounded-lg" />
            </div>
            <button type="submit" className="w-full bg-blue-900 text-white py-2.5 rounded-lg font-bold shadow text-xs">
              सर्विस लाइव करें
            </button>
          </form>
        </div>
      )}

      {/* ================= ADD NEW PRODUCT MODAL ================= */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddProduct} className="bg-white p-5 rounded-2xl w-full max-w-sm space-y-3 text-xs shadow-xl relative">
            <button type="button" onClick={() => setShowAddProduct(false)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">नया सामान स्टोर में जोड़ें</h3>
            <div>
              <label className="block font-bold mb-1">प्रोडक्ट का नाम</label>
              <input required name="name" placeholder="जैसे: LED Batten 20W" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-bold mb-1">ब्रांड का नाम</label>
              <input required name="brand" placeholder="जैसे: Philips / Havells" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-bold mb-1">कीमत (₹)</label>
              <input required type="number" name="price" placeholder="जैसे: 240" className="w-full p-2 border rounded-lg" />
            </div>
            <button type="submit" className="w-full bg-emerald-700 text-white py-2.5 rounded-lg font-bold shadow text-xs">
              सामान स्टोर में जोड़ें
            </button>
          </form>
        </div>
      )}

      {/* ================= BOOKING MODAL ================= */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleBooking} className="bg-white p-5 rounded-2xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setSelectedService(null)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">सर्विस बुकिंग</h3>
            <p className="text-xs text-blue-800 font-bold">{selectedService.name} (₹{selectedService.price})</p>

            <div className="bg-slate-50 p-2.5 rounded-lg border text-slate-600">
              <div><strong>ग्राहक:</strong> {user.name}</div>
              <div><strong>मोबाइल:</strong> {user.phone}</div>
            </div>

            <div>
              <label className="block font-bold mb-1">समय स्लॉट चुनें</label>
              <select name="custSlot" className="w-full p-2 border rounded-lg font-semibold">
                <option>सुबह (9:00 AM - 1:00 PM)</option>
                <option>दोपहर (1:00 PM - 5:00 PM)</option>
                <option>शाम (5:00 PM - 8:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">मकान नंबर, गली व लैंडमार्क</label>
              <textarea required name="custAddr" rows={2} placeholder="पूरा पता दर्ज करें" className="w-full p-2 border rounded-lg"></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-900 hover:bg-blue-950 text-white py-2.5 rounded-lg font-bold shadow text-xs">
              कन्फर्म बुकिंग (Live Cloud Sync)
            </button>
          </form>
        </div>
      )}

      {/* ================= RATING & COMPLAINT MODAL ================= */}
      {reviewModalBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={submitReview} className="bg-white p-5 rounded-2xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setReviewModalBooking(null)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">रेटिंग और फीडबैक</h3>
            <p className="text-xs text-slate-500">सर्विस: {reviewModalBooking.serviceName}</p>

            <div>
              <label className="block font-bold mb-1">रेटिंग दें:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRatingVal(star)} 
                    className={`text-2xl ${star <= ratingVal ? 'text-amber-400' : 'text-slate-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">आपकी राय (Review)</label>
              <textarea 
                value={reviewText} 
                onChange={(e) => setReviewText(e.target.value)} 
                rows={2} 
                placeholder="काम कैसा हुआ? इलेक्ट्रीशियन का व्यवहार कैसा था?" 
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="border-t pt-2">
              <label className="block font-bold text-red-700 mb-1">क्या कोई शिकायत है? (Complaint Box)</label>
              <textarea 
                value={complaintText} 
                onChange={(e) => setComplaintText(e.target.value)} 
                rows={2} 
                placeholder="अगर कोई खराबी दोबारा आई है या कोई समस्या है तो लिखें (एडमिन तुरंत देखेगा)" 
                className="w-full p-2 border border-red-200 rounded-lg text-red-900 bg-red-50/50"
              />
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold shadow text-xs">
              सबमिट करें
            </button>
          </form>
        </div>
      )}

      {/* ================= BOTTOM NAVIGATION ================= */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2.5 z-40 shadow-lg">
        <button onClick={() => setActiveTab('home')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-blue-900' : 'text-slate-400'}`}>
          <Zap className="w-4 h-4" /> होम
        </button>
        <button onClick={() => setActiveTab('orders')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'orders' ? 'text-blue-900' : 'text-slate-400'}`}>
          <Clock className="w-4 h-4" /> मेरे आर्डर
        </button>
        {user?.role === 'admin' && (
          <button onClick={() => setActiveTab('admin')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'admin' ? 'text-yellow-600' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-4 h-4" /> एडमिन
          </button>
        )}
      </nav>

    </div>
  );
}
