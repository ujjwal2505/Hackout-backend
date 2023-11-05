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

const { PythonShell } = require("python-shell");

exports.createTrip = async (req, res) => {
  try {
    const {
      source,
      destination,
      name,
      scheduledTime,
      expectedDeliverTime,
      driverId,
      companyId,
      userId,
      weight,
    } = req.body;

    const trip = await Trip.create({
      name,
      source,
      destination,
      scheduledTime,
      DriverId: driverId,
      CompanyId: companyId,
      UserId: userId,
      expectedDeliverTime,
      weight,
      tripEnded: true,
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

    const upcomingTrips = await Trip.findAll({
      where: { CompanyId: companyId, scheduledTime: { [Op.gte]: new Date() } },
      include: [Driver],
    });

    const liveTrips = await Trip.findAll({
      where: { CompanyId: companyId, tripEnded: false },
      include: [Driver],
    });

    const pastTrips = await Trip.findAll({
      where: { CompanyId: companyId, path: { [Op.ne]: null }, tripEnded: true },
      include: [Driver],
    });

    return successResponse(res, "Successfully fetched all trips", {
      upcomingTrips,
      liveTrips,
      pastTrips,
    });
  } catch (error) {
    console.log(error);
    return serverErrorResponse(res);
  }
};

exports.fetchBatchTripsByCompany = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return notFoundResponse(res, "Company Id not found in query");
    }

    let trips = await Trip.findAll({
      where: { CompanyId: companyId },
      include: [Driver],
    });

    trips = trips
      .filter((el) => new Date(el.scheduledTime) >= Date.now())
      .map((el) => {
        const { id, source, destination, weight } = el;
        // console.log(id, source, destination, weight);
        return { tripId: id, source, destination, weight };
      });

    // console.log(trips);

    if (!trips.length) {
      return notFoundResponse(res, "no trips present in the future");
    }

    PythonShell.run("batching_headout.py", {
      args: [JSON.stringify(trips), process.env.MAPS_API_KEY],
    }).then((messages) => {
      console.log("finished", messages[0]);
      const validJson = messages[0].replace(/'/g, '"');
      const jsObject = JSON.parse(validJson);

      return successResponse(
        res,
        "Successfully batched upcoming trips",
        jsObject
        // [
        //   [
        //     {
        //       tripId: 5,
        //       source: {
        //         lat: 26.701358646675054,
        //         lng: 75.48562256540185,
        //       },
        //       destination: {
        //         lat: 25.07540801059919,
        //         lng: 82.97178574705691,
        //       },
        //       weight: 1000,
        //     },
        //     {
        //       tripId: 6,
        //       source: {
        //         lat: 26.5944035379648,
        //         lng: 75.84242775623534,
        //       },
        //       destination: {
        //         lat: 25.53845809266971,
        //         lng: 82.4891557947634,
        //       },
        //       weight: 300,
        //     },
        //   ],
        //   [
        //     {
        //       tripId: 8,
        //       source: {
        //         lat: 27.061541561836318,
        //         lng: 76.1171942310336,
        //       },
        //       destination: {
        //         lat: 29.852156029941664,
        //         lng: 78.33600590680298,
        //       },
        //       weight: 750,
        //     },
        //     {
        //       tripId: 7,
        //       source: {
        //         lat: 26.515784954470565,
        //         lng: 75.71059182819842,
        //       },
        //       destination: {
        //         lat: 29.927556794554288,
        //         lng: 78.45100853665144,
        //       },
        //       weight: 250,
        //     },
        //   ],
        //   [
        //     {
        //       tripId: 9,
        //       source: {
        //         lat: 30.60186367917381,
        //         lng: 75.13941179037325,
        //       },
        //       destination: {
        //         lat: 12.954659898562022,
        //         lng: 77.63686246848359,
        //       },
        //       weight: 800,
        //     },
        //   ],
        // ]
      );
    });
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

    const upcomingTrips = await Trip.findAll({
      where: { UserId: userId, scheduledTime: { [Op.gte]: new Date() } },
      include: [Driver],
    });

    const liveTrips = await Trip.findAll({
      where: { UserId: userId, tripEnded: false },
      include: [Driver],
    });

    const pastTrips = await Trip.findAll({
      where: { UserId: userId, path: { [Op.ne]: null }, tripEnded: true },
      include: [Driver],
    });

    return successResponse(
      res,
      "Successfully fetched all trips for the client",
      {
        upcomingTrips,
        liveTrips,
        pastTrips,
      }
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
      series: [
        {
          name: "On Time Arrival",
          colorByPoint: true,
          data: onTimeSeriesData,
        },
      ],
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

    const clientDistArr = [];

    Object.values(groupedData).map((el) => {
      clientDistArr.push({
        name: el.firstName + " " + el.lastName,
        y: el.totalDistance / 1000,
      });
    });

    const distanceByClients = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: "pie",
      },
      title: {
        text: "km travelled for each clients of the company",
        align: "left",
      },
      tooltip: {
        pointFormat:
          "{series.name}: <b>({point.y:.2f} km) {point.percentage:.1f}%</b>",
      },
      accessibility: {
        point: {
          valueSuffix: "km",
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: false,
          },
          showInLegend: true,
        },
      },
      series: [
        {
          name: "Value",
          colorByPoint: true,
          data: clientDistArr,
        },
      ],
    };

    return successResponse(res, "succesfully", {
      onTimeTripConfig,
      distanceByClients,
    });
  } catch (error) {
    console.log(error);
    return serverErrorResponse(res);
  }
};

// const trips = [
//   {
//     tripId: 5,
//     source: { lat: 28.234208636605853, lng: 77.33205868320063 },
//     destination: { lat: 20.583081095376528, lng: 79.59703213539039 },
//     weight: 500,
//   },
//   {
//     tripId: 6,
//     source: { lat: 29.004173642205913, lng: 75.85949922908723 },
//     destination: { lat: 21.9789773956468, lng: 78.57553789746748 },
//     weight: 500,
//   },
//   {
//     tripId: 7,
//     source: { lat: 27.277099096093625, lng: 81.89005664412944 },
//     destination: { lat: 23.257127747269138, lng: 75.47666597582126 },
//     weight: 750,
//   },
//   {
//     tripId: 8,
//     source: { lat: 28.612423089010715, lng: 77.88637750237245 },
//     destination: { lat: 20.8528659379407, lng: 79.52087823225143 },
//     weight: 750,
//   },
//   {
//     tripId: 9,
//     source: { lat: 28.782375617610533, lng: 76.46124511917708 },
//     destination: { lat: 18.157236016226136, lng: 74.84955078308683 },
//     weight: 750,
//   },
// ];

// const trips = [
//   {
//     tripId: 5,
//     source: {
//       lat: 26.701358646675054,
//       lng: 75.48562256540185,
//     },
//     destination: {
//       lat: 25.07540801059919,
//       lng: 82.97178574705691,
//     },
//     weight: 1000,
//   },
//   {
//     tripId: 6,
//     source: {
//       lat: 26.5944035379648,
//       lng: 75.84242775623534,
//     },
//     destination: {
//       lat: 25.53845809266971,
//       lng: 82.4891557947634,
//     },
//     weight: 300,
//   },
//   {
//     tripId: 7,
//     source: {
//       lat: 26.515784954470565,
//       lng: 75.71059182819842,
//     },
//     destination: {
//       lat: 29.927556794554288,
//       lng: 78.45100853665144,
//     },
//     weight: 250,
//   },
//   {
//     tripId: 8,
//     source: {
//       lat: 27.061541561836318,
//       lng: 76.1171942310336,
//     },
//     destination: {
//       lat: 29.852156029941664,
//       lng: 78.33600590680298,
//     },
//     weight: 750,
//   },
//   {
//     tripId: 9,
//     source: {
//       lat: 30.60186367917381,
//       lng: 75.13941179037325,
//     },
//     destination: {
//       lat: 12.954659898562022,
//       lng: 77.63686246848359,
//     },
//     weight: 800,
//   },
// ];
