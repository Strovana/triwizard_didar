const connectToMongo = require('./db');
const express = require('express'); 
const cors = require('cors');

const app = express(); 
const port = 5000;

app.use(cors());
app.use(express.json());

connectToMongo(); 

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.listen(port, () => {
  console.log(`Server listening locally on http://localhost:${port}`);
});

module.exports = app; // Optional but good for testing or Render
