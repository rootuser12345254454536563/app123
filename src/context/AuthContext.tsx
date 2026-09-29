import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  linkWithPopup,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/config';

export type UserRole = 'user' | 'seller' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface UserProfileDoc {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  provider: 'password' | 'google' | 'facebook' | 'other';
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any;
}

export interface SellerProfileDoc {
  uid: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  photoURL?: string;
  provider: 'password' | 'google' | 'facebook' | 'other';
  role: 'seller';
  status: SellerStatus;
  createdAt: any;
  updatedAt: any;
  approvedAt?: any;
  approvedBy?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfileDoc | null;
  sellerProfile: SellerProfileDoc | null;
  role: UserRole | null;
  isLoading: boolean;
  isSellerApproved: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<UserRole>;
  registerUser: (fullName: string, email: string, phone: string, pass: string) => Promise<void>;
  registerSeller: (fullName: string, businessName: string, email: string, phone: string, address: string, pass: string) => Promise<void>;
  loginWithGoogle: (roleForNewAccount?: 'user' | 'seller', sellerData?: { businessName: string; phone: string; address: string }) => Promise<UserRole>;
  loginWithFacebook: (roleForNewAccount?: 'user' | 'seller', sellerData?: { businessName: string; phone: string; address: string }) => Promise<UserRole>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  linkProvider: (providerType: 'google' | 'facebook') => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserFields: (data: Partial<UserProfileDoc>) => Promise<void>;
  updateSellerFields: (data: Partial<SellerProfileDoc>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin identifier emails
const ADMIN_EMAILS = ['admin@buyjump.com', 'vithusan2553@gmail.com'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileDoc | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfileDoc | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to fetch user and seller documents from Firestore
  const fetchProfiles = async (fbUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      const isAdminEmail = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');

      let currentRole: UserRole = isAdminEmail ? 'admin' : 'user';
      let currentStatus: UserStatus = 'active';

      if (userSnap.exists()) {
        const uData = userSnap.data() as UserProfileDoc;
        currentRole = isAdminEmail ? 'admin' : (uData.role || 'user');
        currentStatus = uData.status || 'active';
        setUserProfile({ ...uData, role: currentRole });

        // Update last login
        updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          emailVerified: fbUser.emailVerified
        }).catch(err => console.warn('Could not update last login timestamp:', err));
      } else {
        // Auto-provision initial profile if missing
        const newProf: UserProfileDoc = {
          uid: fbUser.uid,
          fullName: fbUser.displayName || (isAdminEmail ? 'BuyJump Administrator' : 'BuyJump User'),
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '',
          photoURL: fbUser.photoURL || '',
          provider: (fbUser.providerData[0]?.providerId.includes('google') ? 'google' :
                     fbUser.providerData[0]?.providerId.includes('facebook') ? 'facebook' : 'password'),
          role: currentRole,
          status: currentStatus,
          emailVerified: fbUser.emailVerified,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        };
        await setDoc(userRef, newProf);
        setUserProfile(newProf);
      }

      // Check for seller profile
      if (currentRole === 'seller' || !isAdminEmail) {
        const sellerRef = doc(db, 'sellers', fbUser.uid);
        const sellerSnap = await getDoc(sellerRef);
        if (sellerSnap.exists()) {
          const sData = sellerSnap.data() as SellerProfileDoc;
          setSellerProfile(sData);
          currentRole = 'seller';
        } else {
          setSellerProfile(null);
        }
      }

      setRole(currentRole);
      return currentRole;
    } catch (err) {
      console.error('Error fetching user profiles from Firestore:', err);
      // Fallback role
      if (ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '')) {
        setRole('admin');
        return 'admin';
      }
      setRole('user');
      return 'user';
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      setCurrentUser(fbUser);
      if (fbUser) {
        await fetchProfiles(fbUser);
      } else {
        setUserProfile(null);
        setSellerProfile(null);
        setRole(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await fetchProfiles(auth.currentUser);
    }
  };

  // 1. Email Login
  const loginWithEmail = async (email: string, pass: string): Promise<UserRole> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const userRole = await fetchProfiles(cred.user);
      return userRole;
    } catch (error: any) {
      // If admin account does not exist yet in Firebase Auth, automatically create it
      if (
        (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') &&
        email.trim().toLowerCase() === 'admin@buyjump.com' &&
        pass === 'Vithusan2553&&'
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
          await updateProfile(cred.user, { displayName: 'BuyJump Administrator' });
          const userRef = doc(db, 'users', cred.user.uid);
          await setDoc(userRef, {
            uid: cred.user.uid,
            fullName: 'BuyJump Administrator',
            email: 'admin@buyjump.com',
            phone: '+94 77 123 4567',
            photoURL: '',
            provider: 'password',
            role: 'admin',
            status: 'active',
            emailVerified: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
          });
          const adminRole = await fetchProfiles(cred.user);
          return adminRole;
        } catch (createErr) {
          throw createErr;
        }
      }
      throw error;
    }
  };

  // 2. User Registration
  const registerUser = async (fullName: string, email: string, phone: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await updateProfile(cred.user, { displayName: fullName });

    const userDoc: UserProfileDoc = {
      uid: cred.user.uid,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      photoURL: '',
      provider: 'password',
      role: 'user',
      status: 'active',
      emailVerified: cred.user.emailVerified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, 'users', cred.user.uid), userDoc);
      setUserProfile(userDoc);
      setRole('user');
      // Attempt sending email verification
      sendEmailVerification(cred.user).catch(e => console.log('Verification email sent or skipped:', e));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${cred.user.uid}`);
    }
  };

  // 3. Seller Registration
  const registerSeller = async (
    fullName: string,
    businessName: string,
    email: string,
    phone: string,
    address: string,
    pass: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await updateProfile(cred.user, { displayName: fullName });

    const userDoc: UserProfileDoc = {
      uid: cred.user.uid,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      photoURL: '',
      provider: 'password',
      role: 'seller',
      status: 'pending',
      emailVerified: cred.user.emailVerified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };

    const sellerDoc: SellerProfileDoc = {
      uid: cred.user.uid,
      fullName: fullName.trim(),
      businessName: businessName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      photoURL: '',
      provider: 'password',
      role: 'seller',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, 'users', cred.user.uid), userDoc);
      await setDoc(doc(db, 'sellers', cred.user.uid), sellerDoc);
      setUserProfile(userDoc);
      setSellerProfile(sellerDoc);
      setRole('seller');
      sendEmailVerification(cred.user).catch(e => console.log('Verification email status:', e));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `sellers/${cred.user.uid}`);
    }
  };

  // 4. Google Sign In
  const loginWithGoogle = async (
    roleForNewAccount: 'user' | 'seller' = 'user',
    sellerData?: { businessName: string; phone: string; address: string }
  ): Promise<UserRole> => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    const userRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userRef);

    const isAdmin = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');

    if (!userSnap.exists()) {
      const assignedRole: UserRole = isAdmin ? 'admin' : roleForNewAccount;
      const initialStatus: UserStatus = (assignedRole === 'seller' ? 'pending' : 'active');

      const newDoc: UserProfileDoc = {
        uid: fbUser.uid,
        fullName: fbUser.displayName || 'Google User',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || (sellerData?.phone || ''),
        photoURL: fbUser.photoURL || '',
        provider: 'google',
        role: assignedRole,
        status: initialStatus,
        emailVerified: fbUser.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      await setDoc(userRef, newDoc);

      if (assignedRole === 'seller') {
        const sDoc: SellerProfileDoc = {
          uid: fbUser.uid,
          fullName: fbUser.displayName || 'Seller',
          businessName: sellerData?.businessName || `${fbUser.displayName}'s Store`,
          email: fbUser.email || '',
          phone: sellerData?.phone || '',
          address: sellerData?.address || '',
          photoURL: fbUser.photoURL || '',
          provider: 'google',
          role: 'seller',
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'sellers', fbUser.uid), sDoc);
      }
    }

    return await fetchProfiles(fbUser);
  };

  // 5. Facebook Sign In
  const loginWithFacebook = async (
    roleForNewAccount: 'user' | 'seller' = 'user',
    sellerData?: { businessName: string; phone: string; address: string }
  ): Promise<UserRole> => {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');

    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    const userRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userRef);
    const isAdmin = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');

    if (!userSnap.exists()) {
      const assignedRole: UserRole = isAdmin ? 'admin' : roleForNewAccount;
      const initialStatus: UserStatus = (assignedRole === 'seller' ? 'pending' : 'active');

      const newDoc: UserProfileDoc = {
        uid: fbUser.uid,
        fullName: fbUser.displayName || 'Facebook User',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || (sellerData?.phone || ''),
        photoURL: fbUser.photoURL || '',
        provider: 'facebook',
        role: assignedRole,
        status: initialStatus,
        emailVerified: fbUser.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      await setDoc(userRef, newDoc);

      if (assignedRole === 'seller') {
        const sDoc: SellerProfileDoc = {
          uid: fbUser.uid,
          fullName: fbUser.displayName || 'Seller',
          businessName: sellerData?.businessName || `${fbUser.displayName}'s Store`,
          email: fbUser.email || '',
          phone: sellerData?.phone || '',
          address: sellerData?.address || '',
          photoURL: fbUser.photoURL || '',
          provider: 'facebook',
          role: 'seller',
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'sellers', fbUser.uid), sDoc);
      }
    }

    return await fetchProfiles(fbUser);
  };

  // 6. Forgot Password
  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  // 7. Verification Email
  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  // 8. Account Linking
  const linkProvider = async (providerType: 'google' | 'facebook') => {
    if (!auth.currentUser) return;
    const provider = providerType === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
    await linkWithPopup(auth.currentUser, provider);
    await refreshProfile();
  };

  // 9. Logout
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
    setSellerProfile(null);
    setRole(null);
  };

  // 10. Update user profile fields
  const updateUserFields = async (data: Partial<UserProfileDoc>) => {
    if (!auth.currentUser) return;
    const ref = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp()
    });
    await refreshProfile();
  };

  // 11. Update seller profile fields
  const updateSellerFields = async (data: Partial<SellerProfileDoc>) => {
    if (!auth.currentUser) return;
    const ref = doc(db, 'sellers', auth.currentUser.uid);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp()
    });
    await refreshProfile();
  };

  const isSellerApproved = Boolean(
    role === 'admin' ||
    (role === 'seller' && sellerProfile?.status === 'approved')
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        sellerProfile,
        role,
        isLoading,
        isSellerApproved,
        loginWithEmail,
        registerUser,
        registerSeller,
        loginWithGoogle,
        loginWithFacebook,
        sendPasswordReset,
        sendVerificationEmail,
        linkProvider,
        logout,
        refreshProfile,
        updateUserFields,
        updateSellerFields
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
