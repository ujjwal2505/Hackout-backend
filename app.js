const express = require("express");
const http = require("http");
const morgan = require("morgan");
require("dotenv").config();
const { sequelize } = require("./models");
const cors = require("cors");
const driverRoutes = require("./routes/driverRoutes");
const companyRoutes = require("./routes/companyRoutes");
const tripRoutes = require("./routes/tripRoutes");
const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const { Server } = require("socket.io");

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use("/api/v1/driver", driverRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/trip", tripRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/client", clientRoutes);

const server = http.createServer(app);
const NODE_ENV = process.env.NODE_ENV || "development";
const port = process.env.PORT || 8000;
const fs = require("fs");
const { writeDataToFile } = require("./util/util");
const { tripEvents } = require("./util/tripEvents");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const { insertTripData, subscribeToTrip, onDisconnect } =
  require("./socketHandler/tripDataHandler")(io);

const onConnection = (socket) => {
  console.log("A client has connected.");

  let mp = {}; //old Payload
  socket.on("welcome", (payload) => {
    try {
      payload = JSON.parse(payload);
      // payload.timestamp = new Date(payload.timestamp).getTime();
      console.log(payload);
      const { tripId } = payload;
      if (!tripId) return;

      tripEvents(payload, mp[tripId]);
      mp[tripId] = payload;

      writeDataToFile(`tripData-${tripId}.txt`, payload);

      console.log("payload", payload);
      // socket.emit("welcome", `sent ${payload}`);
    } catch (error) {
      console.log("hello", error);
    }
  });

  socket.on("driverLocation", insertTripData);
  socket.on("subscribeToTrip", subscribeToTrip);
  socket.on("stopDriverLocation", onDisconnect);

  // socket.on("disconnect", (socket) => {
  //   delete mp[socket.id];
  //   onDisconnect(socket);
  // });

  socket.on("disconnect", onDisconnect);
};

io.on("connection", onConnection);

sequelize
  .sync()
  .then(() => {
    console.log("[CONNECTED TO DATABASE]");
    server.listen(port, () =>
      console.info(`[LISTENING ON PORT:${port} ENV:${NODE_ENV}]`)
    );
  })
  .catch((err) => {
    console.error("Failed to connect to db", err);
  });
