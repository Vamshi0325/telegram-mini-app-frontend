import React, { useEffect, useState } from "react";
import axios from "axios";

// Helper function to check if the app is inside the official Telegram WebApp
const isInTelegramWebView = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    console.log("❌ Telegram WebApp SDK not available");
    return false;
  }

  const platform = tg.platform; // Check the platform (android, ios)
  const isWebView = tg.isWebView; // Check if it's running in a WebView

  console.log("🔍 Telegram Platform:", platform);
  console.log("🔍 isWebView:", isWebView);

  return (
    !!tg.initData && // initData should exist
    isWebView !== false && // Must be inside WebView
    (platform === "android" || platform === "ios") // Only Android or iOS
  );
};

// Function to validate initData with backend (auto-login and mobile restrictions)
const validateInitData = (initData) => {
  console.log("🔍 Sending initData for backend validation:", initData);

  return axios
    .post("http://localhost:5000/autologin", { initData })
    .then((res) => {
      console.log("✅ Backend validation response:", res.data);
      return res.data; // The response should contain user details or tokens
    })
    .catch((err) => {
      console.error("❌ Validation Error:", err);
      return { valid: false, message: "Error validating initData." };
    });
};

// Helper function to expand the WebApp if inside Telegram WebView
const expandWebApp = () => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    console.log("✅ Expanding WebApp...");
    tg.expand(); // Expands the WebApp within the available screen space
  } else {
    console.log("❌ Unable to expand WebApp, Telegram SDK not found");
  }
};

const App = () => {
  const [isValidTelegram, setIsValidTelegram] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Store user details after auto-login

  useEffect(() => {
    // Function to handle WebView validation and expansion
    const initializeCheck = async () => {
      console.log("🔍 Checking if running in Telegram WebView...");
      const isValid = isInTelegramWebView();
      console.log("🚦 isValidTelegram:", isValid);

      setLoading(false);

      if (isValid) {
        // Expand the WebApp if in Telegram
        expandWebApp();

        // Validate initData with the backend for auto-login and mobile restriction checks
        const tg = window.Telegram?.WebApp;
        if (tg) {
          const backendResponse = await validateInitData(tg.initData);
          if (backendResponse.valid) {
            console.log(
              "✅ User authenticated successfully:",
              backendResponse.user
            );
            setIsValidTelegram(true);
            setUser(backendResponse.user); // Store user details
          } else {
            console.log("❌ Validation failed:", backendResponse.message);
            setIsValidTelegram(false);
          }
        }
      } else {
        console.log("❌ Not in the official Telegram WebView");
        setIsValidTelegram(false);
      }
    };

    // Initialize check
    initializeCheck();
  }, []);

  // If still loading, show a loading message
  if (loading) {
    console.log("🔄 Loading...");
    return <p>Loading...</p>;
  }

  // If the WebApp is valid and running in the official Telegram app
  if (isValidTelegram) {
    console.log("✅ App is running in Telegram WebView. Displaying content.");
    return (
      <div>
        <h1>✅ Welcome to the Telegram Mini App!</h1>
        <p>Welcome, {user?.name}!</p>{" "}
        {/* Display the user’s name after auto-login */}
      </div>
    );
  }

  // If it's not running inside the official Telegram app, show an appropriate message
  console.log("❌ Access Restricted. Displaying restricted access message.");
  return (
    <div>
      <h1>🚫 Access Restricted</h1>
      <p>This app is only accessible within the official Telegram app.</p>
    </div>
  );
};

export default App;
