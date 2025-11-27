import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../firebase.config';

const storage = getStorage(app);

/**
 * Comprime uma imagem antes do upload
 */
const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionar mantendo proporção
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Erro ao comprimir imagem'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * Faz upload de imagem para o Firebase Storage com compressão
 */
export const uploadEventImage = async (file: File, eventId: string) => {
  try {
    // Comprimir imagem antes do upload
    const compressedBlob = await compressImage(file);
    
    // Criar referência única
    const storageRef = ref(storage, `events/${eventId}/${Date.now()}_${file.name}`);
    
    // Upload
    const snapshot = await uploadBytes(storageRef, compressedBlob);
    
    // Obter URL pública
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return { success: false, error: 'Erro ao fazer upload da imagem' };
  }
};

/**
 * Deleta uma imagem do Storage
 */
export const deleteEventImage = async (imageUrl: string) => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return { success: false, error: 'Erro ao deletar imagem' };
  }
};
