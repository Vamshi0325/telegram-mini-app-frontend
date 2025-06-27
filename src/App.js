import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    console.log("Telegram WebApp SDK:", tg); // Debugging log

    // If not inside Telegram
    if (!tg || !tg.isWebView || !["android", "ios"].includes(tg.platform)) {
      console.log("Not in Telegram WebView"); // Debugging log
      setIsValid(false); // Don't show content and mark it invalid
      return;
    }

    // Send initData to backend for HMAC-validation
    axios
      .post("http://localhost:5000/validate", { initData: tg.initData })
      .then((res) => {
        console.log("Validation Response:", res.data); // Debugging log
        setIsValid(res.data.valid);
      })
      .catch((err) => {
        console.error("Validation Error:", err); // Debugging log
        setIsValid(false); // Mark as invalid if error occurs
      });
  }, []);

  if (isValid === null) {
    return <p>Loading...</p>;
  }

  if (!isValid) {
    return <p>Content is not available outside the official Telegram app.</p>;
  }

  return (
    <div>
      <h1>✅ Welcome to Telegram Mini App!</h1>
      <p>Your app is securely running within the official Telegram app.</p>
    </div>
  );
};

export default App;
