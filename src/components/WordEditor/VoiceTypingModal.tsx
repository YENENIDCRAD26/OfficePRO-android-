import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Sparkles, Check, Volume2, Trash2 } from 'lucide-react';

interface VoiceTypingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText: (text: string) => void;
}

export const VoiceTypingModal: React.FC<VoiceTypingModalProps> = ({
  isOpen,
  onClose,
  onInsertText,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ar-SA');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
    }
  }, [isOpen]);

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('متصفحك لا يدعم ميزة التعرف على الصوت (Speech Recognition). يرجى استخدام متصفح كروم (Chrome) أو أندرويد الحديث.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscript((prev) => (prev ? prev + ' ' + final.trim() : final.trim()));
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('تم رفض إذن الميكروفون. يرجى السماح للمايكروفون بالعمل من إعدادات المتصفح أو النظام.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('لم يتم رصد أي صوت. يرجى التحدث بوضوح.');
        } else {
          setErrorMessage(`خطأ في التعرف على الصوت: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      setErrorMessage('تعذر بدء الاستماع الصوتي: ' + (e?.message || 'خطأ غير معروف'));
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const handleInsertAndClose = () => {
    const fullText = (transcript + ' ' + interimTranscript).trim();
    if (fullText) {
      onInsertText(fullText);
    }
    setTranscript('');
    setInterimTranscript('');
    onClose();
  };

  const handleClear = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 z-[250] animate-in fade-in select-none font-sans" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${isListening ? 'bg-rose-600 animate-pulse' : 'bg-blue-600'}`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">
                الإملاء الصوتي الذكي (Speech-to-Text) 🎙️✨
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تحدث بصوتك باللغة العربية وسيتم تحويل الكلام إلى نص فوري في المستند
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4">
          
          {/* Controls & Language selector */}
          <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">لغة التعرف:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="ar-SA">العربية (المملكة العربية السعودية)</option>
                <option value="ar-EG">العربية (مصر)</option>
                <option value="ar-AE">العربية (الإمارات)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {isListening ? (
                <button
                  type="button"
                  onClick={stopListening}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-900/30 transition cursor-pointer animate-pulse"
                >
                  <MicOff className="w-4 h-4" />
                  <span>إيقاف الاستماع</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startListening}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/35 transition cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>بدء التسجيل والإملاء 🎙️</span>
                </button>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-950/80 border border-rose-700/70 text-rose-200 p-3 rounded-xl text-xs font-semibold flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0">⚠️ تنبيه:</span>
                <span>{errorMessage}</span>
              </div>
              {errorMessage.includes('إذن الميكروفون') && (
                <div className="flex flex-col gap-2 mt-1">
                  <button 
                    onClick={startListening}
                    className="w-full bg-rose-700 hover:bg-rose-600 text-white rounded-lg py-2 font-bold transition"
                  >
                    إعادة محاولة الوصول للميكروفون
                  </button>
                  <p className="text-[10px] text-rose-300">
                    إذا لم يظهر طلب الإذن، يرجى النقر على أيقونة "القفل" في شريط عنوان المتصفح في الأعلى، ثم تفعيل خيار الميكروفون.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Transcript Display Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <span>النصوص المنطوقة المحولة:</span>
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-slate-400 hover:text-rose-300 flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>مسح النص</span>
              </button>
            </div>

            <div className="w-full h-36 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white overflow-y-auto leading-relaxed font-serif select-text">
              {transcript || interimTranscript ? (
                <div>
                  <span>{transcript}</span>
                  <span className="text-blue-400 italic ml-1">{interimTranscript}</span>
                </div>
              ) : (
                <span className="text-slate-500 italic">
                  {isListening ? 'جاري الاستماع... تحدث بوضوح الآن...' : 'انقر على "بدء التسجيل والإملاء" وابدأ بالتحدث باللغة العربية وسيظهر النص هنا تلقائياً...'}
                </span>
              )}
            </div>
          </div>

          {/* Voice Command Tips */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>نصائح للاستخدام السليم:</span>
            </div>
            <p className="text-slate-400 leading-normal">
              تحدث بنبرة واضحة. يمكنك قول الفواصل أو النقاط بوضوح، وعند الانتهاء انقر على زر **"إدراج النص في المستند"** ليتم إضافته فوراً في موضع المؤشر الحالي.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleInsertAndClose}
            disabled={!transcript && !interimTranscript}
            className={`px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
              transcript || interimTranscript
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>إدراج النص في المستند 📝</span>
          </button>
        </div>

      </div>
    </div>
  );
};
