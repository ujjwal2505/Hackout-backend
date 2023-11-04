const bcrypt = require("bcrypt");
const fs = require("fs");

exports.encryptPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.log(error);
  }
};

exports.decryptPassword = async (plainText, hashed) => {
  try {
    return await bcrypt.compare(plainText, hashed);
  } catch (error) {
    console.log(error);
  }
};

exports.writeDataToFile = async function (filePath, payload) {
  try {
    // Convert the JSON object to a string
    const payloadString = JSON.stringify(payload);

    // Append the payload directly to the file
    if (fs.existsSync(filePath)) {
      fs.appendFileSync(filePath, "," + payloadString, "utf-8");
    } else {
      fs.appendFileSync(filePath, payloadString, "utf-8");
    }

    console.log("Trip data has been successfully appended to the file.");
  } catch (error) {
    console.error("Error inserting trip data:", error);
  }
};

exports.readDataFromFile = async function (filePath) {
  try {
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      const jsonArray = JSON.parse(`[${data}]`);
      if (Array.isArray(jsonArray)) {
        return jsonArray;
      } else {
        console.error("File does not contain a valid JSON array.");
        return [];
      }
    }

    return [];
  } catch (error) {
    console.error("Error reading trip data:", error);
    return [];
  }
};

exports.getDistanceBetweenCoordinates = (lat1, lng1, lat2, lng2) => {
  lng1 = (lng1 * Math.PI) / 180; //coverted to  radians
  lng2 = (lng2 * Math.PI) / 180;
  lat1 = (lat1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;

  // Haversine formula
  let dlng = lng2 - lng1;
  let dlat = lat2 - lat1;
  let a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlng / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers. Use 3956 for miles
  let r = 6371;

  return c * r * 1000; //in meter
};

//  // Read the file contents as a string
//  const fileDataString = fs.readFileSync(filePath, "utf-8");

//  // Split the file data into lines
//  const lines = fileDataString.trim().split("\n");

//  // Parse each line as a JSON object and store them in an array
//  const tripData = lines.map((line) => JSON.parse(line));

//  // Return the parsed trip data
//  return tripData;
// } else {
//  console.log("The file does not exist or is empty.");
//  return [];
