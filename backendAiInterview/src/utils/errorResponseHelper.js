function sendError(res, statusCode,message, success=false){
    return res.status(statusCode).json({
        statusCode,
        message,
        success
    })
}

export default sendError