import axios from "axios";

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI: string;
}

export type TokenResponse = Record<string, Token>;

export const getAllTokens = (): Promise<TokenResponse> =>
  axios
    .get("https://api.1inch.io/v4.0/1/tokens")
    .then(({ data }) => data.tokens);
