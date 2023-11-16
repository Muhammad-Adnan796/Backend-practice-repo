


// Api response structure for reusable on every api response

const ApiResponse = (statusCode, data, message = "Success") => {
    return {
      statusCode: statusCode,
      data: data,
      message: message,
      success: statusCode < 400,
    };
  }

export {ApiResponse}  


// Api response structure for reusable on every api response

/* class ApiResponse {
    constructor(statusCode,data,message = "Success"){
        this.statusCode = statusCode,
        this.data = data,
        this.message = message,
        this.success = statusCode < 400
    }
} */