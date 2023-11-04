const success = {
  SUCCESS: true,
  FAILURE: false,
};

const ResponseStatus = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  PAYMENT_REQUIRED: 402,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  ACCESS_DENIED: 440,
  INTERNAL_ERROR: 500,
};

const successResponse = (res, msg, data) => {
  if (data) {
    res.status(ResponseStatus.SUCCESS).send({
      msg,
      data,
    });
    return;
  }
  res.status(ResponseStatus.SUCCESS).send({
    msg,
  });
};

const createdSuccessResponse = (res, msg, data) => {
  res.status(ResponseStatus.CREATED).send({
    msg,
    data,
  });
};

const notFoundResponse = (res, msg = "Not found") => {
  res.status(ResponseStatus.NOT_FOUND).send({
    msg,
  });
};

const unauthorizedResponse = (res, msg = "Unauthorized") => {
  res.status(ResponseStatus.UNAUTHORIZED).send({
    msg,
  });
};

const badRequestResponse = (res, msg = "Bad request") => {
  res.status(ResponseStatus.BAD_REQUEST).send({
    msg,
  });
};

const forbiddenResponse = (res, msg = "Forbidden") => {
  res.status(ResponseStatus.FORBIDDEN).send({
    msg,
  });
};

const serverErrorResponse = (res, msg = "Internal server error") => {
  res.status(ResponseStatus.INTERNAL_ERROR).send({
    msg,
  });
};

const accessDeniedResponse = (res, msg = "Access denied", data) => {
  res.status(ResponseStatus.ACCESS_DENIED).send({
    msg,
    data,
  });
};

const unprocessableEntityResponse = (res, msg = "Unprocessable entity") => {
  res.status(ResponseStatus.UNPROCESSABLE_ENTITY).send({
    msg,
  });
};

const paymentRequiredResponse = (res, msg = "Payment required") => {
  res.status(ResponseStatus.PAYMENT_REQUIRED).send({
    msg,
  });
};

module.exports = {
  ResponseStatus,
  successResponse,
  createdSuccessResponse,
  notFoundResponse,
  unauthorizedResponse,
  badRequestResponse,
  forbiddenResponse,
  serverErrorResponse,
  accessDeniedResponse,
  unprocessableEntityResponse,
  paymentRequiredResponse,
};
