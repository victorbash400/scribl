import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";

import addOnUISdk from "https://express.adobe.com/static/add-on-sdk/sdk.js";

// Ensure the SDK is available globally
window.addOnUISdk = addOnUISdk;

addOnUISdk.ready.then(() => {
    console.log("Adobe Add-on SDK is ready and globally available");

    const root = createRoot(document.getElementById("root"));
    root.render(<App />);
});
