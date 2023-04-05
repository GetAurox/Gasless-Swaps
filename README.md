# Aurox Gasless Swaps

💻 [Download Aurox Wallet](https://chrome.google.com/webstore/detail/aurox-wallet/kilnpioakcdndlodeeceffgjdpojajlo?hl=en&authuser=0) | 📂 [Aurox Documentation](https://docs.getaurox.com/)


🐂 [Visit Aurox's Website](https://getaurox.com) | 🐦 [Follow us on Twitter](https://twitter.com/getaurox) | 👾 [Join our Discord](https://aurox.app/discord)

## Overview

Aurox Gasless Swaps offer a unique method of executing swaps on the Ethereum network, allowing users to pay network fees using any ERC20 token.

Unlike other "gasless" implementations, which rely on the [EIP-2771](https://eips.ethereum.org/EIPS/eip-2771) standard for off-chain transactions through signed messages and relayers, Aurox Gasless Swaps utilize Flashbots to provide a full gasless experience.

EIP-2771, or otherwise known as meta transactions, still requires users to execute an approval transaction for the ERC20 token, which necessitates ETH for network fees. Once the approval transaction is processed, only then can the user execute a meta transaction. Only a **handful of tokens** like DAI gives the user and the dApp the ability to execute a full gasless swap using the **permit() function.**

By using Flashbots, Aurox can bundle approval and swap transactions, submit them to private Flashbot RPCs, [sponsor the transaction](https://github.com/flashbots/searcher-sponsored-tx), and execute both within the same block. 

This feature will be available in the Aurox Wallet this month and in the Aurox Terminal later this year.



## Example Flow
Let's assume a user creates a new wallet and deposits $100 USDC. 

The current swap network fee is $25 for swap transaction.

 
The user selects to swap $100 in USDC to URUS using the Aurox Wallet. A bundle of transactions are created to execute the gasless swap:


1.  Aurox's Hot Wallet transfers $30 in ETH to the user's wallet.
2.  USDC approval with the swap contract (if required).
3. Swap $70 USDC to URUS and $25 in ETH (more details below).
4. Send $25 in ETH back to Aurox's Hot Wallet.

**This bundle is then submitted to the Flashbot RPC to be executed within the same block which results in a total of 3 transactions:**

1.  **Transfer** of ETH from Aurox's Hot Wallet to the user's wallet. Sponsors the user's bundle since they did not possess any ETH

2. **Approval** (if required).

3. **Swap**. Part of the user's input token is converted into ETH and paid back to Aurox for sponsoring the initial ETH used for the transaction fee.
	   
Although the standard network fee for these three transactions would have cost $25, Aurox's Hot Wallet deposits a small extra amount of ETH to ensure the user's transaction is submitted without reverting. After the process is completed, the user's balance will be **$70 in URUS and $5 in ETH.**

The extra ETH left over can serve as a net positive for the user. Not only has the user executed the swap they desired without owning ETH but they're left over with extra ETH which allows them to transfer the URUS to another wallet or execute other dAPP transactions. Both of which would have been impossible without ETH to pay for the network fee.

## Fees
Gasless swapping slightly increases costs compared to regular swaps due to multiple transactions. However, the increase in transaction fees has been negligible during testing. 

Further, these fees are offset by several benefits:

- Flashbots protect users from frontrunning by MEV bots, and therefore save users from losing value.

- Users who run out of ETH, have three options to continue transacting on the blockchain. Two of these options can be more costly and time consuming:
	1. Purchasing ETH on a centralized exchange transfer it into your Web3 Wallet, and finally execute the swap. This method requires paying up to .1% or more in CEX trading fee and then upwards of $20 in withdraw fees. Plus the  dependence on Centralized Exchanges.
	
	2. Bridging tokens from another blockchain network which can be costly and take several minutes to hours. 

	3. Transferring ETH from another Web3 wallet, then executing the swap. This is the only method does end up being cheaper than gasless swapping but by a small margin. 


Overall, Aurox's Gasless swap eliminates dependencies on centralized exchanges, improves user experience and makes on-boarding new users to DeFi significantly easier. 
	

# Architecture
This repository is composed of 3 components; Client, Backend and Contracts.

## Client

The intended usage for this repo begins by the user installing the client package located in: `/packages/client`

This package will sign an approval and a swap transaction, given a user's ethers.Wallet instance.

These signed transactions will then be submitted to the Backend.

## Backend

The backend receives signed transactions and validates them:
* Will the transaction complete successfully
* Are we getting refunded to sponsor the transaction
* Are they utilizing the SwapProxy.sol contract
* Other various validation; do the amounts match, is it the same token, etc.

Once the transactions are validated, they are passed to the Bull Queue, where the transactions are to be executed.

**Bull Queue**

Due to the nature of transactions on Ethereum requiring nonces, we must execute these transactions requests synchronously. The [Bull Queue](https://docs.bullmq.io/) portion of this service enables this by implementing a queueing system for transactions requests. Each queue will have its own Hot Wallet that can sponsor these transaction requests and the queue ensures that the nonce never gets out of sync for the given Hot Wallet.

This obviously comes with some tradeoffs, namely throughput. Scale for this system will have to come in the form of more queue's and more Hot Wallet's.

However, the Ethereum network currently processes at most 300 transactions per block. In order to support every single user on the Ethereum network, the maximum hot wallets required to fill **every single transaction on every block** would be 300 wallet addresses. If at such point our implementation is being used to fill every transaction on each block, dedicating resources to create, and manage 300 wallet addresses would not be of much concern. 

## Contracts

### SwapProxy

The ForwardingSwapProxy.sol contract simplifies this sponsored transaction process by allowing one contract call to:

1. Refund the fee and transfer to the Vault.sol contract
2. Execute the swap

This contract also enforces a Whitelist for proxied calls, the destination "to" address for proxied calls must be whitelisted otherwise the call will revert. This massively increases the security for the contract as proxying calls can be dangerous.

### Vault

To increase security all fee revenue will be sent into the Vault.sol contract.

As well as this this contract will allow the admin to register Hot Wallet's, these wallets can then all be topped up via a single contract call. This should simplify the management of the Hot Wallet's

### Deployment

In the deploy scripts that are 3 contracts, for the current usage only the Vault and ForwardingSwapProxy are needed. The UniswapSwapProxy deploy script can be ignored and is still there to support the pre-existing tests.

Run: `npx hardhat deploy --network <network> --tags _vault,_forwardingSwapProxy`

## Testing

You need [Docker](https://www.docker.com/) installed to be able to test with the service.

In order to test with the service you need to do the following:

1. Run `yarn install` in the root directory
2. Run `npm run dev`

## Testing (PROD)

This testing utilizes a CLI tool

1. Run `yarn install` in the root directory
2. Run `ts-node ./packages/cli swap --help`

This command will output the format required to use the CLI tool.
