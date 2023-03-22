import { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
const xrpl = require("xrpl");
var signURL = '';

const Sdk = new XummSdk(process.env["XummKey"], process.env["XummPrivateKey"]);


async function verifySignIn(body) {
    const appInfo = await Sdk.ping()
    console.log(appInfo.application.name)

    const request = {
        options: {
          return_url: {
            app: body.hostURL+'/?payload={id}&petId='+body.petId,
            web: body.hostURL+'/?payload={id}&petId='+body.petId
          }
        },
        txjson: {
            "TransactionType": "Payment",
            "Destination": process.env["custodialWalletAddress"],
            "Amount": "5000000"
          }
    }
  
    const payload = await Sdk.payload.create(request, true)
    console.log(payload?.next.always)
    signURL = payload?.next.always;

}

export default async function handler(req,res) {
    const body = req.body
    await verifySignIn(body);
    res.status(200).json({ signURL: signURL })
}
  