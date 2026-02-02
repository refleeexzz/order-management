// ImgBB API service for image uploads
// Get your API key at: https://api.imgbb.com/

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '';

export interface ImgBBUploadResponse {
  success: boolean;
  data: {
    id: string;
    url: string;
    display_url: string;
    delete_url: string;
  };
  status: number;
}

export async function uploadToImgBB(file: File): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error('IMGBB_API_KEY não configurado. Adicione VITE_IMGBB_API_KEY no .env');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Erro ao fazer upload da imagem');
  }

  const result: ImgBBUploadResponse = await response.json();
  
  if (!result.success) {
    throw new Error('Falha no upload da imagem');
  }

  return result.data.display_url;
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 32 * 1024 * 1024; // 32MB (ImgBB limit)
  
  return validTypes.includes(file.type) && file.size <= maxSize;
}
