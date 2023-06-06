const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');


const app = express();
const PORT = 3000;

app.use('/static', express.static('static'));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// Connect to MongoDB
mongoose.connect('mongodb+srv://gunjan124:mahatmagandhi@cluster0.lnzwxca.mongodb.net/crypto_data?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Failed to connect to MongoDB', error));

// Create a schema for the data
const cryptoDataSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String
});

// Create a model for the data
const CryptoData = mongoose.model('CryptoData', cryptoDataSchema);

// Fetch data from the API and store it in the database
app.get('/', async (req, res) => {
  try {
    // deleting the old values for inserting new values
    await CryptoData.deleteMany({});

    // now fetching the new data after deletion of old data
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickers = response.data;

    // Extract the top 10 tickers
    const top10Tickers = Object.values(tickers).slice(0, 10);

    // Store the tickers in the database
    await CryptoData.insertMany(top10Tickers);

    console.log('Data fetched and stored successfully!');

    // now fetching the data stored in database
    try {
        const data = await CryptoData.find({}, '-_id name last buy sell volume base_unit').limit(10);
        console.log(data);
        res.render('home.pug',{n:0,  data:data});
    } catch (error) {
        console.error('Failed to fetch data from the database', error);
        res.status(500).send('Failed to fetch data from the database');
    }
} catch (error) {
    console.error('Failed to fetch and store data', error);
    res.status(500).send('Failed to fetch and store data');
}
    
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
