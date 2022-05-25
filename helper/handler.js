// Return error response with 500 error code 
errorHandler = (error, req, resp, next) => {
    console.log('errorHandler', error);
    // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
    return resp.status(500).json({
        ...error
    });
}

module.exports = errorHandler;