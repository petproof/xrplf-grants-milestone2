import NextAuth from "next-auth"
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials"
import { Client as FaunaClient } from "faunadb"
//import Providers from "next-auth/providers"
import * as Fauna from "faunadb"
import { FaunaAdapter } from "@next-auth/fauna-adapter"
import { setCookie } from 'cookies-next';
var faunadb = require('faunadb');
var q = faunadb.query;

let userAccount = null;
let YOUR_API_URL ='http://localhost:3000/api/';
const bcrypt = require('bcrypt');

const client = new FaunaClient({
  scheme: "http",
  secret: process.env["faunaKey"],
  domain: 'localhost',
  port: 8443,
})

var dbClient = new faunadb.Client({
    secret: process.env["faunaKey"],
    domain: 'db.fauna.com', // Adjust if you are using Region Groups
  })

const confirmPasswordHash = (plainPassword, hashedPassword) => {
  return new Promise(resolve => {
      bcrypt.compare(plainPassword, hashedPassword, function(err, res) {
          resolve(res);
      });
  })
}

async function refreshAccessToken(tokenObject) {
    try {
        // Get a new set of tokens with a refreshToken
        const tokenResponse = await axios.post(YOUR_API_URL + 'auth/refreshToken', {
            token: tokenObject.refreshToken
        });

        return {
            ...tokenObject,
            accessToken: tokenResponse.data.accessToken,
            accessTokenExpiry: tokenResponse.data.accessTokenExpiry,
            refreshToken: tokenResponse.data.refreshToken
        }
    } catch (error) {
        return {
            ...tokenObject,
            error: "RefreshAccessTokenError",
        }
    }
}

export const authOptions = {
  // Configure one or more authentication providers
  
  cookie: {
    secure: process.env.NODE_ENV && process.env.NODE_ENV === 'production',
  },
  
  //cookies: cookies,
  session: {
      
      jwt: true,
      maxAge: 30 * 24 * 60 * 60
      
     /*
      strategy: "database",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // 24 hours
      */
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      id: "credentials",
      name: 'credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "text", placeholder: "yourname@domain.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try
        {
            /*
            const user = await prisma.users.findFirst({
                where: {
                    email: credentials.email
                }
            });
            */
            var user;
            var resultId;
            await dbClient.query(
                q.Paginate(q.Match(q.Index('user_by_email'), credentials.email))
              )
              .then((ret) => resultId=ret.data[0].id)
              .catch((err) => console.error(
                'Error: [%s] %s: %s',
                err.name,
                err.message,
                err.errors()[0].description,
            ))

            await dbClient.query(
                q.Get(q.Ref(q.Collection('users'), resultId))
            )
            .then((ret) => user=ret.data)
            .catch((err) => console.error(
                'Error: [%s] %s: %s',
                err.name,
                err.message,
                err.errors()[0].description,
            )) 

            console.log(user);


            if (user !== null)
            {
                //Compare the hash
                const res = await confirmPasswordHash(credentials.password, user.password);
                if (res === true)
                {
                    userAccount = {
                        userId: user.userId,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        xrpWalletAddress: user.xrpWalletAddress,
                        isActive: user.isActive
                    };
                    

                    return userAccount;
                }
                else
                {
                    console.log("Hash not matched logging in");
                    return null;
                }
            }
            else {
                return null;
            }
        }
        catch (err)
        {
            console.log("Authorize error:", err);
        }

    }
    })
  ],
  callbacks: {
      async signIn(user, account, profile) {
          try
          {
              //the user object is wrapped in another user object so extract it
              user = user.user;
              console.log("Sign in callback", user);
              console.log("User id: ", user.userId)
              if (typeof user.userId !== typeof undefined)
              {

                  if (user.isActive === '1')
                  {
                      console.log("User is active");
                      return user;
                  }
                  else
                  {
                      console.log("User is not active: "+user.isActive)
                      //return false;
                      return user;
                  }
              }
              else
              {
                  console.log("User id was undefined")
                  return false;
              }
          }
          catch (err)
          {
              console.error("Signin callback error:", err);
          }

      },
      async register(firstName, lastName, email, password) {
          try
          {
              await dbClient.query(
                q.Create(q.Collection("users"), {
                  data: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    xrpWalletAddress: xrpWalletAddress,
                    password: password
                  },
                })
              )
              return true;
          }
          catch (err)
          {
              console.error("Failed to register user. Error", err);
              return false;
          }

      },
      /*
      async session(session, token) {
          if (userAccount !== null)
          {
              //session.user = userAccount;
              session.user = {
                  userId: userAccount.userId,
                  name: `${userAccount.firstName} ${userAccount.lastName}`,
                  email: userAccount.email
              }

          }
          else if (typeof token.user !== typeof undefined && (typeof session.user === typeof undefined
              || (typeof session.user !== typeof undefined && typeof session.user.userId === typeof undefined)))
          {
              session.user = token.user;
          }
          else if (typeof token !== typeof undefined)
          {
              session.token = token;
          }
          return session;
      },
      async jwt(token, user, account, profile, isNewUser) {
          console.log("JWT callback. Got User: ", user);
          if (typeof user !== typeof undefined)
          {
              token.user = user;
          }
          return token;
      }
      */

      
     
      async session(session, token) {
        //session.accessToken = token.accessToken;
        console.log("Session token");
        console.log(token);
        if (userAccount !== null)
        {
            session.user = userAccount;
        }
        else if (typeof token !== typeof undefined)
        {
            session.token = token;
        }
        console.log("session callback returning");
        console.log(session);
        return session;
    },
    async jwt(token, user, account, profile, isNewUser) {
        console.log("JWT Token User");
        console.log(token.user);
        if (typeof user !== typeof undefined)
        {
             token.user = user;
        }
        return token;
    }
    



  
   /*
    jwt: async ({ token, user }) => {
        if (user) {
            // This will only be executed at login. Each next invocation will skip this part.
            token.accessToken = user.data.accessToken;
            token.accessTokenExpiry = user.data.accessTokenExpiry;
            token.refreshToken = user.data.refreshToken;
        }

        // If accessTokenExpiry is 24 hours, we have to refresh token before 24 hours pass.
        const shouldRefreshTime = Math.round((token.accessTokenExpiry - 60 * 60 * 1000) - Date.now());

        // If the token is still valid, just return it.
        if (shouldRefreshTime > 0) {
            return Promise.resolve(token);
        }

        // If the call arrives after 23 hours have passed, we allow to refresh the token.
        token = refreshAccessToken(token);
        return Promise.resolve(token);
    },
    session: async ({ session, token }) => {
        // Here we pass accessToken to the client to be used in authentication with your API
        session.accessToken = token.accessToken;
        session.accessTokenExpiry = token.accessTokenExpiry;
        session.error = token.error;

        return Promise.resolve(session);
    },
    */
      
     /*
      async jwt({ token, account }) {
        // Persist the OAuth access_token to the token right after signin
        if (account) {
          token.accessToken = account.access_token
        }
        return token
      },
      async session({ session, token, user }) {
        // Send properties to the client, like an access_token from a provider.
        session.accessToken = token.accessToken
        return session
      }
      */
  },
  //adapter: FaunaAdapter(client)
  secret: 'your_secret'
}

export default NextAuth(authOptions)