const db = require("../db");

exports.getSnapshots = (req, res, next) => {
  db.query('SELECT data FROM v_nft_data ', (error, results) => {
    if (error) {
      return next(error);
    }
    res.status(200).json(results.rows[0].data)
  })
}