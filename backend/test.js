// test.js
const fetch = require('node-fetch');

async function testAPI() {
  try {
    // Teste busca de livro
    const searchResponse = await fetch('http://localhost:3000/api/search-book/9780545010221');
    console.log('Busca:', await searchResponse.json());

    // Teste salvamento
    const saveResponse = await fetch('http://localhost:3000/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: '9780545010221',
        title: 'Harry Potter',
        authors: ['J.K. Rowling']
      })
    });
    console.log('Salvamento:', await saveResponse.json());

  } catch (error) {
    console.error('Erro:', error);
  }
}

testAPI();


// No seu servidor Express
app.post('/api/books', (req, res) => {
  console.log('Corpo da requisição:', req.body);
  // resto do código...
});