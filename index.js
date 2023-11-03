const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require('axios');
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const healthdata = new mongoose.Schema({
  Temperature: String,
  Humidity: String,
  Pressure: String,
  Altitude: String,
  Relay1: Boolean,
  Relay2: Boolean,
  Relay3: Boolean,
  Relay4: Boolean,
});

const Healthdata = mongoose.model("Healthdata", healthdata);

app.get("/update", async (req, res) => {
  try {
    // Check if there are any existing entries
    const existingData = await Healthdata.find();
    console.log(existingData,'gdh')
    
    if (existingData && existingData.length > 0) {
      // If there are existing entries, delete them all
      await Healthdata.deleteMany({});
      console.log("Deleted existing entries.");
    }

    // Create and add the new data to the database
    const data = {
      Temperature: req.query.Temperature,
      Humidity: req.query.Humidity, 
      Pressure: req.query.Pressure,
      Altitude: req.query.Altitude,
      Relay1: req.query.Relay1,
      Relay2: req.query.Relay2,
      Relay3: req.query.Relay3,
      Relay4: req.query.Relay4,
    };
    
    await Healthdata.create(data);
    console.log("Added new entry.");
    
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/api/patient", async (req, res) => {
    try{
        const data = await Healthdata.find({}).exec();
        res.json(data);
    }catch(err){
        console.log(err);
    }
})

let queryString;

app.put("/api/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // First, update the data
    const result = await Healthdata.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    // Then, send a GET request and include the updated data in the query parameters
    const updatedDataQuery = {
      ...updatedData,
    };
    // Add any other necessary data to the updatedDataQuery if needed

    // You can use the querystring library to serialize the object as query parameters
    const querystring = require('querystring');
     queryString = querystring.stringify(updatedDataQuery);
     console.log(queryString)

    // Now, make the GET request with the query parameters
    const response = axios.get(`https://odd-ruby-clownfish-belt.cyclic.app/api/patient?${queryString}`);

    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get(`/api/patient?${queryString}`, async (req, res)=>{
  try{
    console.log('api hits')
    res.json({message : 'data rechead'})
  }
  catch(error){
    console.log(error)
  }
})
 

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
})
