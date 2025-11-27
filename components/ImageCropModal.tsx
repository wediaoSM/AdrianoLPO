import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropModalProps {
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onClose: () => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageUrl, onCropComplete, onClose }) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 60,
    x: 10,
    y: 20
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const getCroppedImage = async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.imageSmoothingQuality = 'high';

    // Aplicar rotação se necessário
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleSave = async () => {
    const croppedBlob = await getCroppedImage();
    if (croppedBlob) {
      onCropComplete(croppedBlob);
      onClose();
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-luxury-900 w-full max-w-4xl rounded-3xl border border-gold-900/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gold-900/20 bg-gradient-to-r from-luxury-950 to-luxury-900">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-white font-serif text-xl">Recortar Imagem</h2>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Arraste para selecionar a área desejada</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2.5 rounded-xl hover:bg-white/10" aria-label="Fechar">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Controles */}
        <div className="p-4 border-b border-luxury-600/20 bg-luxury-950 flex gap-3 items-center justify-center flex-wrap">
          <button
            onClick={handleRotate}
            className="flex items-center gap-2 px-4 py-2 bg-luxury-800 hover:bg-luxury-700 text-gray-300 rounded-xl transition-all text-sm"
          >
            <RotateCw size={16} />
            Girar 90°
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 bg-luxury-800 hover:bg-luxury-700 text-gray-300 rounded-xl transition-all"
              disabled={zoom <= 0.5}
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs text-gray-400 min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-2 bg-luxury-800 hover:bg-luxury-700 text-gray-300 rounded-xl transition-all"
              disabled={zoom >= 3}
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Área de Crop */}
        <div className="flex-grow overflow-auto p-6 bg-luxury-950 flex items-center justify-center">
          <div style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transformOrigin: 'center', transition: 'transform 0.3s ease' }}>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={undefined}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop"
                className="max-w-full max-h-[60vh] object-contain"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const defaultCrop: Crop = {
                    unit: '%',
                    width: 80,
                    height: 60,
                    x: 10,
                    y: 20
                  };
                  setCrop(defaultCrop);
                }}
              />
            </ReactCrop>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gold-900/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-4 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-4 bg-gold-600 hover:bg-gold-500 text-white rounded-xl text-sm font-bold uppercase tracking-wide shadow-xl flex items-center gap-2 transition-all hover:shadow-gold-600/50"
          >
            <Check size={18} />
            Confirmar Recorte
          </button>
        </div>
      </div>
    </div>
  );
};
