from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def greet_json():
    return {"Hello": "Welcome to my N8N Automation Space!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
