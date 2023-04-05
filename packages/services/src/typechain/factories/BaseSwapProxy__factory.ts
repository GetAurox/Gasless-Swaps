/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { BaseSwapProxy, BaseSwapProxyInterface } from "../BaseSwapProxy";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_admin",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "prod1",
        type: "uint256",
      },
    ],
    name: "PRBMath__MulDivFixedPointOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "prod1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "denominator",
        type: "uint256",
      },
    ],
    name: "PRBMath__MulDivOverflow",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "SetFee",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract IVault",
        name: "vault",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "setter",
        type: "address",
      },
    ],
    name: "VaultSet",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WETH",
    outputs: [
      {
        internalType: "contract IERC20Extension",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Extension",
        name: "_token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_gasRefund",
        type: "uint256",
      },
    ],
    name: "calculatePercentageFeeInETH",
    outputs: [
      {
        internalType: "uint256",
        name: "feeTotalInETH",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "feeTotalInToken",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ethContract",
    outputs: [
      {
        internalType: "contract IERC20Extension",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feePercentage",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feedRegistry",
    outputs: [
      {
        internalType: "contract FeedRegistryInterface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Extension",
        name: "_fromToken",
        type: "address",
      },
      {
        internalType: "contract IERC20Extension",
        name: "_toToken",
        type: "address",
      },
    ],
    name: "getChainlinkRate",
    outputs: [
      {
        internalType: "uint256",
        name: "exchangeRate",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Extension",
        name: "_fromToken",
        type: "address",
      },
      {
        internalType: "contract IERC20Extension",
        name: "_toToken",
        type: "address",
      },
    ],
    name: "getExchangeRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Extension",
        name: "_fromToken",
        type: "address",
      },
      {
        internalType: "contract IERC20Extension",
        name: "_toToken",
        type: "address",
      },
    ],
    name: "getUniswapV2Rate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Extension",
        name: "_token",
        type: "address",
      },
    ],
    name: "isEth",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "_inputDecimals",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "_outputDecimals",
        type: "uint8",
      },
    ],
    name: "scaleAmountFromDecimals",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Extension",
        name: "_token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "_inputDecimals",
        type: "uint8",
      },
    ],
    name: "scaleAmountFromTokenDecimals",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_pauseContract",
        type: "bool",
      },
    ],
    name: "setContractPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256",
      },
    ],
    name: "setFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IVault",
        name: "_vault",
        type: "address",
      },
    ],
    name: "setVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "uniswapV2Router",
    outputs: [
      {
        internalType: "contract IUniswapV2Router02",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vault",
    outputs: [
      {
        internalType: "contract IVault",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20Extension",
        name: "_token",
        type: "address",
      },
    ],
    name: "withdrawERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604051620026d3380380620026d38339810160408190526200003491620001bc565b6002805460ff1916905560016003556200005060008262000057565b50620001ee565b62000063828262000067565b5050565b6200007e8282620000aa60201b620010031760201c565b6000828152600160209081526040909120620000a5918390620010a16200014a821b17901c565b505050565b6000828152602081815260408083206001600160a01b038516845290915290205460ff1662000063576000828152602081815260408083206001600160a01b03851684529091529020805460ff19166001179055620001063390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b600062000161836001600160a01b0384166200016a565b90505b92915050565b6000818152600183016020526040812054620001b35750815460018181018455600084815260208082209093018490558454848252828601909352604090209190915562000164565b50600062000164565b600060208284031215620001cf57600080fd5b81516001600160a01b0381168114620001e757600080fd5b9392505050565b6124d580620001fe6000396000f3fe6080604052600436106101b05760003560e01c80639010d07c116100ec578063baaa61be1161008a578063ea9119a511610064578063ea9119a514610510578063ead8ece81461054d578063f4f3b20014610582578063fbfa77cf146105a257600080fd5b8063baaa61be146104b0578063ca15c873146104d0578063d547741f146104f057600080fd5b8063a001ecdd116100c6578063a001ecdd1461043d578063a217fddf14610453578063a702f2c014610468578063ad5c46481461048857600080fd5b80639010d07c146103b157806390238c39146103d157806391d14854146103f957600080fd5b80634021a867116101595780635c975abb116101335780635c975abb146103395780636817031b1461035157806369fe0e2d14610371578063882796f11461039157600080fd5b80634021a867146102d95780634c712594146102f95780635285301c1461031957600080fd5b80632f2ff15d1161018a5780632f2ff15d1461026f57806336568abe146102915780633cc562b2146102b157600080fd5b806301ffc9a7146101bc5780631694505e146101f1578063248a9ca31461023157600080fd5b366101b757005b600080fd5b3480156101c857600080fd5b506101dc6101d7366004611d8c565b6105c2565b60405190151581526020015b60405180910390f35b3480156101fd57600080fd5b50610219737a250d5630b4cf539739df2c5dacb4c659f2488d81565b6040516001600160a01b0390911681526020016101e8565b34801561023d57600080fd5b5061026161024c366004611db6565b60009081526020819052604090206001015490565b6040519081526020016101e8565b34801561027b57600080fd5b5061028f61028a366004611de7565b610606565b005b34801561029d57600080fd5b5061028f6102ac366004611de7565b610631565b3480156102bd57600080fd5b5061021973eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee81565b3480156102e557600080fd5b506102616102f4366004611e26565b6106c2565b34801561030557600080fd5b50610261610314366004611e68565b6106e6565b34801561032557600080fd5b50610261610334366004611e68565b61087e565b34801561034557600080fd5b5060025460ff166101dc565b34801561035d57600080fd5b5061028f61036c366004611e96565b610a00565b34801561037d57600080fd5b5061028f61038c366004611db6565b610a7c565b34801561039d57600080fd5b5061028f6103ac366004611ec1565b610abf565b3480156103bd57600080fd5b506102196103cc366004611ede565b610ae1565b3480156103dd57600080fd5b506102197347fb2585d2c56fe188d0e6ec628a38b74fceeedf81565b34801561040557600080fd5b506101dc610414366004611de7565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b34801561044957600080fd5b5061026160055481565b34801561045f57600080fd5b50610261600081565b34801561047457600080fd5b50610261610483366004611f00565b610af9565b34801561049457600080fd5b5061021973c02aaa39b223fe8d0a0e5c4f27ead9083c756cc281565b3480156104bc57600080fd5b506102616104cb366004611e68565b610b6a565b3480156104dc57600080fd5b506102616104eb366004611db6565b610c95565b3480156104fc57600080fd5b5061028f61050b366004611de7565b610cac565b34801561051c57600080fd5b506101dc61052b366004611e96565b6001600160a01b031673eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee1490565b34801561055957600080fd5b5061056d610568366004611f37565b610cd2565b604080519283526020830191909152016101e8565b34801561058e57600080fd5b5061028f61059d366004611e96565b610dfa565b3480156105ae57600080fd5b50600454610219906001600160a01b031681565b60006001600160e01b031982167f5a05180f0000000000000000000000000000000000000000000000000000000014806106005750610600826110b6565b92915050565b600082815260208190526040902060010154610622813361111d565b61062c838361119b565b505050565b6001600160a01b03811633146106b45760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201527f20726f6c657320666f722073656c66000000000000000000000000000000000060648201526084015b60405180910390fd5b6106be82826111bd565b5050565b6000806106ce856111df565b90506106db848483610af9565b9150505b9392505050565b600073eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed196001600160a01b038416016107255773c02aaa39b223fe8d0a0e5c4f27ead9083c756cc292505b73eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed196001600160a01b038316016107625773c02aaa39b223fe8d0a0e5c4f27ead9083c756cc291505b600061076e8484611270565b90508051600003610783576000915050610600565b600061078e856111df565b9050600061079d82600a612066565b6107a8906001612075565b6040517fd06ca61f000000000000000000000000000000000000000000000000000000008152909150737a250d5630b4cf539739df2c5dacb4c659f2488d9063d06ca61f906107fd9084908790600401612094565b600060405180830381865afa92505050801561083b57506040513d6000823e601f3d908101601f191682016040526108389190810190612101565b60015b61084b5760009350505050610600565b806001855161085a91906121bf565b8151811061086a5761086a6121d2565b602002602001015194505050505092915050565b600073c02aaa39b223fe8d0a0e5c4f27ead9083c756cc1196001600160a01b038416016108bd5773eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee92505b73c02aaa39b223fe8d0a0e5c4f27ead9083c756cc1196001600160a01b038316016108fa5773eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee91505b60006109068484611555565b905080156109225761091a838260126106c2565b915050610600565b6001600160a01b03841673eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee148061096957506001600160a01b03831673eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee145b15610978576000915050610600565b60006109988573eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee611555565b905060006109ba73eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee86611555565b905081158015906109ca57508015155b156109f45760006109db838361166d565b90506109e9868260126106c2565b945050505050610600565b50600095945050505050565b6000610a0c813361111d565b600480547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b03841690811790915560405190815233907f8800deb8c31293b539eaf5391fcc88280dc58f015c043d65dd5b72a0979a1dd1906020015b60405180910390a25050565b6000610a88813361111d565b600582905560405182815233907f01fe2943baee27f47add82886c2200f910c749c461c9b63c5fe83901a53bdb4990602001610a70565b6000610acb813361111d565b8115610ad9576106be611679565b6106be61171e565b60008281526001602052604081206106df90836117a1565b60008160ff168360ff161015610b3257610b1383836121e8565b610b219060ff16600a612201565b610b2b9085612075565b90506106df565b8160ff168360ff161115610b6257610b4a82846121e8565b610b589060ff16600a612201565b610b2b9085612223565b509192915050565b600073eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee6001600160a01b0384161480610bb357506001600160a01b03831673c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2145b8015610c01575073eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee6001600160a01b0383161480610c0157506001600160a01b03821673c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2145b15610c155750670de0b6b3a7640000610600565b6000610c21848461087e565b90508015610c30579050610600565b6000610c3c85856106e6565b90508015610c4d5791506106009050565b60405162461bcd60e51b815260206004820152600d60248201527f4e6f205261746520466f756e640000000000000000000000000000000000000060448201526064016106ab565b6000818152600160205260408120610600906117ad565b600082815260208190526040902060010154610cc8813361111d565b61062c83836111bd565b6000806000610cf58673c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2610b6a565b90506000610d02876111df565b90506000610d1b610d13888561166d565b836012610af9565b9050858111610d925760405162461bcd60e51b815260206004820152602d60248201527f4e6f74207377617070696e6720656e6f75676820746f207265636f766572207460448201527f68652067617320726566756e640000000000000000000000000000000000000060648201526084016106ab565b6000610dac6005548884610da691906121bf565b9061166d565b9050610db88782612245565b95506000610dc887601286610af9565b90506000610dde670de0b6b3a7640000876117b7565b9050610dea828261166d565b9650505050505050935093915050565b6000610e06813361111d565b73eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed196001600160a01b03831601610eac574780610e795760405162461bcd60e51b815260206004820152601360248201527f4e6f7468696e6720746f2077697468647261770000000000000000000000000060448201526064016106ab565b604051339082156108fc029083906000818181858888f19350505050158015610ea6573d6000803e3d6000fd5b50505050565b6040517f70a082310000000000000000000000000000000000000000000000000000000081523060048201526000906001600160a01b038416906370a0823190602401602060405180830381865afa158015610f0c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f309190612258565b905060008111610f825760405162461bcd60e51b815260206004820152601360248201527f4e6f7468696e6720746f2077697468647261770000000000000000000000000060448201526064016106ab565b6001600160a01b03831663a9059cbb336040516001600160e01b031960e084901b1681526001600160a01b039091166004820152602481018490526044016020604051808303816000875af1158015610fdf573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ea69190612271565b6000828152602081815260408083206001600160a01b038516845290915290205460ff166106be576000828152602081815260408083206001600160a01b03851684529091529020805460ff1916600117905561105d3390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b60006106df836001600160a01b0384166117cc565b60006001600160e01b031982167f7965db0b00000000000000000000000000000000000000000000000000000000148061060057507f01ffc9a7000000000000000000000000000000000000000000000000000000006001600160e01b0319831614610600565b6000828152602081815260408083206001600160a01b038516845290915290205460ff166106be57611159816001600160a01b0316601461181b565b61116483602061181b565b6040516020016111759291906122b2565b60408051601f198184030181529082905262461bcd60e51b82526106ab91600401612333565b6111a58282611003565b600082815260016020526040902061062c90826110a1565b6111c782826119fc565b600082815260016020526040902061062c9082611a7b565b600073eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed196001600160a01b0383160161120e57506012919050565b816001600160a01b031663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa15801561124c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106009190612366565b6040517fe6a439050000000000000000000000000000000000000000000000000000000081526001600160a01b03808416600483015282166024820152606090735c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f9063e6a4390590604401602060405180830381865afa925050508015611308575060408051601f3d908101601f1916820190925261130591810190612383565b60015b15611433576001600160a01b03811615611431576000816001600160a01b0316630902f1ac6040518163ffffffff1660e01b8152600401606060405180830381865afa15801561135c573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061138091906123c3565b63ffffffff169250505062015180814261139a91906121bf565b101561142f57604080516002808252606082018352909160208301908036833701905050925084836000815181106113d4576113d46121d2565b60200260200101906001600160a01b031690816001600160a01b0316815250508383600181518110611408576114086121d2565b60200260200101906001600160a01b031690816001600160a01b0316815250505050610600565b505b505b6001600160a01b03831673c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2148061147a57506001600160a01b03821673c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2145b6106005760408051600380825260808201909252906020820160608036833701905050905082816000815181106114b3576114b36121d2565b60200260200101906001600160a01b031690816001600160a01b03168152505073c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2816001815181106114fb576114fb6121d2565b60200260200101906001600160a01b031690816001600160a01b031681525050818160028151811061152f5761152f6121d2565b60200260200101906001600160a01b031690816001600160a01b03168152505092915050565b60006001600160a01b03831673eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee1480156115975791925073eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee915b6040517fbcfd032d0000000000000000000000000000000000000000000000000000000081526001600160a01b038086166004830152841660248201527347fb2585d2c56fe188d0e6ec628a38b74fceeedf9063bcfd032d9060440160a060405180830381865afa92505050801561162c575060408051601f3d908101601f1916820190925261162991810190612422565b60015b61163a576000915050610600565b851561165f57611652670de0b6b3a7640000856117b7565b9650505050505050610600565b839650505050505050610600565b60006106df8383611a90565b60025460ff16156116cc5760405162461bcd60e51b815260206004820152601060248201527f5061757361626c653a207061757365640000000000000000000000000000000060448201526064016106ab565b6002805460ff191660011790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586117013390565b6040516001600160a01b03909116815260200160405180910390a1565b60025460ff166117705760405162461bcd60e51b815260206004820152601460248201527f5061757361626c653a206e6f742070617573656400000000000000000000000060448201526064016106ab565b6002805460ff191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa33611701565b60006106df8383611b89565b6000610600825490565b60006106df83670de0b6b3a764000084611bb3565b600081815260018301602052604081205461181357508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155610600565b506000610600565b6060600061182a836002612075565b611835906002612245565b67ffffffffffffffff81111561184d5761184d6120eb565b6040519080825280601f01601f191660200182016040528015611877576020820181803683370190505b5090507f3000000000000000000000000000000000000000000000000000000000000000816000815181106118ae576118ae6121d2565b60200101906001600160f81b031916908160001a9053507f7800000000000000000000000000000000000000000000000000000000000000816001815181106118f9576118f96121d2565b60200101906001600160f81b031916908160001a905350600061191d846002612075565b611928906001612245565b90505b60018111156119ad577f303132333435363738396162636465660000000000000000000000000000000085600f1660108110611969576119696121d2565b1a60f81b82828151811061197f5761197f6121d2565b60200101906001600160f81b031916908160001a90535060049490941c936119a681612472565b905061192b565b5083156106df5760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e7460448201526064016106ab565b6000828152602081815260408083206001600160a01b038516845290915290205460ff16156106be576000828152602081815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b60006106df836001600160a01b038416611c99565b60008080600019848609848602925082811083820303915050670de0b6b3a76400008110611aed576040517fd31b3402000000000000000000000000000000000000000000000000000000008152600481018290526024016106ab565b600080670de0b6b3a764000086880991506706f05b59d3b1ffff8211905082600003611b2b5780670de0b6b3a7640000850401945050505050610600565b6204000082850304939091119091037d40000000000000000000000000000000000000000000000000000000000002919091177faccb18165bd6fe31ae1cf318dc5b51eee0e1ba569b88cd74c1773b91fac106690201905092915050565b6000826000018281548110611ba057611ba06121d2565b9060005260206000200154905092915050565b6000808060001985870985870292508281108382030391505080600003611bed57838281611be357611be361220d565b04925050506106df565b838110611c30576040517f773cc18c00000000000000000000000000000000000000000000000000000000815260048101829052602481018590526044016106ab565b60008486880960026001871981018816978890046003810283188082028403028082028403028082028403028082028403028082028403029081029092039091026000889003889004909101858311909403939093029303949094049190911702949350505050565b60008181526001830160205260408120548015611d82576000611cbd6001836121bf565b8554909150600090611cd1906001906121bf565b9050818114611d36576000866000018281548110611cf157611cf16121d2565b9060005260206000200154905080876000018481548110611d1457611d146121d2565b6000918252602080832090910192909255918252600188019052604090208390555b8554869080611d4757611d47612489565b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050610600565b6000915050610600565b600060208284031215611d9e57600080fd5b81356001600160e01b0319811681146106df57600080fd5b600060208284031215611dc857600080fd5b5035919050565b6001600160a01b0381168114611de457600080fd5b50565b60008060408385031215611dfa57600080fd5b823591506020830135611e0c81611dcf565b809150509250929050565b60ff81168114611de457600080fd5b600080600060608486031215611e3b57600080fd5b8335611e4681611dcf565b9250602084013591506040840135611e5d81611e17565b809150509250925092565b60008060408385031215611e7b57600080fd5b8235611e8681611dcf565b91506020830135611e0c81611dcf565b600060208284031215611ea857600080fd5b81356106df81611dcf565b8015158114611de457600080fd5b600060208284031215611ed357600080fd5b81356106df81611eb3565b60008060408385031215611ef157600080fd5b50508035926020909101359150565b600080600060608486031215611f1557600080fd5b833592506020840135611f2781611e17565b91506040840135611e5d81611e17565b600080600060608486031215611f4c57600080fd5b8335611f5781611dcf565b95602085013595506040909401359392505050565b634e487b7160e01b600052601160045260246000fd5b600181815b80851115611fbd578160001904821115611fa357611fa3611f6c565b80851615611fb057918102915b93841c9390800290611f87565b509250929050565b600082611fd457506001610600565b81611fe157506000610600565b8160018114611ff757600281146120015761201d565b6001915050610600565b60ff84111561201257612012611f6c565b50506001821b610600565b5060208310610133831016604e8410600b8410161715612040575081810a610600565b61204a8383611f82565b806000190482111561205e5761205e611f6c565b029392505050565b60006106df60ff841683611fc5565b600081600019048311821515161561208f5761208f611f6c565b500290565b6000604082018483526020604081850152818551808452606086019150828701935060005b818110156120de5784516001600160a01b0316835293830193918301916001016120b9565b5090979650505050505050565b634e487b7160e01b600052604160045260246000fd5b6000602080838503121561211457600080fd5b825167ffffffffffffffff8082111561212c57600080fd5b818501915085601f83011261214057600080fd5b815181811115612152576121526120eb565b8060051b604051601f19603f83011681018181108582111715612177576121776120eb565b60405291825284820192508381018501918883111561219557600080fd5b938501935b828510156121b35784518452938501939285019261219a565b98975050505050505050565b8181038181111561060057610600611f6c565b634e487b7160e01b600052603260045260246000fd5b60ff828116828216039081111561060057610600611f6c565b60006106df8383611fc5565b634e487b7160e01b600052601260045260246000fd5b60008261224057634e487b7160e01b600052601260045260246000fd5b500490565b8082018082111561060057610600611f6c565b60006020828403121561226a57600080fd5b5051919050565b60006020828403121561228357600080fd5b81516106df81611eb3565b60005b838110156122a9578181015183820152602001612291565b50506000910152565b7f416363657373436f6e74726f6c3a206163636f756e74200000000000000000008152600083516122ea81601785016020880161228e565b7f206973206d697373696e6720726f6c6520000000000000000000000000000000601791840191820152835161232781602884016020880161228e565b01602801949350505050565b602081526000825180602084015261235281604085016020870161228e565b601f01601f19169190910160400192915050565b60006020828403121561237857600080fd5b81516106df81611e17565b60006020828403121561239557600080fd5b81516106df81611dcf565b80516dffffffffffffffffffffffffffff811681146123be57600080fd5b919050565b6000806000606084860312156123d857600080fd5b6123e1846123a0565b92506123ef602085016123a0565b9150604084015163ffffffff81168114611e5d57600080fd5b805169ffffffffffffffffffff811681146123be57600080fd5b600080600080600060a0868803121561243a57600080fd5b61244386612408565b945060208601519350604086015192506060860151915061246660808701612408565b90509295509295909350565b60008161248157612481611f6c565b506000190190565b634e487b7160e01b600052603160045260246000fdfea26469706673582212208fd251daadbd65c70793911cfbe26888a3bdabd1c23ccb2bed84599d8b8e7eec64736f6c63430008100033";

export class BaseSwapProxy__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    _admin: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<BaseSwapProxy> {
    return super.deploy(_admin, overrides || {}) as Promise<BaseSwapProxy>;
  }
  getDeployTransaction(
    _admin: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_admin, overrides || {});
  }
  attach(address: string): BaseSwapProxy {
    return super.attach(address) as BaseSwapProxy;
  }
  connect(signer: Signer): BaseSwapProxy__factory {
    return super.connect(signer) as BaseSwapProxy__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BaseSwapProxyInterface {
    return new utils.Interface(_abi) as BaseSwapProxyInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BaseSwapProxy {
    return new Contract(address, _abi, signerOrProvider) as BaseSwapProxy;
  }
}
