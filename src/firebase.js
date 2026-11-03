import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, 
  getDocs, addDoc, updateDoc, deleteDoc, onSnapshot 
} from 'firebase/firestore';

export const ADMIN_PHONE = "6367626276";
export const ADMIN_PIN = "2026";

export const firebaseConfig = {
  apiKey: "AIzaSyDzD7cmC7h_uSOB22uNBvPlaO7U1w6Y1_k",
  authDomain: "electrical-service-hub-742d9.firebaseapp.com",
  projectId: "electrical-service-hub-742d9",
  storageBucket: "electrical-service-hub-742d9.firebasestorage.app",
  messagingSenderId: "311450205670",
  appId: "1:311450205670:web:33f31485bdbd55ba272a27"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Image Compression Utility for Before/After Photos & Product Uploads
export const compressImage = (file, callback) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 500;
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
