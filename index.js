// index.js
// where your node app starts
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

const dateSchema = new mongoose.Schema({
  unix: { type: Number, required: true },
  utc: { type: String, required: true }
});

const DateModel = mongoose.model('Date', dateSchema);

// API endpoint to handle date requests
app.get("/api/:date?", function (req, res) {
  const dateParam = req.params.date;
  let date;

  if (!dateParam) {
    date = new Date();
  } else if (/^\d+$/.test(dateParam)) {
    // If the date is a number, treat it as a Unix timestamp
    date = new Date(parseInt(dateParam));
  } else {
    // Otherwise, treat it as a date string
    date = new Date(dateParam);
  }

  if (isNaN(date.getTime())) {
    return res.json({ error: "Invalid Date" });
  }

  const unix = date.getTime();
  const utc = date.toUTCString();

  // Save to MongoDB
  const dateEntry = new DateModel({ unix, utc });
  dateEntry.save()
    .then(() => res.json({ unix, utc }))
    .catch(err => res.status(500).json({ error: "Database error" }));
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
