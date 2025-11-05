// ====== IMPORTS ======
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// ====== APP SETUP ======
const app = express();
const PORT = process.env.PORT || 3001;

// ====== MIDDLEWARE ======
app.use(cors());
app.use(express.json());

// ====== MOCK QUOTES (Fallback) ======
const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" }
];

// ====== API ENDPOINTS ======

// 🌤 1. WEATHER API
app.get('/api/weather', async (req, res) => {
  try {
    const city = req.query.city || 'London';
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Weather API key not configured" });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const weatherData = {
      city: response.data.name,
      temp: Math.round(response.data.main.temp),
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      icon: response.data.weather[0].icon
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Weather API Error:', error.message);
    res.status(500).json({ error: "Could not fetch weather data. Please check the city name." });
  }
});

// 💱 2. CURRENCY CONVERTER API
app.get('/api/currency', async (req, res) => {
  try {
    const amount = parseFloat(req.query.amount) || 1000;
    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/INR');

    const rates = {
      inr: amount,
      usd: (amount * response.data.rates.USD).toFixed(2),
      eur: (amount * response.data.rates.EUR).toFixed(2),
      gbp: (amount * response.data.rates.GBP).toFixed(2),
      timestamp: new Date().toISOString()
    };

    res.json(rates);
  } catch (error) {
    console.error('Currency API Error:', error.message);
    res.status(500).json({ error: "Could not fetch exchange rates. Please try again later." });
  }
});

// 💬 3. QUOTE GENERATOR API
app.get('/api/quote', async (req, res) => {
  try {
    const response = await axios.get('https://api.quotable.io/random');
    res.json({
      text: response.data.content,
      author: response.data.author
    });
  } catch (error) {
    console.error('Quote API Error:', error.message);
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json(randomQuote);
  }
});

// 🩺 4. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   🌤 Weather:  http://localhost:${PORT}/api/weather?city=London`);
  console.log(`   💱 Currency: http://localhost:${PORT}/api/currency?amount=1000`);
  console.log(`   💬 Quote:    http://localhost:${PORT}/api/quote`);
});
