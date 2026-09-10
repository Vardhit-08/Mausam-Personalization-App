export class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200, meta = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    });
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }
}

