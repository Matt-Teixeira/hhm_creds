("use strict");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pgp = require("pg-promise")();
const db = require("./db/pg-pool");
const { get_creds, get_one_cred } = require("./sql/index");

const { decryptString, encryptString, decrypt_all } = require("./encrypt");

async function on_boot() {
  console.log(process.argv);
  // node index.js encrypt UESERNAME PASSWOED
  if (process.argv[2] === "encrypt") {
    let user = encryptString(process.argv[3]);
    let pass = encryptString(process.argv[4]);

    console.log(`USER ${process.argv[3]}   ---   ${user}`);
    console.log(`PASSWOED ${process.argv[4]}   ---   ${pass}`);
    return;
  }

  // node index.js decrypt UESERNAME PASSWOED
  if (process.argv[2] === "decrypt") {
    let user = decryptString(process.argv[3]);
    let pass = decryptString(process.argv[4]);

    console.log(`USER ${process.argv[3]}   ---   ${user}`);
    console.log(`PASSWOED ${process.argv[4]}   ---   ${pass}`);
    return;
  }

  if (process.argv[2] === "decrypt_all") {
    const creds = await decrypt_all(db);

    // Create CSV content
    const headers = ["id", "user_num", "pass_num", "manufacturer", "modality", "user_enc", "password_enc", "user", "pass"];
    const csvRows = [headers.join(",")];

    for (const cred of creds) {
      const row = headers.map(header => {
        const value = cred[header] ?? "";
        // Escape quotes and wrap in quotes if contains comma or quote
        const strValue = String(value);
        if (strValue.includes(",") || strValue.includes('"') || strValue.includes("\n")) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      });
      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");
    const csvPath = path.join(__dirname, "credentials.csv");
    fs.writeFileSync(csvPath, csvContent);
    console.log(`CSV file created: ${csvPath}`);

    const jsonPath = path.join(__dirname, "credentials.json");
    fs.writeFileSync(jsonPath, JSON.stringify(creds, null, 2));
    console.log(`JSON file created: ${jsonPath}`);
    return;
  }

  // GETS ALL CREDS FOR A GROUP OF 'manufacturer' && 'modality'
  // EXAMPLE: 'node index.js GE MRI'
  const manufacturer = process.argv[2];
  const modality = process.argv[3];

  if (modality) {
    let system_creds = await db.any(get_creds, [manufacturer, modality]);

    console.log(system_creds);

    for (let system of system_creds) {
      let user = decryptString(system.user_enc);
      let pass = decryptString(system.password_enc);

      let obj = {
        system_id: system.system_id,
        cred_id: system.cred_id,
        manufacturer: system.manufacturer,
        modality: system.modality,
        user,
        pass
      };

      console.log(obj);
    }
  }
  // NOT GREAT, BUT 'ELSE' RUNS IF ONLY ONE ARG IS SUPPLIED TO CMD LINE.
  // ONLY USED FOR RETURNING THE CREDENTIALS OF ONE SYSTEM
  // EXAMPLE: 'node index.js SME12345'
  else {
    let system_id = process.argv[2];

    let system_cred = await db.any(get_one_cred, [system_id]);

    console.log(system_cred);

    let user = decryptString(system_cred[0].user_enc);
    let pass = decryptString(system_cred[0].password_enc);

    let obj = {
      system_id: system_cred[0].system_id,
      manufacturer: system_cred[0].manufacturer,
      modality: system_cred[0].modality,
      user,
      pass
    };

    console.log(obj);
  }

  // ADD DEFAULT 'npm run' THAT PROCESSES AN ARRAY OF SMEs
}

on_boot();
