const Crypto = require("../models/Crypto");

async function listAll(req, res) {
  try {
    const items = await Crypto.find().sort({ name: 1 }).lean();
    return res.json({
      success: true,
      count: items.length,
      data: items.map(mapCrypto),
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Could not load cryptocurrencies.",
    });
  }
}

async function listGainers(req, res) {
  try {
    const items = await Crypto.find().sort({ change24h: -1 }).lean();
    return res.json({
      success: true,
      count: items.length,
      data: items.map(mapCrypto),
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Could not load top gainers.",
    });
  }
}

async function listNew(req, res) {
  try {
    const items = await Crypto.find().sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      count: items.length,
      data: items.map(mapCrypto),
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Could not load new listings.",
    });
  }
}

async function createCrypto(req, res) {
  try {
    const { name, symbol, price, image, change24h } = req.body;
    if (
      name == null ||
      symbol == null ||
      price == null ||
      image == null ||
      change24h == null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: name, symbol, price, image, change24h (24h change %).",
      });
    }
    const priceNum = Number(price);
    const changeNum = Number(change24h);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a non-negative number.",
      });
    }
    if (Number.isNaN(changeNum)) {
      return res.status(400).json({
        success: false,
        message: "change24h must be a number (e.g. 2.5 for +2.5%).",
      });
    }
    const doc = await Crypto.create({
      name: String(name).trim(),
      symbol: String(symbol).trim(),
      price: priceNum,
      image: String(image).trim(),
      change24h: changeNum,
    });
    return res.status(201).json({
      success: true,
      message: "Cryptocurrency added.",
      data: mapCrypto(doc.toObject()),
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Could not add cryptocurrency.",
    });
  }
}

function mapCrypto(c) {
  return {
    id: c._id,
    name: c.name,
    symbol: c.symbol,
    price: c.price,
    image: c.image,
    change24h: c.change24h,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

module.exports = {
  listAll,
  listGainers,
  listNew,
  createCrypto,
};
