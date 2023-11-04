module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define("Company", {
    name: { type: DataTypes.STRING },
  });

  return Company;
};
