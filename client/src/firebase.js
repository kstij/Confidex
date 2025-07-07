import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAjZblqcA4ocqo7UvmPFf55Bl-QP8_0qdg",
  authDomain: "techaways-84296.firebaseapp.com",
  projectId: "techaways-84296",
  appId: "1:932106590182:web:52ca9a5ba7d288f8742827"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize and export Firebase Storage
export const storage = getStorage(app);

export default app; 