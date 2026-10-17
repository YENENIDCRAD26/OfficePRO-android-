import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Check, Image as ImageIcon, RotateCw, Move, Sliders, Frame } from 'lucide-react';

interface ImageInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImageHtml: (html: string) => void;
}

export const ImageInsertModal: React.FC<ImageInsertModalProps> = ({
  isOpen,
  onClose,
  onInsertImageHtml
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageWidthCm, setImageWidthCm] = useState<number>(6.0); // Default 6cm (from 1cm up to 25cm)
  const [alignment, setAlignment] = useState<'right' | 'center' | 'left'>('center');
  const [wrapMode, setWrapMode] = useState<'inline' | 'float-right' | 'float-left' | 'in-front' | 'behind'>('inline');
  const [rotation, setRotation] = useState<number>(0);
  const [frameStyle, setFrameStyle] = useState<string>('none');
  const [imageEffect, setImageEffect] = useState<string>('none');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsert = () => {
    if (!imageSrc) return;

    let style = `width: ${imageWidthCm}cm; max-width: 100%; height: auto; cursor: pointer; transition: all 0.2s;`;
    
    if (rotation !== 0) {
      style += ` transform: rotate(${rotation}deg);`;
    }

    if (wrapMode === 'float-right') {
      style += ` float: right; margin: 0 0 12px 16px; display: inline-block;`;
    } else if (wrapMode === 'float-left') {
      style += ` float: left; margin: 0 16px 12px 0; display: inline-block;`;
    } else if (wrapMode === 'in-front') {
      style += ` position: absolute; z-index: 20; box-shadow: 0 15px 30px rgba(0,0,0,0.25);`;
    } else if (wrapMode === 'behind') {
      style += ` position: absolute; z-index: -1; opacity: 0.65;`;
    } else {
      style += ` display: block; margin: ${alignment === 'center' ? '8px auto' : alignment === 'right' ? '8px 0 8px auto' : '8px auto 8px 0'};`;
    }

    // Frame styling
    if (frameStyle === 'classic') {
      style += ` border: 3px solid #1e3a8a; padding: 4px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);`;
    } else if (frameStyle === 'gold') {
      style += ` border: 4px solid #b45309; outline: 2px solid #fde047; padding: 4px; background: white; box-shadow: 0 6px 15px rgba(180,83,9,0.2);`;
    } else if (frameStyle === 'rounded') {
      style += ` border-radius: 12px; border: 2px solid #cbd5e1; box-shadow: 0 8px 20px rgba(0,0,0,0.15);`;
    } else if (frameStyle === 'shadow') {
      style += ` box-shadow: 0 12px 25px -5px rgba(0,0,0,0.3); border-radius: 4px;`;
    }

    // Filters / Effects
    if (imageEffect === 'grayscale') {
      style += ` filter: grayscale(100%);`;
    } else if (imageEffect === 'sepia') {
      style += ` filter: sepia(80%);`;
    } else if (imageEffect === 'brightness') {
      style += ` filter: brightness(115%);`;
    } else if (imageEffect === 'contrast') {
      style += ` filter: contrast(125%);`;
    }

    const html = `<div class="word-image-wrapper" contenteditable="false" style="text-align: ${alignment}; position: relative; margin: 10px 0;"><img src="${imageSrc}" style="${style}" alt="إدراج مستند" /></div><p><br></p>`;
    
    onInsertImageHtml(html);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[200] flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">إدراج وتنسيق صورة احترافية (Word Pro)</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">

          {/* 1. Source Selection */}
          {!imageSrc ? (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-4 bg-slate-50">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">اختر مصدر الصورة للإدراج في المستند:</h4>
                <p className="text-slate-500 text-[11px]">يمكنك التقاط صورة بالكاميرا مباشرة أو اختيارها من ملفات جهازك</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>التقاط بالكاميرا 📷</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>اختيار من الجهاز 📁</span>
                </button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview Box */}
              <div className="border border-slate-300 rounded-xl p-3 bg-slate-100 flex flex-col items-center justify-center relative min-h-[180px]">
                <button
                  onClick={() => setImageSrc('')}
                  className="absolute top-2 left-2 bg-rose-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow hover:bg-rose-700 transition"
                >
                  تغيير الصورة ✕
                </button>
                <img
                  src={imageSrc}
                  alt="Preview"
                  style={{
                    width: `${imageWidthCm}cm`,
                    maxHeight: '180px',
                    objectFit: 'contain',
                    transform: `rotate(${rotation}deg)`,
                    transition: 'all 0.2s',
                  }}
                  className="rounded shadow-md bg-white p-1"
                />
              </div>

              {/* 2. Size Slider (from 1.0 cm to 25.0 cm) */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>حجم عرض الصورة بالسنتيمتر (Width):</span>
                  <span className="text-blue-700 font-mono text-sm">{imageWidthCm} cm</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="25.0"
                  step="0.5"
                  value={imageWidthCm}
                  onChange={(e) => setImageWidthCm(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1.0 سم (صغير جداً)</span>
                  <span>10 سم (متوسط)</span>
                  <span>25.0 سم (ملء العرض)</span>
                </div>
              </div>

              {/* 3. Positioning & Wrap */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">وضع التفاف النص (Text Wrap):</label>
                  <select
                    value={wrapMode}
                    onChange={(e) => setWrapMode(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="inline">مضمن مع السطر (Inline)</option>
                    <option value="float-right">التفاف يمين النص (Float Right)</option>
                    <option value="float-left">التفاف يسار النص (Float Left)</option>
                    <option value="in-front">وضع أمام النص (In Front of Text)</option>
                    <option value="behind">وضع خلف النص (Behind Text)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">محاذاة الصورة (Alignment):</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg">
                    {(['right', 'center', 'left'] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setAlignment(pos)}
                        className={`flex-1 py-1 rounded font-bold transition text-center ${
                          alignment === pos ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {pos === 'right' ? 'يمين' : pos === 'center' ? 'وسط' : 'يسار'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Rotation & Effects */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">تدوير الصورة (Rotation):</label>
                  <div className="flex items-center gap-1">
                    {[0, 90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setRotation(deg)}
                        className={`flex-1 py-1 rounded font-bold border transition text-[10px] ${
                          rotation === deg ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">إطار الصورة (Frame):</label>
                  <select
                    value={frameStyle}
                    onChange={(e) => setFrameStyle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="none">بدون إطار</option>
                    <option value="classic">إطار كلاسيكي أزرق</option>
                    <option value="gold">إطار ذهبي فاخر 👑</option>
                    <option value="rounded">حواف دائرية أنيقة</option>
                    <option value="shadow">إطار مع ظل بارز 3D</option>
                  </select>
                </div>
              </div>

              {/* 5. Image Filters / Effects */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">تأثيرات لونية (Filters):</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'none', label: 'طبيعي' },
                    { id: 'grayscale', label: 'أسود وأبيض' },
                    { id: 'sepia', label: 'بني دافئ' },
                    { id: 'brightness', label: 'إضاءة +' },
                    { id: 'contrast', label: 'تباين عالي' },
                  ].map((eff) => (
                    <button
                      key={eff.id}
                      onClick={() => setImageEffect(eff.id)}
                      className={`py-1.5 rounded-lg border text-center font-bold text-[10px] transition ${
                        imageEffect === eff.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {eff.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-100 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 font-bold transition text-xs"
          >
            إلغاء
          </button>
          {imageSrc && (
            <button
              onClick={handleInsert}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition text-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>إدراج الصورة في المستند</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
