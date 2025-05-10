require('dotenv').config();
const express = require('express');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const port = process.env.PORT || 80;
const cosmosConn = process.env.COSMOS_CONN_STRING;
const blobConn = process.env.BLOB_CONN_STRING;

// CosmosDB
const cosmosClient = new CosmosClient(cosmosConn);
const database = cosmosClient.database('despesasdb');
const container = database.container('items');

// Blob Storage
const blobServiceClient = BlobServiceClient.fromConnectionString(blobConn);
const containerClient = blobServiceClient.getContainerClient('imagens');

app.get('/', (req, res) => {
  res.send('Backend das despesas a bombar! 🚀');
});

app.post('/despesa', async (req, res) => {
  try {
    const { valor, tipo, data, local } = req.body;
    const newItem = {
      id: crypto.randomUUID(),
      valor,
      tipo,
      data,
      local
    };
    const response = await container.items.create(newItem);
    res.status(201).json(response.resource);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar despesa');
  }
});

app.get('/despesas', async (req, res) => {
  const { resources } = await container.items.readAll().fetchAll();
  res.json(resources);
});

app.listen(port, () => {
  console.log(`Servidor a bombar na porta ${port}`);
});
