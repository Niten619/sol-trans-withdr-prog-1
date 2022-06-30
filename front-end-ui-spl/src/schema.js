import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export class SendSplToken {
    constructor(args) {
      console.log('Args:', args)
      console.log('timestamp:', args.timestamp)
      console.log('amount:', args.amount)
      this.instruction = args.transactionMode;
      this.start_time = args.timestamp;
      this.amount = (args.amount * LAMPORTS_PER_SOL).toString();
    }
  }
  
export const SendSplTokenSchema = new Map([
[
  SendSplToken,
    {
    kind: "struct",
    fields: [
        ["instruction", "u8"],
        ["start_time", "u64"],
        ["amount", "u64"],
      ],
    },
  ],
]);


export class WithdrawSplToken {
  constructor(args) {
    this.instruction = args.transactionMode;
    this.amount = (args.amount * LAMPORTS_PER_SOL).toString();
  }
}

export const WithdrawSplTokenSchema = new Map([
  [
    WithdrawSplToken,
    {
      kind: "struct",
      fields: [
        ["instruction", "u8"],
        ["amount", "u64"],
      ],
    },
  ],
]);

