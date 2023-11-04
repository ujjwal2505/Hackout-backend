const { Company } = require("../models");
const { successResponse, createdSuccessResponse } = require("../util/response");

exports.createCompany = async (req, res) => {
  try {
    const { name } = req.body;
    const company = await Company.create({
      name,
    });
    return createdSuccessResponse(res, "driver created", company);
  } catch (error) {
    console.log(error);
    serverErrorResponse(res);
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll();
    return successResponse(
      res,
      "Successfully fetched all companies",
      companies
    );
  } catch (error) {
    console.log(error);
    serverErrorResponse(res);
  }
};
