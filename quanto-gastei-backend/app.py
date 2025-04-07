from flask import Flask, request, jsonify
from services.cosmosdb import save_expense, get_expenses
from services.blob_storage import upload_image
import os

app = Flask(__name__)

@app.route('/add_expense', methods=['POST'])
def add_expense():
    """Recebe uma despesa e, se houver imagem, faz upload para o BLOB Storage"""
    data = request.form  # Dados da despesa enviados pelo utilizador
    image = request.files.get('image')  # Verifica se foi enviada uma imagem

    expense = {
        "category": data.get("category"),
        "amount": float(data.get("amount")),  # Converte o valor para float
        "description": data.get("description")
    }

    if image:
        image_url = upload_image(image)  # Faz upload da imagem e retorna o URL
        expense["image_url"] = image_url  # Guarda o link da imagem na despesa

    save_expense(expense)  # Guarda a despesa na base de dados
    
    return jsonify({"message": "Despesa adicionada!", "data": expense}), 201

@app.route('/expenses', methods=['GET'])
def list_expenses():
    """Retorna todas as despesas guardadas na base de dados"""
    expenses = get_expenses()
    return jsonify(expenses), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  # Inicia o servidor Flask na porta 5000
