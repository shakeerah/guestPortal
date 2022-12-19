import React, { useEffect, useState, Fragment } from 'react';
import { ethers } from 'ethers';
import ABI from './utils/VPortal.json';
// let visits = null;


import { Popover, Listbox, Transition } from '@headlessui/react'
import Picker from 'emoji-picker-react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'About', href: '#' },
  { name: 'Guest Book', href: '#' },
  { name: 'Thoughts', href: '#' },
  { name: 'Contact', href: '#' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const getEthereumObject = () => window.ethereum;
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();
    if (!ethereum) {
      console.error('Make sure you have Metamask!');
      return null;
    }
    console.log('We have the Ethereum object', ethereum);
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Wefound an authorized  account: ', account);
      return account;
    } else {
      console.error('No authorized account found');
      return null;
    }
  } catch (err) {
    console.error(error);
    return null;
  }
};

const App = () => {
   const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [visits, setVisits] = useState('');
  const [chosenEmoji, setChosenEmoji] = useState(null);

  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
  };
  
  const [currentAccount, setCurrentAccount] = useState('');
  const contactAddress = '0x1d3Aa3D6CFD0B80576B6ff4c7Cf70C89D35C54a7';
  const contractABI = ABI.abi;

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert('Please connect to Wallet (Metamask/Coinbase)');
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected Account: ', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log('connect wallet error: ', error);
      if (!error.code == '-32002') {
        alert(error.message);
      } else {
        alert(
          'Open Wallet (Metamask/Coinbase) to confirm that there no pending connection request.'
        );
      }
    }
  };

  const vContract = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const VPortalContract = new ethers.Contract(contactAddress, contractABI, signer);

        return VPortalContract
      } else {
        console.log('Ethereum Object does not exist ');
        return null
      }
    } catch (error) {
      console.log('Wave Error: ', error);
      return null
    }
  };

  const waveLog = async () => {
    try {
      const VPortalContract = await vContract();
      if (VPortalContract) {

        let vCount = await VPortalContract.getTotalWaves();

        const visits = await VPortalContract.getVisitorsWaves();
        setVisits(visits)
        console.log('Retrieved total wave count...:  ',visits.length, vCount);
        console.log('visits==visits', visits)
        if (visits && visits.lenght) {
        for (let i = 0; i < visits; i++) {
          visits[i].wavedAt = new Date(visits[i].wavedAt * 1000).toString();
        }
        setVisits(visits)
        }
      } else {
        console.log('Ethereum Object does not exist ');
      }
    } catch (error) {
      console.log('Wave Error: ', error);
    }
  };

  const wave = async (e) => {
    try {
      e.preventDefault();

      console.log("started.....", name, email, message)
  
      const VPortalContract = await vContract();
      if (VPortalContract) {

        const vTrx = await VPortalContract.wave(name, email, message, { gasLimit: 300000 })
        
        // console.log("Mining.....", vTrx.hash)

        await vTrx.wait();

         setName('');
          setEmail('');
          setMessage('');
        await waveLog();
      } else {
        console.log('Ethereum Object does not exist ');
      }
      console.log("finsin shed.....", name, email, message)
    } catch (error) {
      console.log('Wave Error: ', error);
      alert('Wave Error: ' + error.message );
    }
  };

  useEffect(async () => {
    
    const account = await findMetaMaskAccount();
    if (account != null) {
      setCurrentAccount(account);
      await waveLog()
    }


    const onNewWave = (from, wavedAt, message)=>{
      console.log("New Wave in => ", from, wavedAt, message);
      setVisits(visits)
      setVisits(prevState => [
      ...prevState,
      {
        visitorsAddress: from,
        wavedAt: new Date(wavedAt * 1000),
        messages: message,
      },
    ]);
      waveLog()
    }

    const VPortalContract = await vContract();
      if (VPortalContract) {
      VPortalContract.on("NewWave", onNewWave);
    }

  return () => {
    if (VPortalContract) {
      VPortalContract.off("NewWave", onNewWave);
    }
  };
    
  }, []);

  return (
    <div>
      {/*  Layout? */}
      <div className="bg-gray-800 text-gray-400">

        {/* Nav */}
        <div className="w-full bg-gray-900 pb-6">
          <Popover>
            <div className="relative px-4 pt-6 sm:px-6 lg:px-8">
              <nav className="relative flex items-center justify-between sm:h-10 " aria-label="Global">
                {/* Logo */}
                <div className="flex flex-shrink-0 flex-grow items-center lg:flex-grow-0">
                  <div className="flex w-full items-center justify-between md:w-auto">
                    <a href="#">
                      <span className="sr-only">Wave Simply Shakirah</span>
                      <img
                        alt="Wave Simply Shakirah"
                        className="h-8 w-auto sm:h-10"
                        src="https://avatars.githubusercontent.com/u/54970951?s=700"
                      />
                    </a>
                    <div className="-mr-2 flex items-center md:hidden">
                      <Popover.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-900 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-800">
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                      </Popover.Button>
                    </div>
                  </div>
                </div>
                

                {/* Middles Links */}
                <div className="hidden md:ml-10 md:block md:space-x-8 md:pr-4">
                  
                </div>

                {/* Right Links */}
                <div className="hidden md:ml-10 md:block md:space-x-8 md:pr-4 md:justify-end xl:col-span-4">
                  {navigation.map((item) => (
                    <a key={item.name} href={item.href} className="font-medium text-gray-400 hover:text-gray-500">
                      {item.name}
                    </a>
                  ))}
                  <a
                    href="#"
                    className="ml-6 inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-sm font-medium text-gray-400 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                  >
                    Hire Me
                  </a>
                </div>
              </nav>
            </div>


            {/* Mobile */}

            <Transition
              as={Fragment}
              enter="duration-150 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-100 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Popover.Panel
                focus
                className="absolute bg-gray-900 inset-x-0 top-0 z-10 origin-top-right transform p-2 transition md:hidden"
              >
                <div className="overflow-hidden rounded-lg shadow-md ring-1 ring-gray ring-opacity-5">
                  <div className="flex items-center justify-between px-5 pt-4">
                    <div>
                      <img
                        className="h-8 w-auto"
                        src="https://avatars.githubusercontent.com/u/54970951?s=700"
                        alt="Wave Simply Shakirah"
                      />
                    </div>
                    <div className="-mr-2">
                      <Popover.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-800">
                        <span className="sr-only">Close main menu</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </Popover.Button>
                    </div>
                  </div>
                  <div className="space-y-1 px-2 pt-2 pb-3">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-700 hover:text-gray-400"
                      >
                        {item.name}
                      </a>
                    ))}

                    {/* Hire MeMobile */}
                    <div className="">
                      <a
                        href="#"
                        className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-sm font-medium text-gray-400 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"

                      >
                        Hire Me
                      </a>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>

          </Popover>
        </div>

        {/* Body */}
        <main className="">
          <div  className="flex flex-wrap md:flex-nowrap mx-auto max-w-7xl my-16 place-items-center">
            {/* Intro */}
            <div className="p-16">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight text-gray-500 md:text-6xl">
                  <span className="block md:inline">I'm Simply</span>{' '}
                  <span className="block text-gray-300 md:inline">Shakirah</span>
                </h1>
                <h2 className="mt-4 font-bold tracking-tight text-gray-400">
                  The Code-Blooded Software Engineer / Manager that bridges the gap between the Product and the Technology. 
                  <br />
                  I am on a mission to Serve, Impact and Imrove living.

                </h2>
                <p className="mt-5 text-base text-gray-500 mx-auto sm:max-w-xl sm:text-lg md:text-xl lg:mx-0">
                  <span>
                    Welcome! This is my first blockchain based project and i am glad to have you here. Please dont forget to Connect your Ethereum wallet and send a wave before you leave.   
  Also, the Wavers may recieve some Token Goodies !!
                  </span>
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className=" flex flex-col gap-8 flex-shrink-0">
                  
                    {/*
                    *If there is no currentAccount render the Connect button
                    */}
  
                    {!currentAccount && (
                      <div className="rounded-md shadow">
                        <a
                          href="#"
                          className="rounded-md border border-transparent bg-gray-900 px-5 py-3 font-medium hover:bg-gray-700 text-gray-400"
                          onClick={connectWallet}
                        >
                          Connect Wallet
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
  
            </div>
  
            {/* Greeting Form */}
             {/*
            * Display Form if there iscurrent account r
            */}
  
             {currentAccount && ( 
            <div className="bg-gray-900 mx-auto px-8 py-12 shadow rounded-lg w-[60%] md:w-1/3">
              <div className="mb-8">
                <h3 className="text-lg font-medium leading-6 text-gray-500">Stop by and say Hi </h3>
                <p className="mt-1 text-sm text-gray-400">I will aprreciate a feedback.</p>
              </div>
  
              <div className="mt-5">
                <form action="#" onSubmit={wave} className="space-y-2 text-gray-300">
                  <div className="name">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="name"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="mt-1 bg-gray-800 block w-full rounded-md border-gray-800 shadow-sm focus:border-gray-700 focus:ring-gray-800 sm:text-sm"
                    />
                  </div>
  
                  <div className="email">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="mt-1 bg-gray-800 block w-full rounded-md border-gray-800 shadow-sm focus:border-gray-700 focus:ring-gray-800 sm:text-sm"
                    />
                  </div>
  
                  {/* Textarea Chart box */}
                  <div className="relative">
                    <div className="overflow-hidden rounded-lg border border-gray-800 shadow-sm focus-within:border-gray-700 focus-within:ring-1 focus-within:ring-gray-800">
                      <label htmlFor="message" className="sr-only">
                        Add your message
                      </label>
                      <textarea
                        rows={3}
                        name="message"
                        id="message"
                        onChange={e => setMessage(e.target.value)}
                        className="bg-gray-800 block w-full resize-none border-0 py-3 focus:ring-0 sm:text-sm"
                        placeholder="Add your message..."
                        defaultValue={''}
                      />
  
                      {/* Spacer element to match the height of the toolbar */}
                      <div className="bg-gray-900 pt-2" aria-hidden="true">
                        {/* Matches height of button in toolbar (1px border + 36px content height) */}
                        <div className="py-px">
                          <div className="h-6" />
                        </div>
                      </div>
                    </div>

                    {/* Emogi box */}
                    <div className="bg-gray-800 absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                      <div className="flex items-center space-x-5">
                        <div className="flex items-center">
                         {/* <Picker onEmojiClick={onEmojiClick} /> */}
                          
                          <Listbox >
                            {({ open }) => (
                              <>
                                <Listbox.Label className="sr-only"> Your mood </Listbox.Label>
                                <div className="relative">
                                  <Listbox.Button className="relative -m-2.5 flex h-10 w-10 items-center justify-center rounded-full">
                                    <span className="flex items-center justify-center">
                                      {chosenEmoji === null ? (
                                        <span> 👋
                                          <span className="sr-only"> Add your mood </span>
                                        </span>
                                      ) : (
                                        <span>
                                            {chosenEmoji.emoji}
                                        </span>
                                      )}
                                    </span>
                                  </Listbox.Button>
  
                                  <Transition
                                    show={open}
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                  >
                                    <Listbox.Options className="absolute z-10 mt-1 -ml-6 w-60 rounded-lg bg-gray-700 py-3 text-base shadow sm:ml-auto sm:w-64 sm:text-sm"> 
                                      <Picker onEmojiClick={onEmojiClick} />
                                    </Listbox.Options>
                                  </Transition>
                                </div>
                              </>
                            )}
                          </Listbox>
                        </div>
                      </div>
                    </div>
  
                  </div>
                  
                      <div className="mt-4 rounded-md shadow">
                        <button
                          type="submit"
                          className=" rounded-md border border-transparent bg-gray-800 px-5 py-3 font-medium hover:bg-gray-700"
                        >
                          Wave
                        </button>
                      </div>
  
                </form>
               
              </div>
  
            </div>
                )}

              
          </div>

         {/* Visitors Wave list  2a2c39 */}
        {visits && ( 

        <div className="w-full bg-gray-700 py-16 ">
          <ul role="list" className="divide-y divide-gray-200 ">
           {visits.map((visitor) => ( 
            <li className="flex p-12 mx-auto max-w-6xl gap-4 bg-gray-800 text-gray-400">
              <div className="bg-gray-700 w-32 h-32 p-4 flex place-content-center place-items-center text-center ">
                <p className="">
                <span className="text-gray-500 text-4xl "> 👋 </span>
                <span className="text-gray-500 text-4xl ">{visitor.waveNo.toString()}  </span>
                </p>
                
              </div>
              <div className="ml-8 space-y-2">
                <p className="text-sm font-medium text-gray-300">Address: {visitor.visitorsAddress}</p>
                <p className="text-sm text-gray-500">{visitor.name}</p>
                 {/* Todo : List messages */}
                <p className="text-sm text-gray-500">{visitor.messages} kkkkk </p>
                {/* 
                <div>
                  <ul role="list" className="divide-y divide-gray-200">
                {visitor.messages.map((message, i) => (
                  <li key=i} className="flex py-4">
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">{message}</p>
                    </div>
                  </li>
                ))}
              </ul>
                </div>
                */}
              </div>
            </li>
           ))} 
          </ul>
        </div>
     
        )} 
          
         </main>

      </div>

      {/*  layout end */}

    </div>
  );
};

export default App;
