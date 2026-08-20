import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  increment,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App (Singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore using the specified firestoreDatabaseId if present
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface SiteStatistics {
  totalVisits: number;
  totalSignatures: number;
  updatedAt?: any;
}

export interface FirestoreGuestbookEntry {
  id?: string;
  name: string;
  message: string;
  createdAt: any;
  status: 'approved' | 'pending' | 'hidden';
}

const STATS_DOC_REF = doc(db, 'statistics', 'site');
const GUESTBOOK_COLLECTION_REF = collection(db, 'guestbookEntries');

/**
 * Registra uma visita ao site respeitando a regra:
 * - 1 visita por sessão do navegador (controlado via sessionStorage)
 * - Incremento atômico seguro no Firestore via backend seguro ou transação direta
 */
export async function recordSiteVisit(): Promise<void> {
  if (typeof window === 'undefined') return;

  const SESSION_KEY = 'mateus_visit_logged_session';
  const hasVisitedThisSession = sessionStorage.getItem(SESSION_KEY);

  if (hasVisitedThisSession) {
    return; // Já contabilizado nesta sessão
  }

  // Marcar imediatamente para evitar concorrência no mesmo navegador
  sessionStorage.setItem(SESSION_KEY, 'true');

  try {
    // Tentativa 1: Endpoint de backend seguro (/api/analytics/visit)
    const res = await fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      // Fallback direto ao Firestore com setDoc merge e increment(1)
      await setDoc(
        STATS_DOC_REF,
        {
          totalVisits: increment(1),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('[Firebase] Não foi possível registrar visita via API, tentando Firestore direto:', err);
    try {
      await setDoc(
        STATS_DOC_REF,
        {
          totalVisits: increment(1),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (firestoreErr) {
      console.warn('[Firebase] Falha ao registrar visita no Firestore:', firestoreErr);
    }
  }
}

/**
 * Escuta estatísticas em tempo real (totalVisits, totalSignatures)
 */
export function subscribeToSiteStatistics(
  callback: (stats: SiteStatistics) => void
): () => void {
  return onSnapshot(
    STATS_DOC_REF,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          totalVisits: Number(data.totalVisits) || 0,
          totalSignatures: Number(data.totalSignatures) || 0,
          updatedAt: data.updatedAt
        });
      } else {
        // Criar documento inicial com contagens zero se não existir
        setDoc(
          STATS_DOC_REF,
          {
            totalVisits: 1,
            totalSignatures: 0,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        ).catch(() => {});
        callback({ totalVisits: 1, totalSignatures: 0 });
      }
    },
    (error) => {
      console.warn('[Firebase] Erro ao escutar estatísticas:', error);
    }
  );
}

/**
 * Obtém estatísticas uma única vez
 */
export async function getSiteStatistics(): Promise<SiteStatistics> {
  try {
    const snap = await getDoc(STATS_DOC_REF);
    if (snap.exists()) {
      const data = snap.data();
      return {
        totalVisits: Number(data.totalVisits) || 0,
        totalSignatures: Number(data.totalSignatures) || 0,
        updatedAt: data.updatedAt
      };
    }
  } catch (err) {
    console.warn('[Firebase] Erro ao obter estatísticas:', err);
  }
  return { totalVisits: 0, totalSignatures: 0 };
}

/**
 * Escuta mensagens aprovadas do Guestbook em tempo real
 */
export function subscribeToGuestbookEntries(
  maxEntries = 50,
  callback: (entries: FirestoreGuestbookEntry[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    GUESTBOOK_COLLECTION_REF,
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(maxEntries)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FirestoreGuestbookEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name,
          message: data.message,
          createdAt: data.createdAt,
          status: data.status
        });
      });
      callback(items);
    },
    (err) => {
      console.warn('[Firebase] Erro ao escutar assinaturas:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Envia uma nova assinatura com validação e incremento atômico de totalSignatures
 */
export async function submitGuestbookSignature(
  name: string,
  message: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const trimmedName = name.trim().slice(0, 40);
  const trimmedMessage = message.trim().slice(0, 200);

  if (!trimmedName) {
    return { success: false, error: 'Por favor, informe seu nome ou apelido.' };
  }

  if (!trimmedMessage) {
    return { success: false, error: 'Por favor, digite sua mensagem.' };
  }

  try {
    // 1. Criar novo documento na coleção guestbookEntries
    const docRef = await addDoc(GUESTBOOK_COLLECTION_REF, {
      name: trimmedName,
      message: trimmedMessage,
      createdAt: serverTimestamp(),
      status: 'approved'
    });

    // 2. Incrementar atomicamente o contador de assinaturas
    await setDoc(
      STATS_DOC_REF,
      {
        totalSignatures: increment(1),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error('[Firebase] Erro ao salvar assinatura no Firestore:', err);
    return {
      success: false,
      error: err?.message || 'Falha ao salvar assinatura no banco de dados.'
    };
  }
}
