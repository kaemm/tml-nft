const express = require('express');
const router = express.Router();
const NFTController = require("./controllers/nft");

router.get("", NFTController.getSnapshots);

module.exports = router;
