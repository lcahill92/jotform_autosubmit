const CryptoJS = require("crypto-js");

function decryptApiKey(encryptedKey, secretKey) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedKey, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}

// Example Usage
const encryptedKey = "ZniYjkNmjsWzUFOGhymNkxExgne3iLYrLpH99FODNlskKjH3Jnzj2J6w4+NtoEgIc8t8020OfQl9L43o8j9OPT+tagaTzlJLYwsEYwXxwAdUNh36EiPIYIdWj+y14f3B";
const secretKey = "your-secret-key"; // Replace with the actual key
const decryptedKey = decryptApiKey(encryptedKey, secretKey);

console.log("Decrypted API Key:", decryptedKey);