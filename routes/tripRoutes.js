const express = require("express");
const {
  createTrip,
  fetchTripsByCompany,
  analytics,
  fetchTripsById,
  fetchTripsByClient,
  fetchTripsByDriver,
  fetchBatchTripsByCompany,
} = require("../controller/tripController");

const router = express.Router();

router.get("/", fetchTripsByCompany);
router.post("/batch", fetchBatchTripsByCompany);
router.get("/:id", fetchTripsById);
router.post("/", createTrip);
router.post("/client", fetchTripsByClient);
router.post("/driver", fetchTripsByDriver);
router.post("/analytics", analytics);

module.exports = router;
