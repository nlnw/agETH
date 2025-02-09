import { z } from "zod";
import { encodeFunctionData } from "viem";
import {
  ActionProvider,
  type Network,
  CreateAction,
  EvmWalletProvider,
} from "@coinbase/agentkit";

const UnwrapEthSchema = z
  .object({
    amountToUnwrap: z.string().describe("Amount of ETH to unwrap in wei"),
  })
  .strip()
  .describe("Instructions for unwrapping WETH to ETH");
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const WETH_ABI = [
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

export class UnwrapWethActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super("unwrap_weth", []);
  }

  @CreateAction({
    name: "unwrap_weth",
    description: "",
    schema: UnwrapEthSchema,
  })
  async unwrapWeth(
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
      return `Error unwrapping ETH: ${error}`;
    }
  }

  supportsNetwork = (network: Network) =>
    network.networkId === "base-mainnet" ||
    network.networkId === "base-sepolia";
}

export const unwrapWethActionProvider = () => new UnwrapWethActionProvider();
