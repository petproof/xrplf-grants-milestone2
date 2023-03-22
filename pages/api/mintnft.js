import { Client as FaunaClient } from "faunadb"
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { XummSdk } from 'xumm-sdk'
const xrpl = require("xrpl");
var faunadb = require('faunadb');
var q = faunadb.query;
var signURL;

const Sdk = new XummSdk(process.env["XummKey"], process.env["XummPrivateKey"]);

async function mintNFT(body) {
    var dbClient = new faunadb.Client({
    secret: process.env["faunaKey"],
    domain: 'db.fauna.com', // Adjust if you are using Region Groups
    })

          // Look up Pet record in DB
          let petRef;
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
          
          
          // Get all the pet's info so we can mint an NFT
          await dbClient.query(
            q.Get(q.Ref(q.Collection('pets'), resultId))
            //q.Get(q.Ref(q.Collection('Events'), '341640181339652687'))
          )
          .then((ret) => petRef=ret.data)
          .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
          ))
          
          // Create variables from pet info in the DB
          let mintPetName = petRef.petName;
          let mintPetId = petRef.petId;
          let mintOwnerId = petRef.ownerId;
          let mintPhotoUrl = petRef.photoUrl;
          let mintContactInfo = petRef.contactInfo;

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
            "Pet Name": mintPetName,
            "PetProof ID": mintPetId,
            "Owner ID": mintOwnerId,
            "Photo": mintPhotoUrl,
            "Contact URL": "https://petproof.app/pet?petId="+mintPetId,
            "Additional Contact Info": mintContactInfo
          })
          try {
            const added = await client.add(data)
            petFileURL = `${IPFSGateway}${added.path}`
          } catch (error) {
            console.log('Error uploading file: ', error)
          }
          
          // Add IPFS URL to our DB
          await dbClient.query(
            q.Update(
              q.Ref(q.Collection('pets'), resultId),
              {
                data: {
                  ipfsURL: petFileURL
                },
              },
            )
          );

          // Get Owner database ID
          let theOwnerId;
          await dbClient.query(
            q.Paginate(q.Match(q.Index('find_owner_by_id'), mintOwnerId))
          )
          .then((ret) => theOwnerId=ret.data[0].id)
          .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            //err.errors()[0].description,
          ));
          
          // Now get Owner wallet address
          let theOwnerWallet;
          await dbClient.query(
            q.Get(q.Ref(q.Collection('users'), theOwnerId))
            //q.Get(q.Ref(q.Collection('Events'), '341640181339652687'))
          )
          .then((ret) => theOwnerWallet=ret.data.xrpWalletAddress)
          .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
          ))




          // Create and send transaction to Mint NFT to owner wallet
          const appInfo = await Sdk.ping()
          console.log(appInfo.application.name)

          const request = {
              options: {
                return_url: {
                  app: body.hostURL+'/mypets?payload={id}&mintedPet='+mintPetId,
                  web: body.hostURL+'/mypets?payload={id}&mintedPet='+mintPetId
                }
              },
              txjson: {
                  "TransactionType": "NFTokenMint",
                  "Account": theOwnerWallet,
                  "Amount": "0",
                  "URI": xrpl.convertStringToHex(petFileURL),
                  "Flags": 8,
                  "NFTokenTaxon": 0 
                }
          }
        
          const payload = await Sdk.payload.create(request, true)
          console.log(payload?.next.always)
          signURL = payload?.next.always;


          /*
          // Now that we have ID, mark pet as "minted"
          await dbClient.query(
            q.Update(
              q.Ref(q.Collection('pets'), resultId),
              {
                data: {
                  isMinted: 1
                },
              },
            )
          );
          */

}



export default async function handler(req,res) {
    const body = req.body
    await mintNFT(body);
    res.status(200).json({ signURL: signURL })
}