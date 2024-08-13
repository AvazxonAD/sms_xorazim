const jwt = require('jsonwebtoken');
const asyncHandler = require('../middlewares/asyncHandler.js');
const ErrorResponse = require('../utils/errorResponse.js');

module.exports = asyncHandler(async (req, res, next) => {
    let token;

    // Foydalanuvchidan tokenni olamiz
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    }

    // Agar token mavjud bo'lmasa
    if (!token) {
        return next(new ErrorResponse('Token notog\'ri jonatildi', 403));
    }
    try {
        // Tokenni tekshiramiz
        const decoded = token === process.env.REQUEST_SECRETKEY
        // Agar token yaroqsiz bo'lsa
        if (!decoded) {
            return next(new ErrorResponse("Unable to enter", 403));
            req.user = false
        }
        req.user = true;
        next();
    } catch (err) {
        // Xatolikni qaytarib yuboramiz
        return next(new ErrorResponse('Token eskirgan yoki yaroqsiz', 403));
    }
});
