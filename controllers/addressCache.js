const AddressCache = require("../models/addressCache");

exports.getAddressCache = async (req, res) => {
  const { address } = req.params;

  const addressInfo = await AddressCache.findOne({
    address,
  });

  if (addressInfo) {
    return res.status(200).json(addressInfo);
  }

  return res.status(200).json({ error: "not found" });
};
