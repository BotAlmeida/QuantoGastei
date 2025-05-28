const express = require('express');
const multer = require('multer');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer();

const client = new CosmosClient(process.env.COSMOS_CONN_STRING);
const container = client.database('despesasdb').container('faturas');
const relatorioContainer = client.database('despesasdb').container('relatorio_semanal');

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.BLOB_CONN_STRING);
const blobContainer = blobServiceClient.getContainerClient('faturas-imagens');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Endpoint para guardar despesas
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

// Endpoint para devolver despesas
app.get('/faturas', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    let query = 'SELECT * FROM c';
    let params = [];

    if (mes && ano) {
      query += ' WHERE STARTSWITH(c.data, @anoMes)';
      params.push({ name: '@anoMes', value: `${ano}-${String(mes).padStart(2, '0')}` });
    }

    const { resources } = await container.items
      .query({ query, parameters: params })
      .fetchAll();

    res.send(resources);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar despesas');
  }
});

// Endpoint para relatorio semanal
app.get('/relatorio-semanal', async (req, res) => {
  try {
    // Devolve o relatório mais recente
    const query = 'SELECT * FROM c ORDER BY c.data DESC OFFSET 0 LIMIT 1';
    const { resources } = await relatorioContainer.items.query(query).fetchAll();
    if (resources.length === 0) return res.json([]);
    res.json(resources[0].categorias || []);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar relatório semanal');
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('Im ok!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend a bombar na porta ${PORT} 🚀`));
