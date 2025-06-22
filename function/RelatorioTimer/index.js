const { CosmosClient } = require('@azure/cosmos');
const conn = process.env.COSMOS_CONN_STRING;
const client = new CosmosClient(conn);
const container = client.database('despesasdb').container('faturas');
const relatorioContainer = client.database('despesasdb').container('relatorio_semanal');

module.exports = async function (context, myTimer) {
  const now = new Date().toISOString();
  context.log(`Relatório semanal gerado a ${now}`);

  const { resources } = await container.items.readAll().fetchAll();
  const resumo = {};
  resources.forEach(fatura => {
    const cat = fatura.categoria;
    resumo[cat] = (resumo[cat] || 0) + fatura.valor;
  });

  await relatorioContainer.items.create({
    data: now,
    categorias: resumo
  });
};
