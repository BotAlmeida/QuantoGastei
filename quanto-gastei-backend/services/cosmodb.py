import os
import pymongo
from dotenv import load_dotenv

load_dotenv()  # Carrega variáveis de ambiente do ficheiro .env

# URL de ligação ao CosmosDB
COSMOSDB_URI = os.getenv("COSMOSDB_URI")

# Nome da base de dados e da coleção
DATABASE_NAME = "despesasDB"
COLLECTION_NAME = "despesas"

# Conectar ao CosmosDB
client = pymongo.MongoClient(COSMOSDB_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

def save_expense(expense):
    """Guarda uma despesa na base de dados"""
    collection.insert_one(expense)

def get_expenses():
    """Obtém todas as despesas guardadas, excluindo o campo '_id'"""
    return list(collection.find({}, {"_id": 0}))
