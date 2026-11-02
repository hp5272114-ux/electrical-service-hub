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
                <p className="text-xs text-slate-400">कुल लाइव बुकिंग्स: {bookings.length}</p>
              </div>
              <button onClick={() => setActiveTab('home')} className="text-xs bg-blue-800 text-white px-3 py-1.5 rounded-lg font-bold">
                कस्टमर व्यू
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border space-y-3 shadow-sm">
              <h3 className="font-bold text-xs text-slate-800">ग्राहकों के लाइव आर्डर (Real-time Sync)</h3>
              {bookings.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">अभी कोई बुकिंग दर्ज नहीं हुई है।</p>
              ) : (
                bookings.map((b) => (
                  <div key={b.docId} className="p-3 bg-slate-50 border rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-black text-blue-900">#{b.bookingId}</span> • <strong>{b.customerName}</strong>
                        <div className="text-slate-700 font-semibold mt-0.5">{b.serviceName} (₹{b.price})</div>
                        <div className="text-[11px] text-slate-500">📞 {b.customerPhone} | 📍 {b.address}</div>
                        <div className="text-[10px] text-slate-400">स्लॉट: {b.slot}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                        b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'On The Way' ? 'bg-purple-100 text-purple-800' :
                        b.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="flex gap-1.5 pt-2 border-t flex-wrap">
                      <button onClick={() => updateStatus(b.docId, 'Confirmed')} className="bg-blue-800 text-white text-[10px] px-2.5 py-1 rounded font-bold">
                        स्वीकार (Confirm)
                      </button>
                      <button onClick={() => updateStatus(b.docId, 'On The Way')} className="bg-purple-700 text-white text-[10px] px-2.5 py-1 rounded font-bold">
                        रास्ते में (On The Way)
                      </button>
                      <button onClick={() => updateStatus(b.docId, 'Completed')} className="bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded font-bold">
                        पूरा हुआ (Done)
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            <h2 className="font-black text-base text-slate-800">मेरे आर्डर व लाइव ट्रैकिंग</h2>
            {!user ? (
              <div className="bg-white p-6 rounded-2xl text-center space-y-2 border">
                <p className="text-xs text-slate-500">अपने आर्डर देखने के लिए पहले लॉगिन करें</p>
                <button onClick={() => setShowLogin(true)} className="bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-lg">
                  लॉगिन करें
                </button>
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

                  <div className="bg-slate-50 p-3 rounded-xl border space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">लाइव स्टेटस</span>
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
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-5 rounded-2xl shadow-lg">
              <span className="bg-yellow-400 text-blue-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                ★ डोरस्टेप इलेक्ट्रीशियन सेवा
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

            <div className="space-y-2.5">
              <h2 className="font-black text-sm text-slate-800">इलेक्ट्रिकल सेवाएं</h2>
              {services.map((s) => (
                <div key={s.id} className="bg-white p-3.5 rounded-xl border flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{s.name}</h3>
                    <div className="text-xs font-black text-blue-800 mt-0.5">₹{s.price}</div>
                  </div>
                  <button 
                    onClick={() => {
                      if (!user) {
                        alert("सर्विस बुक करने के लिए कृपया पहले नाम और मोबाइल नंबर से लॉगिन करें!");
                        setShowLogin(true);
                      } else {
                        setSelectedService(s);
                      }
                    }} 
                    className="bg-blue-900 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow"
                  >
                    बुक करें
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 pt-2">
              <h2 className="font-black text-sm text-slate-800">सामान स्टोर</h2>
              {products.map((p) => (
                <div key={p.id} className="bg-white p-3.5 rounded-xl border flex justify-between items-center shadow-sm">
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

      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAuth} className="bg-white p-6 rounded-2xl w-full max-w-xs space-y-3.5 shadow-2xl relative text-xs">
            <button type="button" onClick={() => setShowLogin(false)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-slate-900">रजिस्ट्रेशन / लॉगिन</h3>
              <p className="text-[11px] text-slate-500">लाइव आर्डर ट्रैकिंग के लिए</p>
            </div>

            <div>
              <label className="block font-bold mb-1">आपका नाम (Full Name)</label>
              <input required type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="जैसे: राहुल शर्मा" className="w-full p-2.5 border rounded-lg font-semibold" />
            </div>

            <div>
              <label className="block font-bold mb-1">10 अंकों का मोबाइल नंबर</label>
              <input required type="tel" maxLength={10} value={authPhone} onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, ''))} placeholder="जैसे: 98290XXXXX" className="w-full p-2.5 border rounded-lg font-bold" />
              <span className="text-[10px] text-slate-400 mt-0.5 block">एडमिन के लिए: <strong>6367626276</strong></span>
            </div>

            <div>
              <label className="block font-bold mb-1">4-अंकों का गुप्त पिन (PIN)</label>
              <input required type="password" maxLength={4} value={authPin} onChange={(e) => setAuthPin(e.target.value.replace(/\D/g, ''))} placeholder="****" className="w-full p-2.5 border rounded-lg text-center tracking-widest font-black text-base" />
              <span className="text-[10px] text-slate-400 mt-0.5 block">एडमिन पिन: <strong>2026</strong></span>
            </div>

            <button type="submit" className="w-full bg-blue-900 text-white py-2.5 rounded-lg font-bold shadow text-xs">
              रजिस्टर / लॉगिन करें
            </button>
          </form>
        </div>
      )}

      {selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleBooking} className="bg-white p-5 rounded-2xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setSelectedService(null)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">सर्विस बुकिंग</h3>
            <p className="text-xs text-blue-800 font-bold">{selectedService.name} (₹{selectedService.price})</p>

            <div className="bg-slate-50 p-2.5 rounded-lg border text-slate-600">
              <div><strong>ग्राहक:</strong> {user?.name}</div>
              <div><strong>फोन:</strong> {user?.phone}</div>
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2.5 z-40 shadow-lg">
        <button onClick={() => setActiveTab('home')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-blue-900' : 'text-slate-400'}`}>
          <Zap className="w-4 h-4" /> होम
        </button>
        <button onClick={() => setActiveTab('orders')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'orders' ? 'text-blue-900' : 'text-slate-400'}`}>
          <Clock className="w-4 h-4" /> मेरे आर्डर
        </button>
        {user?.role === 'admin' ? (
          <button onClick={() => setActiveTab('admin')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'admin' ? 'text-yellow-600' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-4 h-4" /> एडमिन
          </button>
        ) : (
          <button onClick={() => setShowLogin(true)} className="text-xs font-bold flex flex-col items-center gap-0.5 text-slate-400">
            <User className="w-4 h-4" /> {user ? 'प्रोफाइल' : 'लॉगिन'}
          </button>
        )}
      </nav>
    </div>
  );
}
