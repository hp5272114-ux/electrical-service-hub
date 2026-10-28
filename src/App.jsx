import React, { useState } from 'react';
import { 
  Wrench, ShoppingBag, ShieldCheck, PhoneCall, Download, 
  X, Zap, CheckCircle2, LayoutDashboard, MessageCircle, 
  AlertCircle, Search, ChevronRight
} from 'lucide-react';

const i18n = {
  en: {
    brand: "Electrical Service Hub",
    tagline: "Certified Electricians & Genuine Electrical Products",
    nav_home: "Home",
    nav_services: "Book Service",
    nav_products: "Shop Products",
    nav_apk: "Download App",
    visiting_fee_notice: "Standard Visiting Inspection Charge: ₹149 (Adjusted in final repair bill)",
    btn_book_now: "Book Electrician",
    btn_buy_now: "Add to Cart",
    verified_tech: "Government Licensed & Background Verified",
    switch_lang: "हिन्दी",
    admin_mode: "Admin Dashboard",
    tech_mode: "Electrician Portal",
    cod_avail: "Cash On Delivery & UPI Available across India"
  },
  hi: {
    brand: "विद्युत सेवा हब",
    tagline: "प्रमाणित इलेक्ट्रीशियन और 100% असली इलेक्ट्रिकल उत्पाद",
    nav_home: "होम",
    nav_services: "सर्विस बुक करें",
    nav_products: "सामान खरीदें",
    nav_apk: "ऐप डाउनलोड करें",
    visiting_fee_notice: "विजिटिंग व जांच शुल्क: ₹149 (रिपेयर कराने पर बिल में समायोजित)",
    btn_book_now: "इलेक्ट्रीशियन बुक करें",
    btn_buy_now: "कार्ट में जोड़ें",
    verified_tech: "सरकारी लाइसेंस प्राप्त व सत्यापित इलेक्ट्रीशियन",
    switch_lang: "English",
    admin_mode: "एडमिन पैनल",
    tech_mode: "इलेक्ट्रीशियन पोर्टल",
    cod_avail: "पूरे भारत में कैश ऑन डिलीवरी (COD) और यूपीआई उपलब्ध"
  }
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('home');
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingModal, setBookingModal] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  
  const t = i18n[lang];

  const services = [
    {
      id: "srv-1",
      name_en: "Ceiling Fan Installation & Bearing Fix",
      name_hi: "सीलिंग फैन इंस्टालेशन और रिपेयर",
      base_price: 199,
      visiting_charge: 99,
      category: "Fan & Lighting",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "srv-2",
      name_en: "Full House Short Circuit Detection & Rewiring",
      name_hi: "शॉर्ट सर्किट फॉल्ट चेकिंग और वायरिंग",
      base_price: 399,
      visiting_charge: 149,
      category: "Wiring & Safety",
      image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "srv-3",
      name_en: "Inverter and Dual Battery Setup",
      name_hi: "इनवर्टर और डबल बैटरी इंस्टालेशन",
      base_price: 499,
      visiting_charge: 149,
      category: "Power Backup",
      image: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "srv-4",
      name_en: "Distribution Board & MCB Replacement",
      name_hi: "एमसीबी बॉक्स व डीपी स्विच इंस्टॉलेशन",
      base_price: 299,
      visiting_charge: 99,
      category: "Switchgear",
      image: "https://images.unsplash.com/photo-1509744645300-a2098b11871a?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const products = [
    {
      id: "prod-1",
      name_en: "Polycab 2.5 Sq mm Flame Retardant Wire (90m, Red)",
      name_hi: "पॉलीकैब 2.5 वर्ग मिमी एफआर वायर (90 मीटर)",
      mrp: 2450,
      price: 1899,
      brand: "Polycab",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-2",
      name_en: "Havells 32 Amp Double Pole C-Curve MCB",
      name_hi: "हैवेल्स 32 एम्पियर डबल पोल एमसीबी",
      mrp: 680,
      price: 520,
      brand: "Havells",
      image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "prod-3",
      name_en: "Anchor Roma 6A Modular Switch Set (Pack of 10)",
      name_hi: "एंकर रोमा 6A मॉड्युलर स्विच (10 का पैक)",
      mrp: 480,
      price: 310,
      brand: "Anchor",
      image: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`${product.name_en} कार्ट में जोड़ दिया गया है!`);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bookingRef = 'ESH-' + Math.floor(100000 + Math.random() * 900000);
    setBookingSuccess({
      ref: bookingRef,
      name: formData.get('fullName'),
      phone: formData.get('phone'),
      date: formData.get('scheduledDate'),
      slot: formData.get('timeSlot')
    });
    setBookingModal(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-6 font-sans">
      
      {/* 1. TOP HEADER */}
      <div className="bg-[#0B1E3D] text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            {t.cod_avail}
          </span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="text-yellow-400 font-bold hover:underline"
            >
              {t.switch_lang}
            </button>
            <span className="hidden md:inline">|</span>
            <button onClick={() => setActiveTab('admin')} className="hover:text-white flex items-center gap-1">
              <LayoutDashboard className="w-3 h-3" /> {t.admin_mode}
            </button>
            <button onClick={() => setActiveTab('technician')} className="hover:text-white flex items-center gap-1">
              <Wrench className="w-3 h-3" /> {t.tech_mode}
            </button>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-[#1E3A8A] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-yellow-400 text-[#0B1E3D] p-2 rounded-lg font-black flex items-center justify-center">
              <Zap className="w-6 h-6 fill-[#0B1E3D]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">
                {t.brand}
              </span>
              <span className="text-[10px] text-amber-300 font-medium tracking-wide uppercase">
                Verified Electrical Hub
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-medium text-sm">
            <button onClick={() => setActiveTab('home')} className={`${activeTab === 'home' ? 'text-yellow-400 font-bold' : 'hover:text-slate-200'}`}>{t.nav_home}</button>
            <button onClick={() => setActiveTab('services')} className={`${activeTab === 'services' ? 'text-yellow-400 font-bold' : 'hover:text-slate-200'}`}>{t.nav_services}</button>
            <button onClick={() => setActiveTab('products')} className={`${activeTab === 'products' ? 'text-yellow-400 font-bold' : 'hover:text-slate-200'}`}>{t.nav_products}</button>
            <button onClick={() => setActiveTab('apk')} className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-3 py-1.5 rounded-full font-bold">
              <Download className="w-4 h-4" /> {t.nav_apk}
            </button>
          </nav>

          <a 
            href="https://wa.me/919876543210?text=Hello%20Electrical%20Service%20Hub"
            target="_blank" 
            rel="noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 shadow"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden md:inline">WhatsApp Help</span>
          </a>
        </div>
      </header>

      {/* 2. BODY CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#0B1E3D] text-white rounded-2xl p-6 md:p-12 relative overflow-hidden shadow-xl">
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                  <ShieldCheck className="w-4 h-4 text-yellow-400" /> {t.verified_tech}
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  {lang === 'en' ? 'Quick Doorstep Electrical Repair' : 'घर और दुकान की वायरिंग में कोई खराबी?'}
                </h1>
                <p className="text-slate-300 text-sm md:text-base">
                  {t.tagline}. Fast service arrival in 45 minutes across major cities.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button 
                    onClick={() => setActiveTab('services')}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                  >
                    <Wrench className="w-5 h-5" /> {t.btn_book_now}
                  </button
