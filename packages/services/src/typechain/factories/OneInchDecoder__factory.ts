/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  OneInchDecoder,
  OneInchDecoderInterface,
} from "../OneInchDecoder";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_minReturn",
        type: "uint256",
      },
    ],
    name: "updateData",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x6101e561003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100355760003560e01c8063174392bf1461003a575b600080fd5b61005861004836600461009d565b6044830191909152606482015290565b6040516100659190610161565b60405180910390f35b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000806000606084860312156100b257600080fd5b833567ffffffffffffffff808211156100ca57600080fd5b818601915086601f8301126100de57600080fd5b8135818111156100f0576100f061006e565b604051601f8201601f19908116603f011681019083821181831017156101185761011861006e565b8160405282815289602084870101111561013157600080fd5b82602086016020830137600060208483010152809750505050505060208401359150604084013590509250925092565b600060208083528351808285015260005b8181101561018e57858101830151858201604001528201610172565b506000604082860101526040601f19601f830116850101925050509291505056fea2646970667358221220106a1db68afab763c8dbab40989a9b0ad3efc1200813239290eba212025118e664736f6c63430008100033";

export class OneInchDecoder__factory extends ContractFactory {
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
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<OneInchDecoder> {
    return super.deploy(overrides || {}) as Promise<OneInchDecoder>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): OneInchDecoder {
    return super.attach(address) as OneInchDecoder;
  }
  connect(signer: Signer): OneInchDecoder__factory {
    return super.connect(signer) as OneInchDecoder__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): OneInchDecoderInterface {
    return new utils.Interface(_abi) as OneInchDecoderInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): OneInchDecoder {
    return new Contract(address, _abi, signerOrProvider) as OneInchDecoder;
  }
}
