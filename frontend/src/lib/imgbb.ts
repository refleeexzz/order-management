/**
 * Upload de imagem para o imgbb (o backend só armazena a URL resultante).
 * Se VITE_IMGBB_API_KEY não estiver configurada, o formulário de produto
 * permite colar a URL diretamente (ver ProductFormModal).
 */
export async function uploadImage(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Upload de imagem não configurado. Defina VITE_IMGBB_API_KEY ou cole a URL da imagem.",
    );
  }

  const form = new FormData();
  form.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error("Falha ao enviar a imagem. Tente novamente.");
  }

  const data = (await response.json()) as {
    success: boolean;
    data?: { url?: string; display_url?: string };
  };
  const url = data.data?.display_url ?? data.data?.url;
  if (!data.success || !url) {
    throw new Error("O serviço de imagens não retornou uma URL válida.");
  }
  return url;
}

export const isImageUploadConfigured = Boolean(import.meta.env.VITE_IMGBB_API_KEY);
