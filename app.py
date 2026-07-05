from fastapi import FastAPI
import subprocess
import json
import os

app = FastAPI()

@app.get("/")
def greet_json():
    return {"Hello": "Welcome to my N8N Automation Space!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "N8N Automation"}

@app.get("/run-workflow")
def run_workflow():
    """
    نقطة بداية لتشغيل N8N workflows
    يمكنك تعديل هذه الدالة لتنفيذ أوامر N8N
    """
    try:
        # مثال: تشغيل أمر N8N (سيتم تفعيله عند تثبيت N8N)
        # result = subprocess.run(["n8n", "--help"], capture_output=True, text=True)
        return {
            "status": "Workflow triggered",
            "message": "N8N integration ready",
            "note": "Add your workflow logic here"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/env")
def show_env():
    """عرض متغيرات البيئة (للتحقق)"""
    return {
        "environment": os.environ.get("ENVIRONMENT", "production"),
        "space": "eissa0070/n8nautomtion"
    }
