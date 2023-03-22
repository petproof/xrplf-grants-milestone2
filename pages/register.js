import * as React from "react";
import Link from "next/link";
import {useState} from "react";
import axios from 'axios';
import {useRouter} from "next/router";
import {signIn} from "next-auth/react";
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'

import {
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
    Button,
    Input,
    Card,
    Typography,
    Checkbox
  } from "@material-tailwind/react";

  const inter = Inter({ subsets: ['latin'] })


export default function Register() {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [xrpWalletAddress, setXrpWalletAddress] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const registerUser = async (event) => {
        event.preventDefault();
        
        const data = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            xrpWalletAddress: xrpWalletAddress,
            password: password
        }
        
        await axios.post('/api/register', data);
        signIn("credentials", {
            email, password, callbackUrl: `${window.location.origin}/`, redirect: false }
        ).then(function(result) {
            router.push('http://localhost:3000/')
        }).catch(err => {
            alert("Failed to register: " + err.toString())
        });
    }

    return (
        <>
            <section className="bg-gray-50">
            <div className="p-8 md:p-12 lg:px-16 lg:py-24">
            <div className="mx-auto max-w-lg text-center">
                                   

                    <Card color="transparent" shadow={false}>
                    <a href="/"><Image
                src="/logo.png"
                alt="PetProof Logo"
                className="text-center align-center mx-auto my-0 pb-[20px]"
                width={200}
                height={50}
                priority
              /></a>
                    <Typography variant="h4" color="blue-gray">
                        Register
                    </Typography>
                    <Typography color="gray" className="mt-1 font-normal">
                        Enter your details to register.
                    </Typography>
                    <form className="mt-8 mb-2 w-80 text-center mx-auto max-w-screen-lg sm:w-96" onSubmit={registerUser}>
                        <div className="mb-4 flex flex-col gap-6">

                        <Input size="lg" label="First Name" type='text' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <Input size="lg" label="Last Name" type='text' value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        <Input size="lg" label="Email" type='text' value={email} onChange={(e) => setEmail(e.target.value)} />
                        <Input size="lg" label="XRP Wallet Address" type='text' value={xrpWalletAddress} onChange={(e) => setXrpWalletAddress(e.target.value)} />
                        <Input size="lg" label="Password" type='password' value={password} onChange={(e) => setPassword(e.target.value)} />

                        </div>
                        <Checkbox
                        label={
                            (
                            <Typography
                                variant="small"
                                color="gray"
                                className="flex items-center font-normal"
                            >
                                I agree the
                                <a
                                href="#"
                                className="font-medium transition-colors hover:text-blue-500"
                                >
                                &nbsp;Terms and Conditions
                                </a>
                            </Typography>
                            )
                        }
                        containerProps={{ className: "-ml-2.5" }}
                        />
                        <Button className="mt-6" fullWidth type='submit'>
                        Register
                        </Button>
                        <Typography color="gray" className="mt-4 text-center font-normal">
                        Already have an account?{" "}
                        <a
                            href="/api/auth/signin"
                            className="font-medium text-blue-500 transition-colors hover:text-blue-700"
                        >
                            Sign In
                        </a>
                        </Typography>
                    </form>
                    </Card>
                </div>
                </div>        
             </section>    
        </>
    )
}