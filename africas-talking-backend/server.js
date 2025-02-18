const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Allow requests from any origin

// Africa's Talking API credentials
const AFRICAS_TALKING_API_KEY = "atsk_7af1c2c2ff661043f9084ee1b789212fd9b7a5d50506bc7dccd384891ef4d490f05aaeaa";
const AFRICAS_TALKING_USERNAME = "airtimeapi";

// Endpoint to send SMS
app.post("/send-sms", async (req, res) => {
  const { phoneNumber, message } = req.body;

  // Validate input
  if (!phoneNumber || !message) {
    return res.status(400).json({ error: "Phone number and message are required" });
  }

  try {
    // Make the API request to Africa's Talking
    const response = await axios.post(
      "https://api.africastalking.com/version1/messaging",
      new URLSearchParams({
        username: AFRICAS_TALKING_USERNAME,
        to: phoneNumber,
        message: message,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          apiKey: AFRICAS_TALKING_API_KEY,
        },
      }
    );

    // Send the API response back to the frontend
    res.status(200).json({
      success: true,
      message: "SMS sent successfully",
      data: response.data,
    });
  } catch (error) {
    // Handle errors
    console.error("Error sending SMS:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});