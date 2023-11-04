const { User, Company, Driver } = require("../models");
const { encryptPassword, decryptPassword } = require("../util/util");
const {
  createdSuccessResponse,
  notFoundResponse,
  accessDeniedResponse,
  successResponse,
  serverErrorResponse,
  badRequestResponse,
} = require("../util/response");

exports.register = async (req, res) => {
  try {
    const { company_id, firstName, lastName, role, email, password } = req.body;

    if (!email || !password) {
      return badRequestResponse(res, "email or password is missing");
    }

    let encodedPassword = await encryptPassword(password);
    const user = await User.create({
      firstName,
      lastName,
      role,
      email,
      password: encodedPassword,
      CompanyId: company_id,
    });

    return createdSuccessResponse(
      res,
      `User register for company id ${company_id}`,
      user
    );
  } catch (error) {
    console.log(error);
    serverErrorResponse(res);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({
      where: { email },
      include: [Company],
    });

    const user = await User.findOne({
      where: { email },
      include: [Company],
    });

    // console.log(user);
    if (!user && !driver) {
      return notFoundResponse(res, "Email not found");
    }
    let match;
    if (user) {
      match = await decryptPassword(password, user.password);
    } else {
      match = await decryptPassword(password, driver.password);
    }
    if (!match) {
      return accessDeniedResponse(res, "Invalid password");
    }

    if (user) {
      return successResponse(res, "Successfully logged in", user);
    }
    return successResponse(res, "Successfully logged in", driver);
  } catch (error) {
    console.log(error);
    serverErrorResponse(res);
  }
};
