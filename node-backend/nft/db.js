const pg = require('pg');

// Set parser for float values to be represented as numbers in json
pg.types.setTypeParser(1700, x => parseFloat(x));

const Pool = pg.Pool
const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PW,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DB_NFT,
})

module.exports = pool;