import { z } from "zod";
import { encodeFunctionData } from "viem";
import {
  ActionProvider,
  type Network,
  CreateAction,
  EvmWalletProvider,
} from "@coinbase/agentkit";

const AaveYieldSchema = z
  .object({
    tokenName: z.string().describe("Token name"),
  })
  .strip()
  .describe(
    "Instructions for getting yield rates from AAVE for a particular token"
  );

export class AaveYieldsActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super("aave", []);
  }

  @CreateAction({
    name: "aave",
    description: "Get the highest yield rates from AAVE for various tokens",
    schema: AaveYieldSchema,
  })
  async aaveYieldAction(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof AaveYieldSchema>
  ): Promise<string> {
    try {
      const data = await fetch(
        "https://aave-api-v2.aave.com/data/markets-data"
      );
      const json = await data.json();

      const reserves = json.reserves;
      const filtered = reserves
        .filter(
          (reserve: any) =>
            reserve.symbol.toLowerCase() === args.tokenName.toLocaleLowerCase()
        )
        .sort((a: any, b: any) => b.liquidityRate - a.liquidityRate);

      // id and symbol are useful.
      return filtered.length > 0
        ? JSON.stringify({
            id: filtered[0].id,
            rate: filtered[0].liquidityRate,
          })
        : `${args.tokenName} not found`;
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  supportsNetwork = (network: Network) =>
    network.networkId === "base-mainnet" ||
    network.networkId === "base-sepolia";
}

export const aaveYieldsActionProvider = () => new AaveYieldsActionProvider();
