from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.training_plan import router as plan_router
from app.api.rag import router as rag_router

app = FastAPI(title="RunBuddy API")

# CORS for Next.js dev on 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plan_router)
app.include_router(rag_router)

@app.get("/")
def root():
    return {"msg": "RunBuddy backend running"}

