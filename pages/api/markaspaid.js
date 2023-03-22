import { Client as FaunaClient } from "faunadb"
var faunadb = require('faunadb');
var q = faunadb.query;
const bcrypt = require('bcrypt');
import { v4 as uuidv4 } from 'uuid'
const petId = uuidv4();

async function updatePet(body) {
    var dbClient = new faunadb.Client({
    secret: process.env["faunaKey"],
    domain: 'db.fauna.com', // Adjust if you are using Region Groups
    })

          // Look up Pet record in DB
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
          
          // Now that we have ID, mark pet as "paid" since user paid PetProof transaction fee
          await dbClient.query(
            q.Update(
              q.Ref(q.Collection('pets'), resultId),
              {
                data: {
                  paidFee: 1
                },
              },
            )
          );


}



export default async function handler(req,res) {
    const body = req.body
    await updatePet(body);
    res.status(200).json({ petId: petId })
}