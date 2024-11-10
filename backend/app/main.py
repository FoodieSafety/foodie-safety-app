from fastapi import FastAPI

app = FastAPI()

@app.get("/home")
async def root():
    return {"message": "Hello World"}

