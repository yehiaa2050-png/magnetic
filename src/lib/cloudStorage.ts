import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Setup Cloudflare R2 compatible S3 Client
// In a real app, these credentials would be securely managed, not hardcoded.
const R2_ACCOUNT_ID = 'your-cloudflare-account-id';
const ACCESS_KEY_ID = 'your-access-key-id';
const SECRET_ACCESS_KEY = 'your-secret-access-key';
const BUCKET_NAME = 'magnetic-experiments';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export interface ExperimentData {
  timestamp: string;
  weightKg: number;
  distanceMm: number;
  calculatedForceN: number;
  isEquilibrium: boolean;
}

export const saveExperimentToCloud = async (data: ExperimentData): Promise<boolean> => {
  try {
    const fileName = `experiment_${Date.now()}.json`;
    const fileContent = JSON.stringify(data, null, 2);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ContentType: 'application/json',
    });

    // In this AI Studio demo, we will mock the actual network call to AWS S3 
    // unless real credentials were provided above, to prevent crashing.
    console.log('[Cloudflare R2 Mock] Uploading file:', fileName, 'Data:', fileContent);
    // await s3Client.send(command); 
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  } catch (error) {
    console.error('Error saving experiment:', error);
    throw error;
  }
};
