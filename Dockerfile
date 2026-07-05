# استخدام نسخة Node حديثة ومستقرة
FROM node:20

# تحديد مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات الـ package.json لتهيئة تثبيت الحزم
COPY package*.json ./

# تثبيت الحزم بالكامل (بما فيها حزم التطوير لأن Tailwind v4 و Vite يحتاجانها للبناء)
RUN npm install --legacy-peer-deps

# نسخ كافة ملفات المشروع إلى الحاوية
COPY . .

# بناء واجهة الـ Frontend وتحويلها لمجلد dist
RUN npm run build

# إعلام الحاوية بالمنفذ الذي تفرضه Hugging Face
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# تشغيل السيرفر مباشرة باستخدام أداة tsx
CMD ["npx", "tsx", "server.ts"]
