const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();

require('colors')

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({extended: false}))


app.use('/sms', require('./routes/sms.route'))

app.use(require('./middlewares/errorHandler'))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
