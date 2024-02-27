import * as fs from "node:fs";
import axios from "axios";

const offlineDataDir = "./server/src/offline_data";

// Export offline data the app for testing
export const handleOfflineRequest = (data: any) => {
  // console.log("You are currently offline. Saving data locally...");

  try {
    // Check if the offline data directory exists, create it if not
    if (!fs.existsSync(offlineDataDir)) {
      fs.mkdirSync(offlineDataDir);
    }

    // Loop through each endpoint and its data
    for (const endpoint in data) {
      if (Object.prototype.hasOwnProperty.call(data, endpoint)) {
        const endpointData = data[endpoint];

        // Generate the file name based on the endpoint and current timestamp
        // const fileName = `${offlineDataDir}/${endpoint}_${Date.now()}.json`;
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
        const jsonData = JSON.stringify(mergedData, null, 2);

        // Write the data to the file
        fs.writeFileSync(fileName, jsonData);

        console.log(`Data saved locally in file: ${fileName}`);
      }
    }
  } catch (err: any) {
    console.error("Error saving data locally", err);
  }
};

const isEqual = (existingItem: any, newItem: any) => {
  return JSON.stringify(existingItem) === JSON.stringify(newItem);
};

const onlineDataDir = "./server/src/online_data";

export const fetchServerData = async () => {
  try {
    if (!fs.existsSync(onlineDataDir)) {
      fs.mkdirSync(onlineDataDir);
    }

    const fileName = `${onlineDataDir}/manufacturers.json`;

    let existingData: any = [];
    // Check if the file already exists
    if (fs.existsSync(fileName)) {
      // Read existing data from the file
      existingData = JSON.parse(fs.readFileSync(fileName, "utf8"));
    }

    const response = await axios.get("http://localhost:3000/manufacturers");

    // Serialize the data to JSON format
    const jsonData = JSON.stringify(response.data, null, 2);

    // Write the data to the file
    fs.writeFileSync(fileName, jsonData);

    console.log(`Data saved locally in file: ${fileName}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching server data:", error);
  }
};

// Function to compare two files' content
export const compareAndMerge = async (
  file1Path: fs.PathLike,
  file2Path: fs.PathLike
) => {
  try {
    // Read content of both files asynchronously
    const file1Content = fs.existsSync(file1Path)
      ? fs.readFileSync(file1Path, "utf8")
      : null;
    const file2Content = fs.existsSync(file2Path)
      ? fs.readFileSync(file2Path, "utf8")
      : null;

    // Compare content
    if (file1Content === file2Content) {
      console.log("Files have the same content. No action required.");
      return;
    }

    // Update file1 with content from file2
    if (file2Content) {
      fs.writeFileSync(file1Path, file2Content);
      console.log("Local data updated successfully.");
    } else {
      console.log("File 2 does not exist. No update performed.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Example usage
const file1Path = "./server/src/offline_data/createManufacturer.json";
const file2Path = "./server/src/online_data/manufacturers.json";
compareAndMerge(file1Path, file2Path);

// const compareFile = JSON.stringify(file1Path) === JSON.stringify(file2Path);
// console.log(compareFile);

// Output:
// Files synced successfully.
