// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const authRoutes = require("./routes/authRoutes");
const assetRoutes = require('./routes/assetRoutes');
const commentRoutes = require('./routes/commentRoutes');
const WebSocket = require('ws');
const http = require('http');
const axios = require('axios');
const cors = require('cors'); // Added CORS support
const axiosRateLimit = require('axios-rate-limit'); // For rate limiting API calls

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET || !process.env.FINNHUB_API_KEY) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Asset Routes
app.use(assetRoutes);

// Comment Routes
app.use(commentRoutes); // Use comment routes

// Root path response
app.get("/", (req, res) => {
  res.render("index");
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Axios instance for Finnhub API with rate limiting
const httpFinnhub = axiosRateLimit(axios.create(), { maxRPS: 30 });

wss.on('connection', function connection(ws) {
  console.log('A new client connected');
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  const fetchAndBroadcastAssetPrices = () => {
    fetchRealTimeAssetPrices().then(prices => {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(prices));
          console.log('Broadcasted asset prices to clients');
        }
      });
    }).catch(err => {
      console.error('Failed to fetch or broadcast asset prices: ', err);
      console.error(err.stack);
    });
  };

  const intervalId = setInterval(fetchAndBroadcastAssetPrices, 15 * 60 * 1000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(intervalId);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

async function fetchRealTimeAssetPrices() {
  try {
    const symbols = ['IBM', 'AAPL', 'GOOGL']; // Add more symbols as needed
    let prices = [];
    for (const symbol of symbols) {
      const response = await httpFinnhub.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`);
      if (response.status === 200 && response.data) {
        console.log("Real-time asset prices fetched successfully for", symbol);
        const price = response.data.c; // Current price
        prices.push({ asset: symbol, price });
      } else {
        console.error("Failed to fetch real-time asset prices for", symbol, ": Status code", response.status);
      }
    }
    return prices;
  } catch (err) {
    console.error("Error fetching real-time asset prices:", err.message);
    console.error(err.stack);
    return []; // Return an empty array on error
  }
}