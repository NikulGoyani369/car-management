import express from 'express'
import { connect, ConnectOptions } from 'mongoose';
import Manufacturer from './models/Manufacturer'
import Model from './models/Models';
import { ListFormat } from 'typescript';
import { log } from 'console';

const app = express();


const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const options: ConnectOptions = {
    autoCreate: true,
    dbName: 'car_management',
  };
  
  connect('mongodb://localhost:27017/car_management', options)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB', err);
    });


app.use(express.json());

// Define routes for CRUD operations on manufacturers
app.post('/manufacturers', async (req, res) => {
  // Implement logic to create a new manufacturer
});

app.get('/manufacturers', async (req, res) => {
  // Implement logic to list all manufacturers
});

// Define routes for CRUD operations on models
app.post('/models', async (req, res) => {
  // Implement logic to create a new model
});

app.get('/models', async (req, res) => {
  // Implement logic to list all models
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
