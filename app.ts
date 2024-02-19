import express = require("express");
import { connect, ConnectOptions } from "mongoose";
import { CarModelModel, ManufacturerModel } from "./models/Manufacturers";
import { createManufacturer, listManufacturers, rl } from "./commands";

// Create an express application
const app = express();

// Define the port to listen on (3000 by default)
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const options: ConnectOptions = {
  autoCreate: true,
  dbName: "car_management",
};

// Connect to the MongoDB database
connect("mongodb://localhost:27017/car_management", options)
  .then(() => {
    // Start the application
    console.log("Welcome to the Car Management Console Application!");
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// Define the JSON parser middleware
app.use(express.json());

// Define routes for CRUD operations on manufacturers
app.post("/manufacturers", async (req, res) => {
  try {
    const { name, manufacturer } = req.body;

    // Create a new instance of the ManufacturerModel with the provided name and manufacturer
    const newManufacturer = new ManufacturerModel({ name, manufacturer });

    // Save the newly created manufacturer to the database
    await newManufacturer.save();

    // Respond with a 201 Created status code and the JSON representation of the created manufacturer
    res.status(201).json(newManufacturer);
  } catch (err: any) {
    // If an error occurs during the process, respond with a 500 Internal Server Error status code
    // and send the error message as JSON
    res.status(500).json({ error: err.message });
  }
});

// Handle GET request to retrieve all manufacturers
app.get("/manufacturers", async (req, res) => {
  try {
    // Fetch all manufacturers from the database
    const manufacturers = await ManufacturerModel.find();

    // Respond with the list of manufacturers as JSON
    res.json(manufacturers);
  } catch (err: any) {
    // If an error occurs during the process, respond with a 500 Internal Server Error status code
    // and send the error message as JSON
    res.status(500).json({ error: err.message });
  }
});

// Define routes for CRUD operations on models
app.post("/models", async (req, res) => {
  try {
    const { name, manufacturer } = req.body;

    const model = new CarModelModel({ name, manufacturer });

    await model.save();

    res.status(201).json(model);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// app.get("/models", async (req, res) => {
//   try {
//     const models = await Model.find();
//     res.json(models);
//   } catch (err) {
//     res.status(500).json({ error: err });
//   }
// });

// Start the server and listen on the defined port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Prompt user for commands
async function promptUser() {
  while (true) {
    const command = await askQuestion(
      "Enter command (c / l / d / v / a / h / q ): "
    );
    switch (command) {
      case "c":
        console.log("'c' - Create a new manufacturer");
        await createManufacturer();
        break;

      case "l":
        console.log("'l' - List all manufacturers");
        await listManufacturers();
        break;

      case "d":
        console.log("'d' - Delete a manufacturer by ID");
        break;

      case "v":
        console.log("'v' - View all models of manufacturer by manufacturer-ID");
        break;

      case "a":
        console.log("'a' - Add a new model (Name) by manufacturer-ID");
        break;

      case "h":
        console.log("'h' - Show help");
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
  console.log("Available commands:");
  console.log("'c' - Create a new manufacturer");
  console.log("'l' - List all manufacturers");
  console.log("'d' - Delete a manufacturer by ID");
  console.log("'v' - View all models of manufacturer by manufacturer-ID");
  console.log("'a' - Add a new model (Name) by manufacturer-ID");
  console.log("'h' - Show help");
  console.log("'q' - Quit the application");
}

// Start the application
promptUser();
