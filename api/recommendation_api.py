from fastapi import FastAPI
# ... seus imports atuais ...

app = FastAPI(title="Media Recommendation API")

# Adicione este middleware para CORS
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique seus domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... resto do seu código atual ...