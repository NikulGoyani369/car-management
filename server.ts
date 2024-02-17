// import express from 'express';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
// import manufacturerRoutes from './routes/manufacturerRoutes';
// import modelRoutes from './routes/modelRoutes';


// const app = express();
// const PORT = process.env.Port || 3000;


// // Middleware
// app.use(bodyParser.json());


// // Mongoose connection
// mongoose.connect('mongodb://localhost:27017/car_management', {

//     useNewUrlParser: true,
//     useUnifiedTopology: true
//     }).then(() => {
//         console.log('Connected to database');
//     }).catch((err) => {
//         console.log('Error: ', err);
//     });
    

// // Routes
// app.use('/manufacturers', manufacturerRoutes);
// app.use('/models', modelRoutes);

// // Start server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });