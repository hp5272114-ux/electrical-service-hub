import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { 
  Zap, Wrench, ShoppingBag, LayoutDashboard, LogIn, LogOut, 
  PhoneCall, MessageCircle, AlertTriangle, User, X, CheckCircle2, Clock, Truck 
} from 'lucide-react';

const ADMIN_PHONE = "6367626276";
const ADMIN_PIN = "2026";

// आपकी लाइव Firebase Cloud Keys
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
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('esh_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('home');
  const [showLogin, setShowLogin] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPin, setAuthPin] = useState('');

  // लाइव क्लाउड सिंक (Amazon स्टाइल रीयल-टाइम डेटा)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "bookings"), (snapshot) => {
      const liveList = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
      liveList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setBookings(liveList);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = (e) => {
    e.preventDefault();
    if (authPhone.length !== 10) return alert("10 अंकों का फोन नंबर डालें!");
    if (authPin.length !== 4) return alert("4 अंकों का पिन डालें!");

    const cleanPhone = authPhone.trim();
    if (cleanPhone === ADMIN_PHONE) {
      if (authPin === ADMIN_PIN) {
        const adminUser = { name: "मास्टर एडमिन", phone: cleanPhone, role: 'admin' };
        setUser(adminUser);
        localStorage.setItem('esh_user', JSON.stringify(adminUser));
        setShowLogin(false);
        setActiveTab('admin');
        alert("नमस्ते एडमिन! कंट्रोल रूम खुल चुका है।");
      } else {
        alert("गलत एडमिन पिन! सही पिन 2026 डालें।");
      }
    } else {
      if (!authName.trim()) return alert("कृपया अपना नाम दर्ज करें!");
      const custUser = { name: authName.trim(), phone: cleanPhone, role: 'customer' };
      setUser(custUser);
      localStorage.setItem('esh_user', JSON.stringify(custUser));
      setShowLogin(false);
      alert("रजिस्ट्रेशन सफल! स्वागत है " + custUser.name);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('esh_user');
    setActiveTab('home');
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("सर्विस बुक करने के लिए कृपया पहले नाम और फोन नंबर से लॉगिन करें!");
      setShowLogin(true);
      return;
    }

    const form = e.target;
    const addr = form.custAddr.value;
    const slot = form.custSlot.value;
    const refCode = "ESH-" + Math.floor(1000 + Math.random() * 9000);

    const bookingData = {
      bookingId: refCode,
      customerName: user.name,
      customerPhone: user.phone,
      serviceName: selectedService.name,
      price: selectedService.price,
      slot: slot,
      address: addr,
      status: "Placed",
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "bookings"), bookingData);
      setSelectedService(null);
      setActiveTab('orders');
      alert(`🎉 बुकिंग सफल! रिफरेंस: #${refCode}\nएडमिन को लाइव आर्डर प्राप्त हो गया है।`);
    } catch (err) {
      alert("बुकिंग सेव करने में एरर: " + err.message);
    }
  };

  const updateStatus = async (docId, newStatus) => {
    try {
      await updateDoc(doc(db, "bookings", docId), { status: newStatus });
    } catch (err) {
      alert("स्टेटस अपडेट नहीं हो सका: " + err.message);
    }
  };

  const services = [
    { id: 1, name: "Ceiling Fan Repair / पंखा रिपेयर", price: 199 },
    { id: 2, name: "Short Circuit Check / वायरिंग जांच", price: 399 },
    { id: 3, name: "Inverter Setup / इनवर्टर फिटिंग", price: 499 },
    { id: 4, name: "MCB Box & Wiring / स्विच बोर्ड फिटिंग", price: 299 }
  ];

  const products = [
    { id: 1, name: "Polycab 2.5 Sq mm Wire (90m)", price: 1899, brand: "Polycab" },
    { id: 2, name: "Havells 32A DP MCB Switch", price: 520, brand: "Havells" },
    { id: 3, name: "Anchor Roma 6A Modular Switch Set", price: 310, brand: "Anchor" }
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans">
      <header className="bg-blue-900 text-white p-3.5 shadow-md flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-yellow-400 p-1 rounded-lg">
            <Zap className="w-5 h-5 text-blue-900 fill-blue-900" />
          </div>
          <div>
            <span className="font-black text-base block leading-none">विद्युत सेवा हब</span>
            <span className="text-[9px] text-yellow-300 font-semibold tracking-wider uppercase">Live Cloud Sync</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded font-black ${user.role === 'admin' ? 'bg-yellow-400 text-blue-900' : 'bg-emerald-600 text-white'}`}>
                {user.role === 'admin' ? 'ADMIN' : user.name.split(' ')[0]}
              </span>
              <button onClick={handleLogout} className="text-red-300 p-1">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} className="text-xs bg-yellow-400 text-blue-900 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow">
              <LogIn className="w-3.5 h-3.5" /> लॉगिन / साइन इन
            </button>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-4">
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-3.5 rounded-2xl shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-xl animate-pulse">
              <AlertTriangle className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-sm">इमरजेंसी बिजली फॉल्ट?</h3>
              <p className="text-[11px] text-red-100">15 मिनट में इलेक्ट्रीशियन सहायता</p>
            </div>
          </div>
          <a href={`tel:${ADMIN_PHONE}`} className="bg-yellow-400 text-blue-950 font-black text-xs px-3.5 py-2 rounded-xl shadow">
            SOS कॉल
          </a>
        </div>

        {activeTab === 'admin' && user?.role === 'admin' && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg border border-yellow-400/30">
              <div>
                <span className="text-[10px] bg-yellow-400 text-blue-950 font-black px-2 py-0.5 rounded-full uppercase">Master Admin</span>
                <h2 className="text-lg font-black mt-1">लाइव आर्डर कंट्रोल रूम</h2>
                <p classN
