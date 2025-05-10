const { CosmosClient } = require('@azure/cosmos');
const connStr = process.env.COSMOS_CONN_STRING;
const cosmosClient = new CosmosClient(connStr);
const container = cosmosClient.database('despesasdb').container('items');

module.exports = async function (context, req) {
    const despesas = await container.items.readAll().fetchAll();
    const totaisPorCategoria = {};

    for (const item of despesas.resources) {
        const categoria = item.tipo || 'Indefinido';
        const valor = parseFloat(item.valor) || 0;

        if (!totaisPorCategoria[categoria]) {
            totaisPorCategoria[categoria] = 0;
        }

        totaisPorCategoria[categoria] += valor;
    }

    context.res = {
        status: 200,
        body: totaisPorCategoria
    };
};
