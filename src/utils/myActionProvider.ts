import { z } from "zod";
import { encodeFunctionData } from "viem";
import {
  ActionProvider,
  type Network,
  CreateAction,
  EvmWalletProvider,
} from "@coinbase/agentkit";

export const UnwrapEthSchema = z
  .object({
    amountToUnwrap: z.string().describe("Amount of ETH to unwrap in wei"),
  })
  .strip()
  .describe("Instructions for unwrapping ETH to WETH");

export const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

export const WETH_ABI = [
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ internalType: "uint256", name: "wad", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * WethActionProvider is an action provider for WETH.
 */
export class MyActionProvider extends ActionProvider<EvmWalletProvider> {
  /**
   * Constructor for the WethActionProvider.
   */
  constructor() {
    super("unwrap_weth", []);
  }

  /**
   * Wraps ETH to WETH.
   *
   * @param walletProvider - The wallet provider to use for the action.
   * @param args - The input arguments for the action.
   * @returns A message containing the transaction hash.
   */
  @CreateAction({
    name: "unwrap_weth",
    description: `
    This tool can only be used to unwrap ETH to WETH.`,
    schema: UnwrapEthSchema,
  })
  async myAction(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof UnwrapEthSchema>
  ): Promise<string> {
    try {
      const hash = await walletProvider.sendTransaction({
        to: WETH_ADDRESS,
        data: encodeFunctionData({
          abi: WETH_ABI,
          functionName: "withdraw",
          args: [BigInt(args.amountToUnwrap)],
        }),
      });

      await walletProvider.waitForTransactionReceipt(hash);

      return `Unwrapped ETH with transaction hash: ${hash}`;
    } catch (error) {
      return `Error wrapping ETH: ${error}`;
    }
  }

  /**
   * Checks if the Weth action provider supports the given network.
   *
   * @param network - The network to check.
   * @returns True if the Weth action provider supports the network, false otherwise.
   */
  supportsNetwork = (network: Network) =>
    network.networkId === "base-mainnet" ||
    network.networkId === "base-sepolia";
}

export const myActionProvider = () => new MyActionProvider();
