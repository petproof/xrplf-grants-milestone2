import { Client as FaunaClient } from "faunadb"
var faunadb = require('faunadb');
var q = faunadb.query;
var petList = [];


async function getPets(body) {
      var dbClient = new faunadb.Client({
      secret: process.env["faunaKey"],
      domain: 'db.fauna.com', // Adjust if you are using Region Groups
      })

      petList = [];
      let internalIds;
      await dbClient.query(
        q.Paginate(q.Match(q.Index('get_pets_by_owner_id'),body.ownerId))
      )
      .then((ret) => internalIds=ret)
      .catch((err) => console.error(
        'Error: [%s] %s: %s',
        err.name,
        err.message,
        err.errors()[0].description,
      ))
      
      //console.log(internalIds.data.length)
      
      for (let step = 0; step < internalIds.data.length; step++) {
          let matchingId;
          await dbClient.query(
            q.Get(q.Ref(q.Collection('pets'), internalIds.data[step].id))
          )
          .then((ret) => matchingId=ret)
          .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
          ))
          
          var matchingObj = {
            "petName" : matchingId.data.petName,
            "petId" : matchingId.data.petId,
            "photoUrl" : matchingId.data.photoUrl,
            "txId": matchingId.data.txId  
          };
          petList.push(matchingObj);

      }     




}



export default async function handler(req,res) {
    const body = req.body
    await getPets(body);
    res.status(200).json({ petList })
}