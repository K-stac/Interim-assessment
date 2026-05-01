const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const {
  listAll,
  listGainers,
  listNew,
  createCrypto,
} = require("../controllers/cryptoController");

const router = express.Router();

router.get("/", listAll);
router.get("/gainers", listGainers);
router.get("/new", listNew);
router.post("/", authMiddleware, createCrypto);

module.exports = router;
