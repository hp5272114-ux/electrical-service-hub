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
  Megaphone, Shield, Search, TrendingUp, Camera, QrCode, 
  FileText, Check, Send, DollarSign, Image 
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

// इमेज को सुरक्षित रूप से कंप्रेस करके बेस64 में बदलने का फंक्शन
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

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('esh_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('home');
  const [adminSubTab, setAdminSubTab] = useState('metrics');
  const [searchQuery, setSearchQuery] = useState('');

  // Collections
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [broadcast, setBroadcast] = useState({ text: "गर्मी स्पेशल: पंखा रिपेयरिंग पर 20% की छूट!", active: true });
  const [paymentConfig, setPaymentConfig] = useState({ upiId: "6367626276@upi", upiName: "Electrical Service Hub" });

  // Modals
  const [selectedService, setSelectedService] = useState(null);
  const [billModalBooking, setBillModalBooking] = useState(null);
  const [customerPayBooking, setCustomerPayBooking] = useState(null);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showAddService, setShowAddService] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Billing & Photo Upload Form States
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

  // 1. SPLASH SCREEN
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
          { name: "Ceiling Fan Repair / पंखा रिपेयर", price: 199, visiting: 99 },
          { name: "Short Circuit Check / वायरिंग जांच", price: 399, visiting: 149 },
          { name: "Inverter Setup / इनवर्टर व बैटरी", price: 499, visiting: 149 },
          { name: "MCB Box & Wiring / स्विच बोर्ड फिटिंग", price: 299, visiting: 99 }
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

    const unsubPayment = onSnapshot(doc(db, "settings", "payment"), (snap) => {
      if (snap.exists()) setPaymentConfig(snap.data());
      else setDoc(doc(db, "settings", "payment"), { upiId: "6367626276@upi", upiName: "Electrical Service Hub" });
    });

    return () => {
      unsubBookings();
      unsubServices();
      unsubProducts();
      unsubBroadcast();
      unsubPayment();
    };
  }, []);

  // 3. METRICS
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid' || b.status === 'Completed')
    .reduce((sum, b) => sum + (Number(b.finalTotal || b.price) || 0), 0);

  const pendingCount = bookings.filter(b => b.status === 'Placed').length;
  const activeCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'On The Way').length;
  const complaintsCount = bookings.filter(b => b.complaint && b.complaintStatus !== 'Resolved').length;

  // 4. AUTH
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nameInput.trim() || phoneInput.length !== 10 || pinInput.length !== 4) return alert("सभी फील्ड सही भरें!");
    if (pinInput !== confirmPinInput) return alert("दोनों पिन एक जैसे होने चाहिए!");

    setAuthLoading(true);
    const cleanPhone = phoneInput.trim();

    try {
      const userRef = doc(db, "users", cleanPhone);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        alert("यह मोबाइल नंबर पहले से रजिस्टर्ड है! सीधे लॉगिन करें।");
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
      alert(`स्वागत है ${newUser.name}! अकाउंट तैयार है।`);
    } catch (err) {
      alert("एरर: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (phoneInput.length !== 10 || pinInput.length !== 4) return alert("10 अंकों का फोन नंबर व 4 अंकों का पिन डालें!");

    setAuthLoading(true);
    const cleanPhone = phoneInput.trim();

    if (cleanPhone === ADMIN_PHONE && pinInput === ADMIN_PIN) {
      const adminData = { name: "मास्टर एडमिन", phone: ADMIN_PHONE, role: 'admin' };
      setUser(adminData);
      localStorage.setItem('esh_user', JSON.stringify(adminData));
      setActiveTab('admin');
      setAuthLoading(false);
      return;
    }

    try {
      const userRef = doc(db, "users", cleanPhone);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("❌ यह नंबर रजिस्टर्ड नहीं है! पहले 'नया खाता बनाएं' पर क्लिक करें।");
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
      paymentStatus: "unpaid",
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "bookings"), bookingData);
      setSelectedService(null);
      setActiveTab('orders');
      alert(`🎉 बुकिंग दर्ज! रिफरेंस: #${refCode}`);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // 6. ADMIN GENERATES FINAL BILL & UPLOADS BEFORE/AFTER PHOTOS
  const handleGenerateFinalBill = async (e) => {
    e.preventDefault();
    if (!billModalBooking) return;

    const total = Number(labourFee) + Number(materialFee) + Number(visitFee);

    try {
      await updateDoc(doc(db, "bookings", billModalBooking.docId), {
        beforePhoto: beforePhoto || null,
        afterPhoto: afterPhoto || null,
        workDetails: workDetails || "कार्य सफलतापूर्वक पूर्ण हुआ।",
        labourFee: Number(labourFee),
        materialFee: Number(materialFee),
        visitFee: Number(visitFee),
        finalTotal: total,
        status: "Completed",
        isBilled: true,
        paymentStatus: "unpaid"
      });
      alert(`✔ फाइनल बिल ₹${total} जारी कर दिया गया है। ग्राहक को पेमेंट व फोटो दिखेंगे।`);
      setBillModalBooking(null);
      setBeforePhoto('');
      setAfterPhoto('');
      setWorkDetails('');
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // 7. CUSTOMER CONFIRMS PAYMENT (CASH OR ONLINE)
  const handleCustomerPayment = async (mode) => {
    if (!customerPayBooking) return;
    try {
      await updateDoc(doc(db, "bookings", customerPayBooking.docId), {
        paymentMode: mode,
        paymentStatus: mode === 'cash' ? 'cash_selected' : 'paid'
      });
      alert(mode === 'cash' 
        ? "✔ आपने कैश विकल्प चुना है। कृपया इलेक्ट्रीशियन को नकद राशि दें।" 
        : "🎉 ऑनलाइन UPI पेमेंट सफलतापूर्वक दर्ज हो गई है! धन्यवाद।");
      setCustomerPayBooking(null);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // 8. RATING
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

  // ================= SPLASH =================
  if (showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1E3D] via-[#102A56] to-[#1E3A8A] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-yellow-400 p-5 rounded-3xl shadow-2xl animate-bounce mb-6 border-4 border-yellow-300">
          <Zap className="w-16 h-16 text-[#0B1E3D] fill-[#0B1E3D]" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">विद्युत सेवा हब</h1>
        <p className="text-yellow-300 font-bold tracking-widest text-xs uppercase mt-1">Electrical Service Hub</p>
        <div className="mt-8 flex items-center gap-2 text-xs text-blue-100 bg-white/10 px-4 py-2 rounded-full border border-white/20">
          <Shield className="w-4 h-4 text-yellow-400" />
          <span>100% वेरिफाइड इलेक्ट्रीशियन व फोटो प्रूफ बिलिंग</span>
        </div>
      </div>
    );
  }

  // ================= AUTH =================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0B1E3D] to-[#1E3A8A] text-white p-6 text-center">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-2 text-[#0B1E3D] font-black">
              <Zap className="w-7 h-7 fill-[#0B1E3D]" />
            </div>
            <h2 className="text-xl font-black">विद्युत सेवा हब</h2>
            <p className="text-xs text-yellow-300 font-medium">Electrical Services & Store</p>
          </div>

          <div className="flex border-b border-slate-200 bg-slate-50">
            <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 text-xs font-black ${authMode === 'login' ? 'bg-white text-blue-900 border-b-2 border-blue-900' : 'text-slate-400'}`}>
              लॉगिन (Login)
            </button>
            <button onClick={() => setAuthMode('register')} className={`flex-1 py-3 text-xs font-black ${authMode === 'register' ? 'bg-white text-blue-900 border-b-2 border-blue-900' : 'text-slate-400'}`}>
              नया खाता (Register)
            </button>
          </div>

          <div className="p-6">
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">मोबाइल नंबर</label>
                  <input required type="tel" maxLength={10} value={phoneInput} onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))} placeholder="10 अंकों का फोन नंबर" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
                  <span className="text-[10px] text-slate-400 mt-1 block">एडमिन लॉगिन: <strong>6367626276</strong></span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">4-अंकों का गुप्त पिन</label>
                  <input required type="password" maxLength={4} value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} placeholder="****" className="w-full p-2.5 border rounded-xl text-center tracking-widest font-black text-base bg-slate-50" />
                  <span className="text-[10px] text-slate-400 mt-1 block">एडमिन पिन: <strong>2026</strong></span>
                </div>
                <button disabled={authLoading} type="submit" className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-black text-xs shadow-lg">
                  {authLoading ? "जांच जारी..." : "लॉगिन करें"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <input required type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="पूरा नाम" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
                <input required type="tel" maxLength={10} value={phoneInput} onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))} placeholder="मोबाइल नंबर" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
                <div className="grid grid-cols-2 gap-2">
                  <input required type="password" maxLength={4} value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} placeholder="4-अंकों का पिन" className="w-full p-2 border rounded-xl text-center font-black bg-slate-50" />
                  <input required type="password" maxLength={4} value={confirmPinInput} onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))} placeholder="कन्फर्म पिन" className="w-full p-2 border rounded-xl text-center font-black bg-slate-50" />
                </div>
                <button disabled={authLoading} type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-xs shadow-lg">
                  {authLoading ? "रजिस्टर हो रहा है..." : "खाता बनाएं"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN APP =================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0B1E3D] to-[#1E3A8A] text-white p-3.5 shadow-md flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-yellow-400 p-1.5 rounded-xl text-[#0B1E3D] shadow">
            <Zap className="w-5 h-5 fill-[#0B1E3D]" />
          </div>
          <div>
            <span className="font-black text-base block leading-none">विद्युत सेवा हब</span>
            <span className="text-[9px] text-yellow-300 font-bold uppercase">Work Proof & Live Billing</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${user.role === 'admin' ? 'bg-yellow-400 text-blue-950' : 'bg-emerald-600 text-white'}`}>
            {user.role === 'admin' ? 'MASTER ADMIN' : user.name.split(' ')[0]}
          </span>
          <button onClick={handleLogout} className="text-red-300 p-1"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Offer Strip */}
      {broadcast.active && broadcast.text && (
        <div className="bg-yellow-400 text-blue-950 px-4 py-2 font-black text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <Megaphone className="w-4 h-4 flex-shrink-0 fill-blue-950 animate-bounce" />
            <span className="truncate">{broadcast.text}</span>
          </div>
          <span className="text-[10px] uppercase bg-blue-950 text-white px-2 py-0.5 rounded-full font-bold ml-2">ऑफर</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-xl mx-auto p-4 space-y-4">
        
        {/* SOS */}
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
          <a href={`tel:${ADMIN_PHONE}`} className="bg-yellow-400 text-blue-950 font-black text-xs px-3.5 py-2 rounded-xl shadow">SOS कॉल</a>
        </div>

        {/* ================= ADMIN WORKSPACE ================= */}
        {activeTab === 'admin' && user.role === 'admin' && (
          <div className="space-y-4">
            
            {/* Admin Header */}
            <div className="bg-gradient-to-br from-[#0B1E3D] via-[#102A56] to-[#1E3A8A] text-white p-5 rounded-3xl shadow-xl border border-yellow-400/30 flex justify-between items-start">
              <div>
                <span className="bg-yellow-400 text-blue-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Executive Center</span>
                <h2 className="text-xl font-black mt-1.5">एडमिन कंट्रोल डैशबोर्ड</h2>
                <p className="text-xs text-blue-200">हेल्पलाइन: +91 {ADMIN_PHONE}</p>
              </div>
              <button onClick={() => setActiveTab('home')} className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-xl font-bold border border-white/20">
                कस्टमर व्यू
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">कुल कमाई (Revenue)</span>
                <div className="text-2xl font-black text-slate-900 mt-1">₹{totalRevenue}</div>
                <span className="text-[10px] text-emerald-600 font-bold">✔ फाइनल बिलिंग से</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">नये आर्डर (Pending)</span>
                <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
                <span className="text-[10px] text-amber-700 font-bold">तुरंत स्वीकार करें</span>
              </div>
            </div>

            {/* Admin Subtabs */}
            <div className="bg-white p-1 rounded-2xl border flex justify-between shadow-sm overflow-x-auto text-[11px] font-bold">
              <button onClick={() => setAdminSubTab('metrics')} className={`flex-1 py-2 px-2 rounded-xl whitespace-nowrap ${adminSubTab === 'metrics' ? 'bg-[#0B1E3D] text-yellow-400' : 'text-slate-500'}`}>📋 आर्डर्स व बिलिंग ({bookings.length})</button>
              <button onClick={() => setAdminSubTab('payment')} className={`flex-1 py-2 px-2 rounded-xl whitespace-nowrap ${adminSubTab === 'payment' ? 'bg-[#0B1E3D] text-yellow-400' : 'text-slate-500'}`}>💳 UPI व QR सेटिंग</button>
              <button onClick={() => setAdminSubTab('services')} className={`flex-1 py-2 px-2 rounded-xl whitespace-nowrap ${adminSubTab === 'services' ? 'bg-[#0B1E3D] text-yellow-400' : 'text-slate-500'}`}>⚡ सर्विसेज</button>
              <button onClick={() => setAdminSubTab('products')} className={`flex-1 py-2 px-2 rounded-xl whitespace-nowrap ${adminSubTab === 'products' ? 'bg-[#0B1E3D] text-yellow-400' : 'text-slate-500'}`}>📦 स्टोर</button>
            </div>

            {/* 1. ORDERS, BILLING & WORK PROOF LIST */}
            {adminSubTab === 'metrics' && (
              <div className="bg-white p-4 rounded-3xl border space-y-3 shadow-sm">
                <h3 className="font-black text-xs text-slate-800">लाइव आर्डर, काम का फोटो प्रूफ व बिलिंग</h3>

                {bookings.map((b) => (
                  <div key={b.docId} className="p-3.5 bg-slate-50 border rounded-2xl space-y-2.5 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-black text-blue-900 text-sm">#{b.bookingId}</span> • <strong>{b.customerName}</strong>
                        <div className="text-slate-800 font-bold mt-0.5">{b.serviceName}</div>
                        <div className="text-[11px] text-slate-500">📞 {b.customerPhone} | 📍 {b.address}</div>
                        {b.finalTotal && (
                          <div className="text-xs font-black text-emerald-700 mt-1">
                            फाइनल बिल: ₹{b.finalTotal} ({b.paymentStatus === 'paid' ? '✔ पेड' : b.paymentMode === 'cash' ? '💵 कैश पेंडिंग' : '⏳ अनपेड'})
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

                    {/* Before & After Photos Preview in Admin */}
                    {(b.beforePhoto || b.afterPhoto) && (
                      <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-xl border">
                        {b.beforePhoto && (
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block">काम से पहले (Before):</span>
                            <img src={b.beforePhoto} alt="Before" className="h-24 w-full object-cover rounded-lg mt-1" />
                          </div>
                        )}
                        {b.afterPhoto && (
                          <div>
                            <span className="text-[9px] font-bold text-emerald-600 block">काम के बाद (After):</span>
                            <img src={b.afterPhoto} alt="After" className="h-24 w-full object-cover rounded-lg mt-1" />
                          </div>
                        )}
                      </div>
                    )}

                    {b.workDetails && (
                      <div className="bg-slate-100 p-2 rounded-lg text-[11px] text-slate-700">
                        <strong>काम का विवरण:</strong> {b.workDetails}
                      </div>
                    )}

                    {/* Operational Actions */}
                    <div className="flex gap-1.5 pt-2 border-t flex-wrap">
                      <button onClick={() => updateDoc(doc(db, "bookings", b.docId), { status: "Confirmed" })} className="bg-blue-800 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold">
                        स्वीकारें
                      </button>
                      <button onClick={() => updateDoc(doc(db, "bookings", b.docId), { status: "On The Way" })} className="bg-purple-700 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold">
                        रास्ते में
                      </button>
                      
                      {/* Button to Open Final Bill & Photo Upload */}
                      <button 
                        onClick={() => {
                          setBillModalBooking(b);
                          setLabourFee(b.price || 199);
                          setMaterialFee(0);
                          setVisitFee(99);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-3 py-1 rounded-lg font-bold flex items-center gap-1 shadow ml-auto"
                      >
                        <Camera className="w-3 h-3 text-yellow-300" /> फाइनल बिल व फोटो प्रूफ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. ADMIN UPI & QR CODE SETTINGS */}
            {adminSubTab === 'payment' && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-sm text-slate-800">एडमिन UPI व QR कोड सेटिंग्स</h3>
                </div>
                <p className="text-xs text-slate-500">
                  यहाँ अपना फोनपे, गूगल पे या बैंक का UPI ID डालें। ग्राहक को इसी ID का QR कोड दिखेगा!
                </p>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const f = e.target;
                  await setDoc(doc(db, "settings", "payment"), {
                    upiId: f.upiId.value.trim(),
                    upiName: f.upiName.value.trim()
                  });
                  alert("✔ आपकी नई UPI ID सफलतापूर्वक सेव हो गई है!");
                }} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">आपका UPI ID (VPA)</label>
                    <input required name="upiId" defaultValue={paymentConfig.upiId} placeholder="जैसे: 6367626276@upi या yourname@okaxis" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">दुकान / खाताधारक का नाम</label>
                    <input required name="upiName" defaultValue={paymentConfig.upiName} placeholder="जैसे: Electrical Service Hub" className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
                  </div>

                  <div className="p-3 bg-slate-50 border rounded-2xl text-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">वर्तमान लाइव QR कोड प्रीव्यू:</span>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${paymentConfig.upiId}%26pn=${encodeURIComponent(paymentConfig.upiName)}%26cu=INR`} 
                      alt="UPI QR Preview" 
                      className="w-32 h-32 mx-auto rounded-lg border shadow-sm"
                    />
                    <div className="font-mono text-xs font-bold text-slate-800">{paymentConfig.upiId}</div>
                  </div>

                  <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 rounded-xl shadow text-xs">
                    सेव करें (Update UPI Globally)
                  </button>
                </form>
              </div>
            )}

            {/* 3. SERVICES */}
            {adminSubTab === 'services' && (
              <div className="bg-white p-4 rounded-3xl border space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xs text-slate-800">सर्विस लिस्ट व चार्ज संशोधन</h3>
                  <button onClick={() => setShowAddService(true)} className="bg-blue-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow">
                    <PlusCircle className="w-3.5 h-3.5 text-yellow-400" /> नई सर्विस
                  </button>
                </div>
                {services.map((s) => (
                  <div key={s.docId} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{s.name}</span>
                      <span className="text-blue-900 font-black text-sm">₹{s.price}</span>
                      <span className="text-[10px] text-slate-400 ml-2">विजिट: ₹{s.visiting || 99}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditItem({ type: 'service', data: s })} className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 text-[11px]"><Edit3 className="w-3 h-3" /> बदलें</button>
                      <button onClick={() => deleteDoc(doc(db, "services", s.docId))} className="text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. PRODUCTS */}
            {adminSubTab === 'products' && (
              <div className="bg-white p-4 rounded-3xl border space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xs text-slate-800">सामान स्टोर व कीमतें</h3>
                  <button onClick={() => setShowAddProduct(true)} className="bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow">
                    <PlusCircle className="w-3.5 h-3.5 text-yellow-300" /> नया सामान
                  </button>
                </div>
                {products.map((p) => (
                  <div key={p.docId} className="p-3 bg-slate-50 border rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">{p.brand}</span>
                      <span className="font-bold text-slate-800">{p.name}</span>
                      <div className="text-slate-900 font-black text-sm mt-0.5">₹{p.price}</div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditItem({ type: 'product', data: p })} className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 text-[11px]"><Edit3 className="w-3 h-3" /> बदलें</button>
                      <button onClick={() => deleteDoc(doc(db, "products", p.docId))} className="text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ================= CUSTOMER ORDERS VIEW ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <h2 className="font-black text-base text-slate-800">मेरे आर्डर व लाइव बिलिंग</h2>

            {bookings.filter(b => b.customerPhone === user.phone).map((b) => (
              <div key={b.docId} className="bg-white p-4 rounded-3xl border shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-xs text-blue-900">#{b.bookingId}</span>
                    <h4 className="font-black text-sm text-slate-900">{b.serviceName}</h4>
                  </div>
                  <span className="text-sm font-black text-slate-900">₹{b.finalTotal || b.price}</span>
                </div>

                {/* Tracking Bar */}
                <div className="bg-slate-50 p-3 rounded-2xl border space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-blue-900 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> दर्ज</span>
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

                {/* Before & After Photo Proof to Customer */}
                {(b.beforePhoto || b.afterPhoto) && (
                  <div className="border border-slate-200 p-2.5 rounded-2xl bg-slate-50 space-y-2">
                    <span className="text-[10px] font-bold text-blue-900 uppercase block">प्रमाणित कार्य फोटो प्रूफ (Photo Proof):</span>
                    <div className="grid grid-cols-2 gap-2">
                      {b.beforePhoto && (
                        <div>
                          <span className="text-[9px] text-slate-400 block">काम से पहले:</span>
                          <img src={b.beforePhoto} alt="Before" className="h-24 w-full object-cover rounded-xl mt-0.5" />
                        </div>
                      )}
                      {b.afterPhoto && (
                        <div>
                          <span className="text-[9px] text-emerald-600 font-bold block">काम के बाद (ठीक हुआ):</span>
                          <img src={b.afterPhoto} alt="After" className="h-24 w-full object-cover rounded-xl mt-0.5" />
                        </div>
                      )}
                    </div>
                    {b.workDetails && <p className="text-[11px] text-slate-600 italic">"{b.workDetails}"</p>}
                  </div>
                )}

                {/* Final Bill Payment Action */}
                {b.isBilled && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-950">फाइनल बिलिंग राशि:</span>
                      <span className="font-black text-base text-emerald-800">₹{b.finalTotal}</span>
                    </div>

                    {b.paymentStatus === 'paid' ? (
                      <div className="text-center font-bold text-emerald-700 text-xs py-1 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> ऑनलाइन भुगतान प्राप्त हुआ (Paid)
                      </div>
                    ) : b.paymentMode === 'cash' ? (
                      <div className="text-center font-bold text-amber-800 text-xs py-1">
                        💵 नकद भुगतान चुना गया (इलेक्ट्रीशियन को कैश दें)
                      </div>
                    ) : (
                      <button 
                        onClick={() => setCustomerPayBooking(b)} 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" /> बिल भुगतान करें (Cash / Online UPI)
                      </button>
                    )}
                  </div>
                )}

                {/* Rating Button */}
                {b.status === 'Completed' && !b.rating && (
                  <button onClick={() => setReviewModalBooking(b)} className="w-full bg-yellow-400 text-blue-950 font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow">
                    <Star className="w-3.5 h-3.5 fill-blue-950" /> सर्विस को रेटिंग दें / शिकायत दर्ज करें
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ================= HOME VIEW ================= */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="सर्च करें: पंखा, इनवर्टर, तार, स्विच..." className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-2xl text-xs font-semibold shadow-sm" />
            </div>

            <div className="bg-gradient-to-r from-[#0B1E3D] via-[#102A56] to-[#1E3A8A] text-white p-5 rounded-3xl shadow-lg">
              <span className="bg-yellow-400 text-blue-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">★ 45 मिनट में इलेक्ट्रीशियन घर पर</span>
              <h1 className="text-xl font-black mt-2 leading-tight">प्रमाणित इलेक्ट्रीशियन और 100% असली सामान</h1>
              <div className="flex gap-2 mt-4">
                <a href={`tel:${ADMIN_PHONE}`} className="bg-yellow-400 text-blue-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1 shadow"><PhoneCall className="w-3.5 h-3.5" /> {ADMIN_PHONE}</a>
                <a href={`https://wa.me/91${ADMIN_PHONE}?text=नमस्ते`} className="bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 shadow"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
              </div>
            </div>

            <div className="space-y-2.5">
              <h2 className="font-black text-sm text-slate-800">इलेक्ट्रिकल सेवाएं (Services)</h2>
              {services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((s) => (
                <div key={s.docId} className="bg-white p-3.5 rounded-2xl border flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{s.name}</h3>
                    <div className="text-xs font-black text-blue-800 mt-0.5">शुरुआती: ₹{s.price} <span className="text-[10px] text-slate-400">(विजिट: ₹{s.visiting || 99})</span></div>
                  </div>
                  <button onClick={() => setSelectedService(s)} className="bg-[#1E3A8A] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow">बुक करें</button>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 pt-2">
              <h2 className="font-black text-sm text-slate-800">इलेक्ट्रिकल सामान स्टोर (Products)</h2>
              {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
                <div key={p.docId} className="bg-white p-3.5 rounded-2xl border flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">{p.brand}</span>
                    <h3 className="font-bold text-xs text-slate-900">{p.name}</h3>
                    <div className="text-sm font-black text-slate-900 mt-0.5">₹{p.price}</div>
                  </div>
                  <button onClick={() => window.open(`https://wa.me/91${ADMIN_PHONE}?text=${encodeURIComponent(`सामान आर्डर: ${p.name}`)}`, '_blank')} className="bg-yellow-400 text-blue-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow"><ShoppingBag className="w-3.5 h-3.5" /> खरीदें</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: ADMIN GENERATES FINAL BILL & PHOTO PROOF ================= */}
      {billModalBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleGenerateFinalBill} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative my-8">
            <button type="button" onClick={() => setBillModalBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            
            <div>
              <h3 className="font-black text-sm text-slate-900">फाइनल बिल व फोटो प्रूफ जारी करें</h3>
              <p className="text-[11px] text-slate-500">बुकिंग: #{billModalBooking.bookingId} ({billModalBooking.customerName})</p>
            </div>

            {/* Photo 1: Before Work */}
            <div className="p-3 bg-slate-50 border rounded-2xl space-y-1.5">
              <label className="block font-bold text-slate-700">1. काम से पहले की फोटो (खराब पार्ट):</label>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => compressImage(e.target.files[0], setBeforePhoto)} className="w-full text-[11px]" />
              {beforePhoto && <img src={beforePhoto} alt="Before preview" className="h-20 rounded-lg mt-1 object-cover" />}
            </div>

            {/* Photo 2: After Work */}
            <div className="p-3 bg-slate-50 border rounded-2xl space-y-1.5">
              <label className="block font-bold text-emerald-800">2. काम के बाद की फोटो (ठीक होने पर):</label>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => compressImage(e.target.files[0], setAfterPhoto)} className="w-full text-[11px]" />
              {afterPhoto && <img src={afterPhoto} alt="After preview" className="h-20 rounded-lg mt-1 object-cover" />}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">काम का विवरण (Work Details)</label>
              <textarea required value={workDetails} onChange={(e) => setWorkDetails(e.target.value)} placeholder="जैसे: मोटर कैपेसिटर बदला और नई केबल जोड़ी" rows={2} className="w-full p-2 border rounded-xl" />
            </div>

            {/* Bill Breakdown Inputs */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
              <span className="font-bold text-blue-950 block">बिल चार्ज विवरण (Charges):</span>
              
              <div className="flex justify-between items-center">
                <span>सर्विस / लेबर चार्ज:</span>
                <input required type="number" value={labourFee} onChange={(e) => setLabourFee(e.target.value)} className="w-20 p-1.5 border rounded-lg text-right font-bold" />
              </div>

              <div className="flex justify-between items-center">
                <span>सामान / पार्ट्स का खर्चा:</span>
                <input required type="number" value={materialFee} onChange={(e) => setMaterialFee(e.target.value)} className="w-20 p-1.5 border rounded-lg text-right font-bold" />
              </div>

              <div className="flex justify-between items-center">
                <span>विजिटिंग / डिलीवरी फीस:</span>
                <input required type="number" value={visitFee} onChange={(e) => setVisitFee(e.target.value)} className="w-20 p-1.5 border rounded-lg text-right font-bold" />
              </div>

              <div className="border-t border-blue-300 pt-1.5 flex justify-between items-center font-black text-sm text-blue-950">
                <span>कुल फाइनल बिल:</span>
                <span className="text-base text-emerald-700">₹{Number(labourFee) + Number(materialFee) + Number(visitFee)}</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl shadow-lg text-xs">
              ✔ फाइनल बिल जारी करें व ग्राहक को भेजें
            </button>
          </form>
        </div>
      )}

      {/* ================= MODAL: CUSTOMER PAYS BILL (CASH OR ONLINE) ================= */}
      {customerPayBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative">
            <button onClick={() => setCustomerPayBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>

            <div className="text-center">
              <h3 className="font-black text-base text-slate-900">सर्विस बिल भुगतान</h3>
              <p className="text-xs text-slate-500">इनवॉइस: #{customerPayBooking.bookingId}</p>
            </div>

            {/* Bill Breakdown Receipt */}
            <div className="bg-slate-50 border p-3.5 rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>सर्विस चार्ज:</span>
                <span>₹{customerPayBooking.labourFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>सामान / पार्ट्स:</span>
                <span>₹{customerPayBooking.materialFee || 0}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>विजिटिंग चार्ज:</span>
                <span>₹{customerPayBooking.visitFee || 0}</span>
              </div>
              <div className="border-t pt-1.5 flex justify-between items-center font-black text-sm text-slate-900">
                <span>कुल देय राशि:</span>
                <span className="text-base text-emerald-700">₹{customerPayBooking.finalTotal}</span>
              </div>
            </div>

            {/* Dynamic UPI QR Code using Admin's live UPI ID */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">PhonePe / GPay / Paytm से स्कैन करें:</span>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=${paymentConfig.upiId}%26pn=${encodeURIComponent(paymentConfig.upiName)}%26am=${customerPayBooking.finalTotal}%26cu=INR`} 
                alt="UPI QR Code" 
                className="w-36 h-36 mx-auto rounded-xl border bg-white p-1"
              />
              <div className="font-mono text-xs font-bold text-emerald-950">{paymentConfig.upiId}</div>
              
              <a 
                href={`upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(paymentConfig.upiName)}&am=${customerPayBooking.finalTotal}&cu=INR`}
                className="block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs shadow"
              >
                1-क्लिक में फोन की UPI ऐप खोलें
              </a>
            </div>

            {/* Two Action Payment Choices */}
            <div className="flex gap-2">
              <button 
                onClick={() => handleCustomerPayment('cash')}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                💵 नकद (Cash)
              </button>
              <button 
                onClick={() => handleCustomerPayment('upi')}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                ✔ UPI पेड किया
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BOOKING ================= */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleBooking} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setSelectedService(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">सर्विस बुकिंग</h3>
            <p className="text-xs text-blue-800 font-bold">{selectedService.name} (अनुमानित: ₹{selectedService.price})</p>
            <div className="bg-slate-50 p-2.5 rounded-xl border text-slate-600">
              <div><strong>ग्राहक:</strong> {user.name} (📞 {user.phone})</div>
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

      {/* ================= MODAL: RATING ================= */}
      {reviewModalBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={submitReview} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setReviewModalBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">रेटिंग और फीडबैक</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRatingVal(star)} className={`text-2xl ${star <= ratingVal ? 'text-amber-400' : 'text-slate-300'}`}>★</button>
              ))}
            </div>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={2} placeholder="काम कैसा हुआ?" className="w-full p-2 border rounded-xl" />
            <textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)} rows={2} placeholder="क्या कोई शिकायत है?" className="w-full p-2 border border-red-200 rounded-xl text-red-900 bg-red-50/50" />
            <button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold shadow text-xs">सबमिट करें</button>
          </form>
        </div>
      )}

      {/* ================= MODAL: EDIT ================= */}
      {editItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target;
            if (editItem.type === 'service') {
              await updateDoc(doc(db, "services", editItem.data.docId), { name: f.name.value, price: Number(f.price.value), visiting: Number(f.visiting.value) });
            } else {
              await updateDoc(doc(db, "products", editItem.data.docId), { name: f.name.value, brand: f.brand.value, price: Number(f.price.value) });
            }
            setEditItem(null);
            alert("अपडेट हो गया!");
          }} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setEditItem(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm">संशोधन करें</h3>
            <input required name="name" defaultValue={editItem.data.name} className="w-full p-2 border rounded-xl font-bold" />
            {editItem.type === 'product' && <input required name="brand" defaultValue={editItem.data.brand} className="w-full p-2 border rounded-xl font-bold" />}
            <input required type="number" name="price" defaultValue={editItem.data.price} className="w-full p-2 border rounded-xl font-bold" />
            {editItem.type === 'service' && <input required type="number" name="visiting" defaultValue={editItem.data.visiting || 99} placeholder="विजिटिंग चार्ज" className="w-full p-2 border rounded-xl" />}
            <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded-xl font-bold">सेव करें</button>
          </form>
        </div>
      )}

      {/* ================= MODAL: ADD SERVICE ================= */}
      {showAddService && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target;
            await addDoc(collection(db, "services"), { name: f.name.value, price: Number(f.price.value), visiting: Number(f.visiting.value || 99) });
            setShowAddService(false);
          }} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs relative">
            <button type="button" onClick={() => setShowAddService(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm">नई सर्विस जोड़ें</h3>
            <input required name="name" placeholder="सर्विस का नाम" className="w-full p-2 border rounded-xl" />
            <input required type="number" name="price" placeholder="बेस प्राइस" className="w-full p-2 border rounded-xl" />
            <input required type="number" name="visiting" placeholder="विजिटिंग चार्ज (₹99)" className="w-full p-2 border rounded-xl" />
            <button type="submit" className="w-full bg-blue-900 text-white py-2.5 rounded-xl font-bold">सर्विस सेव करें</button>
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
          }} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs relative">
            <button type="button" onClick={() => setShowAddProduct(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm">नया सामान जोड़ें</h3>
            <input required name="name" placeholder="प्रोडक्ट का नाम" className="w-full p-2 border rounded-xl" />
            <input required name="brand" placeholder="ब्रांड का नाम" className="w-full p-2 border rounded-xl" />
            <input required type="number" name="price" placeholder="कीमत (₹)" className="w-full p-2 border rounded-xl" />
            <button type="submit" className="w-full bg-emerald-700 text-white py-2.5 rounded-xl font-bold">स्टोर में जोड़ें</button>
          </form>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t flex justify-around py-2.5 z-40 shadow-lg">
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
