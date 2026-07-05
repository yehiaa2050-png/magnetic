import * as tf from '@tensorflow/tfjs';

export const G = 9.81;

export const MAGNETIC_MATERIALS: Record<string, { name: string, constant: number }> = {
  n52: { name: 'نيوديميوم N52', constant: 500000 },
  n42: { name: 'نيوديميوم N42', constant: 400000 },
  alnico: { name: 'النيكو (Alnico)', constant: 250000 },
  ferrite: { name: 'فيريت سيراميك', constant: 100000 }
};

export const calculateRequiredForce = (massKg: number) => {
  return massKg * G;
};

export const calculateMagneticForce = (distanceMm: number, materialStr: string = 'n52') => {
  if (distanceMm <= 0) return Infinity; // Prevent div by 0
  const C = MAGNETIC_MATERIALS[materialStr]?.constant || 500000;
  return C / (distanceMm * distanceMm);
};

export const calculateEquilibriumDistance = (massKg: number, materialStr: string = 'n52') => {
  if (massKg <= 0) return 0;
  const targetForce = calculateRequiredForce(massKg);
  const C = MAGNETIC_MATERIALS[materialStr]?.constant || 500000;
  return Math.sqrt(C / targetForce);
};

// --- Predictive AI (TensorFlow.js) ---
let tfModel: tf.Sequential | null = null;

export const initPredictiveModel = async () => {
  // Create a minimal synthetic model that predicts distance based on mass
  // In a real scenario, this would be loaded from a pre-trained URL.
  tfModel = tf.sequential();
  tfModel.add(tf.layers.dense({ units: 16, inputShape: [1], activation: 'relu' }));
  tfModel.add(tf.layers.dense({ units: 1 }));
  tfModel.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
  
  // Train it with some dummy physics data to simulate an "AI" predictive model
  const xs = tf.tensor2d([10, 50, 100, 150, 200], [5, 1]);
  const ys = tf.tensor2d([
    calculateEquilibriumDistance(10, 'n52'),
    calculateEquilibriumDistance(50, 'n52'),
    calculateEquilibriumDistance(100, 'n52'),
    calculateEquilibriumDistance(150, 'n52'),
    calculateEquilibriumDistance(200, 'n52')
  ], [5, 1]);
  
  await tfModel.fit(xs, ys, { epochs: 20 });
  console.log("TF.js Model Initialized");
};

export const predictDistance = async (massKg: number): Promise<number | null> => {
  if (!tfModel) return null;
  const input = tf.tensor2d([massKg], [1, 1]);
  const prediction = tfModel.predict(input) as tf.Tensor;
  const result = await prediction.data();
  return result[0];
};

// --- Generative AI ---

export const getOptimalDesignSuggestion = async (massKg: number, distanceMm: number, material: string, shape: string): Promise<string> => {
  try {
    const response = await fetch('/api/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ massKg, distanceMm, material, shape })
    });
    
    if (!response.ok) {
       const err = await response.json();
       throw new Error(err.error || 'Failed to fetch');
    }

    const data = await response.json();
    return data.suggestion || 'عذراً، لم أتمكن من توليد اقتراح حالياً.';
  } catch (error: any) {
    console.error('Error generating suggestion:', error);
    if (error.message.includes('GROQ_API_KEY') || error.message.includes('INVALID_GROQ_KEY')) {
        return 'مفتاح Groq API المدخل غير صالح أو غير موجود. يرجى التأكد من نسخه ولصقه بشكل صحيح (بدون مسافات إضافية) في قائمة الأسرار (Secrets) تحت اسم GROQ_API_KEY.';
    }
    return 'عذراً، لم أتمكن من إكمال المعالجة. تفاصيل الخطأ: ' + error.message;
  }
};
