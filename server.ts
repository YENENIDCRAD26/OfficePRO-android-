import express from 'express';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

interface ProofreadCorrection {
  original: string;
  suggestion: string;
  type: 'spelling' | 'grammar' | 'punctuation' | 'style';
  explanation: string;
}

interface ProofreadResult {
  originalText: string;
  correctedText: string;
  corrections: ProofreadCorrection[];
  source: 'gemini' | 'rules';
}

const ARABIC_WORD_RULES: Array<{
  word: string;
  replacement: string;
  type: 'spelling' | 'grammar' | 'punctuation';
  explanation: string;
}> = [
  { word: 'هاذا', replacement: 'هذا', type: 'spelling', explanation: 'حذف ألف التنبيه الزائدة في اسم الإشارة' },
  { word: 'هاذه', replacement: 'هذه', type: 'spelling', explanation: 'حذف ألف التنبيه الزائدة في اسم الإشارة' },
  { word: 'هاؤلاء', replacement: 'هؤلاء', type: 'spelling', explanation: 'حذف ألف التنبيه الزائدة في اسم الإشارة' },
  { word: 'هاكذا', replacement: 'هكذا', type: 'spelling', explanation: 'كتابة اسم الإشارة الصحيح' },
  { word: 'ذالك', replacement: 'ذلك', type: 'spelling', explanation: 'حذف الألف بعد الذال في اسم الإشارة' },
  { word: 'لاكن', replacement: 'لكن', type: 'spelling', explanation: 'كتابة حرف الاستدراك بدون ألف' },
  { word: 'الى', replacement: 'إلى', type: 'spelling', explanation: 'همزة قطع مكسورة في حرف الجر' },
  { word: 'ان', replacement: 'أن', type: 'spelling', explanation: 'همزة قطع مفتوحة' },
  { word: 'انما', replacement: 'إنما', type: 'spelling', explanation: 'همزة قطع مكسورة في أداة الحصر' },
  { word: 'اذا', replacement: 'إذا', type: 'spelling', explanation: 'همزة قطع مكسورة في ظرفية الشرط' },
  { word: 'اكثر', replacement: 'أكثر', type: 'spelling', explanation: 'همزة قطع على وزن أفعل' },
  { word: 'اكبر', replacement: 'أكبر', type: 'spelling', explanation: 'همزة قطع على وزن أفعل' },
  { word: 'اصغر', replacement: 'أصغر', type: 'spelling', explanation: 'همزة قطع على وزن أفعل' },
  { word: 'افضل', replacement: 'أفضل', type: 'spelling', explanation: 'همزة قطع على وزن أفعل' },
  { word: 'اول', replacement: 'أول', type: 'spelling', explanation: 'همزة قطع مفتوحة' },
  { word: 'اخر', replacement: 'آخر', type: 'spelling', explanation: 'همزة مد ممدودة' },
  { word: 'انسان', replacement: 'إنسان', type: 'spelling', explanation: 'همزة قطع مكسورة' },
  { word: 'احسان', replacement: 'إحسان', type: 'spelling', explanation: 'همزة قطع مصدر رباعي' },
  { word: 'ابراهيم', replacement: 'إبراهيم', type: 'spelling', explanation: 'همزة قطع علم أعجمي' },
  { word: 'اسماعيل', replacement: 'إسماعيل', type: 'spelling', explanation: 'همزة قطع علم أعجمي' },
  { word: 'اسحاق', replacement: 'إسحاق', type: 'spelling', explanation: 'همزة قطع علم أعجمي' },
  { word: 'ايضا', replacement: 'أيضاً', type: 'spelling', explanation: 'همزة قطع وتنوين نصب' },
  { word: 'مدرسه', replacement: 'مدرسة', type: 'spelling', explanation: 'تاء مربوطة تنطق هاء عند الوقف وتاء عند الوصل' },
  { word: 'مكتبه', replacement: 'مكتبة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'جامعه', replacement: 'جامعة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'حياه', replacement: 'حياة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'وثيقه', replacement: 'وثيقة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'شرعيه', replacement: 'شرعية', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'قضائيه', replacement: 'قضائية', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'رسميه', replacement: 'رسمية', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'جمهوريه', replacement: 'جمهورية', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'اليمنيه', replacement: 'اليمنية', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'خاصه', replacement: 'خاصة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'عامه', replacement: 'عامة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'قوه', replacement: 'قوة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'صوره', replacement: 'صورة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'مستشفي', replacement: 'مستشفى', type: 'spelling', explanation: 'ألف مقصورة في نهاية الاسم المقصور' },
  { word: 'فتوي', replacement: 'فتوى', type: 'spelling', explanation: 'ألف مقصورة' },
  { word: 'دعاوي', replacement: 'دعاوى', type: 'spelling', explanation: 'ألف مقصورة في جمع دعوى' },
];

function ruleBasedArabicProofread(text: string): ProofreadResult {
  const corrections: ProofreadCorrection[] = [];
  let corrected = text;

  // 1. Punctuation spacing
  corrected = corrected.replace(/\s+([،؛:؟!.\)])/g, (match, p1) => {
    corrections.push({
      original: match,
      suggestion: p1,
      type: 'punctuation',
      explanation: 'إزالة المسافة الزائدة قبل علامة الترقيم',
    });
    return p1;
  });

  // 2. Word by word replacement with Unicode boundary check
  for (const item of ARABIC_WORD_RULES) {
    const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])(${item.word})([^\\p{L}\\p{N}_]|$)`, 'gu');
    if (regex.test(corrected)) {
      corrections.push({
        original: item.word,
        suggestion: item.replacement,
        type: item.type,
        explanation: item.explanation,
      });
      corrected = corrected.replace(
        new RegExp(`(^|[^\\p{L}\\p{N}_])(${item.word})([^\\p{L}\\p{N}_]|$)`, 'gu'),
        `$1${item.replacement}$3`
      );
    }
  }

  return {
    originalText: text,
    correctedText: corrected,
    corrections,
    source: 'rules',
  };
}

async function proofreadWithGemini(text: string): Promise<ProofreadResult> {
  return ruleBasedArabicProofread(text);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Download complete project source code as a ZIP archive
  app.get(['/api/download-app', '/api/download-project-zip', '/api/download-source'], async (req, res) => {
    try {
      const zip = new JSZip();
      const rootDir = process.cwd();

      const addDirToZip = (currentDir: string, relativePath = '') => {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;

          // Skip heavy, generated or sensitive directories
          if (
            entry.name === 'node_modules' ||
            entry.name === '.git' ||
            entry.name === '.aistudio' ||
            entry.name === 'dist' ||
            entry.name === '.env'
          ) {
            continue;
          }

          if (entry.isDirectory()) {
            addDirToZip(fullPath, rel);
          } else if (entry.isFile()) {
            const data = fs.readFileSync(fullPath);
            zip.file(rel, data);
          }
        }
      };

      addDirToZip(rootDir);

      const zipBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="word-excel-pro-app.zip"');
      res.send(zipBuffer);
    } catch (err: any) {
      console.error('Error creating app zip:', err);
      res.status(500).json({ error: 'فشل تصدير حزمة التطبيق' });
    }
  });

  // Download or redirect to latest compiled Android APK
  app.get('/api/download-apk', (req, res) => {
    res.redirect('https://github.com/YENENIDCRAD26/word-xlsx-mazen-docx/releases/download/apk-latest/Word-Excel-Suite.apk');
  });

  app.post('/api/proofread', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'النص مطلوب للتدقيق اللغوي' });
      }
      
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.json(ruleBasedArabicProofread(text));
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `أنت خبير لغوي عربي دقيق. قم بتدقيق النص التالي إملائياً ونحوياً.
أعد النص المصحح والتعليقات بالتنسيق JSON فقط:
{"correctedText": "النص بعد التصحيح", "corrections": [{"original": "الخطأ", "suggestion": "التصحيح", "type": "spelling|grammar", "explanation": "شرح مبسط"}]}
النص:
${text}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      const result = JSON.parse(response.text || '{}');
      res.json({
        originalText: text,
        correctedText: result.correctedText || text,
        corrections: result.corrections || [],
        source: 'gemini'
      });
    } catch (err: any) {
      console.error('Proofread API error:', err);
      // Fallback to rule-based
      res.json(ruleBasedArabicProofread(text));
    }
  });

  app.post('/api/autocomplete', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'النص مطلوب للإكمال التلقائي' });
      }
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.json({ completion: ' وبناءً على ما تقدم، تقرر الحكم بما هو منصوص عليه شرعاً وقانوناً.' });
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `أنت مساعد ذكي ومتخصص في صياغة وتحرير المستندات القانونية والإدارية والشرعية باللغة العربية الفصحى. أكمل الجملة أو الفقرة التالية بعبارة بليغة ومتسقة سياقياً (أعطِ فقط النص المكمل بدون مقدمات وبطول 5 إلى 15 كلمة):\n\n${text}`,
      });
      const completion = response.text?.trim() || '';
      res.json({ completion });
    } catch (err: any) {
      console.error('Autocomplete API error:', err);
      res.json({ completion: ' وبناءً على الأصول الشرعية والقانونية المرعية.' });
    }
  });

  app.post('/api/synonyms', async (req, res) => {
    try {
      const { word, context } = req.body;
      if (!word || typeof word !== 'string') {
        return res.status(400).json({ error: 'الكلمة مطلوبة' });
      }
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        const fallbackMap: Record<string, string[]> = {
          'كتابة': ['تحرير', 'تدوين', 'تسجيل', 'تسطير'],
          'قرار': ['حكم', 'مرسوم', 'إجراء', 'قضاء'],
          'حكم': ['قرار', 'قضاء', 'فصل', 'إلزام'],
          'جميل': ['رائع', 'بديع', 'حسن', 'أنيق'],
          'كبير': ['ضخم', 'عظيم', 'هائل', 'جسيم'],
          'سريع': ['عاجل', 'فوري', 'خاطف', 'وشيك'],
          'طلب': ['التماس', 'رجاء', 'استدعاء', 'مناشدة'],
          'مستند': ['وثيقة', 'صك', 'محرر', 'سجل'],
          'تعديل': ['تصحيح', 'تنقيح', 'تطوير', 'تغيير']
        };
        const trimmed = word.trim();
        const found = fallbackMap[trimmed] || ['مرادف فصيح', 'بديل لغوي', 'صياغة أدبية'];
        return res.json({ synonyms: found });
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `أنت معجم لغوي عربي ذكي وفصيح. أعطني قائمة دقيقة من 4 إلى 6 مرادفات أو بدائل لغوية بلاغية للكلمة: "${word}"${context ? ` في السياق: "${context}"` : ''}.
أجب حصراً بصيغة JSON بالهيكل:
{"synonyms": ["مرادف1", "مرادف2", "مرادف3", "مرادف4"]}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ synonyms: parsed.synonyms || [] });
    } catch (err: any) {
      console.error('Synonyms API error:', err);
      res.json({ synonyms: ['مرادف لغوي', 'بديل فصيح'] });
    }
  });

  // Vite middleware for dev / static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
