import express = require("express");
import { connect, ConnectOptions } from "mongoose";
import { CarModelModel, ManufacturerModel } from "./models/Manufacturers";
import {
  createManufacturer,
  listManufacturers,
  rl,
  deleteManufacturerById,
  viewModelsByManufacturerId,
  addModelByManufacturerId,
} from "./commands";
import * as fs from "node:fs";
import { Manufacturer, CarModel } from "./models/Manufacturers";
import { log } from "node:console";

// Start the application
console.log(
  "\n" +
    "Welcome to the Car Management Console Application!" +
    "\n" +
    "Type 'h' for help." +
    "\n" +
    "\n"
);

const app = express();
const PORT = process.env.PORT || 3000;
let isOnline = false;

// Connect to MongoDB
const options: ConnectOptions = {
  autoCreate: true,
  dbName: "car_management",
};

// Connect to the MongoDB database
connect("mongodb://localhost:27017/car_management", options)
  .then(() => {
    // console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// Define the JSON parser middleware
app.use(express.json());

const offlineDataDir = "./offline_data";

// Export offline data the app for testing
async function handleOfflineRequest(data: Manufacturer[] | CarModel[]) {
  console.log("You are currently offline. Saving data locally...");
  console.log("Received data:", data);

  try {
    // Serialize the data to JSON format
    const jsonData = JSON.stringify(data);

    // Check if the offline data directory exists, create it if not
    if (!fs.existsSync(offlineDataDir)) {
      fs.mkdirSync(offlineDataDir);
    }

    // Generate a unique file name based on the current timestamp
    const fileName = `Create new manufacturer_${Date.now()}.json`;
    const filePath = `${offlineDataDir}/${fileName}`;

    // Write the data to a new file
    fs.writeFileSync(filePath, jsonData);

    console.log(`Data saved locally in file: ${JSON.stringify(fileName)}`);
  } catch (err: any) {
    console.error("Error saving data locally", err);
  }
}

// Define routes for CRUD operations on manufacturers
app.post("/manufacturers", async (req, res) => {
  try {
    if (!isOnline) {
      await handleOfflineRequest(req.body);

      log("You are currently offline. Data will be saved locally.", req.body);

      return res.status(201).json(req.body);
    }

    const { name, manufacturer } = req.body;

    log("Creating new manufacturer:", req.body);

    // Create a new instance of the ManufacturerModel with the provided name and manufacturer
    const newManufacturer = new ManufacturerModel({ name, manufacturer });

    // Save the newly created manufacturer to the database
    await newManufacturer.save();

    // Respond with a 201 Created status code and the JSON representation of the created manufacturer
    res.status(201).json(newManufacturer);
  } catch (err: any) {
    // If an error occurs during the process, respond with a 500 Internal Server Error status code
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: "Internal Server Error",
    });
  }
});

// Handle GET request to retrieve all manufacturers
app.get("/manufacturers", async (req, res) => {
  try {
    if (!isOnline) {
      log("You are currently offline");

      return res.status(404).send("Sorry, You are currently offline");
    }

    // Fetch all manufacturers from the database
    const manufacturers = await ManufacturerModel.find();

    const carModels = await CarModelModel.find();

    // For each manufacturer, count the number of models associated with it
    const manufacturersWithModelCount = manufacturers.map((manufacturer) => {
      const modelCount = carModels.filter(
        (model) => model.manufacturer.toString() === manufacturer._id.toString()
      ).length;

      return {
        ...manufacturer.toJSON(),
        modelCount,
      };
    });

    res.status(200).json(manufacturersWithModelCount);

    // Respond with the list of manufacturers as JSON
    // res.status(200).json(manufacturers);
  } catch (err: any) {
    // If an error occurs during the process, respond with a 500 Internal Server Error status code
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: "Internal Server Error",
    });
  }
});

// Define routes for POST operations on car models
app.post("/models", async (req, res) => {
  try {
    const { name, manufacturer } = req.body;

    const model = new CarModelModel({ name, manufacturer });

    await model.save();

    res.status(201).json(model);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: "Internal Server Error",
    });
  }
});

app.get("/models", async (req, res) => {
  try {
    const models = await CarModelModel.find();
    res.json(models);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: "Internal Server Error",
    });
  }
});

app.delete("/manufacturers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await ManufacturerModel.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: "Internal Server Error",
    });
  }
});

app.get("/models", async (req, res) => {
  try {
    const { manufacturer } = req.query;
    const models = await CarModelModel.find({ manufacturer });
    res.json(models);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: "Internal Server Error",
    });
  }
});

app.post("/models", async (req, res) => {
  try {
    const { name, manufacturer } = req.body;
    const model = new CarModelModel({ name, manufacturer });
    await model.save();
    res.status(201).json(model);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: "Internal Server Error",
    });
  }
});

// Prompt user for commands
async function promptUser() {
  while (true) {
    const command = await askQuestion(
      "Enter command (c / l / d / v / a / h / q) :"
    );
    switch (command) {
      case "c":
        await createManufacturer();
        break;

      case "l":
        await listManufacturers();
        break;

      case "d":
        await deleteManufacturerById();
        break;

      case "v":
        await viewModelsByManufacturerId();
        break;

      case "a":
        await addModelByManufacturerId();
        break;

      case "h":
        showHelp();
        break;

      case "q":
        console.log("Exiting... Goodbye!");
        process.exit(0);

      default:
        console.log("Invalid command. Type 'h' for help.");
    }
  }
}

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer);
    });
  });
}

function showHelp() {
  console.log("\n", "Available commands:");
  console.log("'c' - Create a new manufacturer");
  console.log("'l' - List all manufacturers (ID, Name, Number of models)");
  console.log("'d' - Delete a manufacturer by ID");
  console.log("'v' - View all models of manufacturer by manufacturer-ID");
  console.log("'a' - Add a new model (Name) by manufacturer-ID");
  console.log("'h' - Show help");
  console.log("'q' - Quit the application", "\n");
}

// Start the application
promptUser();

// Start the server and listen on the defined port
app.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
});
