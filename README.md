# 💸 Projeto Despesas em Azure

Aplicação cloud-native para registo e análise de despesas pessoais, baseada em serviços da plataforma Microsoft Azure.

## 🔧 Tecnologias e Serviços Utilizados

- **GitHub + GitHub Actions** (CI/CD automático)
- **Azure App Service** (Backend em Docker)
- **Azure Function App** (Frontend analítico em Docker)
- **Azure Container Registry (ACR)** (armazenamento de imagens Docker)
- **Azure CosmosDB** (Base de dados NoSQL para despesas)
- **Azure Blob Storage** (armazenamento de imagens)
- **Bicep** (infraestrutura como código)

---

## 📁 Estrutura de Pastas

projeto-despesas/
├── .github/workflows/
│ └── deploy.yml
├── infra/
│ └── main.bicep
├── backend/
│ ├── Dockerfile
│ ├── index.js
│ └── .env.example
├── frontend/
│ └── assets/
│ └── index.html
├── function/
│ └── Dockerfile
│ └── function.json
│ └── host.json
│ └── index.js

## 🚀 Deploy em Azure (passo a passo)

### 1. Criar o grupo de recursos

az group create --name rg-despesas --location northeurope

## Deploy da infraestrutura

az deployment group create \
  --resource-group rg-despesas \
  --template-file infra/main.bicep


## Fazer login no ACR

az acr login --name acrdespesas


