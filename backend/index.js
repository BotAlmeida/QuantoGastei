const express = require('express');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const app = express();
app.use(express.json());

const client = new CosmosClient(process.env.COSMOS_CONN_STRING);
const container = client.database('despesasdb').container('faturas');

app.post('/fatura', async (req, res) => {
  try {
    const data = req.body;
    const response = await container.items.create(data);
    res.status(201).send(response.resource);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/faturas', async (req, res) => {
  const { resources } = await container.items.readAll().fetchAll();
  res.send(resources);
});

app.listen(3000, () => console.log('API pronta na porta 3000'));