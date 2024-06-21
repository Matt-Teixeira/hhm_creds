("use strict");
require("dotenv").config();
const pgp = require("pg-promise")();
const db = require("./db/pg-pool");
const { get_creds, get_one_cred } = require("./sql/index");

const { decryptString } = require("./encrypt");

async function run_job(data) {}

async function on_boot() {
  const manufacturer = process.argv[2];
  const modality = process.argv[3];

  if (modality) {
    let system_creds = await db.any(get_creds, [manufacturer, modality]);

    for (let system of system_creds) {
      let user = decryptString(system.user_enc);
      let pass = decryptString(system.password_enc);

      let obj = {
        system_id: system.system_id,
        manufacturer: system.manufacturer,
        modality: system.modality,
        user,
        pass
      };

      console.log(obj);
    }
  } else {
    const re = /SME\d{5}/;
    let system_id = process.argv[2];

    let system_cred = await db.any(get_one_cred, [system_id]);

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
}

on_boot();

/* 
  const re = /SME\d{5}/;
  let matchedSME = process.argv[2].match(re)[0];

  console.log(matchedSME);
*/
