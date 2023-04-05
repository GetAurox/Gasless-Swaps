// ! Deprecated - experimental
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Suite } from "mocha";
import { AuroxWhale } from "../../constants/whales";

// import { ERC20 } from "../../typechain/ERC20";

import { WETHToken } from "./contracts";

import { resetFork, impersonateAndReturnAccount } from "./hardhatHelpers";
import { JsonRpcSigner } from "@ethersproject/providers";
import { Provider } from "@ethersproject/abstract-provider";
import { BigNumberish, ContractInterface, Signer } from "ethers";

// class ExtendedERC20 extends ERC20 {
//   constructor(
//     addressOrName: string,
//     contractInterface: ContractInterface,
//     signerOrProvider?: Signer | Provider
//   ) {
//     super(addressOrName, contractInterface, signerOrProvider);
//   }
// }

// const createExtendedMethods = (Token: ERC20) => ({
//   approveAndTransfer: async (to: string, amount: BigNumberish) => {
//     await Token.approve(to, amount);
//     await Token.transfer(to, amount);
//   },
// });

// // https://stackoverflow.com/questions/42247434/how-to-add-mixins-to-es6-javascript-classes
// export const extendERC20 = (Token: ERC20) => {
//   const tokensExtendedMethods = createExtendedMethods(Token);

//   return Object.assign((Token as any).prototype, tokensExtendedMethods);
// };

// const passTest = (test: any) => {};

// const describeTest = (title: string, fn: (this: Suite) => void) => {
//   describe(title, function (this: Suite) {
//     const amount = "100000000000000000";

//     let swapProxy: ExposedSwapProxy;
//     let user: SignerWithAddress;
//     let impersonatedSigner: JsonRpcSigner;

//     let wethAsserter: T;

//     beforeEach(async () => {
//       await resetFork();

//       swapProxy = (await deploy("ExposedSwapProxy")) as any;
//       [user] = await ethers.getSigners();
//       wethAsserter = new TokenAsserter(WETHToken);

//       impersonatedSigner = await impersonateAndReturnAccount(AuroxWhale, user);
//     });

//     // passTest(swapProxy);

//     // fn();

//     // fn({ amount, swapProxy, user, impersonatedSigner, wethAsserter });
//   });
// };

// describeTest("test", () => {
//   it("should get the swap params correctly and execute the swap from the swapProxy contract. It shouldn't return the swapped tokens as it is just testing the swapping", async () => {
//     const swapParams = await getSwapParams({
//       fromTokenAddress: AuroxAddress,
//       toTokenAddress: WETHAddress,
//       amount,
//       from: swapProxy.address,
//     });

//     await AuroxToken.connect(impersonatedSigner).approve(
//       swapProxy.address,
//       amount
//     );

//     await wethAsserter.assertBeforeAndAfterBalance(
//       {
//         address: swapProxy.address,
//         expectedValue: swapParams.toTokenAmount,
//       },
//       async () =>
//         swapProxy
//           .connect(impersonatedSigner)
//           .swapTokensWithChecks(
//             AuroxAddress,
//             WETHAddress,
//             swapParams.formattedSwapParams
//           ),
//       { range: 0.05 }
//     );
//   });
// });
