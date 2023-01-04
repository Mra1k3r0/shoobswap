import { ChainId, Token } from "@dogeswap/sdk-core";

export type ChainTokens<T extends string = string> = { [chainId in ChainId]: Token<T> };
export type ChainContracts = { [chainId in ChainId]: string };

interface InfrastructureAddress {
    factory: string;
    router: string;
    multicall: string;
    ensRegistrar: string;
}

export const addresses = {
    [ChainId.MAINNET]: {
        infrastructure: {
            factory: "0xf91c8023aB5A1df0ba8a01B766829B76FD4707F0",
            router: "0x3133571F47A0A2E0eeDE6Ee37367cde47301750c",
            multicall: "0x045a25818490120D4517a55A101Aaf54ad82b291",
            ensRegistrar: "0x0000000000000000000000000000000000000000",
        } as InfrastructureAddress,
        tokens: {
            weth: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        },
    },
    [ChainId.TESTNET]: {
        infrastructure: {
            factory: "0xf91c8023aB5A1df0ba8a01B766829B76FD4707F0",
            router: "0x3133571F47A0A2E0eeDE6Ee37367cde47301750c",
            multicall: "0x045a25818490120D4517a55A101Aaf54ad82b291",
            ensRegistrar: "0x0000000000000000000000000000000000000000",
        } as InfrastructureAddress,
        tokens: {
            weth: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        },
    },
    [ChainId.LOCALNET]: {
        infrastructure: {
            factory: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
            router: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
            multicall: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
            ensRegistrar: "0x0000000000000000000000000000000000000000",
        } as InfrastructureAddress,
        tokens: {
            dst: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            usdt: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            usdc: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
            // dai: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", Can trade using the local token list
            wwdoge: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
        },
    },
};

export const getAddress = (address: keyof InfrastructureAddress, chainId: ChainId | undefined) => {
    return chainId == undefined ? undefined : addresses[chainId]?.infrastructure?.[address];
};
