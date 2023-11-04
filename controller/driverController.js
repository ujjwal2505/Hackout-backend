const { Driver, Company } = require("../models");
const { encryptPassword } = require("../util/util");
const {
  createdSuccessResponse,
  serverErrorResponse,
  successResponse,
  notFoundResponse,
} = require("../util/response");

exports.createDriver = async (req, res) => {
  try {
    const { firstName, lastName, email, password, company_id } = req.body;

    const hashedPassword = await encryptPassword(password);

    const driver = await Driver.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      CompanyId: company_id,
    });

    return createdSuccessResponse(res, "driver created", driver);
  } catch (error) {
    console.log(error);
    serverErrorResponse(res);
  }
};

exports.getAllCompanyDrivers = async (req, res) => {
  try {
    const companyId = req.query.companyId;
    const company = await Company.findByPk(companyId);

    if (!company) {
      return notFoundResponse(res, "Company Not Found");
    }

    const drivers = await Driver.findAll({
      where: { CompanyId: companyId },
      attributes: { exclude: ["password"] },
    });
    return successResponse(
      res,
      "successfully fetched company drivers",
      drivers
    );
  } catch (error) {
    console.log(error);
    serverErrorResponse(res);
  }
};
