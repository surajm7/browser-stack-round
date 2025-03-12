const express = require('express');
const path = require('path');
const { handleSSE } = require('./index'); // Make sure index.js is optimized

const app = express();
const port = 8082;

app.get('/log', handleSSE);

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});



// const express = require('express');
// const app = express()
// const port = 8082;

// const {handleSSE} = require('./index');

// app.get('/', (req, res) => {
//     console.log('home page req');
//   res.send('Hello World!')
// })
// app.get('/log', handleSSE);

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })