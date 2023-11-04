const express = require("express");
const {
  createDriver,
  getAllCompanyDrivers,
} = require("../controller/driverController");

const router = express.Router();

router.post("/", createDriver);

router.get("/", getAllCompanyDrivers);

module.exports = router;
