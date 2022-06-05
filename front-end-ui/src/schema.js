import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export class SolStream {
    constructor(args) {
      console.log('Args:', args)
      console.log('timestamp:', args.timestamp)
      this.instruction = 0;
      this.start_time = args.timestamp;
      this.rkey = args.rkey;
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
        ["receiver", "u64"],
        ["amount_to_send", "u64"],
    ],
    },
],
]);

