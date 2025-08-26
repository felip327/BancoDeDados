//! Importa a Biblioteca Express
const express = require('express')
const { error } = require('console');
const sqlite3 =  require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(express.json());

const db = new sqlite3.Database('./database.db', (err =>{
    if(err){
        console.error('erro ao conectar ao banco de dados', err.message);
    }
    else{
        console.log('Conectado ao banco de dados SQLite');
    }
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- 'id' é a chave primária
    nome TEXT NOT NULL,                   -- 'nome' é um texto e não pode ser nulo
    email TEXT UNIQUE NOT NULL            -- 'email' é um texto único e não pode ser nulo
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela', err.message);
        } else {
            console.log('Tabela criada');
        }
    });
}));

app.post('/usuarios', (req, res) => {
    const { nome, email } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    const sql = 'INSERT INTO usuarios (nome, email) VALUES (?, ?)';
    db.run(sql, [nome, email], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Erro ao inserir usuário no banco de dados' });
        }

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            id: this.lastID
        });
    });
});

app.get('/usuarios', (req,res) =>{
    const sql = 'SELECT * FROM usuarios'
    db.all(sql, [], (err, rows)=>{
        if(err)
        {
            console.error(err.message)
            return res.status(500).json({error: 'Erro ao buscar usuarios'})
        }
        res.json({
            message: 'Usuarios listados com sucesso',
            data: rows
        })
    })

})

app.get('/usuarios/:id', (req, res) =>{
    const {id} = req.params;
    const sql = 'SELECT * FROM usuarios WHERE id = ?'
    db.get(sql, [id], (err, row)=>{
        if(err)
        {
            console.error(err.message);
            return res.status(500).json({error: 'Erro ao buscar usuario'});
        }
        if(row)
        {
            res.json({
                message: 'Usuario encontrado',
                data: row
            });
        }
        else{
            res.status(404).json({error: 'Usuarios nao encontrado'});
        }
    })
})

app.put('/usuarios/:id', (req, res)=>{
    const {id} = req.params;
    const {nome, email} = req.body;
    const sql = `UPDATE usuarios SET nome = ?, email = ?, WHERE id = ?`;

    if(!nome || !email){
        return res.status(400).json({error: 'Nome e email são obrigatorios'})
    }

    db.run(sql, [nome, email, id], function(err){
        if(err)
        {
            console.error(err.message);
            return res.status(500).json({error: 'Erro ao atualizar'});
        }

        if(this.changes > 0){
            res.json({message: 'Usuário atualizado com sucesso'})
        }else{
            res.status(404).json({error: 'Usuarios não encontrado'});
        }
    })
})

app.delete('/usuarios/:id', (req, res) =>{
    const {id} = req.params;
    const sql = `DELETE FROM usuarios WHERE id = ?`
    db.run(sql, [id], function(err){
        if(err){
            console.error(err.message);
            return res.status(500).json({json: 'Erro ao deletar usuario'})
        }
        if(this.changes > 0){
            res.json({message: `Usuarios com ${id} deletado com sucesso`})
        }
        else{
            res.status(404).json({error: `Usuario não encontrado`})
        }

    })
})

app.listen(port, ()=>{
    console.log('Servidor rodando na porta ', port);
});
process.on('SIGINT', () =>{
    db.close((err) =>{
        if(err)
        {
            console.error(err.message)
        }
        console.log('conexão com o banco de dados SQLite fechada')
        process.exit(0);
    })
})