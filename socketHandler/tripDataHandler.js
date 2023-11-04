const { Trip } = require("../models");
const { ROLES } = require("../util/constant");
const { notFoundResponse } = require("../util/response");
const { tripEvents } = require("../util/tripEvents");
const { writeDataToFile, readDataFromFile } = require("../util/util");
const AWS = require("aws-sdk");
const fs = require("fs");

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_BUCKET_REGION,
// });

let oldPayloadMap = {}; //old Payload Map

module.exports = (io) => {
  const insertTripData = async function (payload) {
    try {
      const socket = this;
      payload = JSON.parse(payload);
      const { tripId } = payload;
      if (!tripId) return;

      console.log(socket.tripId);

      tripEvents(payload, oldPayloadMap[tripId]);
      oldPayloadMap[tripId] = payload;
      io.to("room" + tripId).emit("tripLocationUpdate", payload);

      const fileName = `tripData-${tripId}.txt`;
      await writeDataToFile(fileName, payload);

      console.log(`Trip data saved to the file for the tripId ${tripId}`);
    } catch (error) {
      console.error("Error storing trip data:", error);
    }
  };

  const subscribeToTrip = async function (payload) {
    try {
      payload = JSON.parse(payload);
      const { tripId, from } = payload;
      console.log(payload);
      const socket = this;
      socket.join("room" + tripId);
      console.log(`Socket ${socket.id} subscribed to trip: ${tripId}`);

      socket.tripId = tripId;
      socket.from = from;

      const trip = await Trip.findByPk(tripId);
      if (from === ROLES.DRIVER) {
        await Trip.update(
          { tripEnded: false },
          {
            where: { id: tripId },
          }
        );

        console.log("tripEnded status changed to live");
      } else {
        let arr = [];
        if (trip.path) {
          arr = trip.path;
        }
        const localFileName = `tripData-${tripId}.txt`;
        const fileData = await readDataFromFile(localFileName);

        arr = [...arr, ...fileData];
        io.to("room" + tripId).emit("join", arr);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onDisconnect = async function (reason) {
    try {
      const socket = this;
      console.log("disconnect tripId", socket.tripId, socket.from);
      delete oldPayloadMap[socket.tripId];
      if (socket.tripId && socket.from === ROLES.DRIVER) {
        const tripId = socket.tripId;
        const localFileName = `tripData-${tripId}.txt`;
        // const awsFileName = `tripData-${tripId}-${Date.now()}.txt`;

        const trip = await Trip.findByPk(tripId);

        if (!trip) {
          return notFoundResponse(
            res,
            `Trip with id ${id} attempting to disconnect not found`
          );
        }

        const fileData = await readDataFromFile(localFileName);

        if (!fileData.length) {
          return;
        }

        const tripPath = trip.path || [];
        tripPath.push(...fileData);

        await Trip.update(
          { path: tripPath, tripEnded: true },
          {
            where: { id: tripId },
          }
        );

        fs.unlink(localFileName, (err) => {
          if (err) throw err;
          console.log(`${localFileName} was deleted`);
        });

        // const params = {
        //   Bucket: process.env.AWS_BUCKET_NAME,
        //   Key: awsFileName,
        //   Body: data,
        //   // ACL: "public-read",
        // };

        // s3.putObject(params, function (err, data) {
        //   if (err) {
        //     console.log(err);
        //   } else {
        //     console.log("Successfully uploaded data to myBucket/myKey", data);
        //   }
        // });

        // Retrieve the file from S3

        // const params2 = {
        //   Bucket: process.env.AWS_BUCKET_NAME,
        //   Key: fileName, // Use the filename to retrieve the file
        // };
        // s3.getObject(params2, (err, data2) => {
        //   if (err) {
        //     console.error("Error retrieving file from S3:\n", err);
        //   }
        //   console.log(data2);
        //   const buf = data2.Body.toString("utf-8");
        //   console.log(buf);
        // });
      }
      console.log("A client has disconnected.", reason);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    insertTripData,
    subscribeToTrip,
    onDisconnect,
  };
};
