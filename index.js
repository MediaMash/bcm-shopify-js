const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Shopify App credentials
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

// Third-party API URL
const THIRD_PARTY_API_URL = 'http://stingray-app-4wzxb.ondigitalocean.app/video/api/videos/';

// Middleware to parse JSON requests
app.use(express.json());

// Endpoint for Shopify app installation
app.get('/install', (req, res) => {
  // Redirect to Shopify's OAuth page for app installation
  res.redirect(`https://${req.query.shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=read_content&redirect_uri=${process.env.APP_URL}/auth/callback`);
});

// OAuth callback endpoint
app.get('/auth/callback', async (req, res) => {
  const { shop, code } = req.query;

  try {
    // Exchange the authorization code for an access token
    const { data } = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    });

    // Store the access token securely (e.g., in a database)
    const accessToken = data.access_token;

    // Redirect to the app's main page
    res.redirect(`${process.env.APP_URL}/dashboard?shop=${shop}&accessToken=${accessToken}`);
  } catch (error) {
    console.error('Error during authentication:', error.message);
    res.status(500).send('Error during authentication');
  }
});

// Endpoint to fetch videos
app.get('/videos/:id', async (req, res) => {
  const { id } = req.params;
  const { shop, accessToken } = req.query;

  try {
    // Fetch videos from the third-party API
    const { data } = await axios.get(`${THIRD_PARTY_API_URL}${id}`);

    // Return the videos to the frontend
    res.json({ videos: data, shop, accessToken });
  } catch (error) {
    console.error('Error fetching videos:', error.message);
    res.status(500).send('Error fetching videos');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
