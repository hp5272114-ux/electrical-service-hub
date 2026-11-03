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
  FileText, Check, Send, RotateCcw, Lock, ChevronRight, Calendar, 
  Info, MapPin, ChevronDown, Award, Sparkles, ArrowLeft, CheckSquare 
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

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('esh_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'orders' | 'admin' | 'store'
  const [adminSubTab, setAdminSubTab] = useState('metrics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Real-time Cloud Collections
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [broadcast, setBroadcast] = useState({ text: "गर्मी स्पेशल: पंखा रिपेयरिंग पर 20% की छूट!", active: true });
  const [paymentConfig, setPaymentConfig] = useState({ upiId: "6367626276@upi", upiName: "Electrical Service Hub" });

  // Modals & Detailed Views
  const [detailService, setDetailService] = useState(null);
  const [bookingStepService, setBookingStepService] = useState(null);
  const [billModalBooking, setBillModalBooking] = useState(null);
  const [customerPayBooking, setCustomerPayBooking] = useState(null);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [custDetailBooking, setCustDetailBooking] = useState(null);
  const [adminDetailBooking, setAdminDetailBooking] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showAddService, setShowAddService] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Billing States
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
          { 
            name: "Ceiling Fan Repair & Service", 
            nameHi: "सीलिंग पंखा रिपेयर व सर्विस",
            category: "fans",
            price: 199, 
            mrp: 299,
            visiting: 99, 
            rating: "4.8",
            bookedCount: "1,840+",
            description: "आवाज बंद करना, बैरिंग रिप्लेसमेंट, कैपेसिटर चेंज व हाई स्पीड चेकिंग।",
            includes: ["फॉल्ट डायग्नोसिस", "कैपेसिटर व बैरिंग जांच", "30 दिन की रिपेयर वारंटी", "सुरक्षित अर्थिंग टेस्ट"]
          },
          { 
            name: "Full House Short Circuit & Rewiring", 
            nameHi: "शॉर्ट सर्किट व फॉल्ट चेकिंग",
            category: "wiring",
            price: 399, 
            mrp: 599,
            visiting: 149, 
            rating: "4.9",
            bookedCount: "920+",
            description: "एमसीबी ट्रिपिंग, स्पार्किंग, न्यूट्रल लीकेज व शॉर्ट सर्किट की डिजिटल मल्टीमीटर से जांच।",
            includes: ["शॉर्ट सर्किट प्वाइंट डिटेक्शन", "सुरक्षा लोड टेस्टिंग", "अर्थिंग चेकिंग", "30 दिन वारंटी"]
          },
          { 
            name: "Inverter & Dual Battery Setup", 
            nameHi: "इनवर्टर व डबल बैटरी फिटिंग",
            category: "power",
            price: 499, 
            mrp: 750,
            visiting: 149, 
            rating: "4.9",
            bookedCount: "640+",
            description: "घर के मेन लोड के साथ इनवर्टर व ड्यूल बैटरी का हैवी केबल कनेक्शन व बाईपास सेटअप।",
            includes: ["हैवी लग क्रिम्पिंग", "लोड डिस्ट्रीब्यूशन", "फुल इनवर्टर टेस्टिंग", "30 दिन वारंटी"]
          },
          { 
            name: "Modular MCB & Switchboard Replacement", 
            nameHi: "मॉड्यूलर स्विच व एमसीबी फिटिंग",
            category: "switchgear",
            price: 299, 
            mrp: 450,
            visiting: 99, 
            rating: "4.7",
            bookedCount: "1,210+",
            description: "मॉड्यूलर स्विच, डीपी स्विच, एमसीबी चेंजओवर और जल चुके सॉकेट का रिप्लेसमेंट।",
            includes: ["पुराने बोर्ड का कनेक्शन चेक", "सुरक्षित अर्थिंग वायर", "ब्रांडेड फिटिंग"]
          }
        ];
        for (const s of initial) await addDoc(collection(db, "services"), s);
      } else {
        setServices(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      }
    });

    const unsubProducts = onSnapshot(collection(db, "products"), async (snap) => {
      if (snap.empty) {
        const initial = [
          { name: "Polycab 2.5 Sq mm Flame Retardant Wire (90m)", brand: "Polycab", mrp: 2450, price: 1899, rating: "4.9" },
          { name: "Havells 32A Double Pole C-Curve MCB", brand: "Havells", mrp: 680, price: 520, rating: "4.8" },
          { name: "Anchor Roma 6A Modular Switch Set (Pack of 10)", brand: "Anchor", mrp: 480, price: 310, rating: "4.7" }
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

  // Metrics
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (Number(b.finalTotal || b.price) || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'Placed').length;
  const activeCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'On The Way').length;

  // 3. AUTH
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nameInput.trim() || phoneInput.length !== 10 || pinInput.length !== 4) return alert("सभी जानकारी सही भरें!");
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

  // 4. BOOKING SUBMISSION
  const handleBooking = async (e) => {
    e.preventDefault();
    const form = e.target;
    const refCode = "ESH-" + Math.floor(1000 + Math.random() * 9000);

    const bookingData = {
      bookingId: refCode,
      customerName: user.name,
      customerPhone: user.phone,
      serviceName: bookingStepService.name,
      price: bookingStepService.price,
      slot: form.custSlot.value,
      address: form.custAddr.value,
      status: "Placed",
      paymentStatus: "unpaid",
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "bookings"), bookingData);
      setBookingStepService(null);
      setActiveTab('orders');
      alert(`🎉 बधाई! बुकिंग दर्ज हो चुकी है (Ref: #${refCode})\nलाइव ट्रैकिंग शुरू हो गई है।`);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // 5. ADMIN GENERATES FINAL BILL & UPLOADS BEFORE/AFTER PHOTOS
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
      alert(`✔ फाइनल बिल ₹${total} जारी कर दिया गया है।`);
      setBillModalBooking(null);
      setBeforePhoto('');
      setAfterPhoto('');
      setWorkDetails('');
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // 6. ADMIN REOPENS SERVICE
  const handleReopenService = async (booking) => {
    if (!window.confirm("क्या आप इस सर्विस को दोबारा खोलना (Reopen) चाहते हैं? फोटो व बिल अनलॉक हो जाएंगे।")) return;
    try {
      await updateDoc(doc(db, "bookings", booking.docId), {
        status: "On The Way",
        isBilled: false,
        reopenedAt: Date.now()
      });
      alert("✔ सर्विस दोबारा खोल दी गई है!");
      if (adminDetailBooking) setAdminDetailBooking(null);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // 7. ADMIN PAYMENT TOGGLE
  const handleTogglePaymentStatus = async (booking, targetStatus) => {
    try {
      await updateDoc(doc(db, "bookings", booking.docId), {
        paymentStatus: targetStatus
      });
      const statusTitle = targetStatus === 'paid' ? 'भुगतान पूर्ण (Paid)' : 'लंबित (Unpaid)';
      alert(`✔ पेमेंट स्थिति '${statusTitle}' सेट हो गई है!`);
      if (adminDetailBooking) {
        setAdminDetailBooking({ ...adminDetailBooking, paymentStatus: targetStatus });
      }
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // 8. CUSTOMER PAYMENT
  const handleCustomerPayment = async (mode) => {
    if (!customerPayBooking) return;
    try {
      await updateDoc(doc(db, "bookings", customerPayBooking.docId), {
        paymentMode: mode,
        paymentStatus: mode === 'cash' ? 'cash_selected' : 'paid'
      });
      alert(mode === 'cash' 
        ? "✔ आपने कैश विकल्प चुना है। कृपया इलेक्ट्रीशियन को नकद राशि दें।" 
        : "🎉 ऑनलाइन UPI पेमेंट दर्ज हो चुकी है!");
      setCustomerPayBooking(null);
    } catch (err) {
      alert("एरर: " + err.message);
    }
  };

  // 9. RATING SUBMISSION
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

  // Categories Metadata (Urban Company style)
  const categories = [
    { id: 'all', name: 'सभी सेवाएं', icon: Sparkles },
    { id: 'fans', name: 'पंखा व कूलर', icon: Wrench },
    { id: 'wiring', name: 'वायरिंग व फॉल्ट', icon: Zap },
    { id: 'power', name: 'इनवर्टर व बैटरी', icon: BatteryChargingIcon },
    { id: 'switchgear', name: 'स्विच व MCB', icon: Shield }
  ];

  function BatteryChargingIcon(props) {
    return <Zap {...props} />;
  }

  // ================= 1. SPLASH SCREEN =================
  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0F1111] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-[#FF9900] p-5 rounded-3xl shadow-2xl animate-bounce mb-6">
          <Zap className="w-16 h-16 text-[#0F1111] fill-[#0F1111]" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">विद्युत सेवा हब</h1>
        <p className="text-[#FF9900] font-bold tracking-widest text-xs uppercase mt-1">Electrical Service Hub • India</p>
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-300 bg-white/10 px-4 py-2 rounded-full border border-white/20">
          <Shield className="w-4 h-4 text-[#FF9900]" />
          <span>Government Certified Electricians & 100% Genuine Store</span>
        </div>
      </div>
    );
  }

  // ================= 2. MANDATORY AUTH =================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-[#131921] text-white p-6 text-center">
            <div className="w-12 h-12 bg-[#FF9900] rounded-2xl flex items-center justify-center mx-auto mb-2 text-[#0F1111] font-black">
              <Zap className="w-7 h-7 fill-[#0F1111]" />
            </div>
            <h2 className="text-xl font-black">विद्युत सेवा हब</h2>
            <p className="text-xs text-amber-300 font-medium">India's Verified Electric Hub</p>
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
                <button disabled={authLoading} type="submit" className="w-full bg-[#131921] hover:bg-[#0F1111] text-white py-3 rounded-xl font-black text-xs shadow-lg">
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

  // ================= 3. MAIN APP UI (AMAZON / URBAN COMPANY LOOK) =================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans">
      
      {/* 1. TOP HEADER (Amazon Dark Slate Header) */}
      <header className="bg-[#131921] text-white shadow-md sticky top-0 z-30">
        <div className="max-w-xl mx-auto px-3.5 py-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-[#FF9900] p-1.5 rounded-xl text-[#0F1111] shadow">
              <Zap className="w-5 h-5 fill-[#0F1111]" />
            </div>
            <div>
              <span className="font-black text-base block leading-none tracking-tight">विद्युत सेवा हब</span>
              <span className="text-[9px] text-[#FF9900] font-bold uppercase tracking-wider">Electrical Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${user.role === 'admin' ? 'bg-[#FF9900] text-slate-950' : 'bg-emerald-600 text-white'}`}>
              {user.role === 'admin' ? 'MASTER ADMIN' : user.name.split(' ')[0]}
            </span>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white p-1"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Amazon Pin-code & Location Bar */}
        <div className="bg-[#232F3E] text-slate-200 px-3.5 py-1.5 text-[11px] flex items-center justify-between border-t border-slate-700">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#FF9900] flex-shrink-0" />
            <span className="truncate">डिलीवरी व सर्विस: <strong>मानसरोवर, जयपुर - 302020</strong></span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex-shrink-0">● 45m एक्सप्रेस</span>
        </div>
      </header>

      {/* Offer Strip */}
      {broadcast.active && broadcast.text && (
        <div className="bg-[#FF9900] text-slate-950 px-4 py-2 font-black text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <Megaphone className="w-4 h-4 flex-shrink-0 fill-slate-950 animate-bounce" />
            <span className="truncate">{broadcast.text}</span>
          </div>
          <span className="text-[10px] uppercase bg-[#131921] text-white px-2 py-0.5 rounded-full font-bold ml-2">ऑफर</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-xl mx-auto p-3.5 space-y-4">
        
        {/* 24x7 Emergency SOS Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-3.5 rounded-2xl shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-xl animate-pulse">
              <AlertTriangle className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-sm">24x7 इमरजेंसी बिजली फॉल्ट?</h3>
              <p className="text-[11px] text-red-100">15 मिनट में इलेक्ट्रीशियन सहायता</p>
            </div>
          </div>
          <a href={`tel:${ADMIN_PHONE}`} className="bg-[#FF9900] text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow active:scale-95 transition">SOS कॉल</a>
        </div>

        {/* ============================================================== */}
        {/* ==================== 🏆 ADMIN WORKSPACE ======================= */}
        {/* ============================================================== */}
        {activeTab === 'admin' && user.role === 'admin' && (
          <div className="space-y-4">
            
            <div className="bg-gradient-to-br from-[#131921] via-[#232F3E] to-[#131921] text-white p-5 rounded-3xl shadow-xl border border-yellow-400/30 flex justify-between items-start">
              <div>
                <span className="bg-[#FF9900] text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Executive Center</span>
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
                <span className="text-[11px] font-bold text-slate-400 uppercase">कुल कमाई (Received)</span>
                <div className="text-2xl font-black text-slate-900 mt-1">₹{totalRevenue}</div>
                <span className="text-[10px] text-emerald-600 font-bold">✔ सत्यापित भुगतानों से</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">नये आर्डर (Pending)</span>
                <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
                <span className="text-[10px] text-amber-700 font-bold">तुरंत एक्शन लें</span>
              </div>
            </div>

            {/* Subtabs */}
            <div className="bg-white p-1 rounded-2xl border flex justify-between shadow-sm overflow-x-auto text-[11px] font-bold">
              <button onClick={() => setAdminSubTab('metrics')} className={`flex-1 py-2 px-2 rounded-xl whitespace-nowrap ${adminSubTab === 'metrics' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>📋 आर्डर्स व बिलिंग ({bookings.length})</button>
              <button onClick={() => setAdminSubTab('payment')} className={`flex-1 py-2 px-2 rounded-xl whitespace-nowrap ${adminSubTab === 'payment' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>💳 UPI व QR</button>
              <button onClick={() => setAdminSubTab('services')} className={`flex-1 py-2 px-2 rounded-xl whitespace-nowrap ${adminSubTab === 'services' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>⚡ सर्विसेज</button>
              <button onClick={() => setAdminSubTab('products')} className={`flex-1 py-2 px-2 rounded-xl whitespace-nowrap ${adminSubTab === 'products' ? 'bg-[#131921] text-[#FF9900]' : 'text-slate-500'}`}>📦 स्टोर</button>
            </div>

            {/* 1. ORDERS LIST WITH STATUS & REOPEN */}
            {adminSubTab === 'metrics' && (
              <div className="bg-white p-4 rounded-3xl border space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-xs text-slate-800">लाइव आर्डर्स (आर्डर पर क्लिक करके फुल डिटेल्स देखें)</h3>
                  <span className="text-[10px] text-blue-900 font-bold">क्लिक = फुल व्यू</span>
                </div>

                {bookings.map((b) => (
                  <div key={b.docId} className="p-3.5 bg-slate-50 border rounded-2xl space-y-2.5 text-xs">
                    
                    <div onClick={() => setAdminDetailBooking(b)} className="flex justify-between items-start cursor-pointer hover:bg-slate-100 p-1 rounded-xl transition">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-blue-900 text-sm">#{b.bookingId}</span>
                          <span className="text-slate-400">•</span>
                          <strong className="text-slate-800">{b.customerName}</strong>
                        </div>
                        <div className="text-slate-800 font-bold mt-0.5">{b.serviceName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {b.createdAt ? new Date(b.createdAt).toLocaleString('hi-IN') : 'हाल ही में'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black block ${
                          b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'On The Way' ? 'bg-purple-100 text-purple-800' :
                          b.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {b.status}
                        </span>
                        <span className={`text-[9px] font-bold mt-1 inline-block ${b.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {b.paymentStatus === 'paid' ? '✔ पेड (Paid)' : '⏳ अनपेड'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 pt-2 border-t flex-wrap items-center">
                      <button onClick={() => updateDoc(doc(db, "bookings", b.docId), { status: "Confirmed" })} className="bg-blue-800 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold">
                        स्वीकारें
                      </button>
                      
                      {b.isBilled && b.status === 'Completed' ? (
                        <div className="flex items-center gap-1">
                          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <Lock className="w-3 h-3" /> फोटो व बिल लॉक है
                          </span>
                          <button 
                            onClick={() => handleReopenService(b)}
                            className="bg-[#FF9900] text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow"
                          >
                            <RotateCcw className="w-3 h-3" /> री-ओपन (अनलॉक)
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setBillModalBooking(b);
                            setLabourFee(b.labourFee || b.price || 199);
                            setMaterialFee(b.materialFee || 0);
                            setVisitFee(b.visitFee || 99);
                            setBeforePhoto(b.beforePhoto || '');
                            setAfterPhoto(b.afterPhoto || '');
                            setWorkDetails(b.workDetails || '');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-3 py-1 rounded-lg font-bold flex items-center gap-1 shadow"
                        >
                          <Camera className="w-3 h-3 text-yellow-300" /> फोटो व बिल अपलोड
                        </button>
                      )}

                      <button 
                        onClick={() => handleTogglePaymentStatus(b, b.paymentStatus === 'paid' ? 'unpaid' : 'paid')}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ml-auto ${
                          b.paymentStatus === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-rose-600 text-white shadow'
                        }`}
                      >
                        {b.paymentStatus === 'paid' ? '✔ पेमेंट पूर्ण (Click to Unpay)' : 'भुगतान प्राप्त हुआ मार्क करें'}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* 2. ADMIN UPI & QR */}
            {adminSubTab === 'payment' && (
              <div className="bg-white p-5 rounded-3xl border space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-sm text-slate-800">एडमिन UPI व QR कोड सेटिंग्स</h3>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const f = e.target;
                  await setDoc(doc(db, "settings", "payment"), {
                    upiId: f.upiId.value.trim(),
                    upiName: f.upiName.value.trim()
                  });
                  alert("✔ आपकी नई UPI ID सेव हो गई है!");
                }} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">आपका UPI ID</label>
                    <input required name="upiId" defaultValue={paymentConfig.upiId} className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">खाताधारक का नाम</label>
                    <input required name="upiName" defaultValue={paymentConfig.upiName} className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" />
                  </div>
                  <button type="submit" className="w-full bg-emerald-700 text-white font-black py-2.5 rounded-xl shadow text-xs">
                    सेव करें (Update UPI)
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

        {/* ============================================================== */}
        {/* ============= 📦 AMAZON-STYLE CUSTOMER ORDERS ================ */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-black text-base text-slate-900">मेरे आर्डर व लाइव ट्रैकिंग</h2>
              <span className="text-[10px] text-slate-500 font-bold">आर्डर पर टैप करके रसीद देखें</span>
            </div>

            {bookings.filter(b => b.customerPhone === user.phone).length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center border text-xs text-slate-500 space-y-3 shadow-sm">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold">आपने अभी तक कोई सर्विस बुक नहीं की है।</p>
                <button onClick={() => setActiveTab('home')} className="bg-[#131921] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow">
                  सर्विस बुक करें
                </button>
              </div>
            ) : (
              bookings.filter(b => b.customerPhone === user.phone).map((b) => (
                <div key={b.docId} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  
                  {/* Clickable Order Header */}
                  <div onClick={() => setCustDetailBooking(b)} className="flex justify-between items-start cursor-pointer hover:bg-slate-50 p-1 rounded-2xl transition">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-blue-900">#{b.bookingId}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] text-slate-400">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('hi-IN') : 'आज'}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-slate-900 mt-0.5">{b.serviceName}</h4>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> स्लॉट: {b.slot}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">₹{b.finalTotal || b.price}</span>
                      <span className={`text-[10px] font-black block mt-0.5 ${b.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {b.paymentStatus === 'paid' ? '✔ पेड (Paid)' : '⏳ पेमेंट बाकी'}
                      </span>
                    </div>
                  </div>

                  {/* Amazon Trademark Vertical / Step Progress Bar */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-blue-900 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> आर्डर दर्ज
                      </span>
                      <span className={b.status !== 'Placed' ? 'text-blue-900 flex items-center gap-1' : 'text-slate-300'}>
                        {b.status !== 'Placed' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : null} स्वीकृत
                      </span>
                      <span className={b.status === 'On The Way' || b.status === 'Completed' ? 'text-purple-700 flex items-center gap-1 font-black' : 'text-slate-300'}>
                        <Truck className="w-3.5 h-3.5" /> रास्ते में
                      </span>
                      <span className={b.status === 'Completed' ? 'text-emerald-600 flex items-center gap-1 font-black' : 'text-slate-300'}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> पूरा
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${
                        b.status === 'Placed' ? 'w-1/4 bg-amber-400' :
                        b.status === 'Confirmed' ? 'w-2/4 bg-blue-600' :
                        b.status === 'On The Way' ? 'w-3/4 bg-purple-600' : 'w-full bg-emerald-600'
                      }`} />
                    </div>
                  </div>

                  {/* Quick Action Button Strip */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCustDetailBooking(b)} 
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-900" /> फोटो प्रूफ व रसीद
                    </button>

                    {b.isBilled && b.paymentStatus !== 'paid' && (
                      <button 
                        onClick={() => setCustomerPayBooking(b)} 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" /> बिल भरें (₹{b.finalTotal})
                      </button>
                    )}
                  </div>

                  {/* Rating Prompt */}
                  {b.status === 'Completed' && !b.rating && (
                    <button onClick={() => setReviewModalBooking(b)} className="w-full bg-[#FF9900] text-slate-950 font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow">
                      <Star className="w-3.5 h-3.5 fill-slate-950" /> सर्विस को रेटिंग दें / शिकायत दर्ज करें
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ================= 🏠 URBAN COMPANY STYLE HOME ================ */}
        {/* ============================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            
            {/* Amazon Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="सर्च करें: पंखा रिपेयर, इनवर्टर, तार, स्विच..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900" 
              />
            </div>

            {/* Urban Company Circular Category Slider */}
            <div className="flex gap-2.5 overflow-x-auto py-1 no-scrollbar">
              {categories.map((c) => {
                const Icon = c.icon;
                return (
                  <button 
                    key={c.id} 
                    onClick={() => setSelectedCategory(c.id)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl min-w-[70px] transition ${
                      selectedCategory === c.id ? 'bg-[#131921] text-[#FF9900] shadow' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${selectedCategory === c.id ? 'bg-white/10' : 'bg-slate-50'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold whitespace-nowrap">{c.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Flipkart Festive Banner */}
            <div className="bg-gradient-to-r from-[#131921] via-[#232F3E] to-[#131921] text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
              <span className="bg-[#FF9900] text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ★ 45 मिनट में इलेक्ट्रीशियन घर पर
              </span>
              <h1 className="text-xl font-black mt-2 leading-tight">प्रमाणित इलेक्ट्रीशियन और 100% असली सामान</h1>
              <p className="text-xs text-slate-300 mt-1">शॉर्ट सर्किट, पंखा, मोटर, इनवर्टर व वायरिंग रिपेयर</p>
              
              <div className="flex gap-2 mt-4">
                <a href={`tel:${ADMIN_PHONE}`} className="bg-[#FF9900] text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1 shadow">
                  <PhoneCall className="w-3.5 h-3.5" /> {ADMIN_PHONE}
                </a>
                <a href={`https://wa.me/91${ADMIN_PHONE}?text=नमस्ते,%20मुझे%20इलेक्ट्रीशियन%20चाहिए`} className="bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 shadow">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </div>

            {/* Services Cards (Amazon E-Commerce Card Style) */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <h2 className="font-black text-sm text-slate-900">लोकप्रिय सेवाएं (Popular Services)</h2>
                <span className="text-[10px] text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded-full">30 दिन वारंटी</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {services
                  .filter(s => {
                    if (selectedCategory !== 'all' && s.category && s.category !== selectedCategory) return false;
                    return s.name.toLowerCase().includes(searchQuery.toLowerCase());
                  })
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
                          <span className="text-[10px] text-emerald-600 font-bold">जांच शुल्क: ₹{s.visiting || 99}</span>
                        </div>
                      </div>

                      {/* Detail View Trigger */}
                      <button 
                        onClick={() => setDetailService(s)} 
                        className="bg-[#131921] hover:bg-[#0F1111] text-white font-black text-xs px-3.5 py-2 rounded-2xl shadow active:scale-95 transition flex items-center gap-1"
                      >
                        विवरण व बुक <ChevronRight className="w-3.5 h-3.5 text-[#FF9900]" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Products Store Section */}
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between items-center">
                <h2 className="font-black text-sm text-slate-900">इलेक्ट्रिकल सामान स्टोर (Products)</h2>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">100% ओरिजिनल</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {products
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => (
                    <div key={p.docId} className="bg-white p-3.5 rounded-2xl border flex justify-between items-center shadow-sm">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">{p.brand}</span>
                        <h3 className="font-bold text-xs text-slate-900">{p.name}</h3>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-sm font-black text-slate-900">₹{p.price}</span>
                          {p.mrp && <span className="text-[10px] text-slate-400 line-through">₹{p.mrp}</span>}
                        </div>
                      </div>
                      <button 
                        onClick={() => window.open(`https://wa.me/91${ADMIN_PHONE}?text=${encodeURIComponent(`सामान आर्डर: ${p.name}`)}`, '_blank')} 
                        className="bg-[#FF9900] text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> आर्डर
                      </button>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ================= MODAL 1: SERVICE DETAILS (SPECIFICATIONS) ================= */}
      {detailService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative">
            <button onClick={() => setDetailService(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>

            <div>
              <span className="text-[10px] bg-blue-100 text-blue-900 font-black px-2.5 py-0.5 rounded-full uppercase">सेवा विवरण व गारंटी</span>
              <h3 className="font-black text-base text-slate-900 mt-1">{detailService.name}</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-black text-slate-900">₹{detailService.price}</span>
                <span className="text-xs text-slate-400 line-through">₹{detailService.mrp || detailService.price + 100}</span>
                <span className="text-xs text-emerald-600 font-bold">30 दिन की रिपेयर गारंटी</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border">
              {detailService.description || "अनुभवी व प्रमाणित इलेक्ट्रीशियन द्वारा सुरक्षित एवं गुणवत्तापूर्ण कार्य।"}
            </p>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">इस सेवा में क्या शामिल है:</span>
              {(detailService.includes || ["30 दिन की आधिकारिक गारंटी", "सुरक्षा व लोड टेस्टिंग", "ओरिजिनल स्पेयर पार्ट्स"]).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div>⚡ <strong>विजिटिंग व जांच शुल्क:</strong> ₹{detailService.visiting || 99} (रिपेयर कराने पर बिल में समायोजित)</div>
              <div>⚡ <strong>पार्ट्स का खर्च:</strong> स्पेयर पार्ट्स लगने पर उसका खर्च फाइनल बिल में जुड़ेगा।</div>
            </div>

            {/* Proceed to Booking */}
            <button 
              onClick={() => {
                setBookingStepService(detailService);
                setDetailService(null);
              }}
              className="w-full bg-[#131921] hover:bg-[#0F1111] text-white font-black py-3 rounded-2xl text-xs shadow-lg flex items-center justify-center gap-1.5"
            >
              तारीख व स्लॉट चुनें <ChevronRight className="w-4 h-4 text-[#FF9900]" />
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CUSTOMER ORDER FULL DETAILS (AMAZON RECEIPT & PHOTOS) ================= */}
      {custDetailBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative my-8">
            <button onClick={() => setCustDetailBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>

            <div className="border-b pb-3">
              <span className="font-mono text-xs font-bold text-blue-900">आर्डर ID: #{custDetailBooking.bookingId}</span>
              <h3 className="font-black text-base text-slate-900">{custDetailBooking.serviceName}</h3>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <strong>बुकिंग समय:</strong> {custDetailBooking.createdAt ? new Date(custDetailBooking.createdAt).toLocaleString('hi-IN') : 'हाल ही में'}
              </div>
              <div className="text-[11px] text-slate-500">
                <strong>स्लॉट:</strong> {custDetailBooking.slot} | <strong>पता:</strong> {custDetailBooking.address}
              </div>
            </div>

            {/* Photos Display */}
            {(custDetailBooking.beforePhoto || custDetailBooking.afterPhoto) ? (
              <div className="space-y-2">
                <span className="font-bold text-xs text-slate-800 block">काम का प्रमाणित फोटो प्रूफ:</span>
                <div className="grid grid-cols-2 gap-2">
                  {custDetailBooking.beforePhoto && (
                    <div>
                      <span className="text-[9px] text-slate-400 block">काम से पहले:</span>
                      <img src={custDetailBooking.beforePhoto} alt="Before" className="h-28 w-full object-cover rounded-xl border mt-0.5" />
                    </div>
                  )}
                  {custDetailBooking.afterPhoto && (
                    <div>
                      <span className="text-[9px] text-emerald-600 font-bold block">काम के बाद (ठीक हुआ):</span>
                      <img src={custDetailBooking.afterPhoto} alt="After" className="h-28 w-full object-cover rounded-xl border mt-0.5" />
                    </div>
                  )}
                </div>
                {custDetailBooking.workDetails && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border italic">
                    "{custDetailBooking.workDetails}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border text-center">
                इलेक्ट्रीशियन द्वारा काम पूरा करने पर फोटो प्रूफ यहाँ दिखाई देगा।
              </p>
            )}

            {/* Itemized Bill Breakdown */}
            {custDetailBooking.isBilled ? (
              <div className="bg-slate-50 p-3.5 rounded-2xl border text-xs space-y-1.5">
                <span className="font-bold text-slate-800 block">पक्का फाइनल बिल विवरण:</span>
                <div className="flex justify-between text-slate-600"><span>लेबर / सर्विस चार्ज:</span><span>₹{custDetailBooking.labourFee}</span></div>
                <div className="flex justify-between text-slate-600"><span>स्पेयर पार्ट्स / सामान:</span><span>₹{custDetailBooking.materialFee || 0}</span></div>
                <div className="flex justify-between text-slate-600"><span>विजिटिंग फीस:</span><span>₹{custDetailBooking.visitFee || 0}</span></div>
                <div className="border-t pt-1.5 flex justify-between items-center font-black text-sm text-slate-900">
                  <span>कुल फाइनल बिल:</span><span className="text-emerald-700 text-base">₹{custDetailBooking.finalTotal}</span>
                </div>
              </div>
            ) : null}

            {/* Payment Status Pill */}
            <div className={`p-3 rounded-2xl text-center text-xs font-bold border ${
              custDetailBooking.paymentStatus === 'paid' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {custDetailBooking.paymentStatus === 'paid' 
                ? '✔ भुगतान पूर्ण हो चुका है (Payment Completed)' 
                : '⏳ भुगतान लंबित है (Payment Pending)'}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: ADMIN FULL ORDER INSPECTOR ================= */}
      {adminDetailBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative my-8 text-xs">
            <button onClick={() => setAdminDetailBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>

            <div>
              <span className="text-[10px] bg-slate-900 text-yellow-400 font-black px-2.5 py-0.5 rounded-full uppercase">Master Order Inspector</span>
              <h3 className="font-black text-base text-slate-900 mt-1">#{adminDetailBooking.bookingId} - {adminDetailBooking.serviceName}</h3>
              <p className="text-slate-500">ग्राहक: {adminDetailBooking.customerName} (📞 {adminDetailBooking.customerPhone})</p>
              <p className="text-slate-500">तारीख/समय: {adminDetailBooking.createdAt ? new Date(adminDetailBooking.createdAt).toLocaleString('hi-IN') : 'हाल ही में'}</p>
              <p className="text-slate-500">पता: {adminDetailBooking.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border">
              <div>
                <span className="text-[9px] font-bold text-slate-400 block">काम से पहले:</span>
                {adminDetailBooking.beforePhoto ? (
                  <img src={adminDetailBooking.beforePhoto} alt="Before" className="h-24 w-full object-cover rounded-xl mt-1" />
                ) : <span className="text-slate-300 italic">फोटो नहीं है</span>}
              </div>
              <div>
                <span className="text-[9px] font-bold text-emerald-600 block">काम के बाद:</span>
                {adminDetailBooking.afterPhoto ? (
                  <img src={adminDetailBooking.afterPhoto} alt="After" className="h-24 w-full object-cover rounded-xl mt-1" />
                ) : <span className="text-slate-300 italic">फोटो नहीं है</span>}
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
              <div className="flex justify-between font-bold text-blue-950">
                <span>फाइनल बिल:</span>
                <span className="text-emerald-800 text-sm">₹{adminDetailBooking.finalTotal || adminDetailBooking.price}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>भुगतान स्थिति:</span>
                <strong className={adminDetailBooking.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-rose-600'}>
                  {adminDetailBooking.paymentStatus === 'paid' ? '✔ पूर्ण (Paid)' : 'लंबित (Unpaid)'}
                </strong>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <span className="font-bold text-slate-800 block">एडमिन एक्शन कंट्रोल्स:</span>
              
              <button 
                onClick={() => handleTogglePaymentStatus(adminDetailBooking, adminDetailBooking.paymentStatus === 'paid' ? 'unpaid' : 'paid')}
                className="w-full bg-blue-900 text-white font-bold py-2 rounded-xl"
              >
                {adminDetailBooking.paymentStatus === 'paid' ? 'भुगतान वापस लंबित (Unpaid) करें' : '✔ भुगतान प्राप्त हुआ (Mark Paid) करें'}
              </button>

              <button 
                onClick={() => handleReopenService(adminDetailBooking)}
                className="w-full bg-[#FF9900] text-slate-950 font-black py-2 rounded-xl flex items-center justify-center gap-1 shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" /> सर्विस दोबारा खोलें (Reopen Service)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: ADMIN PHOTO PROOF & FINAL BILL ================= */}
      {billModalBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleGenerateFinalBill} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-3.5 text-xs shadow-2xl relative my-8">
            <button type="button" onClick={() => setBillModalBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            
            <div>
              <h3 className="font-black text-sm text-slate-900">फाइनल बिल व फोटो प्रूफ जारी करें</h3>
              <p className="text-[11px] text-slate-500">बुकिंग: #{billModalBooking.bookingId} ({billModalBooking.customerName})</p>
            </div>

            <div className="p-3 bg-slate-50 border rounded-2xl space-y-1.5">
              <label className="block font-bold text-slate-700">1. काम से पहले की फोटो (खराब पार्ट):</label>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => compressImage(e.target.files[0], setBeforePhoto)} className="w-full text-[11px]" />
              {beforePhoto && <img src={beforePhoto} alt="Before preview" className="h-20 rounded-lg mt-1 object-cover" />}
            </div>

            <div className="p-3 bg-slate-50 border rounded-2xl space-y-1.5">
              <label className="block font-bold text-emerald-800">2. काम के बाद की फोटो (ठीक होने पर):</label>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => compressImage(e.target.files[0], setAfterPhoto)} className="w-full text-[11px]" />
              {afterPhoto && <img src={afterPhoto} alt="After preview" className="h-20 rounded-lg mt-1 object-cover" />}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">काम का विवरण (Work Details)</label>
              <textarea required value={workDetails} onChange={(e) => setWorkDetails(e.target.value)} placeholder="जैसे: मोटर कैपेसिटर बदला और नई केबल जोड़ी" rows={2} className="w-full p-2 border rounded-xl" />
            </div>

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
                <span>विजिटिंग फीस:</span>
                <input required type="number" value={visitFee} onChange={(e) => setVisitFee(e.target.value)} className="w-20 p-1.5 border rounded-lg text-right font-bold" />
              </div>

              <div className="border-t border-blue-300 pt-1.5 flex justify-between items-center font-black text-sm text-blue-950">
                <span>कुल फाइनल बिल:</span>
                <span className="text-base text-emerald-700">₹{Number(labourFee) + Number(materialFee) + Number(visitFee)}</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl shadow-lg text-xs">
              ✔ फाइनल बिल जारी करें (अपलोड लॉक होगा)
            </button>
          </form>
        </div>
      )}

      {/* ================= MODAL 5: CUSTOMER PAYMENT SHEET ================= */}
      {customerPayBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative">
            <button onClick={() => setCustomerPayBooking(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>

            <div className="text-center">
              <h3 className="font-black text-base text-slate-900">सर्विस बिल भुगतान</h3>
              <p className="text-xs text-slate-500">इनवॉइस: #{customerPayBooking.bookingId}</p>
            </div>

            <div className="bg-slate-50 border p-3.5 rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600"><span>सर्विस चार्ज:</span><span>₹{customerPayBooking.labourFee}</span></div>
              <div className="flex justify-between text-slate-600"><span>सामान / पार्ट्स:</span><span>₹{customerPayBooking.materialFee || 0}</span></div>
              <div className="flex justify-between text-slate-600"><span>विजिटिंग चार्ज:</span><span>₹{customerPayBooking.visitFee || 0}</span></div>
              <div className="border-t pt-1.5 flex justify-between items-center font-black text-sm text-slate-900">
                <span>कुल देय राशि:</span><span className="text-base text-emerald-700">₹{customerPayBooking.finalTotal}</span>
              </div>
            </div>

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

            <div className="flex gap-2">
              <button onClick={() => handleCustomerPayment('cash')} className="flex-1 bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs">
                💵 नकद (Cash)
              </button>
              <button onClick={() => handleCustomerPayment('upi')} className="flex-1 bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs">
                ✔ UPI पेड किया
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: STEP 2 BOOKING FORM ================= */}
      {bookingStepService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleBooking} className="bg-white p-5 rounded-3xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setBookingStepService(null)} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-sm text-slate-900">सर्विस बुकिंग</h3>
            <p className="text-xs text-blue-800 font-bold">{bookingStepService.name} (अनुमानित: ₹{bookingStepService.price})</p>
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
            <button type="submit" className="w-full bg-[#131921] hover:bg-[#0F1111] text-white py-2.5 rounded-xl font-bold shadow text-xs">
              कन्फर्म बुकिंग (Live Cloud Sync)
            </button>
          </form>
        </div>
      )}

      {/* ================= MODAL 7: RATING ================= */}
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

      {/* ================= MODAL 8: EDIT SERVICE/PRODUCT ================= */}
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

      {/* ================= MODAL 9: ADD SERVICE ================= */}
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

      {/* ================= MODAL 10: ADD PRODUCT ================= */}
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

      {/* 5. AMAZON-STYLE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 flex justify-around py-2.5 z-40 shadow-lg">
        <button onClick={() => setActiveTab('home')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-[#FF9900]' : 'text-slate-400'}`}>
          <Zap className="w-4 h-4" /> होम
        </button>
        <button onClick={() => setActiveTab('orders')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'orders' ? 'text-[#FF9900]' : 'text-slate-400'}`}>
          <Clock className="w-4 h-4" /> मेरे आर्डर
        </button>
        {user?.role === 'admin' && (
          <button onClick={() => setActiveTab('admin')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'admin' ? 'text-[#FF9900]' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-4 h-4" /> एडमिन डैशबोर्ड
          </button>
        )}
      </nav>

    </div>
  );
}
