const finnhub = require('finnhub');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.FINNHUB_API_KEY;
const finnhubClient = new finnhub.DefaultApi();

const fetchIcon = (stockSymbol) => {
  const profileEndpoint = `https://finnhub.io/api/v1/stock/profile2?symbol=${stockSymbol}&token=${process.env.FINNHUB_API_KEY}`;

  axios.get(profileEndpoint)
    .then(response => {
      if (response.data.logo) {
        axios({
          method: 'get',
          url: response.data.logo,
          responseType: 'stream'
        }).then(res => {
          const filePath = path.join(__dirname, `../public/icons/${stockSymbol}-icon.png`);
          const writer = fs.createWriteStream(filePath);
          res.data.pipe(writer);

          writer.on('finish', () => console.log(`Icon for ${stockSymbol} has been fetched and saved successfully.`));
          writer.on('error', (err) => console.error(`Error saving the icon for ${stockSymbol}:`, err));
        }).catch(err => console.error(`Error fetching the logo image for ${stockSymbol}:`, err));
      } else {
        console.log(`No logo URL found for ${stockSymbol}.`);
      }
    })
    .catch(err => console.error(`Error fetching logo URL for ${stockSymbol}:`, err));
};

module.exports = { fetchIcon };