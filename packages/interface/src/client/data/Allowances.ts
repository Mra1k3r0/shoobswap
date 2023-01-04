import { CurrencyAmount, Token } from "@dogeswap/sdk-core";
import { useMemo } from "react";
import { useSingleCallResult } from "../hooks/Multicall";

import { useTokenContract } from "../hooks/useContract";

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): CurrencyAmount | undefined {
    const contract = useTokenContract(token?.address, false);

    const inputs = useMemo(() => [owner, spender], [owner, spender]);
    const allowance = useSingleCallResult(contract, "allowance", inputs).result;

    return useMemo(
        () => (token && allowance ? new CurrencyAmount(token, allowance.toString()) : undefined),
        [token, allowance],
    );
}
