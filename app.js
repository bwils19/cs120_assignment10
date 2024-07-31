const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
// require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;
let db;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

MongoClient.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,
  tlsAllowInvalidCertificates: true 
})
.then(client => {
  console.log('Connected to database');
  db = client.db('mass_zips');

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})
.catch(error => {
  console.error('Failed to connect to the database:', error);
  process.exit(1); 
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
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
    console.error('Error during database query:', error);
    res.status(500).send('An error occurred!');
  }
});
