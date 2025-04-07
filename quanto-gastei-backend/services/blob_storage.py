import os
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

load_dotenv()  # Carrega variáveis de ambiente do ficheiro .env

# Chave de ligação ao Azure BLOB Storage
BLOB_CONNECTION_STRING = os.getenv("BLOB_CONNECTION_STRING")
CONTAINER_NAME = "despesas"  # Nome do container onde as imagens serão guardadas

# Criar ligação ao serviço BLOB Storage
blob_service_client = BlobServiceClient.from_connection_string(BLOB_CONNECTION_STRING)
container_client = blob_service_client.get_container_client(CONTAINER_NAME)

def upload_image(image):
    """Faz upload da imagem para o Azure BLOB Storage e retorna o URL"""
    blob_client = container_client.get_blob_client(image.filename)
    blob_client.upload_blob(image, overwrite=True)  # Envia a imagem e substitui se já existir
    return blob_client.url  # Retorna o URL da imagem guardada
