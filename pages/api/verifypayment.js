import { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
const {TxData} = require('xrpl-txdata')
const xrpl = require("xrpl");
var finalStatus;

const Sdk = new XummSdk(process.env["XummKey"], process.env["XummPrivateKey"]);
const Verify = new TxData()

async function verifySignIn(body) {
    const appInfo = await Sdk.ping()
    console.log(appInfo.application.name)

    const theStatus = await Sdk.payload.get(body.payload, true);
    
    /*
    Uncomment when switching to live and comment the below block
    let verifiedTx = theStatus?.response.txid;
    const verifiedResult = await Verify.getOne(verifiedTx);
    console.log('On ledger balance changes:', verifiedResult.balanceChanges);
    finalStatus = verifiedResult.balanceChanges;
    */

    finalStatus = theStatus?.meta.signed;

}

export default async function handler(req,res) {
    const body = req.body
    await verifySignIn(body);
    res.status(200).json({ finalStatus: finalStatus })
}
  