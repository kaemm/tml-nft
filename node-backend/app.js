const express = require('express');
const bodyParser = require('body-parser');

const nftRoutes = require('./nft/routes');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.json({
    'status': 500,
    'message': err.message,
    'error': err
  });
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const allowedOrigins = ['https://kaemm.com', 'https://kaemm.net', 'http://192.168.1.2:8000', 'http://192.168.1.2:8083', 'http://localhost:8100'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  //res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
})

app.use('/nft', nftRoutes);

app.use(errorHandler);

app.use((req, res, next) => {
  res.status(404).json({
    'error': {
      'status': 404,
      'message': 'cannot ' + req.method + ' ' + req.path
    }
  });
});

module.exports = app;
