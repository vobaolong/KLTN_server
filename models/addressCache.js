const mongoose = require("mongoose");

const addressCacheSchema = new mongoose.Schema({
  provinceID: {
    type: String,
    required: true,
  },
  districtID: {
    type: String,
    required: true,
  },
  wardID: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("AddressCache", addressCacheSchema);
