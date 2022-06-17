import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export class SendSol {
    constructor(args) {
      console.log('Args:', args)
      console.log('timestamp:', args.timestamp)
      console.log('amount:', args.amount)
      this.instruction = args.transactionMode;
      this.start_time = args.timestamp;
      this.amount_to_send = (args.amount * LAMPORTS_PER_SOL).toString();
    }
  }
  
export const SendSolSchema = new Map([
[
    SendSol,
    {
    kind: "struct",
    fields: [
        ["instruction", "u8"],
        ["start_time", "u64"],
        ["amount_to_send", "u64"],
      ],
    },
  ],
]);


export class WithdrawSol {
  constructor(args) {
    this.instruction = args.transactionMode;
    this.amount = (args.amount * LAMPORTS_PER_SOL).toString();
  }
}

export const WithdrawSolSchema = new Map([
  [
    WithdrawSol,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
        ["amount", "u64"],
      ],
    },
  ],
]);

