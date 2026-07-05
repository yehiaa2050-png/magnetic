import { collection, addDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface ExperimentData {
  id?: string;
  timestamp: string;
  weightKg: number;
  distanceMm: number;
  material?: string;
  shape?: string;
  calculatedForceN: number;
  isEquilibrium: boolean;
  userId?: string;
  createdAt?: any;
}

export const saveExperimentToCloud = async (data: ExperimentData): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    const userId = user ? user.uid : 'anonymous';

    await addDoc(collection(db, 'experiments'), {
      ...data,
      userId,
      createdAt: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error saving experiment:', error);
    throw error;
  }
};

export const getExperimentsHistory = async (): Promise<ExperimentData[]> => {
  try {
    const user = auth.currentUser;
    const userId = user ? user.uid : 'anonymous';
    
    const q = query(
      collection(db, 'experiments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const experiments: ExperimentData[] = [];
    querySnapshot.forEach((doc) => {
      experiments.push({ id: doc.id, ...doc.data() } as ExperimentData);
    });
    return experiments;
  } catch (error) {
    console.error('Error fetching experiments:', error);
    return [];
  }
};
