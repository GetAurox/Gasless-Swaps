export const INVALID_METHOD_NAME = "Invalid Method Name";

export const INVALID_SPENDER = "Invalid Spender, must be Forwarding Swap Proxy";

export const INVALID_CHAINID = "Must provide chainId of 1";

export const INVALID_TRANSACTION_TYPE = "Only type 2 transactions supported";

export const INVALID_TO_ADDRESS_FORWARDING_SWAP =
  "Invalid to must be whitelisted by contract";

export const FEE_FIELD_MISMATCH =
  "Approval and Swap proxy fee field's; maxFeePerGas and maxPriorityFeePerGas, must be equal";

export const INSUFFICIENT_GAS_REFUND = "Insufficient gas refund provided";

export const FROM_FIELD_MISMATCH =
  "From address for approval and swap proxy transactions must be equal";

export const FROM_TOKEN_MISMATCH =
  "Approval token transaction and _fromToken field must specify the same token for approval";

export const INSUFFICIENT_APPROVAL_BALANCE =
  "Insufficient approval balance for swap";

export const INSUFFICIENT_FROM_TOKEN_BALANCE =
  "Insufficient from token balance for swap";

export const INSUFFICIENT_ETH_PROVIDED =
  "Insufficient ETH provided to execute swap";
