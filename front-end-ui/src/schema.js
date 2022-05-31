import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export class SolStream {
    constructor(args) {
      console.log('Args:', args)
      console.log('timestamp:', args.timestamp)
      this.instruction = args.transactionMode;
      this.start_time = args.timestamp;
      this.rkey = args.rkey;
      // this.end_time = args.end_time;
      this.amount = (args.amount * LAMPORTS_PER_SOL).toString();
    }
  }
  
export const InitSolStreamSchema = new Map([
[
    SolStream,
    {
    kind: "struct",
    fields: [
        ["instruction", "u8"],
        ["start_time", "u64"],
        ["rkey", "u64"],
        ["amount", "u64"],
    ],
    },
],
]);

