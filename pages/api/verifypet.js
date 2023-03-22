import { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
import { Client as FaunaClient } from "faunadb"
var faunadb = require('faunadb');
var q = faunadb.query;
const xrpl = require("xrpl");
var txId = '';

const Sdk = new XummSdk(process.env["XummKey"], process.env["XummPrivateKey"]);


async function verifyPet(body) {

    // Get payload transaction ID using XUMM
    const appInfo = await Sdk.ping()
    console.log(appInfo.application.name)

    const theStatus = await Sdk.payload.get(body.payload, true);

    txId = theStatus?.response.txid;

    var dbClient = new faunadb.Client({
        secret: process.env["faunaKey"],
        domain: 'db.fauna.com', // Adjust if you are using Region Groups
    })

    // Add transaction ID to database and update "minted" status
    let resultId;
    await dbClient.query(
              q.Paginate(q.Match(q.Index('find_pet_by_id'), body.petId))
            )
            .then((ret) => resultId=ret.data[0].id)
            .catch((err) => console.error(
              'Error: [%s] %s: %s',
              err.name,
              err.message,
              //err.errors()[0].description,
    ));

    await dbClient.query(
        q.Update(
          q.Ref(q.Collection('pets'), resultId),
          {
            data: {
              isMinted: 1,
              txId: txId
            },
          },
        )
    );

}

export default async function handler(req,res) {
    const body = req.body
    await verifyPet(body);
    res.status(200).json({ txId: txId })
}
  