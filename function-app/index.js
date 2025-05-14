const { CosmosClient } = require('@azure/cosmos');
const conn = process.env.COSMOS_CONN_STRING;
const client = new CosmosClient(conn);
const container = client.database('despesasdb').container('faturas');

module.exports = async function (context, myTimer) {
  const now = new Date().toISOString();
  context.log(`Relatório semanal gerado a ${now}`);

  const { resources } = await container.items.readAll().fetchAll();
  const resumo = {};
  resources.forEach(fatura => {
    const cat = fatura.categoria;
    resumo[cat] = (resumo[cat] || 0) + fatura.valor;
  });

  context.log("Resumo semanal:", resumo);
};