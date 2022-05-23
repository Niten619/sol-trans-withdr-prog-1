import React, { useState } from "react";
// import ReactDOM from "react-dom";
import {Keypair, TransactionInstruction, PublicKey, Transaction, LAMPORTS_PER_SOL, Connection, clusterApiUrl} from "@solana/web3.js";
import "./styles.css";
import { Buffer } from "buffer";

function App() {
  // React States
  // const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [radiovalue, setRadiovalue]   = useState('Trans: Not selected');
  const [connectWallet, setConnectWallet] = useState('Not Connected');

  const [rkey, setRkey] = useState('');
  const [amount, setAmount] = useState('');

  const PROGRAM_ID = "ACebcF5WjNbotDSPQjZPrRGVi8jPX4MYquePcBU2E1F1";  // program_id of the deployed program
  const base58publicKey = new PublicKey(
    "ACebcF5WjNbotDSPQjZPrRGVi8jPX4MYquePcBU2E1F1"
  );
  const stringofwithdraw = "withdraw_sol";

  const handleChange = e => {
    // this.setState({radio_value:e.target.value})
    // alert("Selected radio value is :"+e.target.value)
    // console.log(e.target.value)
    setRadiovalue(e.target.value)
  };

  const connection = new Connection(clusterApiUrl("devnet"));
  const cluster = "devnet"; 

  
  async function ConnectWallet(e){
    // console.log(e.target.value)
    try {
      // const resp = await window.solana.connect();
      // console.log(resp.publicKey.toString())

      await window.solana.connect();
      console.log(window.solana.publicKey.toString())
      // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo 
    } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
    }
    setConnectWallet('Connected')
  }

  const handleSubmit = async (event) => {
    //Prevent page reload
    event.preventDefault();

    const formSubmit = { rkey, amount };

    console.log(formSubmit)
    console.log(formSubmit.rkey, formSubmit.amount)
    
    // Capture Unix-Timestamp
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime / 1000);
    console.log('Unix TimeStamp:', timestamp)

    const senderaddress = new PublicKey(window.solana.publicKey.toString());
    const withdraw_data = await PublicKey.findProgramAddress(
    [Buffer.from(stringofwithdraw), senderaddress.toBuffer()],
    base58publicKey
    );
    const pda = new Keypair();
    console.log('SenderAddress', senderaddress)
    console.log('PDA', pda)

    const instruction = new TransactionInstruction({
      keys: [
        {
          pubkey: new PublicKey(window.solana.publicKey.toString()),  //sender
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(formSubmit.rkey), //recipient
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: pda.publicKey,
          isSigner: true,
          isWritable: true,
        }
      ],
      programId: new PublicKey(PROGRAM_ID),
      // data: serialize(InitSolStreamSchema,new SolStream(data)),
    
    })

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
          <input type="radio" value = "Transfer"  name='transaction' /> Transfer
          <input type="radio" value = "Withdraw"  name='transaction' /> Withdraw
        </div>

        <div className="button-container">
          <input type="submit"  value='Send'/>
        </div>

        <h1>
        {radiovalue}
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