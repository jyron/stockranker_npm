# StockRanker

StockRanker is a Progressive Web App (PWA) designed to enhance the experience of financial asset tracking across web and mobile platforms. It offers a comprehensive list of stocks and cryptocurrencies, allowing users to vote on these assets and engage in community discussions. The app aims to provide a seamless, engaging, and optimized experience for mobile users, featuring real-time or near-real-time updates on financial data.

## Overview

StockRanker utilizes a mixture of modern web technologies including Node.js and Express for backend operations, MongoDB for database management, and EJS, Bootstrap, and Vanilla JavaScript for the frontend. The application employs service workers and a web app manifest to offer offline functionality and a full-screen app-like experience. Real-time data updates are facilitated through integration with the AlphaVantage API, and the app supports email/password authentication for voting and commenting functionalities.

## Features

- Real-time or near-real-time financial data updates
- User registration and login for personalized experiences
- Anonymous and registered user commenting
- Voting system for financial assets
- Searchable and detailed financial asset information
- Mobile-optimized design for ease of use on various devices

## Getting started

### Requirements

- Node.js
- MongoDB
- An internet connection for API calls and real-time updates

### Quickstart

1. Clone the repository to your local machine.
2. Install the required dependencies by running `npm install` in the project directory.
3. Set up your `.env` file based on the `.env.example` provided. Make sure to include your AlphaVantage API key.
4. Start the application using `npm start`.
5. Navigate to `http://localhost:3000` in your web browser to view the app.

### License

Copyright (c) 2024.