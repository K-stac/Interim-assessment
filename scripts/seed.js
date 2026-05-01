require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Crypto = require("../models/Crypto");

const samples = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    price: 97250.5,
    image: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    change24h: 1.85,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    price: 3450.2,
    image: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    change24h: 2.4,
  },
  {
    name: "Solana",
    symbol: "SOL",
    price: 188.75,
    image: "https://cryptologos.cc/logos/solana-sol-logo.png",
    change24h: -0.6,
  },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Set MONGODB_URI in .env");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const count = await Crypto.countDocuments();
  if (count > 0) {
    console.log("Crypto collection already has data; skipping seed.");
  } else {
    await Crypto.insertMany(samples);
    console.log(`Seeded ${samples.length} cryptocurrencies.`);
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
