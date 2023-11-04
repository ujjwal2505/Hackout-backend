const { getDistanceBetweenCoordinates } = require("./util");

const stoppageThresholdMeters = 10;
const stoppageDurationMinutes = 1;

let mp = {};
exports.tripEvents = (payload, oldPayload) => {
  //overspeeding
  if (payload.speed >= 23) {
    payload.overspeed = true;
  }

  // vehicle Stoppage
  if (oldPayload) {
    dist = getDistanceBetweenCoordinates(
      payload.lat,
      payload.lng,
      oldPayload.lat,
      oldPayload.lng
    );

    console.log("distance", dist);

    if (dist <= stoppageThresholdMeters) {
      if (!mp[payload.tripId]?.vehicleStopageTimestamp) {
        mp[payload.tripId] = { vehicleStopageTimestamp: oldPayload.timestamp };
      }
      if (
        payload.timestamp - mp[payload.tripId].vehicleStopageTimestamp >=
        stoppageDurationMinutes * 60 * 1000
      ) {
        payload.vehicleStopage = true;
        mp[payload.tripId].vehicleStopageTimestamp = payload.timestamp;
      }
    } else {
      mp[payload.tripId] = { vehicleStopageTimestamp: false };
    }
  }
};
