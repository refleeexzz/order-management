import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadToImgBB, isValidImageFile } from '../../lib/imgbb';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!isValidImageFile(file)) {
      toast.error('Arquivo inválido. Use JPG, PNG, GIF ou WebP até 32MB.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToImgBB(file);
      onChange(url);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleChange}
        className="hidden"
        id="image-upload"
      />

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover rounded-xl border border-surface-200"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-white rounded-lg hover:bg-surface-100 transition-colors"
              title="Trocar imagem"
            >
              <Upload className="h-5 w-5 text-surface-700" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
              title="Remover imagem"
            >
              <X className="h-5 w-5 text-red-600" />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center gap-3 p-6 h-40
            border-2 border-dashed rounded-xl cursor-pointer
            transition-all duration-200
            ${dragActive 
              ? 'border-brand-500 bg-brand-50' 
              : 'border-surface-300 hover:border-brand-400 hover:bg-surface-50'
            }
            ${isUploading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
              <span className="text-sm text-surface-600">Enviando...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-surface-400" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-brand-600">Clique para enviar</span>
                <span className="text-sm text-surface-500"> ou arraste aqui</span>
              </div>
              <span className="text-xs text-surface-400">JPG, PNG, GIF ou WebP até 32MB</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
