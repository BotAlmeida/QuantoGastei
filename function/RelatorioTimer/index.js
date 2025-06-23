const { CosmosClient } = require('@azure/cosmos');
const conn = process.env.COSMOS_CONN_STRING;
const client = new CosmosClient(conn);
const container = client.database('despesasdb').container('faturas');
const relatorioContainer = client.database('despesasdb').container('relatorio_semanal');

module.exports = async function (context, myTimer) {
  const now = new Date();
  context.log(`Relatório semanal gerado a ${now.toISOString()}`);

  // Calcula a data limite (7 dias atrás)
  const seteDiasAtras = new Date(now);
  seteDiasAtras.setDate(now.getDate() - 7);

  // Busca apenas faturas dos últimos 7 dias
  const querySpec = {
    query: "SELECT * FROM c WHERE c.data >= @dataLimite",
    parameters: [
      { name: "@dataLimite", value: seteDiasAtras.toISOString() }
    ]
  };
  const { resources } = await container.items.query(querySpec).fetchAll();

  // Filtro extra em JS para garantir apenas os últimos 7 dias
  const recursosFiltrados = resources.filter(fatura => {
    const dataFatura = new Date(fatura.data);
    return dataFatura >= seteDiasAtras && dataFatura <= now;
  });

  const resumo = {};
  recursosFiltrados.forEach(fatura => {
    const cat = fatura.categoria;
    resumo[cat] = (resumo[cat] || 0) + fatura.valor;
  });

  await relatorioContainer.items.create({
    data: now.toISOString(),
    categorias: resumo
  });
};
