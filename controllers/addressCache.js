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

exports.getProvinces = async (req, res) => {
  const addressInfo = await AddressCache.find();
  const map = [];
  addressInfo.forEach((a) => {
    if (!map.includes(a.provinceName) && a.provinceName) {
      map.push(a.provinceName);
    }
  });

  if (addressInfo) {
    return res.status(200).json(map);
  }

  return res.status(200).json({ error: "not found" });
};
