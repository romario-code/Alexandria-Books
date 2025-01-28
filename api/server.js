const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
require('dotenv').config();

const supabaseUrl = process.env.SUPA_BASE_API_URL;
const supabaseKey = process.env.SUPA_BASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

// Check if a book exists by ISBN
const checkBookExists = async (isbn) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('isbn')
      .eq('isbn', isbn)
      .single();
      
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking book existence:', error.message);
    throw error;
  }
};

// Route to fetch all books
app.get('/api/books', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route to save a book
app.post('/api/books', async (req, res) => {
  try {
    const { id, title, authors, publisher, publishedDate, thumbnail } = req.body;

    if (!id || !title || !authors) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const exists = await checkBookExists(id);
    if (exists) {
      return res.status(409).json({
        message: `Livro com ISBN ${id} já existe no banco de dados`,
      });
    }

    const { data, error } = await supabase
      .from('books')
      .insert([
        {
          isbn: id,
          title,
          authors: authors.join(', '),
          publisher,
          published_date: publishedDate,
          thumbnail,
        },
      ]);

    if (error) throw error;
    res.status(201).json({
      message: 'Livro salvo com sucesso',
      id: data[0].id,
      isbn: id,
    });
  } catch (error) {
    console.error('Error saving book:', error.message);
    res.status(500).json({ error: error.message });
  }
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
