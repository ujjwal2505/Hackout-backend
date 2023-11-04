const {
  Trip,
  Driver,
  Company,
  sequelize,
  Sequelize,
  User,
} = require("../models");
const { Op } = require("sequelize");
const {
  successResponse,
  createdSuccessResponse,
  serverErrorResponse,
  notFoundResponse,
} = require("../util/response");

exports.createTrip = async (req, res) => {
  try {
    const {
      source,
      destination,
      name,
      scheduledTime,
      driverId,
      companyId,
      userId,
    } = req.body;

    const trip = await Trip.create({
      name,
      source,
      destination,
      scheduledTime,
      DriverId: driverId,
      CompanyId: companyId,
      UserId: userId,
    });

    return createdSuccessResponse(res, "Trip Successfully Created", trip);
  } catch (error) {
    console.log(error);
    return serverErrorResponse(res);
  }
};

exports.fetchTripsByCompany = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return notFoundResponse(res, "Company Id not found in query");
    }

    const trips = await Trip.findAll({
      where: { CompanyId: companyId },
      include: [Driver],
    });

    return successResponse(res, "Successfully fetched all trips", trips);
  } catch (error) {
    console.log(error);
    return serverErrorResponse(res);
  }
};

exports.fetchTripsByClient = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return notFoundResponse(res, "userId not found in body ");
    }

    const trips = await Trip.findAll({
      where: { UserId: userId },
      include: [Driver],
    });

    return successResponse(
      res,
      "Successfully fetched all trips for the client",
      trips
    );
  } catch (error) {
    console.log(error);
    return serverErrorResponse(res);
  }
};

exports.fetchTripsByDriver = async (req, res) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return notFoundResponse(res, "userId not found in body ");
    }

    const trips = await Trip.findAll({
      where: { DriverId: driverId },
      // include: [Driver],
    });

    return successResponse(
      res,
      "Successfully fetched all trips for the driver",
      trips
    );
  } catch (error) {
    console.log(error);
    return serverErrorResponse(res);
  }
};

exports.fetchTripsById = async (req, res) => {
  try {
    const { id: tripId } = req.params;

    if (!tripId) {
      return notFoundResponse(res, "Trip Id not found");
    }

    const trips = await Trip.findByPk(tripId, {
      include: [Driver],
    });

    return successResponse(res, "Successfully fetched all trips", trips);
  } catch (error) {
    console.log(error);
    return serverErrorResponse(res);
  }
};

exports.analytics = async (req, res) => {
  try {
    // 1. ontime delivery trips based on each company trips for all clients grouped by day.

    const { companyId, client_id } = req.body;

    const onTimeTrips = await Trip.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("scheduledTime")), "day"],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal(`
          CASE
            WHEN JSON_UNQUOTE(JSON_EXTRACT(path, CONCAT('$[', JSON_LENGTH(path) - 1, '].timestamp'))) <= expectedDeliverTime
            THEN 1
            ELSE NULL
          END
        `)
          ),
          "onTimeCount",
        ],
      ],
      where: {
        companyId: companyId,
      },
      group: [sequelize.fn("DATE", sequelize.col("scheduledTime"))],
      order: [sequelize.fn("DATE", sequelize.col("scheduledTime"))],
    });

    if (!onTimeTrips) {
      return notFoundResponse(
        res,
        "no onTimeTrips were on time for this company id"
      );
    }

    const onTimeSeriesData = onTimeTrips.map((el) => {
      el = el.toJSON();
      return [new Date(el.day).getTime(), el.onTimeCount];
    });

    const onTimeTripConfig = {
      title: {
        text: "Ontime Count",
      },
      xAxis: {
        type: "datetime",
        title: {
          text: "Day",
        },
      },
      yAxis: {
        title: {
          text: "Ontime Count",
        },
      },
      series: onTimeSeriesData,
    };

    // 2. Total distance covered for all all clients in a company
    const distance = await Trip.findAll({
      where: { companyId: companyId },
      include: [User],
    });

    const groupedData = distance.reduce((result, record) => {
      const userId = record.UserId;
      if (!result[userId]) {
        result[userId] = {
          ...record.toJSON().User,
          totalDistance: 0,
        };
      }
      result[userId].totalDistance += record.distance;
      return result;
    }, {});

    return successResponse(res, "succesfully", {
      onTimeTripConfig,
      groupedData,
    });
  } catch (error) {
    console.log(error);
    return serverErrorResponse(res);
  }
};
