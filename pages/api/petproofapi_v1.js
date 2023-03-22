import { Client as FaunaClient } from "faunadb"
var faunadb = require('faunadb');
var q = faunadb.query;
const bcrypt = require('bcrypt');
import { v4 as uuidv4 } from 'uuid'
import { create as ipfsHttpClient } from 'ipfs-http-client'
const petId = uuidv4();
const ownerId = uuidv4();
const xrpl = require("xrpl");
var xrplTxId, petName;

async function addPet(body) {

    // Create and upload text file to IPFS

    const projectId = process.env["NEXT_PUBLIC_IPFS_KEY"];
    const projectSecret = process.env["NEXT_PUBLIC_IPFS_SECRET"];
    const auth =
        'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

    const client = ipfsHttpClient({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: auth,
        },
    });
    const IPFSGateway = `https://petproof.infura-ipfs.io/ipfs/`;

    var petFileURL;
    const data = JSON.stringify({
      "Pet Name": body.petName,
      "PetProof ID": petId,
      "Owner ID": ownerId,
      "Photo": body.photoUrl,
      "Contact URL": "https://petproof.app/pet?petId="+petId,
      "Additional Contact Info": body.contacInfo
    })
    try {
      const added = await client.add(data)
      petFileURL = `${IPFSGateway}${added.path}`
    } catch (error) {
      console.log('Error uploading file: ', error)
    }

    // Mint NFT on Ledger
    //Custodial account on Testnet
    const xrplAccount = process.env["xrplCustodialAccount"];
    const xrplAccountSecret = process.env["xrplCustodialSecret"];
    const wallet = xrpl.Wallet.fromSeed(xrplAccountSecret);
    // Currently on Testnet
    const xrpClient = new xrpl.Client("wss://s.altnet.rippletest.net:51233/");
    await xrpClient.connect();  
    
    // NFT transactionblob
    const transactionBlob = {
      TransactionType: "NFTokenMint",
      Account: wallet.classicAddress,
      URI: xrpl.convertStringToHex(petFileURL),
      Flags: 8,
      NFTokenTaxon: 0 
    }

    
      
    let tx = await xrpClient.submitAndWait(transactionBlob,{wallet})
      
    xrplTxId = tx.result.hash;
    console.log("Transaction result:", tx.result.meta.TransactionResult)
    console.log("Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))

    // Add pet to our DB
    var dbClient = new faunadb.Client({
    secret: process.env["faunaKey"],
    domain: 'db.fauna.com', // Adjust if you are using Region Groups
    })

    // Insert owner record
    await dbClient.query(
      q.Create(q.Collection("users"), {
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          userId: ownerId,
          createdByApi: true
        },
      })
    );

    // Insert pet record
    await dbClient.query(
            q.Create(q.Collection("pets"), {
              data: {
                petName: body.petName,
                petId: petId,
                ownerId: ownerId,
                photoUrl: body.photoUrl,
                ipfsUrl: petFileURL,
                contactInfo: body.contactInfo,
                paidFee: 1,
                isMinted: 1,
                txId: xrplTxId
              },
            })
    );
}



export default async function handler(req,res) {
    const body = req.body
    // Check static API key
    if(body.apiKey==process.env['staticApiKey']){
      await addPet(body);
      res.status(200).json({ status: 'success', petProofId: petId, ownerId: ownerId, xrplTxId: xrplTxId, petName: body.petName })
    }else{
      res.status(401).json({ message: 'Wrong API Key, access is denied.' })
    }
}