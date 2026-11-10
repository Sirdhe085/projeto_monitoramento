
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Porta automática da hospedagem ou 3000 no computador
const PORT = process.env.PORT || 3000;

// Define o caminho correto da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Cria ou conecta ao banco de dados SQLite
const db = new sqlite3.Database(
    path.join(__dirname, 'monitoramento.db')
);

// Cria a tabela de acessos, caso não exista
db.run(`
    CREATE TABLE IF NOT EXISTS acessos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL
    )
`);

// Rota para registrar um novo acesso
app.get('/registrar-acesso', (req, res) => {
    const data = new Date().toLocaleString('pt-BR');

    db.run(
        'INSERT INTO acessos (data) VALUES (?)',
        [data],
        function (erro) {
            if (erro) {
                return res.status(500).json({
                    erro: 'Erro ao registrar acesso.'
                });
            }

            res.json({
                mensagem: 'Acesso registrado com sucesso!',
                id: this.lastID
            });
        }
    );
});

// Rota para visualizar os acessos salvos
app.get('/acessos', (req, res) => {
    db.all(
        'SELECT * FROM acessos ORDER BY id DESC',
        [],
        (erro, linhas) => {
            if (erro) {
                return res.status(500).send(
                    'Erro ao buscar os acessos.'
                );
            }

            res.json(linhas);
        }
    );
});

// Rota de monitoramento da aplicação
app.get('/monitoramento', (req, res) => {
    db.get(
        'SELECT COUNT(*) AS total FROM acessos',
        [],
        (erro, resultado) => {
            if (erro) {
                return res.status(500).send(
                    'Erro ao obter dados de monitoramento.'
                );
            }

            const memoria = process.memoryUsage();

            res.json({
                status: 'online',
                totalDeAcessos: resultado.total,
                tempoDeAtividade: Math.floor(process.uptime()),
                memoriaUsadaMB: (
                    memoria.heapUsed / 1024 / 1024
                ).toFixed(2)
            });
        }
    );
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
