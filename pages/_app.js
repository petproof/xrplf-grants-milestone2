import '@/styles/globals.css'
import { SessionProvider } from "next-auth/react"
import { useState } from 'react';
//import RefreshTokenHandler from '../components/refreshTokenHandler';

/*
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
*/

export default function App({Component,pageProps: { session, ...pageProps }}) {
  console.log("Got Session: ", session);
  return (
    <SessionProvider session={session} >
      <Component {...pageProps} />
    </SessionProvider>
  )
}