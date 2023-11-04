const express = require("express");
const {
  createTrip,
  fetchTripsByCompany,
  analytics,
  fetchTripsById,
  fetchTripsByClient,
  fetchTripsByDriver,
} = require("../controller/tripController");

const router = express.Router();

router.get("/", fetchTripsByCompany);
router.get("/:id", fetchTripsById);
router.post("/", createTrip);
router.post("/client", fetchTripsByClient);
router.post("/driver", fetchTripsByDriver);
router.post("/analytics", analytics);

module.exports = router;
