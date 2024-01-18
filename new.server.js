const express = require('express');
const { parse } = require('url');
const querystring = require('querystring');
const path = require('path');
const dotenv = require('dotenv');

const app = express();

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));
const { SHOPIFY_API_KEY, REDIRECT_URI, SCOPE, SHOPIFY_API_SECRET, HOST } = process.env;
const port = parseInt(process.env.PORT, 10) || 3001;

const SHOPIFY_CONFIG = {
    'API_KEY': SHOPIFY_API_KEY,
    'API_SECRET': SHOPIFY_API_SECRET,
    'APP_HOME': HOST,
    'REDIRECT_URI': REDIRECT_URI,
    'SCOPE': SCOPE
  };
  

  app.use(express.static('public')); // Create a 'public' directory and put your CSS and images there




// ====================== Middleware below ================================
function middleware(f) {
  return function decoratedFunction(req, res, next) {
    const referer = req.headers.referer;
    if (!referer) {
      return res.status(401).json({ message: 'unauthorized' });
    }

    const parsedUrl = parse(referer);
    const queryParameters = querystring.parse(parsedUrl.query);

    const shop = queryParameters.shop || 'test_shop';

    req.shop = shop;
    return f(req, res, next);
  };
}

// ====================== Installation route below ================================
app.get('/install', middleware((req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(500).send('Error: parameter shop not found');
  }

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_CONFIG.API_KEY}&redirect_uri=${SHOPIFY_CONFIG.REDIRECT_URI}`;
  return res.redirect(authUrl);
}));



// Serve Shopify app views

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/home', (req, res) => {
  return res.send('<h2>Welcome to the home page</h2>');
});


// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
