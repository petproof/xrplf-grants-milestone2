import Head from 'next/head'
import Image from 'next/image'
import {useState,useEffect} from "react";
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { useSession, signIn, signOut } from "next-auth/react"
import Link from 'next/link'
import {useRouter} from "next/router";
import { setCookie, getCookie, getCookies, hasCookie } from 'cookies-next';

import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Navbar,
  MobileNav,
  IconButton,
} from "@material-tailwind/react";

const inter = Inter({ subsets: ['latin'] })


export default function Home(props) {
  const { data: session, status } = useSession()
  
  const [myPetsResult, setMyPetsResult] = useState([]);
  const [theUserId, setTheUserId] = useState('');
  const [theUserFirstName, setTheUserFirstName] = useState('');

  const router = useRouter();

  const getAllPets = async () => {

    var endpoint = '/api/getallpets'

    const data = {
        ownerId: theUserId
    }
    const JSONdata = JSON.stringify(data)
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSONdata,
    }
    const response = await fetch(endpoint, options)
    const result = await response.json()
    const myPetsResult = result;
    setMyPetsResult(myPetsResult);
    console.log(myPetsResult);
  }

  useEffect(() => {
    if(hasCookie('firstName') ){
      setTheUserFirstName( getCookie('firstName') );
    }

    if(hasCookie('userId') ){
      setTheUserId( getCookie('userId') );
    }

    console.log('status: '+status);
    console.log('session: '+theUserId);
    getAllPets();
  }, [session,status])

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal"
      >
        <a href="/" className="flex items-center text-white">
          Home
        </a>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal"
      >
        <a href="/mypets" className="flex items-center text-white">
          My Pets
        </a>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal"
      >
        <a href="/account" className="flex items-center text-white">
          Account
        </a>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal"
      >
        <a href="/api/auth/signout" className="flex items-center text-white">
          Sign Out
        </a>
      </Typography>

    </ul>
  );

  const [openNav, setOpenNav] = useState(false);
 
  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  return (
    <>
      <Head>
        <title>PetProof</title>
        <meta name="description" content="Registering Pets on the XRP Ledger" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div>
          
          <div>
          </div>


     


<section className="bg-gray-50">
  <div className="p-8 md:p-12 lg:px-16 lg:py-24">
    <div className="mx-auto max-w-lg text-center">
    <a href="/"><Image
                src="/logo.png"
                alt="PetProof Logo"
                className="text-center align-center mx-auto my-0 pb-[20px]"
                width={200}
                height={50}
                priority
              /></a>
      <h2 className="text-2xl font-bold text-gray-900 md:text-3xl pb-5">
      Account
      </h2>

      { status==="authenticated" &&
      <Navbar className="mx-auto max-w-screen-xl py-2 px-4 lg:px-8 lg:py-4 bg-pp-brown mb-20">
      <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
        <Typography
          as="a"
          href="#"
          variant="small"
          className="mr-4 cursor-pointer py-1.5 font-normal"
        >
          <span className="text-white text-xl">{theUserFirstName}</span>
        </Typography>
        <div className="hidden lg:block">{navList}</div>

        <IconButton
          variant="text"
          className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
          ripple={false}
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </IconButton>
      </div>
      <MobileNav open={openNav}>
        <div className="container mx-auto">
          {navList}

        </div>
      </MobileNav>
    </Navbar>
    }

        
      <div className="my-0 mx-auto max-w-lg text-center myPetsContainer mt-5 flex flex-wrap">
            {status==="authenticated" &&
            
              <>

              { myPetsResult?.petList?.map((item) => {
                return <Card className="w-1/2 myPetCard my-0 mx-auto mb-10">
                <CardHeader color="blue" className="relative h-56">
                    <img
                    src={item.photoUrl}
                    alt="petname"
                    className="w-full"
                    />
                </CardHeader>
                <CardBody className="text-center">
                    <Typography variant="h5" className="mb-2">
                    {item.petName}
                    </Typography>
                    <Typography>
                    {item.petId}
                    </Typography>
                </CardBody>
                <CardFooter divider className="flex items-center justify-between py-3">
                    <Typography variant="small"><a href={ 'https://testnet.xrpl.org/transactions/' + item.txId } target="_blank">See XRP Ledger Transaction</a></Typography>
                </CardFooter>
            </Card>
              }) }
              </>

            }

            
       </div>
      

      
    </div>

  </div>
</section>



        </div>


      </main>
      <div className="footer pt-10 pb-10 text-center">
            <p className="text-pp-brown">©2023 PetProof, LLC</p>
      </div>
      
    </>
  )


}

export async function getServerSideProps(context) {

      var hostURL = '';
      var endpoint = '';
      
     
      // If payload exists, we need to add the transaction ID to database and update minted status
      if(context.query.payload!=null){
        if(context.req.headers.host=="localhost:3000"){
          hostURL = 'http://localhost:3000';
        }
        else{
          hostURL = 'https://'+context.req.headers.host;
        }
        if(context.req.headers.host=="localhost:3000"){
          endpoint = 'http://localhost:3000/api/verifypet'
        }
        else{
          endpoint = 'https://'+context.req.headers.host+'/api/verifypet'
        }
        const data = {
          payload: context.query.payload,
          petId: context.query.mintedPet
        }
        const JSONdata = JSON.stringify(data)

        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSONdata,
        }
        const response = await fetch(endpoint, options)
        const result = await response.json()
        console.log("TXID: "+result.txId);

      }

     



      return { props: { hostURL } };
}
