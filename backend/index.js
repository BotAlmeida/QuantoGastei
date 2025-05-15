const express = require('express');
const multer = require('multer');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const app = express();
const upload = multer();

const client = new CosmosClient(process.env.COSMOS_CONN_STRING);
const container = client.database('despesasdb').container('faturas');

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_CONN_STRING);
const blobContainer = blobServiceClient.getContainerClient('faturas-imagens');

app.post('/fatura', upload.single('imagem'), async (req, res) => {
  try {
    const { data, valor, categoria, local, contribuinte } = req.body;
    const imagem = req.file;

    let imagemUrl = null;
    if (imagem) {
      const blobName = `${Date.now()}-${imagem.originalname}`;
      const blockBlobClient = blobContainer.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(imagem.buffer, {
        blobHTTPHeaders: { blobContentType: imagem.mimetype }
      });
      imagemUrl = blockBlobClient.url;
    }

    const item = {
      data,
      valor: parseFloat(valor),
      categoria,
      local,
      contribuinte: contribuinte === 'true',
      imagemUrl
    };

    const response = await container.items.create(item);
    res.status(201).send(response.resource);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao guardar despesa');
  }
});

app.get('/faturas', async (req, res) => {
  const { resources } = await container.items.readAll().fetchAll();
  res.send(resources);
});

app.listen(3000, () => console.log('Backend a bombar na porta 3000 🚀'));
