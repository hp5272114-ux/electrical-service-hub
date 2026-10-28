import React, { useState } from 'react';
import { Wrench, ShoppingBag, Zap, LayoutDashboard, LogIn, LogOut, PlusCircle, Trash2, PhoneCall } from 'lucide-react';

const ADMIN_PHONE = "6367626276";

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState('1234');
  
  const [services, setServices] = useState([
    { id: 1, name: "Ceiling Fan Repair / पंखा रिपेयर", price: 199 },
    { id: 2, name: "Short Circuit / वायरिंग जांच", price: 399 },
    { id: 3, name: "Inverter Setup / इनवर्टर फिटिंग", price: 499 }
  ]);

  const [products, setProducts] = useState([
    { id: 1, name: "Polycab 2.5mm Wire (90m)", price: 1899 },
    { id: 2, name: "Havells 32A DP MCB Switch", price: 520 }
  ]);

  const [bookings, setBookings] = useState([
    { id: "SRV-101", name: "Rahul", service: "Fan Repair", status: "Pending" }
  ]);

  const [selectedService, setSelectedService] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const sendOtp = (e) => {
    e.preventDefault();
    if (phone.length !== 10) return alert("10 अंकों का मोबाइल नंबर डालें!");
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setDemoOtp(code);
    setOtpSent(true);
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    if (otp === demoOtp || otp === "1234") {
      const isAdmin = phone.trim() === ADMIN_PHONE;
      setUser({ phone: phone.trim(), role: isAdmin ? 'admin' : 'customer' });
      setShowLogin(false);
      setOtpSent(false);
      if (isAdmin) {
        setActiveTab('admin');
        alert("नमस्ते एडमिन! आपका कंट्रोल पैनल खुल गया है।");
      } else {
        alert("लॉगिन सफल!");
      }
    } else {
      alert("गलत OTP! स्क्रीन पर दिखने वाला कोड डालें।");
    }
  };

  const bookNow = (e) => {
    e.preventDefault();
    const name = e.target.custName.value;
    const newB = { id: "SRV-" + Math.floor(100 + Math.random()*900), name, service: selectedService.name, status: "Pending" };
    setBookings([newB, ...bookings]);
    setSelectedService(null);
    alert("बुकिंग दर्ज हो चुकी है! रिफरेंस: " + newB.id);
  };

  const addNewService = (e) => {
    e.preventDefault();
    const name = e.target.srvName.value;
    const price = e.target.srvPrice.value;
    setServices([...services, { id: Date.now(), name, price }]);
    setShowAddModal(false);
    alert("नई सर्विस जुड़ गई!");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans">
      <header className="bg-blue-900 text-white p-4 shadow flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2" onClick={() => setActiveTab('home')}>
          <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          <span className="font-bold text-lg">विद्युत सेवा हब</span>
        </div>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-yellow-400 text-slate-900 px-2 py-0.5 rounded font-bold">
              {user.role === 'admin' ? 'ADMIN' : user.phone}
            </span>
            <button onClick={() => { setUser(null); setActiveTab('home'); }} className="text-xs text-red-300">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)} className="text-xs bg-yellow-400 text-slate-900 font-bold px-3 py-1.5 rounded flex items-center gap-1">
            <LogIn className="w-3.5 h-3.5" /> लॉगिन
          </button>
        )}
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-4">
        {activeTab === 'admin' && user?.role === 'admin' ? (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center">
              <div>
                <h2 className="font-bold text-base text-yellow-400">मास्टर एडमिन पैनल</h2>
                <p className="text-xs text-slate-300">नंबर: +91 {ADMIN_PHONE}</p>
              </div>
              <button onClick={() => setActiveTab('home')} className="text-xs bg-blue-800 px-3 py-1 rounded">
                कस्टमर व्यू
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border space-y-2">
              <h3 className="font-bold text-xs text-slate-800">कस्टमर बुकिंग्स ({bookings.length})</h3>
              {bookings.map((b) => (
                <div key={b.id} className="p-2.5 bg-slate-50 border rounded flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-blue-900">{b.id}</span> - {b.name} ({b.service})
                    <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold">{b.status}</span>
                  </div>
                  <button 
                    onClick={() => setBookings(bookings.map(x => x.id === b.id ? { ...x, status: "Done" } : x))}
                    className="bg-emerald-600 text-white text-[10px] px-2 py-1 rounded font-bold"
                  >
                    Done
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-xl border space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-slate-800">सर्विस लिस्ट</h3>
                <button onClick={() => setShowAddModal(true)} className="text-xs bg-blue-900 text-white px-2 py-1 rounded flex items-center gap-1">
                  <PlusCircle className="w-3 h-3" /> नई सर्विस
                </button>
              </div>
              {services.map((s) => (
                <div key={s.id} className="p-2 border rounded flex justify-between items-center text-xs">
                  <span>{s.name} - ₹{s.price}</span>
                  <button onClick={() => setServices(services.filter(x => x.id !== s.id))} className="text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-4 rounded-2xl shadow">
              <h1 className="text-lg font-bold">प्रमाणित इलेक्ट्रीशियन और असली सामान</h1>
              <p className="text-xs text-blue-200 mt-1">45 मिनट में आपके घर इलेक्ट्रीशियन सेवा</p>
              <div className="flex gap-2 mt-3">
                <a href="tel:6367626276" className="bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" /> 6367626276
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-bold text-sm text-slate-800">इलेक्ट्रिकल सेवाएं</h2>
              {services.map((s) => (
                <div key={s.id} className="bg-white p-3 rounded-xl border flex justify-between items-center shadow-sm text-xs">
                  <div>
                    <h3 className="font-bold text-slate-900">{s.name}</h3>
                    <span className="font-black text-blue-800">₹{s.price}</span>
                  </div>
                  <button onClick={() => setSelectedService(s)} className="bg-blue-900 text-white font-bold px-3 py-1.5 rounded">
                    बुक करें
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h2 className="font-bold text-sm text-slate-800">सामान स्टोर</h2>
              {products.map((p) => (
                <div key={p.id} className="bg-white p-3 rounded-xl border flex justify-between items-center shadow-sm text-xs">
                  <div>
                    <h3 className="font-bold text-slate-900">{p.name}</h3>
                    <span className="font-black text-slate-900">₹{p.price}</span>
                  </div>
                  <button onClick={() => alert("कार्ट में जोड़ा गया!")} className="bg-yellow-400 text-slate-900 font-bold px-3 py-1.5 rounded">
                    खरीदें
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showLogin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-5 rounded-2xl w-full max-w-xs space-y-3">
            <h3 className="font-bold text-sm text-center">लॉगिन (Mobile OTP)</h3>
            {!otpSent ? (
              <form onSubmit={sendOtp} className="space-y-3 text-xs">
                <input required type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10 अंकों का मोबाइल नंबर" className="w-full p-2 border rounded" />
                <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded font-bold">ओटीपी भेजें</button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-3 text-xs">
                <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-center font-bold">डेमो OTP: {demoOtp}</div>
                <input required type="number" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP दर्ज करें" className="w-full p-2 border rounded text-center tracking-widest font-bold" />
                <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded font-bold">सत्यापित करें</button>
              </form>
            )}
            <button onClick={() => setShowLogin(false)} className="w-full text-center text-xs text-slate-400">रद्द करें</button>
          </div>
        </div>
      )}

      {selectedService && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={bookNow} className="bg-white p-5 rounded-2xl w-full max-w-xs space-y-3 text-xs">
            <h3 className="font-bold text-sm">बुक करें: {selectedService.name}</h3>
            <input required name="custName" placeholder="आपका नाम" className="w-full p-2 border rounded" />
            <input required type="tel" placeholder="मोबाइल नंबर" className="w-full p-2 border rounded" />
            <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded font-bold">कन्फर्म करें</button>
            <button type="button" onClick={() => setSelectedService(null)} className="w-full text-center text-slate-400">रद्द करें</button>
          </form>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={addNewService} className="bg-white p-5 rounded-2xl w-full max-w-xs space-y-3 text-xs">
            <h3 className="font-bold text-sm">नई सर्विस जोड़ें</h3>
            <input required name="srvName" placeholder="सर्विस का नाम" className="w-full p-2 border rounded" />
            <input required name="srvPrice" type="number" placeholder="मूल्य (₹)" className="w-full p-2 border rounded" />
            <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded font-bold">सेव करें</button>
            <button type="button" onClick={() => setShowAddModal(false)} className="w-full text-center text-slate-400">रद्द करें</button>
          </form>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2.5 z-40">
        <button onClick={() => setActiveTab('home')} className={`text-xs flex flex-col items-center ${activeTab === 'home' ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
          <Zap className="w-4 h-4" /> होम
        </button>
        {user?.role === 'admin' ? (
          <button onClick={() => setActiveTab('admin')} className={`text-xs flex flex-col items-center ${activeTab === 'admin' ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-4 h-4" /> एडमिन
          </button>
        ) : (
          <button onClick={() => setShowLogin(true)} className="text-xs flex flex-col items-center text-slate-400">
            <LogIn className="w-4 h-4" /> लॉगिन
          </button>
        )}
      </nav>
    </div>
  );
}
