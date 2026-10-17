import express from 'express';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';
import { proofreadWithGemini } from './server/proofreadService';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Download complete project source code as a ZIP archive
  app.get('/api/download-app', async (req, res) => {
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
      const result = await proofreadWithGemini(text);
      res.json(result);
    } catch (err: any) {
      console.error('Proofread API error:', err);
      res.status(500).json({ error: err.message || 'فشل التدقيق اللغوي' });
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
