const express = require("express");
const router = express.Router();

const { getAddressCache } = require("../controllers/addressCache");

router.get("/cacheAddress/:address", getAddressCache);

module.exports = router;
