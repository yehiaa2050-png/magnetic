import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Groq from "groq-sdk";

async function startServer() {
  const app = express();
  // تعديل المنفذ ليقرأ تلقائياً من بيئة Hugging Face (7860) أو 3000 للتطوير المحلي
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  let groqClient: Groq | null = null;
  function getGroq(): Groq {
    if (!groqClient) {
      const key = process.env.GROQ_API_KEY;
      if (!key) {
        throw new Error("GROQ_API_KEY is not set. Please set it in the environment.");
      }
      groqClient = new Groq({ apiKey: key });
    }
    return groqClient;
  }

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/suggest", async (req, res) => {
    try {
      const { massKg, distanceMm, material, shape } = req.body;
      const prompt = `أنت خبير في هندسة الفيزياء والمغناطيسيات. تطلب منك تقديم توصيات لجهاز رفع مغناطيسي. استناداً للمعطيات التالية:
- الوزن المستهدف للرفع: ${massKg} كجم
- مسافة الرفع (الفجوة): ${Number(distanceMm).toFixed(2)} ملم
- المادة المغناطيسية المختارة: ${material}
- شكل الجسم المُعلق: ${shape}

قدم اقتراحاً تصميمياً مقتضباً واحترافياً (3-4 أسطر) باللغة العربية حول التكوين الأمثل للمغناطيسات المطلوبة لتعزيز استقرار هذا الجسم بالتحديد، مع أخذ اعتبارات الشكل والمادة في توزيع خطوط الفيض المغناطيسي.`;

      const groq = getGroq();
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
      });

      res.json({ suggestion: chatCompletion.choices[0]?.message?.content || 'لا يوجد اقتراح' });
    } catch (error: any) {
      console.error("Groq Error:", error);
      if (error?.status === 401 || error?.message?.includes('Invalid API Key') || error?.error?.code === 'invalid_api_key' || error?.status === 403) {
         res.status(401).json({ error: "INVALID_GROQ_KEY" });
      } else {
         res.status(500).json({ error: error.message || "Failed to generate suggestion via Groq" });
      }
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, state } = req.body;
      const { massKg, distanceMm, material, shape, forceN, requiredForceN } = state;
      
      const systemPrompt = `أنت مساعد ذكي ومتخصص في الفيزياء وهندسة المغناطيسيات، مدمج داخل معمل محاكاة افتراضي للرفع المغناطيسي.
حالة المحاكاة الحالية:
- الوزن: ${massKg} كجم
- المسافة الحالية: ${distanceMm} ملم
- المادة: ${material}
- الشكل: ${shape}
- القوة المغناطيسية الحالية: ${forceN} نيوتن
- القوة المطلوبة للرفع: ${requiredForceN} نيوتن

دورك هو الرد على استفسارات المستخدم باللغة العربية بأسلوب علمي مبسط ودقيق، ومساعدته في حساب القوى وفهم كيفية تحقيق التوازن، أو شرح مفاهيم كهرومغناطيسية. حافظ على إجاباتك موجزة نسبياً.`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
      ];

      const groq = getGroq();
      const chatCompletion = await groq.chat.completions.create({
        messages: apiMessages,
        model: 'llama-3.3-70b-versatile',
      });

      res.json({ reply: chatCompletion.choices[0]?.message?.content || '' });
    } catch (error: any) {
      console.error("Groq Chat Error:", error);
      res.status(500).json({ error: error.message || "Chat failed" });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
