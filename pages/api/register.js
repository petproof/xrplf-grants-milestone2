import { Client as FaunaClient } from "faunadb"
var faunadb = require('faunadb');
var q = faunadb.query;
const bcrypt = require('bcrypt');
import { v4 as uuidv4 } from 'uuid'
const userId = uuidv4();

const client = new FaunaClient({
    scheme: "http",
    secret: process.env["faunaKey"],
    domain: 'db.fauna.com', // Adjust if you are using Region Groups
    port: 8443,
})

var dbClient = new faunadb.Client({
  secret: process.env["faunaKey"],
  domain: 'db.fauna.com', // Adjust if you are using Region Groups
})

export default async (req, res) => {
    if (req.method === "POST")
    {
        const {firstName, lastName, email, password, xrpWalletAddress} = req.body;

        try
        {
            const hash = await bcrypt.hash(password, 0);
            
            await dbClient.query(
                q.Create(q.Collection("users"), {
                  data: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hash,
                    userId: userId,
                    xrpWalletAddress: xrpWalletAddress,
                    isActive: 1
                  },
                })
            )

            return res.status(200).end();
        }
        catch (err)
        {
            return res.status(503).json({err: err.toString()});
        }
    }
    else
    {
        return res.status(405).json({error: "This request only supports POST requests"})
    }
}