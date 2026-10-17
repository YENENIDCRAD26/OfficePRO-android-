import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

const app = initializeApp(config);
export const db = getFirestore(app);

export async function saveDocumentToFirestore(docId: string, title: string, contentHtml: string, extraData?: Record<string, any>) {
  try {
    const docRef = doc(db, 'documents', docId);
    await setDoc(docRef, {
      id: docId,
      title,
      contentHtml,
      updatedAt: new Date().toISOString(),
      ...(extraData || {})
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Firestore sync error:', error);
    return false;
  }
}

export async function loadDocumentFromFirestore(docId: string) {
  try {
    const docRef = doc(db, 'documents', docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error('Firestore load error:', error);
    return null;
  }
}

export async function deleteDocumentFromFirestore(docId: string) {
  try {
    const docRef = doc(db, 'documents', docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Firestore delete error:', error);
    return false;
  }
}

export async function renameDocumentInFirestore(docId: string, newTitle: string) {
  try {
    const docRef = doc(db, 'documents', docId);
    await updateDoc(docRef, {
      title: newTitle,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Firestore rename error:', error);
    return false;
  }
}
