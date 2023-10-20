const { exit } = require('process');

async function addUser() {
  console.log('start');
}

addUser();

// Hint: to run as one-shot the PG parameters must be set as env variables
(async () => {
  
  const axios = require('axios');
  const pool = require("./db");
  
  const now = new Date();
  
  try {

    // get Sol rates
    const coinUrl = 'https://api.coinpaprika.com/v1/price-converter?base_currency_id=sol-solana&amount=1&quote_currency_id='
    const [resUsd, resEur] = await axios.all([
      axios.get(coinUrl + 'usd-us-dollars'),
      axios.get(coinUrl + 'eur-euro')
    ]);
    const solUsd = resUsd.data.price;
    const solEur = resEur.data.price;
    console.log('price', solUsd, solEur);


    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query('INSERT INTO SNAPSHOTS(snapshot_date, sol_usd, sol_eur) VALUES ($1, $2, $3)', [now, solUsd, solEur]);

      const res = await client.query('SELECT * FROM nfts ORDER BY id');
      //console.log(res.rows);
      const lamportsPerSol = 1000000000;
      for (let row of res.rows) {
        // wait 2 seconds to comply with ME rate limits
        await new Promise(r => setTimeout(r, 2000));
        
        const resSymbol = await axios.get('https://api-mainnet.magiceden.dev/v2/collections/' + row.symbol + '/');
        await client.query('INSERT INTO snapshots_nfts(snapshot_date, nft, floor_price, listed_count, avg_price_24_hrs, volume_all) VALUES ($1, $2, $3, $4, $5, $6)',
                            [now, row.id, (resSymbol.data.floorPrice / lamportsPerSol), resSymbol.data.listedCount, (resSymbol.data.avgPrice24hr / lamportsPerSol), (resSymbol.data.volumeAll / lamportsPerSol)]);
        await client.query('UPDATE nfts SET floor_price = $1, listed_count = $2, avg_price_24_hrs = $3, volume_all = $4 WHERE id = $5',
                            [(resSymbol.data.floorPrice / lamportsPerSol), resSymbol.data.listedCount, (resSymbol.data.avgPrice24hr / lamportsPerSol), (resSymbol.data.volumeAll / lamportsPerSol), row.id]);
        console.log(row.symbol, (resSymbol.data.floorPrice / lamportsPerSol));
      }
      await client.query('COMMIT');
    } catch (e) {
      console.error(e);
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  } catch (error) {
    console.log('oops!', error);
    throw error;
  }

})().finally(() => {
  console.log('done!');
  exit();
});
