from fastapi import FastAPI, UploadFile, Form
from azure.storage.blob import BlobServiceClient
from azure.cosmos import CosmosClient
import uuid, os

app = FastAPI()

COSMOS_URL = os.getenv("COSMOS_URL")
COSMOS_KEY = os.getenv("COSMOS_KEY")
BLOB_CONN_STRING = os.getenv("BLOB_CONN_STRING")

@app.post("/despesa")
async def adicionar_despesa(
    valor: float = Form(...),
    descricao: str = Form(...),
    data: str = Form(...),
    foto: UploadFile = None
):
    despesa_id = str(uuid.uuid4())
    blob_url = ""

    if foto:
        blob = BlobServiceClient.from_connection_string(BLOB_CONN_STRING)
        container = blob.get_container_client("faturas")
        blob_name = f"{despesa_id}_{foto.filename}"
        container.upload_blob(blob_name, await foto.read(), overwrite=True)
        blob_url = f"{container.url}/{blob_name}"

    cosmos = CosmosClient(COSMOS_URL, COSMOS_KEY)
    db = cosmos.get_database_client("DespesasDB")
    container = db.get_container_client("Registos")

    item = {
        "id": despesa_id,
        "valor": valor,
        "descricao": descricao,
        "data": data,
        "foto": blob_url
    }

    container.create_item(body=item)
    return {"msg": "Despesa adicionada com sucesso", "id": despesa_id}
