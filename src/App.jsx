import React, { useState } from 'react';
import { 
  Wrench, ShoppingBag, ShieldCheck, PhoneCall, Download, 
  X, Zap, CheckCircle2, LayoutDashboard, MessageCircle, 
  AlertCircle, Search, ChevronRight, User, LogIn, LogOut, 
  PlusCircle, Edit3, Trash2, Check, Clock, Layers
} from 'lucide-react';

const ADMIN_PHONE = "6367626276"; // आपका मास्टर एडमिन नंबर

export default function App() {
  const [lang, setLang] = useState('hi');
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'services' | 'products' | 'admin' | 'apk'
  
  // Auth State
  const [user, setUser] = useState(null); // { phone: string, role: 'admin' | 'customer' }
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState('1234');

  // Customer Booking Modals
  const [bookingModal, setBookingModal] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Admin New Service & Product Modals
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Dynamic Catalog Data (Controlled by Admin)
  const [services, setServices] = useState([
    { id: 1, name: "Ceiling Fan Repair / पंखा रिपेयर", price: 199, visiting: 99, category: "Fans" },
    { id: 2, name: "Short Circuit & Fault / वायरिंग जांच", price: 399, visiting: 149, category: "Wiring" },
    { id: 3, name: "Inverter Setup / इनवर्टर फिटिंग", price: 499, visiting: 149, category: "Backup" },
    { id: 4, name: "MCB & Board Fit / स्विच बोर्ड फिटिंग", price: 299, visiting: 99, category: "Switchgear" }
  ]);

  const [products, setProducts] = useState([
    { id: 1, name: "Polycab 2.5 Sq mm Wire (90m, Red)", price: 1899, stock: 45, brand: "Polycab" },
    { id: 2, name: "Havells 32 Amp DP MCB Switch", price: 520, stock: 80, brand: "Havells" },
    { id: 3, name: "Anchor Roma 6A Modular Switch (Pack of 10)", price: 310, stock: 120, brand: "Anchor" }
  ]);

  const [bookings, setBookings] = useState([
    { id: "SRV-901", name: "Rahul Sharma", phone: "98290-XXXXX", service: "Ceiling Fan Repair", date: "Today", slot: "Morning", status: "Pending" },
    { id: "SRV-902", name: "Mukesh Verma", phone: "94140-XXXXX", service: "Inverter Setup", date: "Tomorrow", slot: "Evening", status: "Confirmed" }
  ]);

  // LOGIN LOGIC
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (loginPhone.length !== 10) {
      alert("कृपया सही 10 अंकों का मोबाइल नंबर डालें!");
      return;
    }
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setDemoOtp(generated);
    setOtpSent(true);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (loginOtp === demoOtp || loginOtp === "1234") {
      const cleanPhone = loginPhone.trim();
      const isAdmin = cleanPhone === ADMIN_PHONE;
      
      const loggedInUser = {
        phone: cleanPhone,
        role: isAdmin ? 'admin' : 'customer'
      };

      setUser(loggedInUser);
      setShowLoginModal(false);
      setOtpSent(false);
      setLoginPhone('');
      setLoginOtp('');

      if (isAdmin) {
        setActiveTab('admin');
        alert("नमस्ते एडमिन! आपका कंट्रोल पैनल खुल गया है। आप यहां से पूरी ऐप को मैनेज कर सकते हैं।");
      } else {
        alert(`लॉगिन सफल! स्वागत है +91 ${cleanPhone}`);
      }
    } else {
      alert("गलत OTP! कृपया स्क्रीन पर दिख रहा OTP डालें।");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
    alert("आप ऐप से लॉगआउट हो चुके हैं।");
  };

  // BOOKING SUBMIT
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newRef = "SRV-" + Math.floor(1000 + Math.random() * 9000);
    const newBooking = {
      id: newRef,
      name: formData.get("fullName"),
      phone: formData.get("phone"),
      service: bookingModal.name,
      date: formData.get("date"),
      slot: formData.get("slot"),
      status: "Pending"
    };

    setBookings([newBooking, ...bookings]);
    setBookingSuccess(newBooking);
    setBookingModal(null);
  };

  // ADMIN ACTIONS: ADD SERVICE
  const handleAddService = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const newSrv = {
      id: Date.now(),
      name: form.get("srvName"),
      price: Number(form.get("srvPrice")),
      visiting: Number(form.get("srvVisit")),
      category: form.get("srvCategory")
    };
    setServices([...services, newSrv]);
    setShowAddServiceModal(false);
    alert("नई सर्विस सफलतापूर्वक जोड़ दी गई!");
  };

  // ADMIN ACTIONS: ADD PRODUCT
  const handleAddProduct = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const newProd = {
      id: Date.now(),
      name: form.get("prodName"),
      brand: form.get("prodBrand"),
      price: Number(form.get("prodPrice")),
      stock: Number(form.get("prodStock"))
    };
    setProducts([...products, newProd]);
    setShowAddProductModal(false);
    alert("नया प्रोडक्ट सफलतापूर्वक जोड़ दिया गया!");
  };

  // ADMIN: CHANGE BOOKING STATUS
  const updateBookingStatus = (id, newStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans">
      
      {/* 1. TOP ANNOUNCEMENT & AUTH STATUS BAR */}
      <div className="bg-[#0B1E3D] text-slate-300 text-xs py-2 px-4 flex justify-between items-center">
        <span className="flex items-center gap-1 font-medium">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          विद्युत सेवा हब • 100% वेरिफाइड इलेक्ट्रीशियन
        </span>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.role === 'admin' ? 'bg-yellow-400 text-slate-900' : 'bg-emerald-600 text-white'}`}>
                {user.role === 'admin' ? 'MASTER ADMIN' : 'CUSTOMER'}
              </span>
              <span className="text-white font-bold">{user.phone}</span>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-0.5 ml-1">
                <LogOut className="w-3 h-3" /> लॉगआउट
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-2.5 py-1 rounded flex items-center gap-1 shadow"
            >
              <LogIn className="w-3.5 h-3.5" /> लॉगिन / Sign In
            </button>
          )}
        </div>
      </div>

      {/* 2. HEADER */}
      <header className="sticky top-0 z-40 bg-[#1E3A8A] text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-yellow-400 text-[#0B1E3D] p-1.5 rounded-lg font-black">
              <Zap className="w-5 h-5 fill-[#0B1E3D]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight block leading-tight">विद्युत सेवा हब</span>
              <span className="text-[10px] text-amber-300 tracking-wider uppercase font-semibold">Electrical Service Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && user.role === 'admin' && (
              <button 
                onClick={() => setActiveTab(activeTab === 'admin' ? 'home' : 'admin')}
                className="bg-yellow-400 text-slate-900 font-black text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow animate-pulse"
              >
                <LayoutDashboard className="w-4 h-4" />
                {activeTab === 'admin' ? 'कस्टमर व्यू' : 'एडमिन पैनल'}
              </button>
            )}
            <a 
              href="https://wa.me/916367626276?text=Hello%20Electrical%20Service%20Hub" 
              target="_blank" 
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* 3. MAIN BODY CONTAINER */}
      <main className="max-w-4xl mx-auto p-4 space-y-4">

        {/* ==================== VIEW 1: ADMIN CONTROL PORTAL ==================== */}
        {activeTab === 'admin' && user && user.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-5 rounded-2xl border border-yellow-400/30 shadow-xl">
              <div className="flex justify-between items-center">
                <div>
                  <span className="bg-yellow-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    Admin Privileges Active
                  </span>
                  <h1 className="text-2xl font-black mt-1">मास्टर एडमिन कंट्रोल पैनल</h1>
                  <p className="text-xs text-slate-300">रजिस्टर्ड नंबर: +91 {ADMIN_PHONE}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-yellow-300 block">कुल सर्विसेज</span>
                  <span className="text-xl font-black">{services.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">कुल बुकिंग्स</span>
                <span className="text-xl font-black text-blue-900">{bookings.length}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">कुल प्रोडक्ट्स</span>
                <span className="text-xl font-black text-amber-600">{products.length}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">पेंडिंग काम</span>
                <span className="text-xl font-black text-rose-600">
                  {bookings.filter(b => b.status === 'Pending').length}
                </span>
              </div>
            </div>

            {/* Admin Bookings Management */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <h2 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                <span>कस्टमर बुकिंग ऑर्डर्स (Live Service Bookings)</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">{bookings.length} Orders</span>
              </h2>

              <div className="space-y-2">
                {bookings.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-50 border rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-blue-900">#{b.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : b.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                          {b.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs mt-1 text-slate-800">{b.service}</h4>
                      <p className="text-[11px] text-slate-500">ग्राहक: {b.name} ({b.phone}) | स्लॉट: {b.date} ({b.slot})</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => updateBookingStatus(b.id, 'Confirmed')} 
                        className="bg-blue-800 text-white text-[11px] font-bold px-2.5 py-1 rounded hover:bg-blue-900"
                      >
                        कन्फर्म करें
                      </button>
                      <button 
                        onClick={() => updateBookingStatus(b.id, 'Completed')} 
                        className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded hover:bg-emerald-700"
                      >
                        पूर्ण (Done)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Service Catalog Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-sm text-slate-900">विद्युत सेवाएं कंट्रोल (Services List)</h2>
                <button 
                  onClick={() => setShowAddServiceModal(true)}
                  className="bg-blue-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-yellow-400" /> नई सर्विस जोड़ें
                </button>
              </div>

              <div className="space-y-2">
                {services.map((s) => (
                  <div key={s.id} className="p-3 border rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{s.name}</span>
                      <span className="text-slate-500">चार्ज: ₹{s.price} | विजिटिंग: ₹{s.visiting}</span>
                    </div>
                    <button 
                      onClick={() => setServices(services.filter(item => item.id !== s.id))}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Product Store Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-sm text-slate-900">इलेक्ट्रिकल सामान कंट्रोल (Products Store)</h2>
                <button 
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-yellow-200" /> नया सामान जोड़ें
                </button>
              </div>

              <div className="space-y-2">
                {products.map((p) => (
                  <div key={p.id} className="p-3 border rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{p.name} ({p.brand})</span>
                      <span className="text-emerald-700 font-bold">कीमत: ₹{p.price} | स्टॉक: {p.stock} पीस</span>
                    </div>
                    <button 
                      onClick={() => setProducts(products.filter(item => item.id !== p.id))}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW 2: CUSTOMER HOME VIEW ==================== */}
        {activeTab !== 'admin' && (
          <div className="space-y-4">
            
            {/* Promotional Banner */}
            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#0B1E3D] text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <span className="bg-yellow-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                ★ 45 मिनट में इलेक्ट्रीशियन आपके
