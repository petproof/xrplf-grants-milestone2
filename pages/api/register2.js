import { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
const xrpl = require("xrpl");
var finalMessage = '';
var signURL;

const Sdk = new XummSdk(process.env["XummKey"], process.env["XummPrivateKey"]);

async function signIn(body) {
    const appInfo = await Sdk.ping()
    console.log(appInfo.application.name)

    
    var request;

    const request = {
      "TransactionType": "NFTokenMint",
      "Destination": "rwietsevLFg8XSmG3bEZzFein1g8RBqWDZ",
      "Amount": "10000",
      "Memos": [
        {
          "Memo": {
            "MemoData": "F09F988E20596F7520726F636B21"
          }
        }
      ]
    }

    const payload = await Sdk.payload.create(request, true)
    console.log(payload?.next.always)
    signURL = payload?.next.always;

   
}

export default async function handler(req,res) {
    const body = req.body
    await signIn(body);
    res.status(200).json({ signURL: signURL })
}