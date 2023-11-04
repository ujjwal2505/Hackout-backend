const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.SQL_DB_NAME,
  process.env.SQL_USERNAME,
  process.env.SQL_PASSWORD,
  {
    host: "localhost",
    dialect:
      "mysql" /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */,
    logging: false,
  }
);
try {
  sequelize.authenticate();
  // console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Driver = require("./driver")(sequelize, DataTypes);
db.Company = require("./company")(sequelize, DataTypes);
db.Trip = require("./trip")(sequelize, Sequelize, DataTypes);
db.User = require("./user")(sequelize, DataTypes);

db.Company.hasMany(db.Driver);
db.Driver.belongsTo(db.Company);

db.Company.hasMany(db.Trip);
db.Trip.belongsTo(db.Company);

db.Driver.hasMany(db.Trip);
db.Trip.belongsTo(db.Driver);

db.Company.hasMany(db.User);
db.User.belongsTo(db.Company);

db.User.hasMany(db.Trip);
db.Trip.belongsTo(db.User);

module.exports = db;
