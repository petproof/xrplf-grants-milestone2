import Head from 'next/head'
import Image from 'next/image'
import {useState, useEffect} from "react";
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { useSession, signIn, signOut } from "next-auth/react"
import Link from 'next/link'
import {useRouter} from "next/router";
import { create as ipfsHttpClient } from 'ipfs-http-client'
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
  Navbar,
  MobileNav,
  Typography,
  IconButton,
  Select,
  Option,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";

const inter = Inter({ subsets: ['latin'] })

const customAnimation = {
    mount: { scale: 1 },
    unmount: { scale: 0.9 },
};

const data = [
  {
    label: "Register",
    value: "register",
    desc: ``,
  },
  {
    label: "Search",
    value: "search",
    desc: `Search by:`,
  },

  {
    label: "Tools",
    value: "tools",
    desc: ``,
  },

  {
    label: "Contact",
    value: "contact",
    desc: ``,
  },


];

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



export default function Home(props) {
  const { data: session, status } = useSession()
  const [registerPetName, setRegisterPetName] = useState('');
  const [registerPetPhoto, setRegisterPetPhoto] = useState('');
  const [registerPetId, setRegisterPetId] = useState(props.petId);
  const [registerPetContactInfo, setRegisterPetContactInfo] = useState('');
  const [registrationStep, setRegistrationStep] = useState(0);
  const [searchPetsResult, setSearchMyPetsResult] = useState([]);
  const [searchPetsMessage, setSearchPetsMessage] = useState('');
  const [predata, setPredata] = useState(props.predata);
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const [open, setOpen] = useState(0);

  const handleOpen = (value) => {
      setOpen(open === value ? 0 : value);
  };

  const [theUserFirstName, setTheUserFirstName] = useState('');
  const [theUserId, setTheUserId] = useState('');
  
  useEffect(() => {
    if(hasCookie('firstName') ){
      setTheUserFirstName( getCookie('firstName') );
    }
    if(hasCookie('userId') ){
      setTheUserId( getCookie('userId') );
    }
  });
  /*
  if(hasCookie('firstName') ){
    setTheUserFirstName( getCookie('firstName') );
  }
  */


  async function onChange(e) {
    // upload image to IPFS
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `${IPFSGateway}${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function uploadToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) {
      return
    } else {
      // first, upload metadata to IPFS
      const data = JSON.stringify({
        name, description, image: fileUrl
      })
      try {
        const added = await client.add(data)
        const url = `${IPFSGateway}${added.path}`
        // after metadata is uploaded to IPFS, return the URL to use it in the transaction
        return url
      } catch (error) {
        console.log('Error uploading file: ', error)
      } 
    }
  }

  const addPet = async () => {
    const data = {
      petName: registerPetName,
      ownerId: theUserId,
      photoUrl: fileUrl,
      contactInfo: registerPetContactInfo,
    }
    const JSONdata = JSON.stringify(data)

    const endpoint = '/api/addpet'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONdata,
    }
    const response = await fetch(endpoint, options)
    const result = await response.json()
    
    setRegisterPetId(result.petId);
    setRegistrationStep(1);
  }

  const payXumm = async () => {
    const data = {
      hostURL: props.hostURL,
      petId: registerPetId
    }
    const JSONdata = JSON.stringify(data)

    const endpoint = '/api/paypetproof'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONdata,
    }
    const response = await fetch(endpoint, options)
    const result = await response.json()
    window.location.href = result.signURL;
  }

  const mintNFT = async () => {
    const data = {
      hostURL: props.hostURL,
      petId: registerPetId
    }
    const JSONdata = JSON.stringify(data)

    const endpoint = '/api/mintnft'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONdata,
    }
    const response = await fetch(endpoint, options)
    const result = await response.json()
    window.location.href = result.signURL;
  }

  const searchPets = async () => {
    const data = {
      searchBy: searchByType,
      searchNum: searchByNumber
    }
    console.log('searching by '+searchByType);
    console.log('searching id '+searchByNumber);
    const JSONdata = JSON.stringify(data)

    const endpoint = '/api/searchpet'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONdata,
    }
    const response = await fetch(endpoint, options)
    const result = await response.json()
    const theFinalSearchPetsResult = result;
    setSearchMyPetsResult(theFinalSearchPetsResult);
    if(theFinalSearchPetsResult.petList.length < 1){
      setSearchPetsMessage("No pets with this ID could be found.");
    }else{
      setSearchPetsMessage(theFinalSearchPetsResult.petList.length+" pets found:");
    }
    console.log(theFinalSearchPetsResult);
  }

  const router = useRouter();

  // Set our cookies after login
  if(status==="authenticated"){
    //console.log('we are authenticated.');
    if(session?.user?.userId != null){
      setCookie('userId', session?.user?.userId);
      setCookie('firstName', session?.user?.firstName);
      setCookie('xrpWalletAddress', session?.user?.xrpWalletAddress);
    }
  }

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

  /*
  function handleChange(e) {
    setSearchByType(e.target.value);
  }
  */


  const [searchByType, setSearchByType] = useState('petProofId');
  const [searchByNumber, setSearchByNumber] = useState('');

  const handleSearchChange = (e) => {
    setSearchByType(e);
  };
  


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
      A New Approach to Pet Identification
      </h2>


      { status==="authenticated" &&
      <Navbar className="mx-auto max-w-screen-xl py-2 px-4 lg:px-8 lg:py-4 bg-pp-brown mb-5">
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




     
      <Tabs id="petproof-selection" value="register">
      <TabsHeader>
        {data.map(({ label, value }) => (
          <Tab key={value} value={value}>
            {label}
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody
        animate={{
          initial: { y: 250 },
          mount: { y: 0 },
          unmount: { y: 250 },
        }}
      >
        {data.map(({ value, desc }) => (
          
          <TabPanel key={value} value={value}>
            {desc}
            { value=="register" && status==="authenticated" && registrationStep==0 && predata==0 &&
              <>
              <p>Please enter your pet's info below:</p>
              <div className="flex w-72 flex-col gap-6 mt-5 content-center mx-auto my-0">
                <Input color="purple" label="Pet Name" value={registerPetName} onChange={(e) => setRegisterPetName(e.target.value)} />
                <div className="w-full bg-grey-lighter mx-auto my-0 block">
                    <label className="w-100 flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-blue">
                        <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                        </svg>
                        <span className="mt-2 text-base leading-normal">Select a photo</span>
                        <input type='file' className="hidden" value={registerPetPhoto} onChange={onChange} />
                    </label>
                </div>
                {
                  fileUrl && (
                    <img className="rounded mt-4" width="350" src={fileUrl} />
                  )
                }
                <Textarea color="purple" label="Contact Info" value={registerPetContactInfo} onChange={(e) => setRegisterPetContactInfo(e.target.value)} />
              </div>
              <Button className="mt-5 bg-pp-brown" onClick={() => addPet()}>Register Pet</Button>
              </>
            }
            { value=="register" && status==="authenticated" && registrationStep==1 && predata==0 &&
              <>
              <p className="pb-4">Thank you for providing information for <strong className="font-bold">{registerPetName}</strong>!</p>
              <p className="pb-4">We are almost ready to create a record of ownership for {registerPetName}. PetProof charges a small fee of <strong className="font-bold">5 XRP</strong> to register your pet on the XRP Ledger. Registration lasts <strong>forever</strong>.</p>
              <p className="pb-4">This next step requires a XUMM wallet with XRP. <a className="font-bold" href="https://xumm.app/" target="_blank">Learn more about XUMM here</a>.</p>
              <Button size="lg" className="bg-pp-brown" onClick={() => payXumm()}>Continue with XUMM</Button>
              </>
            }
            { predata==1 &&
              <>
              <p>Now ready to mint! This next step will mint a token on the XRP Ledger.</p>
              <p>Continue to create a unique NFT for your pet.</p>
              <Button size="lg" className="mt-5 bg-pp-brown" onClick={() => mintNFT()}>Mint NFT</Button>
              </>
            }
            { value=="register" && status!=="authenticated" &&
              <>
                <p>Please sign in or register to continue.</p>
                <a href="/register"><Button className="mt-5 bg-pp-brown" size="lg">Register</Button></a>
                <p>Or</p>
                <Button size="lg" className="bg-pp-brown" onClick={() => signIn()}>Sign In</Button>
              </>
            }
            { value=="contact" &&
              <Accordion open={open === 1} animate={customAnimation}>
                <AccordionHeader onClick={() => handleOpen(1)}>
                  How to Contact Us
                </AccordionHeader>
                <AccordionBody>
                  You can send us an email at <a href="mailto:support@petproof.app">support@petproof.app</a> and we will reply as soon as possible. Thank you!
                </AccordionBody>
              </Accordion>
            }
            { value=="search" &&
              <>
              <div className="max-w-[300px] mx-auto my-0 pt-3">
              <Select label="Select Search Type" className="pb-3 mb-3" value={searchByType} onChange={handleSearchChange}>
                <Option value="petProofId">PetProof ID</Option>
                <Option value="ownerId">Owner ID</Option>
                <Option value="xrplTxId">XRPL Transaction ID</Option>
              </Select>
              <br/>
              <Input label="ID/Transaction Number" className="" value={searchByNumber} onChange={(e) => setSearchByNumber(e.target.value)} />
                <Button className="bg-pp-brown mt-5 pb-3" onClick={() => searchPets()}>Search</Button>
              </div>

              <div className="searchPetsMessage pt-10">
                <p>{searchPetsMessage}</p>
              </div>

              <div className="petSearchArea mt-5 my-0 mx-auto max-w-lg text-center pt-10 flex flex-wrap">
                  { searchPetsResult?.petList?.map((item) => {
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
              </div>
              </>
            }
            {value=='tools' &&
              <div className="toolsArea">
                <p>If you have an API key, you can mint NFT pet records using our API.</p>
                <p>Send a POST request with the API Key, Pet Name, Contact Info, and Photo URL:</p>
                <p className="pt-5"><strong className="font-bold">https://petproof.app/api/petproofapi_v1/</strong></p>
                <p className="pt-5">Parameters to include:</p>
                <ul className="pt-5">
                  <li>apiKey</li>
                  <li>petName</li>
                  <li>contactInfo</li>
                  <li>photoUrl</li>
                  <li>firstName (of Owner)</li>
                  <li>lastName (of Owner)</li>
                  <li>email (of Owner)</li>
                </ul>
                <p className="pt-5">You will receive a JSON response with the following:</p>
                <ul className="pt-5">
                  <li>ownerId - An internal owner ID used by PetProof</li>
                  <li>petName - The name of the pet.</li>
                  <li>xrplTxId - The transaction ID on the ledger.</li>
                  <li>petProofId - An internal ID used by PetProof.</li>
                </ul>
              </div>
            }
          </TabPanel>
         

        ))}
      </TabsBody>
    </Tabs>

   
      
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

      var hostURL;
      if(context.req.headers.host=="localhost:3000"){
        hostURL = 'http://localhost:3000';
      }
      else{
        hostURL = 'https://'+context.req.headers.host;
      }

  if(context.query.payload!=null){
      const data = {
        payload: context.query.payload
      }
      const JSONdata = JSON.stringify(data)

      var endpoint;
      if(context.req.headers.host=="localhost:3000"){
        endpoint = 'http://localhost:3000/api/verifypayment'
      }
      else{
        endpoint = 'https://'+context.req.headers.host+'/api/verifypayment'
      }
  
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSONdata,
      }
      const response = await fetch(endpoint, options)
      const result = await response.json()

      let predata = 0;
      let petId = context.query.petId;

      if(context.query.adminoverride==1){
        predata=1;
      }

      if(result.finalStatus==true){
        predata=1;
      }

      if(predata==1){
        // If Paid, mark as paid in the DB
        const data = {
          payload: context.query.payload,
          petId: context.query.petId
        }
        const JSONdata = JSON.stringify(data)
        var endpoint;
        if(context.req.headers.host=="localhost:3000"){
          endpoint = 'http://localhost:3000/api/markaspaid'
        }
        else{
          endpoint = 'https://'+context.req.headers.host+'/api/markaspaid'
        }
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSONdata,
        }
        const response = await fetch(endpoint, options)
        const result = await response.json()
      }


      return { props: { predata, hostURL, petId } }
  }else{
      let predata = 0;
      let petId = "";
      return { props: { predata, hostURL, petId } };
  }
}
