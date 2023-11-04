const express = require("express");
const {
  createCompany,
  getAllCompanies,
} = require("../controller/companyController");

const router = express.Router();

router.get("/", getAllCompanies);
router.post("/", createCompany);

module.exports = router;
