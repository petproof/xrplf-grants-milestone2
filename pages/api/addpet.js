import { Client as FaunaClient } from "faunadb"
var faunadb = require('faunadb');
var q = faunadb.query;
const bcrypt = require('bcrypt');
import { v4 as uuidv4 } from 'uuid'
const petId = uuidv4();

async function addPet(body) {
    var dbClient = new faunadb.Client({
    secret: process.env["faunaKey"],
    domain: 'db.fauna.com', // Adjust if you are using Region Groups
    })

    

    await dbClient.query(
        q.Create(q.Collection("pets"), {
          data: {
            petName: body.petName,
            petId: petId,
            ownerId: body.ownerId,
            photoUrl: body.photoUrl,
            contactInfo: body.contactInfo,
            paidFee: 0,
            isMinted: 0
          },
        })
    )
}



export default async function handler(req,res) {
    const body = req.body
    await addPet(body);
    res.status(200).json({ petId: petId })
}