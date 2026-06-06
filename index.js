// index.js — Integrating With HubSpot I: Foundations Practicum

const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.set('view engine', 'pug');                    // render .pug files in /views
app.use(express.static(__dirname + '/public'));   // serve CSS from /public
app.use(express.urlencoded({ extended: true }));  // parse HTML form submissions

const PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_TOKEN;

const CUSTOM_OBJECT = '2-63742191';

const PROPERTIES = ['name', 'publisher', 'price'];


const hubspot = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    Authorization: `Bearer ${PRIVATE_APP_TOKEN}`,
    'Content-Type': 'application/json',
  },
});


app.get('/', async (req, res) => {
  const url = `/crm/v3/objects/${CUSTOM_OBJECT}?properties=${PROPERTIES.join(',')}`;
  try {
    const response = await hubspot.get(url);
    res.render('homepage', {
      title: 'Custom Object Table | Integrating With HubSpot I Practicum',
      records: response.data.results,
      properties: PROPERTIES,
    });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching records — check the terminal.');
  }
});


app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
  });
});


app.post('/update-cobj', async (req, res) => {
  const newRecord = {
    properties: {
      name: req.body.name,
      publisher: req.body.publisher,
      price: req.body.price,
    },
  };
  try {
    await hubspot.post(`/crm/v3/objects/${CUSTOM_OBJECT}`, newRecord);
    res.redirect('/');
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send('Error creating record — check the terminal.');
  }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));