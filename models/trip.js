const { getDistanceBetweenCoordinates } = require("../util/util");

module.exports = (sequelize, Sequelize, DataTypes) => {
  const Trip = sequelize.define("Trip", {
    name: { type: DataTypes.STRING, allowNull: false },
    scheduledTime: { type: DataTypes.DATE },
    expectedDeliverTime: {
      type: DataTypes.DATE,
    },
    source: {
      type: DataTypes.JSON,
    },
    destination: {
      type: DataTypes.JSON,
    },
    path: {
      type: DataTypes.JSON,
    },
    tripEnded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    weight: { type: DataTypes.INTEGER },
    distance: {
      type: DataTypes.VIRTUAL,
      get() {
        const path = this.get("path");
        let totalDistance = 0;

        if (path && path.length > 1) {
          for (let i = 1; i < path.length; i++) {
            const lat1 = path[i - 1].lat;
            const lng1 = path[i - 1].lng || path[i - 1].long;
            const lat2 = path[i].lat;
            const lng2 = path[i].lng || path[i].long;

            const dist =
              lat1 && lng1 && lat2 && lng2
                ? getDistanceBetweenCoordinates(lat1, lng1, lat2, lng2)
                : 0;
            totalDistance += dist;
          }
        }
        return totalDistance;
      },
    },
  });

  // sequelize.define("distance", {
  //   type: DataTypes.VIRTUAL,
  //   get() {
  //     const path = this.get("path");
  //     let totalDistance = 0;

  //     if (path && path.length > 1) {
  //       for (let i = 1; i < path.length; i++) {
  //         const lat1 = path[i - 1].lat;
  //         const lng1 = path[i - 1].long;
  //         const lat2 = path[i].lat;
  //         const lng2 = path[i].long;

  //         const dist = getDistanceBetweenCoordinates(lat1, lng1, lat2, lng2);

  //         totalDistance += dist;
  //       }
  //     }
  //     return totalDistance;
  //   },
  // });

  return Trip;
};
