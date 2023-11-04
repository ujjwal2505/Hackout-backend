const { User } = require("../models");
const { ROLES } = require("../util/constant");
const {
  successResponse,
  serverErrorResponse,
  badRequestResponse,
  createdSuccessResponse,
} = require("../util/response");

exports.createClient = async (req, res) => {
  try {
    const { company_id, firstName, lastName, email, password } = req.body;

    if (!email || !password) {
      return badRequestResponse(res, "email or password is missing");
    }

    let encodedPassword = await encryptPassword(password);
    const client = await User.create({
      firstName,
      lastName,
      role: ROLES.CLIENT,
      email,
      password: encodedPassword,
      CompanyId: company_id,
    });

    return createdSuccessResponse(
      res,
      `Client register for company id ${company_id}`,
      client
    );
  } catch (error) {
    console.log(error);
    serverErrorResponse(res);
  }
};

exports.getAllClientsByCompany = async (req, res) => {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return badRequestResponse(res, "Company Id not found");
    }

    const clients = await User.findAll({
      where: {
        CompanyId: company_id,
        role: ROLES.CLIENT,
      },
    });

    return successResponse(
      res,
      `Successfully fetched all clients for the company id ${company_id}`,
      clients
    );
  } catch (error) {
    console.log(error);
    serverErrorResponse(res);
  }
};
