const mongoose = require("mongoose");

const cryptoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true, trim: true },
    change24h: { type: Number, required: true },
  },
  { timestamps: true }
);

cryptoSchema.index({ change24h: -1 });
cryptoSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Crypto", cryptoSchema);
