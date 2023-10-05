async function getData() {
  const res = await fetch('https://api.kaemm.net/nft/');
  return res.json();
}