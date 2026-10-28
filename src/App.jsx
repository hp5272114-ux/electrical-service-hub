import React, { useState } from 'react';
import { 
  Wrench, ShoppingBag, ShieldCheck, PhoneCall, Download, 
  X, Zap, CheckCircle2, LayoutDashboard, MessageCircle, 
  AlertCircle, Search, ChevronRight
} from 'lucide-react';

const i18n = {
  en: {
    brand: "Electrical Service Hub",
    tagline: "Certified Electricians & Genuine Products",
    nav_home: "Home",
    nav_services: "Services",
    nav_products: "Products",
    nav_apk: "App",
    btn_book_now: "Book Now",
    btn_buy_now: "Add to Cart",
    switch_lang: "हिन्दी"
  },
  hi: {
    brand: "विद्युत सेवा हब",
    tagline: "प्रमाणित इलेक्ट्रीशियन और असली सामान",
    nav_home: "होम",
    nav_services: "सेवाएं",
    nav_products: "सामान",
    nav_apk: "ऐप",
    btn_book_now: "बुक करें",
    btn_buy_now: "खरीदें",
    switch_lang: "English"
  }
};

export default function App() {
  const [lang, setLang] = useState('hi');
  const [activeTab, setActiveTab] = useState('home');
  const [bookingModal, setBookingModal] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const t = i18n[lang];

  const services = [
    { id: 1, name: "Ceiling Fan Repair / पंखा रिपेयर", price: 199, img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400" },
    { id: 2, name: "Short Circuit Check / वायरिंग जांच", price: 399, img: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400" },
    { id: 3, name: "Inverter Setup / इनवर्टर फिटिंग", price: 499, img: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=400" },
    { id: 4, name: "MCB & Board Fit / स्विच बोर्ड फिटिंग", price: 299, img: "https://images.unsplash.com/photo-1509744645300-a2098b11871a?w=400" }
  ];

  const products = [
    { id: 1, name: "Polycab 2.5 Sq mm Wire (90m)", price: 1899, brand: "Polycab" },
    { id: 2, name: "Havells 32A DP MCB Switch", price: 520, brand: "Havells" },
    { id: 3, name: "Anchor Roma 6A Modular Switch (Pack of 10)", price: 310, brand: "Anchor" }
  ];

  const handleBooking = (e) => {
    e.preventDefault();
    setBookingModal(null);
    setBookingSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans">
      {/* Top Header */}
      <header className="bg-blue-900 text-white p-4 shadow flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2" onClick={() => setActiveTab('home')}>
          <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          <span className="font-bold text-lg">{t.brand}</span>
        </div>
        <button 
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="text-xs bg-yellow-400 text-slate-900 font-bold px-3 py-1 rounded"
        >
          {t.switch_lang}
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto p-4 space-y-4">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-5 rounded-2xl shadow">
          <span className="text-[10px] bg-yellow-400 text-slate-900 font-bold px-2 py-0.5 rounded-full">
            ★ Verified Electricians
          </span>
          <h1 className="text-xl font-bold mt-2">{t.tagline}</h1>
          <p className="text-xs text-blue-200 mt-1">45 मिनट में आपके घर इलेक्ट्रीशियन सेवा उपलब्ध</p>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => setActiveTab('services')}
              className="bg-yellow-400 text-slate-900 font-bold text-xs px-4 py-2 rounded-lg"
            >
              {t.btn_book_now}
            </button>
            <a 
              href="https://wa.me/919876543210" 
              className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        </div>

        {/* Tab: Home & Services */}
        {(activeTab === 'home' || activeTab === 'services') && (
          <div className="space-y-3">
            <h2 className="font-bold text-base text-slate-800">विद्युत सेवाएं (Electrical Services)</h2>
            <div className="grid grid-cols-1 gap-3">
              {services.map((s) => (
                <div key={s.id} className="bg-white p-3 rounded-xl border flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{s.name}</h3>
                    <span className="text-xs font-black text-blue-700">₹{s.price}</span>
                  </div>
                  <button 
                    onClick={() => setBookingModal(s)}
                    className="bg-blue-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    बुक करें
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Products */}
        {(activeTab === 'home' || activeTab === 'products') && (
          <div className="space-y-3 pt-2">
            <h2 className="font-bold text-base text-slate-800">इलेक्ट्रिकल सामान (Products)</h2>
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="bg-white p-3 rounded-xl border flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{p.brand}</span>
                    <h3 className="font-bold text-xs text-slate-900">{p.name}</h3>
                    <span className="text-sm font-black text-slate-900">₹{p.price}</span>
                  </div>
                  <button 
                    onClick={() => alert(`${p.name} कार्ट में जोड़ा गया!`)}
                    className="bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    खरीदें
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: APK Info */}
        {activeTab === 'apk' && (
          <div className="bg-white p-6 rounded-2xl border text-center space-y-3 shadow-sm">
            <Download className="w-10 h-10 text-blue-900 mx-auto" />
            <h3 className="font-bold text-base">Electrical Service Hub Android App</h3>
            <p className="text-xs text-slate-500">Official Android Build v1.0.1</p>
            <button 
              onClick={() => alert("APK डाउनलोड हो रहा है...")}
              className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Download APK Now
            </button>
          </div>
        )}
      </main>

      {/* Booking Form Modal */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl relative">
            <button onClick={() => setBookingModal(null)} className="absolute right-4 top-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-sm mb-1">इलेक्ट्रीशियन बुक करें</h3>
            <p className="text-xs text-blue-700 font-bold mb-3">{bookingModal.name}</p>
            <form onSubmit={handleBooking} className="space-y-3 text-xs">
              <input required type="text" placeholder="आपका नाम (Full Name)" className="w-full p-2 border rounded" />
              <input required type="tel" placeholder="मोबाइल नंबर (Phone Number)" className="w-full p-2 border rounded" />
              <input required type="text" placeholder="पता (Full Address)" className="w-full p-2 border rounded" />
              <button type="submit" className="w-full bg-blue-900 text-white font-bold py-2.5 rounded-lg">
                बुकिंग कन्फर्म करें
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white p-5 rounded-2xl text-center space-y-2 max-w-xs shadow-xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm">बुकिंग सफल हुई!</h4>
            <p className="text-xs text-slate-600">इलेक्ट्रीशियन जल्द ही आपसे संपर्क करेगा।</p>
            <button onClick={() => setBookingSuccess(false)} className="w-full bg-blue-900 text-white text-xs font-bold py-2 rounded">
              ठीक है
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-40">
        <button onClick={() => setActiveTab('home')} className={`text-xs flex flex-col items-center ${activeTab === 'home' ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
          <Zap className="w-4 h-4" /> होम
        </button>
        <button onClick={() => setActiveTab('services')} className={`text-xs flex flex-col items-center ${activeTab === 'services' ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
          <Wrench className="w-4 h-4" /> सेवाएं
        </button>
        <button onClick={() => setActiveTab('products')} className={`text-xs flex flex-col items-center ${activeTab === 'products' ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
          <ShoppingBag className="w-4 h-4" /> सामान
        </button>
        <button onClick={() => setActiveTab('apk')} className={`text-xs flex flex-col items-center ${activeTab === 'apk' ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
          <Download className="w-4 h-4" /> ऐप
        </button>
      </nav>
    </div>
  );
}
