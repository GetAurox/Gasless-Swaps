/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  UniswapV3Helpers,
  UniswapV3HelpersInterface,
} from "../UniswapV3Helpers";

const _abi = [
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
    inputs: [],
    name: "ethContract",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "IERC20",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_fromToken",
        type: "IERC20",
      },
      {
        internalType: "contract IERC20",
        name: "_toToken",
        type: "IERC20",
      },
    ],
    name: "getUniswapV3Rate",
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
];

const _bytecode =
  "0x610de861003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100405760003560e01c8063274e2aa7146100455780633cc562b21461006b575b600080fd5b610058610053366004610a06565b61009e565b6040519081526020015b60405180910390f35b61008673eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee81565b6040516001600160a01b039091168152602001610062565b600073eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed196001600160a01b038416016100dd5773c02aaa39b223fe8d0a0e5c4f27ead9083c756cc292505b73eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeed196001600160a01b0383160161011a5773c02aaa39b223fe8d0a0e5c4f27ead9083c756cc291505b60006101268484610204565b905080156101355790506101fe565b6001600160a01b03841673c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2148061017c57506001600160a01b03831673c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2145b1561018b5760009150506101fe565b60006101ab8573c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2610204565b905060006101cd73c02aaa39b223fe8d0a0e5c4f27ead9083c756cc286610204565b905081158015906101dd57508015155b156101f6576101ec828261043c565b93505050506101fe565b600093505050505b92915050565b6040517f1698ee820000000000000000000000000000000000000000000000000000000081526001600160a01b03808416600483015282166024820152610bb860448201526000908190731f98431c8ad98523631ae4a59f267346ea31f98490631698ee8290606401602060405180830381865afa15801561028a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102ae9190610a3f565b90506001600160a01b0381166102c85760009150506101fe565b604080516002808252606082018352600092602083019080368337019050509050610e10816000815181106102ff576102ff610a72565b602002602001019063ffffffff16908163ffffffff168152505060008160018151811061032e5761032e610a72565b63ffffffff909216602092830291909101909101526040517f883bdbfd0000000000000000000000000000000000000000000000000000000081526000906001600160a01b0384169063883bdbfd9061038b908590600401610a88565b600060405180830381865afa1580156103a8573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526103d09190810190610b9b565b5090506000816000815181106103e8576103e8610a72565b60200260200101518260018151811061040357610403610a72565b60200260200101516104159190610c7d565b90506000610425610e1083610cc0565b90506104308161044f565b98975050505050505050565b6000610448838361048d565b9392505050565b60008061045b8361058b565b905060c06104726001600160a01b03831680610cfe565b61048490670de0b6b3a7640000610cfe565b901c9392505050565b60008080600019848609848602925082811083820303915050670de0b6b3a764000081106104ef576040517fd31b3402000000000000000000000000000000000000000000000000000000008152600481018290526024015b60405180910390fd5b600080670de0b6b3a764000086880991506706f05b59d3b1ffff821190508260000361052d5780670de0b6b3a76400008504019450505050506101fe565b6204000082850304939091119091037d40000000000000000000000000000000000000000000000000000000000002919091177faccb18165bd6fe31ae1cf318dc5b51eee0e1ba569b88cd74c1773b91fac106690201905092915050565b60008060008360020b126105a2578260020b6105af565b8260020b6105af90610d1d565b90506105be620d89e719610d55565b60020b81111561062a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600160248201527f540000000000000000000000000000000000000000000000000000000000000060448201526064016104e6565b60008160011660000361064e57700100000000000000000000000000000000610660565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff169050600282161561069f57608061069a826ffff97272373d413259a46990580e213a610cfe565b901c90505b60048216156106c95760806106c4826ffff2e50f5f656932ef12357cf3c7fdcc610cfe565b901c90505b60088216156106f35760806106ee826fffe5caca7e10e4e61c3624eaa0941cd0610cfe565b901c90505b601082161561071d576080610718826fffcb9843d60f6159c9db58835c926644610cfe565b901c90505b6020821615610747576080610742826fff973b41fa98c081472e6896dfb254c0610cfe565b901c90505b604082161561077157608061076c826fff2ea16466c96a3843ec78b326b52861610cfe565b901c90505b608082161561079b576080610796826ffe5dee046a99a2a811c461f1969c3053610cfe565b901c90505b6101008216156107c65760806107c1826ffcbe86c7900a88aedcffc83b479aa3a4610cfe565b901c90505b6102008216156107f15760806107ec826ff987a7253ac413176f2b074cf7815e54610cfe565b901c90505b61040082161561081c576080610817826ff3392b0822b70005940c7a398e4b70f3610cfe565b901c90505b610800821615610847576080610842826fe7159475a2c29b7443b29c7fa6e889d9610cfe565b901c90505b61100082161561087257608061086d826fd097f3bdfd2022b8845ad8f792aa5825610cfe565b901c90505b61200082161561089d576080610898826fa9f746462d870fdf8a65dc1f90e061e5610cfe565b901c90505b6140008216156108c85760806108c3826f70d869a156d2a1b890bb3df62baf32f7610cfe565b901c90505b6180008216156108f35760806108ee826f31be135f97d08fd981231505542fcfa6610cfe565b901c90505b6201000082161561091f57608061091a826f09aa508b5b7a84e1c677de54f3e99bc9610cfe565b901c90505b6202000082161561094a576080610945826e5d6af8dedb81196699c329225ee604610cfe565b901c90505b6204000082161561097457608061096f826d2216e584f5fa1ea926041bedfe98610cfe565b901c90505b6208000082161561099c576080610997826b048a170391f7dc42444e8fa2610cfe565b901c90505b60008460020b13156109b7576109b481600019610d77565b90505b6109c664010000000082610d8b565b156109d25760016109d5565b60005b6109e69060ff16602083901c610d9f565b949350505050565b6001600160a01b0381168114610a0357600080fd5b50565b60008060408385031215610a1957600080fd5b8235610a24816109ee565b91506020830135610a34816109ee565b809150509250929050565b600060208284031215610a5157600080fd5b8151610448816109ee565b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b6020808252825182820181905260009190848201906040850190845b81811015610ac657835163ffffffff1683529284019291840191600101610aa4565b50909695505050505050565b604051601f8201601f1916810167ffffffffffffffff81118282101715610afb57610afb610a5c565b604052919050565b600067ffffffffffffffff821115610b1d57610b1d610a5c565b5060051b60200190565b600082601f830112610b3857600080fd5b81516020610b4d610b4883610b03565b610ad2565b82815260059290921b84018101918181019086841115610b6c57600080fd5b8286015b84811015610b90578051610b83816109ee565b8352918301918301610b70565b509695505050505050565b60008060408385031215610bae57600080fd5b825167ffffffffffffffff80821115610bc657600080fd5b818501915085601f830112610bda57600080fd5b81516020610bea610b4883610b03565b82815260059290921b84018101918181019089841115610c0957600080fd5b948201945b83861015610c375785518060060b8114610c285760008081fd5b82529482019490820190610c0e565b91880151919650909350505080821115610c5057600080fd5b50610c5d85828601610b27565b9150509250929050565b634e487b7160e01b600052601160045260246000fd5b600682810b9082900b03667fffffffffffff198112667fffffffffffff821317156101fe576101fe610c67565b634e487b7160e01b600052601260045260246000fd5b60008160060b8360060b80610cd757610cd7610caa565b667fffffffffffff19821460001982141615610cf557610cf5610c67565b90059392505050565b6000816000190483118215151615610d1857610d18610c67565b500290565b60007f80000000000000000000000000000000000000000000000000000000000000008203610d4e57610d4e610c67565b5060000390565b60008160020b627fffff198103610d6e57610d6e610c67565b60000392915050565b600082610d8657610d86610caa565b500490565b600082610d9a57610d9a610caa565b500690565b808201808211156101fe576101fe610c6756fea264697066735822122098f894913f6fa1f80930483e1b5ea987413e8c063d289e7f167bdbf4a2adc0ea64736f6c63430008100033";

export class UniswapV3Helpers__factory extends ContractFactory {
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
  ): Promise<UniswapV3Helpers> {
    return super.deploy(overrides || {}) as Promise<UniswapV3Helpers>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): UniswapV3Helpers {
    return super.attach(address) as UniswapV3Helpers;
  }
  connect(signer: Signer): UniswapV3Helpers__factory {
    return super.connect(signer) as UniswapV3Helpers__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UniswapV3HelpersInterface {
    return new utils.Interface(_abi) as UniswapV3HelpersInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UniswapV3Helpers {
    return new Contract(address, _abi, signerOrProvider) as UniswapV3Helpers;
  }
}
