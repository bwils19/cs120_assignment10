const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const uri = process.env.MONGO_URI;
let db;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('views', __dirname);
app.set('view engine', 'ejs');

const connectToMongo = async () => {
  try {
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 
    });
    console.log('Connected to DB');
    db = client.db('mass_zips');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    setTimeout(connectToMongo, 5000); 
  }
};

connectToMongo();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); 
});

app.post('/process', async (req, res) => {
  const input = req.body.input;
  const isZip = !isNaN(input.charAt(0));
  let query;
  let result;

  if (!db) {
    return res.status(500).send('Database not initialized');
  }

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
    console.error('Error processing request:', error);
    res.status(500).send('An error occurred!');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
