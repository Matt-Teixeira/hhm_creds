/*
To run this file, use either of the following commands:
npx ts-node list_of_sme.ts
npm run sme_list

To add a system to the list, add it to the sme_list array.
*/

("use strict");
require("dotenv").config();
const db = require("./db/pg-pool");
const { get_one_cred } = require("./sql/index");

const { decryptString } = require("./encrypt");

//Add in array of SME systems as strings
let sme_list = ['SME01123', 'SME01140', 'SME01141', 'SME01096'];
let output_list: { system_id: any; manufacturer: any; modality: any; user: any; pass: any; }[] = [];

async function sme_list_boot() { 
    for (let i = 0; i < sme_list.length; i++) {
        let system_id = sme_list[i];
        //console.log(`Getting credentials for system_id: ${system_id}`);

        let system_cred = await db.any(get_one_cred, [system_id]);

        //console.log(system_cred);

        let user = decryptString(system_cred[0].user_enc);
        let pass = decryptString(system_cred[0].password_enc);

        let obj = {
            system_id: system_cred[0].system_id,
            manufacturer: system_cred[0].manufacturer,
            modality: system_cred[0].modality,
            user,
            pass
        };

        output_list.push(obj);
    }
    
    console.log("Total systems:", output_list.length);
    console.log("System credentials:");
    console.log("=====================================");
    console.log(output_list);
    console.log("=====================================");
    console.log("End of list");
}

sme_list_boot();
