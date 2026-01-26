const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const key = "your-encryption-key"; // Replace with your secure encryption key

function encryptString(text) {
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decryptString(encryptedText) {
  const decipher = crypto.createDecipher(algorithm, key);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function decrypt_all(db) {
  let cred_query = "SELECT * FROM hhm_credentials ORDER BY id ASC";
  const creds = await db.any(cred_query);
  for (let cred of creds) {
    const user = decryptString(cred.user_enc);
    const pass = decryptString(cred.password_enc);

    cred.user = user;
    cred.pass = pass;
  }
  console.log(creds);
  return creds;
}

module.exports = { decryptString, encryptString, decrypt_all };
