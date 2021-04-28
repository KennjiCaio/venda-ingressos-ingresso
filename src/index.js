const express = require('express');
const app = express();
app.use(express.json());

const axios = require('axios');

const { v4: uuidv4 } = require('uuid');
const ingressosPorClienteId = {};

app.put('/clientes/:id/ingressos', async (req, res) => {
    const idIng = uuidv4();
    const { descricao, quantidade } = req.body;

    const ingressosDoCliente = ingressosPorClienteId[req.params.id] || [];

    ingressosDoCliente.push({
        id: idIng,
        descricao,
        quantidade
    });

    ingressosPorClienteId[req.params.id] = ingressosDoCliente;

    await axios.post('http://localhost:10000/eventos', {
        tipo: "IngressoCriado",
        dados: {
            id: idIng,
            descricao,
            quantidade,
            clienteId: req.params.id
        }
    });

    res.status(201).send(ingressosDoCliente);
});

app.post("/eventos", (req, res) => {
    console.log(req.body);
    res.status(200).send({ msg: "ok" });
});

app.put('/clientes/:id/ingressos/:idIng', (req, res) => {
    const { id, idIng } = req.params;
    const { quantidade } = req.body;

    const ingressoPorCliente = ingressosPorClienteId[id];

    var ingresso = ingressoPorCliente.find(e => {
        return e.id === idIng;
    });

    ingresso.quantidade = quantidade;

    res.json(ingresso);
});

app.delete('/clientes/:id/ingressos/:idIng', (req, res) => {
    const { id, idIng } = req.params;

    ingressosPorClienteId[id].splice(idIng, 1);

    res.json("Delete Success");
});

app.get('/clientes/:id/ingressos', (req, res) => {
    res.send(ingressosPorClienteId[req.params.id] || []);
});

app.listen(5000, () => {
    console.log('Ingressos. Porta 5000');
});