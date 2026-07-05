---
title: N8N Automation Space
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# 🤖 N8N Automation Space

هذه مساحة مخصصة لتشغيل أتمتة N8N باستخدام FastAPI و Docker على Hugging Face.

## 🚀 الميزات

- تشغيل FastAPI كخادم رئيسي
- جاهز لتشغيل N8N workflows
- نشر تلقائي من GitHub إلى Hugging Face

## 📋 نقاط النهاية (Endpoints)

| المسار | الوصف |
|--------|-------|
| `/` | رسالة ترحيبية |
| `/health` | التحقق من صحة الخدمة |
| `/run-workflow` | تشغيل N8N workflow (قيد التطوير) |
| `/env` | عرض متغيرات البيئة |

## 🔧 التطوير المحلي

```bash
# تثبيت المتطلبات
pip install -r requirements.txt

# تشغيل الخادم محلياً
uvicorn app:app --reload
