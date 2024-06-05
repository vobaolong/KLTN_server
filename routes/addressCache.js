const express = require("express");
const router = express.Router();

const {
  getAddressCache,
  getProvinces,
} = require("../controllers/addressCache");

router.get("/cacheAddress/:address", getAddressCache);
router.get("/getProvinces", getProvinces);

module.exports = router;
