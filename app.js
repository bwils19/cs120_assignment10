const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const uri = process.env.MONGO_URI;
let db;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('connected to db...');
    db = client.db('mass_zips');
  })
  .catch(error => console.error(error));

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/process', async (req, res) => {
  const input = req.body.input;
  const isZip = !isNaN(input.charAt(0));
  let query;
  let result;

  try {
    if (isZip) {
      query = { zips: input };
      result = await db.collection('zips').findOne(query);
    } else {
      query = { city: input };
      result = await db.collection('zips').findOne(query);
    }

    res.render('result', { result: result });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred!');
  }
});

app.listen(3000, () => {
  console.log('server is running on port 3000');
});
