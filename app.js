const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initModels } = require('./Models');
const userRoutes = require('./Routes/userRoutes');
const plantRoutes = require('./Routes/plantRoutes');
const digesterRoutes = require('./Routes/digesterRoutes');
const digesterDataRoutes = require('./Routes/digesterDataRoutes');
const subscriptionRoutes = require('./Routes/subscriptionRoutes');
const dashboardRoutes = require('./Routes/dashboardRoutes');
const accessRightsRoutes = require('./Routes/accessRightsRoutes');
const gasRateRoutes = require('./Routes/gasRateRoutes');
const notificationRoutes = require('./Routes/notificationRoutes');
const bannerRoutes = require('./Routes/bannerRoutes')
const calculatedGasRoutes = require('./Routes/calculatedGasRoutes')

const path =require("path");



require('./Middleware/cronJobs');
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT || 5959;
app.use(cors({
    // origin: 'http://bio.vakratundsolutions.com',
    // methods: ['GET', 'POST','DELETE','PUT','PATCH'],
    // allowedHeaders: ['Content-Type', 'Authorization']
}));

// app.use(cors({
//     origin: 'http://bio.vakratundsolutions.com',
//     methods: ['GET', 'POST','DELETE','PUT','PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,'public')));

app.get('/test',(req,res)=>{
  
res.send('test');
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/accessrights', accessRightsRoutes);
app.use('/api/gas-rate', gasRateRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/calculatedgas', calculatedGasRoutes);


app.use('/api/user', userRoutes);
app.use('/api/plant', plantRoutes);
app.use('/api/digester', digesterRoutes);
app.use('/api/digesterdata', digesterDataRoutes);
app.use('/api/subscription', subscriptionRoutes);

//initModels();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


const axios = require('axios');
const cron = require('node-cron');
// Function to generate random data
function getRandomData() {
    const digester_ids = [1, 2, 3];
    const digester_id = digester_ids[Math.floor(Math.random() * digester_ids.length)];
    const pH = (Math.random() * (14 - 0) + 0).toFixed(2);
    const pressure = (Math.random() * (100 - 0) + 0).toFixed(2);
    const temperature = (Math.random() * (200) - 100).toFixed(2); // Range from -100 to 100
    const generated_gas = (Math.random() * (100 - 0) + 0).toFixed(2);

    return { digester_id, pH, pressure, temperature, generated_gas };
}

// Function to send data to the endpoint
async function sendData() {
    const data = getRandomData();

    try {
        const response = await axios.post('http://localhost:5999/api/digesterdata/add-digesterdata', data);
        console.log('Data sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending data:', error.message);
    }
}

// Schedule tasks to be run on the server
cron.schedule('*/10 * * * *', () => {
    console.log('Running task every 10 minutes');
    //sendData();
});
