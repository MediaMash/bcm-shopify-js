// Import required modules and packages
const express = require('express');
const { parse } = require('url');
const querystring = require('querystring');
const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const next = require('next');
const dotenv = require('dotenv');
// const { ShopifyAuth, verifyRequest } = require('@shopify/koa-shopify-auth');
// const { receiveWebhook, registerWebhook } = require('@shopify/koa-shopify-webhooks');
// const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');
// const { graphqlProxy } = require('@shopify/koa-shopify-graphql-proxy');

// const { session: sessionStorage } = require('@shopify/koa-shopify-graphql-proxy');
// const { Page, Form, Layout, Card, Button, TextField, Heading } = require('@shopify/polaris');

dotenv.config();

// Load environment variables
const { SHOPIFY_API_KEY, REDIRECT_URI, SCOPE, SHOPIFY_API_SECRET, HOST } = process.env;
const port = parseInt(process.env.PORT, 10) || 3001;
// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
const handle = app.getRequestHandler();

const appExpress = express();
// Create a new Koa server and a router
const server = new Koa();
const router = new Router();

// Configure the Shopify authentication
server.keys = [SHOPIFY_API_SECRET];



const SHOPIFY_CONFIG = {
    'API_KEY': SHOPIFY_API_KEY,
    'API_SECRET': SHOPIFY_API_SECRET,
    'APP_HOME': HOST,
    'REDIRECT_URI': REDIRECT_URI,
    'SCOPE': SCOPE
  };
  

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
//   app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'views', 'index.html'));
//   });
  
  app.get('/', (req, res) => {
    return res.send('<h2>Welcome to the home page</h2>');
  });
  
  
  // Start the server on port 3000
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  

// Route for the main page with the user interface
router.get('/', verifyRequest(), async (ctx) => {
  await app.render(ctx.req, ctx.res, '/index', ctx.query);
  ctx.respond = false;
});

// Route for handling the form submission
router.post('/', verifyRequest(), async (ctx) => {
  const { shop, accessToken } = ctx.session;
  const { videoUrl } = ctx.request.body;

  // Update the theme settings with the provided video URL
  await updateThemeSettings(shop, accessToken, videoUrl);

  ctx.redirect('/');
});

// Function to update theme settings
const updateThemeSettings = async (shop, accessToken, videoUrl) => {
  const Shopify = require('shopify-api-node');
  const shopify = new Shopify({
    shopName: shop,
    accessToken: accessToken,
  });

  // Fetch the current theme
  const [theme] = await shopify.theme.list();

  // Update the theme settings
  await shopify.theme.update(theme.id, {
    admin_graphql_api_id: theme.admin_graphql_api_id,
    theme_store_id: theme.theme_store_id,
    name: theme.name,
    role: theme.role,
    src: theme.src,
    settings: [
      {
        name: 'video_url',
        value: videoUrl,
      },
    ],
  });

  console.log('Theme settings updated successfully!');
};

// Use the router
server.use(router.routes());
server.use(router.allowedMethods());

// Start the server on port 3000

server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
  
// app.listen(port, () => {
//   console.log(`> Ready on http://localhost:${port}`);
// });
