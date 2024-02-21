import express = require("express");
import { connect, ConnectOptions } from "mongoose";
import { ManufacturerModel } from "./models/Manufacturers";
import { CarModelModel } from "./models/Models";
import {
  createManufacturer,
  listManufacturers,
  rl,
  deleteManufacturerById,
  viewModelsByManufacturerId,
  addModelByManufacturerId,
} from "./commands";
import * as fs from "node:fs";
import { Manufacturer } from "./models/Manufacturers";
import { CarModel } from "./models/Models";
import { log } from "node:console";
import { showHelp } from "./showHelp";
import { cacheCommand, executeCachedCommands } from "./commandCache";

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
/* 
true means REST Service is onlne 
false Means REST Service is offline
*/
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
// const offlineDataFile = "offline_data.json";
// const filePath = `${offlineDataDir}/${offlineDataFile}`;

// Export offline data the app for testing
async function handleOfflineRequest(data: any) {
  console.log("You are currently offline. Saving data locally...");

  try {
    // Check if the offline data directory exists, create it if not
    if (!fs.existsSync(offlineDataDir)) {
      fs.mkdirSync(offlineDataDir);
    }

    // Loop through each endpoint and its data
    for (const endpoint in data) {
      if (Object.prototype.hasOwnProperty.call(data, endpoint)) {
        const endpointData = data[endpoint];

        // Generate the file name based on the endpoint
        const fileName = `${offlineDataDir}/${endpoint}.json`;

        let existingData: any = [];
        // Check if the file already exists
        if (fs.existsSync(fileName)) {
          // Read existing data from the file
          existingData = JSON.parse(fs.readFileSync(fileName, "utf8"));
        }

        // Filter out data that already exists in the file
        const newDataFiltered = endpointData.filter((newItem: any) => {
          return !existingData.some((existingItem: any) =>
            isEqual(existingItem, newItem)
          );
        });

        // Merge new filtered data with existing data
        const mergedData = [...existingData, ...newDataFiltered];

        // Serialize the data to JSON format
        const jsonData = JSON.stringify(endpointData, null, 2);

        // Write the data to the file
        fs.writeFileSync(fileName, jsonData);

        console.log(`Data saved locally in file: ${fileName}`);
      }
    }
  } catch (err: any) {
    console.error("Error saving data locally", err);
  }
}

// // Function to compare two files' content
// function compareAndMerge(
//   file1: fs.PathOrFileDescriptor,
//   file2: fs.PathOrFileDescriptor
// ) {
//   try {
//     // Read content of both files
//     const file1Content = fs.readFileSync(file1, "utf8");
//     const file2Content = fs.readFileSync(file2, "utf8");

//     // Compare content
//     if (file1Content === file2Content) {
//       console.log("Files have the same content. No action required.");
//       return;
//     }

//     // Write file1's content to file2
//     fs.writeFileSync(file2Path, file1Content);
//     console.log("Files synced successfully.");
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// // Example usage
// const file1Path = "./offline_data/Create new manufacturer_1708509047763.json";
// const file2Path = "./offline_data/Create new manufacturer_1708510012909.json";
// compareAndMerge(file1Path, file2Path);

// Later, when the application goes back online:
// Execute the cached commands

executeCachedCommands();

// Define routes for POST operations on Create manufacturers
app.post("/manufacturers", async (req, res) => {
  try {
    const { name } = req.body;

    // Create a new instance of the ManufacturerModel with the provided name and manufacturer
    const newManufacturer = new ManufacturerModel({ name });

    // Save the newly created manufacturer to the database
    await newManufacturer.save();

    if (!isOnline) {
      // Cache the command if offline
      cacheCommand(`createManufacturer('${name}')`);

      // Save the data locally
      handleOfflineRequest({ createManufacturer: [newManufacturer] });
    }

    res.status(201).json(newManufacturer);
  } catch (err: any) {
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
    // if (!isOnline) {
    //   log("Get manufacturers is offline");
    //   const manufacturers = await ManufacturerModel.find();

    //   const carModels = await CarModelModel.find();

    //   const manufacturersWithModelCount = manufacturers.map((manufacturer) => {
    //     const modelCount = carModels.filter(
    //       (model) =>
    //         model.manufacturer.toString() === manufacturer._id.toString()
    //     ).length;

    //     return {
    //       ...manufacturer.toJSON(),
    //       modelCount,
    //     };
    //   });

    //   manufacturersWithModelCount.forEach((manufacturer) => {
    //     cacheCommand(`listManufacturers('${manufacturer._id}')`);
    //   });
    // }
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

    // If the app is offline, cache the command
    if (!isOnline) {
      manufacturersWithModelCount.forEach((manufacturer) => {
        cacheCommand(`listManufacturers('${manufacturer._id}')`);
      });

      // Save the data locally
      handleOfflineRequest({ listManufacturers: manufacturersWithModelCount });
    }

    res.status(200).json(manufacturersWithModelCount);
  } catch (err: any) {
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

    if (!isOnline) {
      cacheCommand(`addModelByManufacturerId('${name}', '${manufacturer}')`);

      // Save the data locally
      handleOfflineRequest({ addModelByManufacturerId: [model] });
    }

    res.status(201).json(model);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: "Internal Server Error",
    });
  }
});

// Define routes for DELETE operations on manufacturers by ID
app.delete("/manufacturers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await ManufacturerModel.findByIdAndDelete(id);

    const models = await CarModelModel.find({ manufacturer: id });

    models.forEach(async (model) => {
      await CarModelModel.findByIdAndDelete(model._id);
    });

    if (!isOnline) {
      cacheCommand(`deleteManufacturerById('${id}')`);

      // Save the data locally
      handleOfflineRequest({ deleteManufacturerById: models });
    }

    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: "Internal Server Error",
    });
  }
});

// Define routes for GET operations on car models by manufacturer ID
app.get("/models", async (req, res) => {
  try {
    const { manufacturer } = req.query;

    const models = await CarModelModel.find({ manufacturer });

    // find each model by its manufacurer id
    const findModels = await Promise.all(
      models.map(async (model) => {
        const foundModel = await CarModelModel.findById(model._id);
        return foundModel;
      })
    );

    if (!isOnline) {
      cacheCommand(`viewModelsByManufacturerId('${manufacturer}')`);

      // Save the data locally
      handleOfflineRequest({
        viewModelsByManufacturerId: findModels as CarModel[],
      });
    }

    res.status(200).json(findModels);
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      status: 500,
      statusText: "Internal Server Error",
    });
  }
});

// Prompt user for commands
const promptUser = async () => {
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
};

const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer);
    });
  });
};

// Start the application
promptUser();

// Start the server and listen on the defined port
app.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
});
function isEqual(existingItem: any, newItem: any) {
  return JSON.stringify(existingItem) === JSON.stringify(newItem);
}
