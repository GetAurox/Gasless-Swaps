export type IsValidTransactionResponse =
  | { status: true }
  | { status: false; error: string };
