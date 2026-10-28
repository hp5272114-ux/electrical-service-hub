import React, { useState } from 'react';
import { Wrench, ShoppingBag, Zap, CheckCircle2, LayoutDashboard, User, LogIn, LogOut, PlusCircle, Trash2, PhoneCall } from 'lucide-react';

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
    { id: 2, name: "Sho
