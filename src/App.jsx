import React, { useState } from 'react';
import { Wrench, ShoppingBag, Zap, LayoutDashboard, LogIn, LogOut, PlusCircle, Trash2, PhoneCall, MessageCircle, CheckCircle2, User, X } from 'lucide-react';

const ADMIN_PHONE = "6367626276";
const ADMIN_PIN = "2026"; // आपका मास्टर एडमिन पिन

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // App Catalog Data
  const [services, setServices] = useState([
    { id: 1, name: "Ceiling Fan Repair / पंखा रिपेयर", price: 199, visiting: 99 },
    { id: 2, name: "Short Circuit Check / वायरिंग जांच", price: 399, visiting: 149 },
    { id: 3, name: "Inverter Setup / इनवर्टर फिटिंग", price: 499, visiting: 149 },
    { id: 4, name: "MCB & Board Fit / स्विच बोर्ड फिटिंग", price: 299, visiting: 99 }
  ]);

  const [products, setProducts] = useState([
    { id: 1, name: "Polycab 2.5 Sq mm Wire (90m)", price: 1899, brand: "Polycab" },
    { id: 2, name: "Havells 32 Amp DP MCB Switch", price: 520, brand: "Havells" },
    { id: 3, name: "Anchor Roma 6A Modular Switch Set", price: 310, brand: "Anchor" }
  ]);

  const [bookings, setBookings] = useState([
    { id: "SRV-801", name: "राहुल शर्मा", phone: "98290-XXXXX", service: "Ceiling Fan Repair", date: "Today", status: "Pending" }
  ]);

  const [selectedService, setSelectedService] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // 1. PIN LOGIN LOGIC
  const handleAuth = (e) => {
    e.preventDefault();
    if (phone.length !== 10) return alert("कृपया सही 10 अंकों का मोबाइल नंबर डालें!");
    if (pin.length !== 4) return alert("कृपया 4 अंकों का पिन दर्ज करें!");

    const cleanPhone = phone.trim();
    if (cleanPhone === ADMIN_PHONE) {
      if (pin === ADMIN_PIN) {
        setUser({ phone: cleanPhone, role: 'admin' });
        setShowLogin(false);
        setActiveTab('admin');
        alert("नमस्ते एडमिन! आपका कंट्रोल पैनल खुल गया है।");
      } else {
        alert("गलत एडमिन पिन! कृपया सही पिन (2026) डालें।");
      }
    } else {
      setUser({ phone: cleanPhone, role: 'customer' });
      setShowLogin(false);
      alert("लॉगिन सफल! स्वागत है +91 " + cleanPhone);
    }
    setPhone('');
    setPin('');
  };

  // 2. WHATSAPP DIRECT SERVICE BOOKING
  const handleServiceBooking = (e) => {
    e.preventDefault();
    const f = e.target;
    const name = f.custName.value;
    const custPhone = f.custPhone.value;
    const addr = f.custAddr.value;
    const slot = f.custSlot.value;
    const refCode = "SRV-" + Math.floor(1000 + Math.random() * 9000);

    const newBooking = {
      id: refCode,
      name,
      phone: custPhone,
      service: selectedService.name,
      date: slot,
      status: "Pending"
    };

    setBookings([newBooking, ...bookings]);
    setBookingSuccess(newBooking);
    setSelectedService(null);

    // Direct WhatsApp message formatting
    const msg = `⚡ *नई सर्विस बुकिंग (विद्युत सेवा हब)*\n\n` +
      `🆔 *रिफरेंस:* ${refCode}\n` +
      `👤 *ग्राहक:* ${name}\n` +
      `📞 *मोबाइल:* ${custPhone}\n` +
      `🔧 *सर्विस:* ${selectedService.name}\n` +
      `💰 *अनुमानित चार्ज:* ₹${selectedService.price}\n` +
      `⏰ *स्लॉट:* ${slot}\n` +
      `📍 *पता:* ${addr}`;

    const waUrl = `https://wa.me/91${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // 3. WHATSAPP DIRECT PRODUCT ORDER
  const handleProductBuy = (product) => {
    const msg = `🛒 *नया सामान आर्डर (विद्युत सेवा हब)*\n\n` +
      `📦 *प्रोडक्ट:* ${product.name}\n` +
      `🏷️ *ब्रांड:* ${product.brand}\n` +
      `💵 *कीमत:* ₹${product.price}\n` +
      `नमस्ते, मुझे यह सामान खरीदना है। कृपया डिलीवरी की जानकारी दें।`;
    
    const waUrl = `https://wa.me/91${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // 4. ADMIN ADD SERVICE
  const handleAddService = (e) => {
    e.preventDefault();
    const name = e.target.srvName.value;
    const price = Number(e.target.srvPrice.value);
    setServices([...services, { id: Date.now(), name, price, visiting: 99 }]);
    setShowAddModal(false);
    alert("नई सर्विस सफलतापूर्वक जुड़ गई!");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans">
      
      {/* Top Bar */}
      <header className="bg-blue-900 text-white p-3.5 shadow flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          <div>
            <span className="font-black text-base block leading-none">विद्युत सेवा हब</span>
            <span className="text-[9px] text-yellow-300 uppercase tracking-wider">Electrical Service Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${user.role === 'admin' ? 'bg-yellow-400 text-slate-900' : 'bg-emerald-600 text-white'}`}>
                {user.role === 'admin' ? 'ADMIN' : user.phone}
              </span>
              <button onClick={() => { setUser(null); setActiveTab('home'); }} className="text-red-300">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLogin(true)}
              className="text-xs bg-yellow-400 text-slate-900 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow"
            >
              <LogIn className="w-3.5 h-3.5" /> लॉगिन
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto p-4 space-y-4">
        
        {/* ================= ADMIN VIEW ================= */}
        {activeTab === 'admin' && user?.role === 'admin' ? (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg border border-yellow-400/30">
              <div>
                <span className="text-[10px] bg-yellow-400 text-slate-900 font-black px-2 py-0.5 rounded-full uppercase">Admin Active</span>
                <h2 className="text-lg font-black mt-1">मास्टर एडमिन कंट्रोल</h2>
                <p className="text-xs text-slate-400">हेल्पलाइन: +91 {ADMIN_PHONE}</p>
              </div>
              <button onClick={() => setActiveTab('home')} className="text-xs bg-blue-800 text-white px-3 py-1.5 rounded-lg font-bold">
                कस्टमर व्यू
              </button>
            </div>

            {/* Bookings List */}
            <div className="bg-white p-4 rounded-xl border space-y-3 shadow-sm">
              <h3 className="font-bold text-xs text-slate-800 flex justify-between">
                <span>कस्टमर ऑर्डर्स ({bookings.length})</span>
                <span className="text-blue-800 font-bold">लाइव अपडेट</span>
              </h3>
              {bookings.map((b) => (
                <div key={b.id} className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-blue-900">{b.id}</span> • {b.name}
                    <div className="font-semibold text-slate-800 mt-0.5">{b.service}</div>
                    <div className="text-[11px] text-slate-500">📞 {b.phone} | स्लॉट: {b.date}</div>
                  </div>
                  <button 
                    onClick={() => setBookings(bookings.map(x => x.id === b.id ? { ...x, status: "Done" } : x))}
                    className={`text-[10px] px-2.5 py-1 rounded font-bold ${b.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-400 text-slate-900'}`}
                  >
                    {b.status === 'Done' ? '✔ Done' : 'Complete'}
                  </button>
                </div>
              ))}
            </div>

            {/* Services Management */}
            <div className="bg-white p-4 rounded-xl border space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-slate-800">सर्विस लिस्ट मैनेज करें</h3>
                <button onClick={() => setShowAddModal(true)} className="text-xs bg-blue-900 text-white px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> नई सर्विस
                </button>
              </div>
              {services.map((s) => (
                <div key={s.id} className="p-2.5 border rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{s.name}</span>
                    <span className="text-blue-800 font-black ml-2">₹{s.price}</span>
                  </div>
                  <button onClick={() => setServices(services.filter(x => x.id !== s.id))} className="text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ================= CUSTOMER VIEW ================= */
          <div className="space-y-4">
            
            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <span className="bg-yellow-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                ★ 45 मिनट में इलेक्ट्रीशियन घर पर
              </span>
              <h1 className="text-xl font-black mt-2">प्रमाणित इलेक्ट्रीशियन और 100% असली सामान</h1>
              <p className="text-xs text-blue-200 mt-1">शॉर्ट सर्किट, पंखा, इनवर्टर, मोटर व वायरिंग रिपेयर</p>
              
              <div className="flex gap-2 mt-4">
                <a 
                  href={`tel:${ADMIN_PHONE}`} 
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> {ADMIN_PHONE}
                </a>
                <a 
                  href={`https://wa.me/91${ADMIN_PHONE}?text=नमस्ते,%20मुझे%20इलेक्ट्रीशियन%20सर्विस%20चाहिए`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp हेल्प
                </a>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <h2 className="font-black text-sm text-slate-800">विद्युत सेवाएं (Electrical Services)</h2>
                <span className="text-[10px] text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded">डोरस्टेप सेवा</span>
              </div>
              {services.map((s) => (
                <div key={s.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{s.name}</h3>
                    <div className="text-xs font-black text-blue-800 mt-0.5">₹{s.price} <span className="text-[10px] text-slate-400 font-normal">(जांच शुल्क: ₹{s.visiting})</span></div>
                  </div>
                  <button 
                    onClick={() => setSelectedService(s)} 
                    className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow"
                  >
                    बुक करें
                  </button>
                </div>
              ))}
            </div>

            {/* Products Store */}
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between items-center">
                <h2 className="font-black text-sm text-slate-800">इलेक्ट्रिकल सामान स्टोर (Products)</h2>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">100% ओरिजिनल</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {products.map((p) => (
                  <div key={p.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{p.brand}</span>
                      <h3 className="font-bold text-xs text-slate-900">{p.name}</h3>
                      <div className="text-sm font-black text-slate-900 mt-0.5">₹{p.price}</div>
                    </div>
                    <button 
                      onClick={() => handleProductBuy(p)} 
                      className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 shadow"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> आर्डर करें
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ================= LOGIN MODAL ================= */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-xs space-y-4 shadow-2xl relative">
            <button onClick={() => setShowLogin(false)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-slate-900">सुरक्षित लॉगिन (PIN Login)</h3>
              <p className="text-[11px] text-slate-500">मोबाइल नंबर और 4-अंकों का पिन डालें</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700">10 अंकों का मोबाइल नंबर</label>
                <input 
                  required 
                  type="tel" 
                  maxLength={10} 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                  placeholder="जैसे 6367626276" 
                  className="w-full p-2.5 border rounded-lg font-bold" 
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700">4-अंकों का गुप्त पिन (PIN)</label>
                <input 
                  required 
                  type="password" 
                  maxLength={4} 
                  value={pin} 
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} 
                  placeholder="****" 
                  className="w-full p-2.5 border rounded-lg text-center tracking-widest text-base font-black" 
                />
                <span className="text-[10px] text-slate-400 mt-1 block">एडमिन के लिए पिन: <strong>2026</strong></span>
              </div>
              <button type="submit" className="w-full bg-blue-900 text-white py-2.5 rounded-lg font-bold shadow text-xs">
                लॉगिन करें
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= BOOKING MODAL (WHATSAPP INTEGRATED) ================= */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleServiceBooking} className="bg-white p-5 rounded-2xl w-full max-w-sm space-y-3 text-xs shadow-2xl relative">
            <button type="button" onClick={() => setSelectedService(null)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">सर्विस बुक करें</h3>
            <p className="text-xs text-blue-800 font-bold">{selectedService.name} (₹{selectedService.price})</p>

            <div>
              <label className="block font-bold mb-1">आपका नाम</label>
              <input required name="custName" placeholder="पूरा नाम दर्ज करें" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-bold mb-1">मोबाइल नंबर (WhatsApp)</label>
              <input required name="custPhone" type="tel" maxLength={10} defaultValue={user ? user.phone : ''} placeholder="10-digit number" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-bold mb-1">समय स्लॉट</label>
              <select name="custSlot" className="w-full p-2 border rounded-lg">
                <option>सुबह (9:00 AM - 1:00 PM)</option>
                <option>दोपहर (1:00 PM - 5:00 PM)</option>
                <option>शाम (5:00 PM - 8:00 PM)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">पूरा पता व लैंडमार्क</label>
              <textarea required name="custAddr" rows={2} placeholder="मकान नंबर, गली, शहर" className="w-full p-2 border rounded-lg"></textarea>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold shadow flex items-center justify-center gap-1 text-xs">
              <MessageCircle className="w-4 h-4" /> बुकिंग WhatsApp पर भेजें
            </button>
          </form>
        </div>
      )}

      {/* ================= ADD SERVICE MODAL (ADMIN ONLY) ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddService} className="bg-white p-5 rounded-2xl w-full max-w-xs space-y-3 text-xs shadow-xl relative">
            <button type="button" onClick={() => setShowAddModal(false)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-sm text-slate-900">नई सर्विस जोड़ें</h3>
            <input required name="srvName" placeholder="सर्विस का नाम (जैसे: पंप रिपेयर)" className="w-full p-2 border rounded" />
            <input required name="srvPrice" type="number" placeholder="चार्ज (₹)" className="w-full p-2 border rounded" />
            <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded font-bold">
              सेव करें
            </button>
          </form>
        </div>
      )}

      {/* ================= BOTTOM NAVIGATION ================= */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2.5 z-40 shadow-lg">
        <button onClick={() => setActiveTab('home')} className={`text-xs font-bold flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-blue-900' : 'text-slate-400'}`}>
          <Zap className="w-4 h-4" /> होम
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
