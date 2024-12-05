const express = require('express');
const mysql = require('mysql2');
const app = express();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'alexandria',
  charset: 'utf8mb4',
});

app.use(express.json());

// Tratamento de erros de conexão
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Rota para salvar um livro
app.post('/api/books', (req, res) => {
  const { id, title, authors, publisher, publishedDate, thumbnail } = req.body;

  if (!id || !title || !authors) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  const query = `
    INSERT INTO books (isbn, title, authors, publisher, published_date, thumbnail) VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [id, title, authors.join(', '), publisher, publishedDate, thumbnail],
    (error, results) => {
      if (error) {
        console.error('Erro ao salvar livro:', error);
        res.status(500).json({ error: 'Erro ao salvar livro' });
        return;
      }
      res
        .status(201)
        .json({ message: 'Livro salvo com sucesso', id: results.insertId });
    },
  );
});

// Rota para buscar todos os livros
app.get('/api/books', (req, res) => {
  const query = 'SELECT * FROM books';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Erro ao buscar livros:', error);
      res.status(500).json({ error: 'Erro ao buscar livros' });
      return;
    }
    res.json(results);
  });
});
// Endpoint de teste
app.get('/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
