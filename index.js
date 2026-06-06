// index.js — Integrating With HubSpot I: Foundations Practicum

const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

// ---------- App configuration ----------
app.set('view engine', 'pug');                    // render .pug files in /views
app.use(express.static(__dirname + '/public'));   // serve CSS from /public
app.use(express.urlencoded({ extended: true }));  // parse HTML form submissions

// ====================================================================
// CONFIG — change these three things to match YOUR account
// ====================================================================
const PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_TOKEN;

// Your custom object's ID (the "2-XXXXXXXX" from the list-view URL)
const CUSTOM_OBJECT = '2-63742191';

// The INTERNAL names of your 3 properties (from Settings > Properties)
const PROPERTIES = ['name', 'publisher', 'price'];
// ====================================================================

// Axios instance pre-loaded with the auth header so we don't repeat it
const hubspot = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    Authorization: `Bearer ${PRIVATE_APP_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// --------------------------------------------------------------------
// ROUTE 1 — Homepage "/"  (GET all records, show them in a table)
// --------------------------------------------------------------------
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

// --------------------------------------------------------------------
// ROUTE 2 — "/update-cobj" (GET) — show the form page
// --------------------------------------------------------------------
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
  });
});

// --------------------------------------------------------------------
// ROUTE 3 — "/update-cobj" (POST) — create a record, then redirect home
// --------------------------------------------------------------------
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

// ---------- Start the server ----------
app.listen(3000, () => console.log('Listening on http://localhost:3000'));