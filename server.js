const express = require('express');
const cors = require('cors');
const app = express();
const asyncHandler = require("./middlewares/asyncHandler");
const ErrorResponse = require("./utils/errorResponse");
const axios = require('axios')
const returnSumma = require('./utils/returnSumma')
const uuid = require('uuid')
const generateTransmitAccessToken = require('./utils/access');
const protect = require('./middlewares/auth')





require('dotenv').config();

require('colors')

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({extended: false}))


app.post('/sms/send', protect, asyncHandler(async (req, res, next) => {
    if(!req.user){
        return next(new ErrorResponse('Unable to enter'))
    }
    const { clients } = req.body;
    if(!clients){
        return next(new ErrorResponse('clinets array bo`sh'))
    }

    for (let client of clients) {
        if (!client.fio || !client.summa || !client.phone) {
            return next(new ErrorResponse(`So'rovlar bo'sh qolishi mumkin emas`, 400));
        }
        if (!Number.isInteger(client.summa)) {
            return next(new ErrorResponse(`Summa noto'g'ri kiritildi: ${client.summa}`, 400));
        }
        const regex = /^[1-9]\d{8}$/
        const phoneTest = regex.test(client.phone.trim())
        if(!phoneTest){
            return next(new ErrorResponse(`Telefon raqami notog'ri kiritilgan. Xato sababchisi: ${client.phone}`, 400))
        }
    }

    const responseData = []
    // SMS API
    for (let client of clients) {
        const sendMessage = `Hurmatli ${client.fio} Xorazim viloyati Milliy gvardiyasi Qo'riqlash boshqarmasi sizga Qo'riqlash hizmati bo'yicha ${returnSumma(client.summa)} so'm qarzingiz mavjudligini eslatib o'tamiz. To'lovlarni Payme, Uzum bank, Click ilovalari orqali amalga oshirishingiz mumkin. Aloqa telefonlari: +998930883434 +998939539444`;
        const utime = Math.floor(Date.now() / 1000); 
        const accessToken = generateTransmitAccessToken('qorakolqch', process.env.SECRETKEY, utime)
        const data = {
            utime, 
            username: 'qorakolqch',
            service: {
                service: 1  
            },
            message: {
                smsid: uuid.v4(), 
                phone: `998${client.phone}`,       
                text: sendMessage
            }
        };
        const response = await axios.post('https://routee.sayqal.uz/sms/TransmitSMS', data, {
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Token': accessToken 
            }
        })
        if(response.status === 200){
            responseData.push({
                fio: client.fio, 
                phone: client.phone,
                success: true
            })
            await pool.query(
                `INSERT INTO reports (client_id, report, senddate) VALUES ($1, $2, $3)`,
                [client.id, sendMessage, new Date()]
            );
        }

        if(response.status !== 200){
            responseData.push({
                fio: client.fio, 
                phone: client.phone,
                success: false
            })
        }
    }
    return res.status(200).json({
        success: true,
        data: responseData
    });
}))

app.use(require('./middlewares/errorHandler'))

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
