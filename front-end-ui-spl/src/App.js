import React, { useState } from "react";
// import ReactDOM from "react-dom";
import {Keypair, TransactionInstruction, PublicKey, Transaction, Connection, clusterApiUrl, SystemProgram } from "@solana/web3.js";
import "./styles.css";
import { extendBorsh } from "./utils/borsh";
// import { Buffer } from "buffer";
// const { extendBorsh } = require("./utils/borsh");
// import * as bs58 from "bs58";
const { SendSplTokenSchema, SendSplToken, WithdrawSplTokenSchema, WithdrawSplToken } = require("./schema");
const { serialize } = require("borsh");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
extendBorsh();

// window.Buffer = Buffer;
window.Buffer = window.Buffer || require("buffer").Buffer;

function App() {
  // React States
  // const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [transactionMode, setTransactionMode]   = useState('Trans: Not selected');
  const [connectWallet, setConnectWallet] = useState('Not Connected');

  const [rkey, setRkey] = useState('');
  const [amount, setAmount] = useState('');

  const PROGRAM_ID = "8EBQJdgAdFiSu56Nh1PfE3JKbEJ9s4ez1auDvjvCyosB";  // program_id of the deployed program
  const senderaddress = new PublicKey("HZpyGMxawAZy8ENvRtTsdQiwDGeBMtU2Dx1P9DFdRdvu");  // SPL Wallet 1
  const tokenmint = new PublicKey("itUKBea2APSEQfSibh3zMMCexaeJ1sWXHLoRj6TJX3N");  // token-address
  const SYSTEM_RENT = "SysvarRent111111111111111111111111111111111";
  const ATOKEN = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
  
  // const stringOfWithdraw = "withdraw_token";
  const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  );
  const token_program_id = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

  // const pda = new Keypair();
  // const pda_address = pda.publicKey.toString();
  // console.log('PDA Address:', pda_address)

  const base58publicKey = new PublicKey(
    "8EBQJdgAdFiSu56Nh1PfE3JKbEJ9s4ez1auDvjvCyosB"
  );

  const handleChange = e => {
    // this.setState({radio_value:e.target.value})
    // alert("Selected radio value is :"+e.target.value)
    // console.log(e.target.value)
    setTransactionMode(e.target.value)
  };

  // Connecting to the DevNet
  const connection = new Connection(clusterApiUrl("devnet"));

  // Connecting to the LocalNet
  // const opts = {
  //   preflightCommitment: "processed"
  // }
  // const network = "http://127.0.0.1:8899";
  // const connection = new Connection(network, opts.preflightCommitment);

  // const cluster = "devnet";

  async function ConnectWallet(e){
    // console.log(e.target.value)
    try {
      // const resp = await window.solana.connect();
      // console.log(resp.publicKey.toString())

      await window.solana.connect();
      window.solana.connect({ onlyIfTrusted: true });  // eagarly connection
      console.log(window.solana.publicKey.toString())
      // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo 
    } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
    }
    setConnectWallet('Connected')
  }

  async function transferTransaction(formSubmit) {

    async function findAssociatedTokenAddress(walletAddress, tokenMintAddress) {
      return (
        await PublicKey.findProgramAddress(
          [
            walletAddress.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
          ],
          SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
        )
      )[0];
    }
    
    console.log("senderaddress:", senderaddress)
    console.log('RKEY', rkey)

    // Creating Associated Token Account for sender
    const sender_associated_token_address = await findAssociatedTokenAddress(
      senderaddress,
      tokenmint
    );
    console.log("sender_associated_token_address:", sender_associated_token_address)
    console.log("sender_associated_token_address.toBase58:", sender_associated_token_address.toBase58())

    // Creating Sender's Vault
    const validProgramAddress = await PublicKey.findProgramAddress(
      [senderaddress.toBuffer()],
      base58publicKey
    );
    console.log("validProgramAddress:", validProgramAddress)
    console.log("validProgramAddress[0]:", validProgramAddress[0])
      
    // Creating Associated Token Address for sender's vault
    const vault_associated_token_address = await findAssociatedTokenAddress(
      validProgramAddress[0],
      tokenmint
    );

    console.log("vault_associated_token_address:", vault_associated_token_address)
    console.log("vault_associated_token_address.toBase58:", vault_associated_token_address.toBase58())

    const pda = new Keypair();
    console.log('pda keypair', pda)
    console.log('pda publicKey', pda.publicKey)
    console.log('pda_address(send)', pda.publicKey.toBase58())

    // Storing PDA to the browser's local storage
    const pdaObj = {
      pda : pda,
      pda_address : pda.publicKey.toBase58()
    };
    const myJson = JSON.stringify(pdaObj);
    localStorage.setItem("pdaData", myJson);

    // Retrieving Data from the browser's local storage
    const text = localStorage.getItem("pdaData");
    const obj = JSON.parse(text);
    console.log('obj.pda:', obj.pda)
    console.log('obj.pda_address:', obj.pda_address)

    const instruction = new TransactionInstruction({
      keys: [
        {
          // escrow
          pubkey: pda.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          // sender
          // pubkey: new PublicKey(window.solana.publicKey.toString()),
          pubkey: senderaddress,
          isSigner: true,
          isWritable: true,
        },
        {
          // recipient
          pubkey: new PublicKey(rkey),
          isSigner: false,
          isWritable: true,
        },
        {
          // system program required to make a transfer
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
        {
          // token mint address
          pubkey: tokenmint,
          isSigner: false,
          isWritable: false,
        },
        {
          // token program id
          // pubkey: pda_associated_token_address,
          pubkey: new PublicKey(token_program_id),
          isSigner: false,
          isWritable: false,
        },
        {
          // Sender's ATA (Associated Token Account)
          pubkey: sender_associated_token_address,
          isSigner: false,
          isWritable: true,
        },
        {
          // Sender Vault's ATA
          pubkey: vault_associated_token_address,
          isSigner: false,
          isWritable: true,
        },
        {
          // Rent
          pubkey: new PublicKey(SYSTEM_RENT),
          isSigner: false,
          isWritable: false,
        },
        {
          // ATOKEN
          pubkey: new PublicKey(ATOKEN),
          isSigner: false,
          isWritable: false,
        },
        {
          // Sender's Vault
          pubkey: validProgramAddress[0],
          isSigner: false,
          isWritable: true,
        }

      ],
      programId: new PublicKey(PROGRAM_ID),
      data: serialize(SendSplTokenSchema,new SendSplToken(formSubmit)),
    });

    console.log('instruction',instruction);
    const transaction = new Transaction().add(instruction);

      // try {
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;
        transaction.feePayer = window.solana.publicKey;
        transaction.partialSign(pda);
        // transaction.partialSign(pda_keypair);
        console.log('transaction:', transaction)
        const signed = await window.solana.signTransaction(transaction);
        console.log('signed:', signed)
        const signature = await connection.sendRawTransaction(signed.serialize());
        console.log('signature:', signature)
        const finality = "confirmed";
        await connection.confirmTransaction(signature, finality);
        const explorerhash = {
          transactionhash: signature,
        };

        console.log('Explorerhash:', explorerhash);
  }

  async function withdrawTransaction(formSubmit) {
    async function findAssociatedTokenAddress(walletAddress, tokenMintAddress) {
      return (
        await PublicKey.findProgramAddress(
          [
            walletAddress.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
          ],
          SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
        )
      )[0];
    }

    // Creating Associated Token Account for recipient
    const recipient_associated_token_address = await findAssociatedTokenAddress(
      new PublicKey(rkey),
      tokenmint
    );
    console.log("recipient_associated_token_address:", recipient_associated_token_address)
    console.log("recipient_associated_token_address.toBase58:", recipient_associated_token_address.toBase58())

    // Creating Sender's Vault
    const validProgramAddress = await PublicKey.findProgramAddress(
      [senderaddress.toBuffer()],
      base58publicKey
    );
    console.log("validProgramAddress:", validProgramAddress)
    console.log("validProgramAddress[0]:", validProgramAddress[0])
    console.log("validProgramAddress pubkey:", validProgramAddress[0].toBase58())

    // Creating Associated Token Address for sender's vault
    const vault_associated_token_address = await findAssociatedTokenAddress(
      validProgramAddress[0],
      tokenmint
    );

    console.log("vault_associated_token_address:", vault_associated_token_address)
    console.log("vault_associated_token_address.toBase58:", vault_associated_token_address.toBase58())

    // Retrieving Data from the browser's local storage
    const text = localStorage.getItem("pdaData");
    const obj = JSON.parse(text);
    console.log('obj.pda:', obj.pda)
    console.log('obj.pda_address:', obj.pda_address)

    console.log('SenderAddress', senderaddress)
    console.log('RKEY', rkey)

    const instruction = new TransactionInstruction({
      keys: [
        {
          // escrow
          pubkey: new PublicKey(obj.pda_address),
          isSigner: false,
          isWritable: true,
        },
        {
          // sender
          pubkey: new PublicKey(senderaddress),
          isSigner: false,
          isWritable: true,
        },
        {
          // Sender's Vault
          pubkey: validProgramAddress[0],
          isSigner: false,
          isWritable: true,
        },
        {
          // recipient
          pubkey: new PublicKey(rkey),
          isSigner: true,
          isWritable: true,
        },
        {
          // system program required to make a transfer
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
        {
          // token mint address
          pubkey: tokenmint,
          isSigner: false,
          isWritable: false,
        },
        {
          // token program id
          pubkey: new PublicKey(token_program_id),
          isSigner: false,
          isWritable: false,
        },
        {
          // Sender Vault's ATA
          pubkey: vault_associated_token_address,
          isSigner: false,
          isWritable: true,
        },
        {
          // Recipient's ATA
          pubkey: recipient_associated_token_address,
          isSigner: false,
          isWritable: true,
        },
        {
          // Rent
          pubkey: new PublicKey(SYSTEM_RENT),
          isSigner: false,
          isWritable: false,
        },
        {
          // ATOKEN
          pubkey: new PublicKey(ATOKEN),
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: new PublicKey(PROGRAM_ID),
      data: serialize(WithdrawSplTokenSchema, new WithdrawSplToken(formSubmit)),
    });

    console.log('instruction',instruction);
    const transaction = new Transaction().add(instruction);

      // try {
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;
        transaction.feePayer = window.solana.publicKey;
        const signed = await window.solana.signTransaction(transaction);
        console.log('signed:', signed)
        const signature = await connection.sendRawTransaction(signed.serialize());
        console.log('signature:', signature)
        const finality = "confirmed";
        await connection.confirmTransaction(signature, finality);
        const explorerhash = {
          transactionhash: signature,
        };

        console.log('Explorerhash:', explorerhash);
  }

  const handleSubmit = async (event) => {
    //Prevent page reload
    event.preventDefault();

    // Capture Unix-Timestamp
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime / 1000);
    console.log('Unix TimeStamp:', timestamp)


    // const formSubmit = { transactionMode, timestamp, rkey, amount };
    // console.log('rkey', rkey)
    
    if (transactionMode == 2){ // Send
      console.log('Transaction Mode 2')
      const formSubmit = { transactionMode, timestamp, amount };
      transferTransaction(formSubmit)
    } else {                  // Withdraw
      console.log('Transaction Mode 3')
      const formSubmit = { transactionMode, amount };
      withdrawTransaction(formSubmit)
    }
    };


  // JSX code for login form
  const renderForm = (
    <div className="form">
      <div className="button-container">
          <input type="button"  value='Connect Wallet' onClick={ConnectWallet}/>
      </div>

        <h1>
        {connectWallet}
        </h1>

      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label>Receiver-key </label>
          <input type="text" value={rkey} onChange={(e) => setRkey(e.target.value)} required />
        </div>

        <div className="input-container">
          <label>Amount ($) </label>
          <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        
        <div onChange={handleChange}>
          <input type="radio" value = {2}  name='transaction' /> Transfer
          <input type="radio" value = {3}  name='transaction' /> Withdraw
        </div>

        <div className="button-container">
          <input type="submit"  value='Send'/>
        </div>

        <h1>
        {transactionMode}
        </h1>
      </form>
    </div>
  );

  return (
    <div className="app">
      <div className="login-form">
        <div className="title">Zebec Protocal</div>
        {isSubmitted ? <div>User is successfully logged in</div> : renderForm}
      </div>
    </div>
  );
}

export default App;