import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) => {
  if (error.message?.includes('Missing or insufficient permissions')) {
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: auth.currentUser?.uid || 'none',
        email: auth.currentUser?.email || 'none',
        emailVerified: auth.currentUser?.emailVerified || false,
        isAnonymous: auth.currentUser?.isAnonymous || false,
        providerInfo: auth.currentUser?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};

// Users
export const getUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    handleFirestoreError(error, 'get', `users/${uid}`);
  }
};

export const createUserProfile = async (uid: string, data: any) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      isVerified: false,
      ...data,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, 'create', `users/${uid}`);
  }
};

export const getAllUsers = async () => {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, 'list', 'users');
  }
};

export const updateUserVerification = async (uid: string, status: boolean) => {
  try {
    await updateDoc(doc(db, 'users', uid), { isVerified: status });
  } catch (error) {
    handleFirestoreError(error, 'update', `users/${uid}`);
  }
};

// Items
export const getItems = async () => {
  try {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, 'list', 'items');
  }
};

export const addItem = async (data: any) => {
  try {
    return await addDoc(collection(db, 'items'), {
      ...data,
      status: 'available',
      avgRating: 0,
      totalRatings: 0,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, 'create', 'items');
  }
};

export const updateItem = async (id: string, data: any) => {
  try {
    await updateDoc(doc(db, 'items', id), data);
  } catch (error) {
    handleFirestoreError(error, 'update', `items/${id}`);
  }
};

export const deleteItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'items', id));
  } catch (error) {
    handleFirestoreError(error, 'delete', `items/${id}`);
  }
};

// Requests
export const createRequest = async (data: any) => {
  try {
    return await addDoc(collection(db, 'requests'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, 'create', 'requests');
  }
};

export const getBorrowerRequests = async (borrowerId: string) => {
  try {
    const q = query(collection(db, 'requests'), where('borrowerId', '==', borrowerId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, 'list', 'requests');
  }
};

export const getAllRequests = async () => {
  try {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, 'list', 'requests');
  }
};

export const updateRequestStatus = async (requestId: string, status: string, itemId: string) => {
  try {
    const updateData: any = { status };
    if (status === 'completed') {
      updateData.returnedAt = serverTimestamp();
    }
    
    await updateDoc(doc(db, 'requests', requestId), updateData);
    
    if (status === 'accepted') {
      await updateDoc(doc(db, 'items', itemId), { status: 'rented' });
    } else if (status === 'completed') {
      await updateDoc(doc(db, 'items', itemId), { status: 'available' });
    }
  } catch (error) {
    handleFirestoreError(error, 'update', `requests/${requestId}`);
  }
};

export const returnItem = async (requestId: string) => {
  try {
    await updateDoc(doc(db, 'requests', requestId), { status: 'returning' });
  } catch (error) {
    handleFirestoreError(error, 'update', `requests/${requestId}`);
  }
};

// Settings
export const getAdminSettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'admin_config');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    handleFirestoreError(error, 'get', 'settings/admin_config');
  }
};

export const updateAdminSettings = async (data: any) => {
  try {
    await setDoc(doc(db, 'settings', 'admin_config'), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, 'write', 'settings/admin_config');
  }
};
