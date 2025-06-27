import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    // If not inside Telegram
    if (!tg || !tg.isWebView || !["android", "ios"].includes(tg.platform)) {
      document.body.innerHTML =
        "<h1>🚫 Please open this inside the official Telegram app</h1>";
      return;
    }

    // Send initData to backend for HMAC-validation
    axios
      .post("http://localhost:5000/validate", {
        initData: tg.initData,
      })
      .then((res) => {
        setIsValid(res.data.valid);
      })
      .catch(() => {
        document.body.innerHTML = "<h1>🚫 Invalid Access</h1>";
      });
  }, []);

  if (isValid === null) return <p>Loading...</p>;
  if (!isValid) return <h1>🚫 Invalid Access</h1>;

  return (
    <div>
      <h1>✅ Welcome to Telegram Mini App!</h1>
      <p>Your app is securely running within the official Telegram app.</p>
    </div>
  );
}

export default App;
