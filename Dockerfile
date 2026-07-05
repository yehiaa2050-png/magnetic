# استخدام نسخة Node المستقرة والحديثة لضمان توافق React 19
FROM node:20

# تحديد مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات الـ package.json لتهيئة تثبيت الحزم
COPY package*.json ./

# تثبيت الحزم بالكامل بما فيها أدوات التطوير اللازمة للـ TypeScript و tsx
RUN npm install --legacy-peer-deps --include=dev

# نسخ كافة ملفات المشروع إلى الحاوية
COPY . .

# بناء واجهة الـ Frontend وتحويلها لمجلد dist لتستطيع Express قراءتها
RUN npm run build

# فتح المنفذ الخاص بـ Hugging Face وتعيين بيئة العمل كـ الإنتاج
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# تشغيل السيرفر مباشرة باستخدام أداة tsx لملفات الـ TypeScript
CMD ["npx", "tsx", "server.ts"]
