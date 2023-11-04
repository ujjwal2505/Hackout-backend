const express = require("express");

const {
  getAllClientsByCompany,
  createClient,
} = require("../controller/clientController");

const router = express.Router();

router.post("/", createClient);
router.get("/", getAllClientsByCompany);

module.exports = router;
