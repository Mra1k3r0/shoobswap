import { ChainId, CurrencyAmount, Rounding, Token, TradeType } from "@dogeswap/sdk-core";
import JSBI from "jsbi";
import invariant from "tiny-invariant";
import { Pair } from "../../src/entities/pair";
import { Route } from "../../src/entities/route";
import { Trade } from "../../src/entities/trade";
import { testWWDOGE } from "../testUtils";

const factoryAddress = "0x0000000000000000000000000000000000000000";
const ADDRESSES = [
    "0x0000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000002",
    "0x0000000000000000000000000000000000000003",
];
const CHAIN_ID = ChainId.LOCALNET;
const DECIMAL_PERMUTATIONS: [number, number, number][] = [
    [0, 0, 0],
    [0, 9, 18],
    [18, 18, 18],
];

function decimalize(amount: number, decimals: number): JSBI {
    return JSBI.multiply(JSBI.BigInt(amount), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals)));
}

describe("entities", () => {
    DECIMAL_PERMUTATIONS.forEach((decimals) => {
        describe(`decimals permutation: ${decimals}`, () => {
            let tokens: Token[];
            it("Token", () => {
                tokens = ADDRESSES.map((address, i) => new Token(CHAIN_ID, address, decimals[i], ""));
                tokens.forEach((token, i) => {
                    expect(token.chainId).toEqual(CHAIN_ID);
                    expect(token.address).toEqual(ADDRESSES[i]);
                    expect(token.decimals).toEqual(decimals[i]);
                });
            });

            let pairs: Pair[];
            it("Pair", () => {
                pairs = [
                    new Pair(
                        new CurrencyAmount(tokens[0], decimalize(1, tokens[0].decimals)),
                        new CurrencyAmount(tokens[1], decimalize(1, tokens[1].decimals)),
                        factoryAddress,
                    ),
                    new Pair(
                        new CurrencyAmount(tokens[1], decimalize(1, tokens[1].decimals)),
                        new CurrencyAmount(tokens[2], decimalize(1, tokens[2].decimals)),
                        factoryAddress,
                    ),
                    new Pair(
                        new CurrencyAmount(tokens[2], decimalize(1, tokens[2].decimals)),
                        new CurrencyAmount(testWWDOGE, decimalize(1234, testWWDOGE.decimals)),
                        factoryAddress,
                    ),
                ];
            });

            let route: Route;
            it("Route", () => {
                route = new Route(pairs, testWWDOGE, tokens[0]);
                expect(route.pairs).toEqual(pairs);
                expect(route.path).toEqual(tokens.concat([testWWDOGE]));
                expect(route.input).toEqual(tokens[0]);
                expect(route.output).toEqual(testWWDOGE);
            });

            it("Price:Route.midPrice", () => {
                invariant(route.input.isToken);
                invariant(route.output.isToken);
                expect(
                    route.midPrice.quote(new CurrencyAmount(route.input, decimalize(1, route.input.decimals))),
                ).toEqual(new CurrencyAmount(route.output, decimalize(1234, route.output.decimals)));
                expect(
                    route.midPrice
                        .invert()
                        .quote(new CurrencyAmount(route.output, decimalize(1234, route.output.decimals))),
                ).toEqual(new CurrencyAmount(route.input, decimalize(1, route.input.decimals)));

                expect(route.midPrice.toSignificant(1)).toEqual("1000");
                expect(route.midPrice.toSignificant(2)).toEqual("1200");
                expect(route.midPrice.toSignificant(3)).toEqual("1230");
                expect(route.midPrice.toSignificant(4)).toEqual("1234");
                expect(route.midPrice.toSignificant(5)).toEqual("1234");
                expect(route.midPrice.toSignificant(5, { groupSeparator: "," })).toEqual("1,234");
                expect(route.midPrice.invert().toSignificant(1)).toEqual("0.0008");
                expect(route.midPrice.invert().toSignificant(2)).toEqual("0.00081");
                expect(route.midPrice.invert().toSignificant(3)).toEqual("0.00081");
                expect(route.midPrice.invert().toSignificant(4)).toEqual("0.0008104");
                expect(route.midPrice.invert().toSignificant(4, undefined, Rounding.ROUND_DOWN)).toEqual("0.0008103");
                expect(route.midPrice.invert().toSignificant(5)).toEqual("0.00081037");

                expect(route.midPrice.toFixed(0)).toEqual("1234");
                expect(route.midPrice.toFixed(1)).toEqual("1234.0");
                expect(route.midPrice.toFixed(2)).toEqual("1234.00");
                expect(route.midPrice.toFixed(2, { groupSeparator: "," })).toEqual("1,234.00");
                expect(route.midPrice.invert().toFixed(0)).toEqual("0");
                expect(route.midPrice.invert().toFixed(1)).toEqual("0.0");
                expect(route.midPrice.invert().toFixed(2)).toEqual("0.00");
                expect(route.midPrice.invert().toFixed(3)).toEqual("0.001");
                expect(route.midPrice.invert().toFixed(4)).toEqual("0.0008");
                expect(route.midPrice.invert().toFixed(5)).toEqual("0.00081");
                expect(route.midPrice.invert().toFixed(6)).toEqual("0.000810");
                expect(route.midPrice.invert().toFixed(7)).toEqual("0.0008104");
                expect(route.midPrice.invert().toFixed(7, undefined, Rounding.ROUND_DOWN)).toEqual("0.0008103");
                expect(route.midPrice.invert().toFixed(8)).toEqual("0.00081037");
            });

            describe("Trade", () => {
                let route: Route;
                it("TradeType.EXACT_INPUT", () => {
                    route = new Route(
                        [
                            new Pair(
                                new CurrencyAmount(tokens[1], decimalize(5, tokens[1].decimals)),
                                new CurrencyAmount(testWWDOGE, decimalize(10, testWWDOGE.decimals)),
                                factoryAddress,
                            ),
                        ],
                        testWWDOGE,
                        tokens[1],
                    );
                    const inputAmount = new CurrencyAmount(tokens[1], decimalize(1, tokens[1].decimals));
                    const expectedOutputAmount = new CurrencyAmount(testWWDOGE, "1662497915624478906");
                    const trade = new Trade(route, inputAmount, TradeType.EXACT_INPUT, testWWDOGE, factoryAddress);
                    expect(trade.route).toEqual(route);
                    expect(trade.tradeType).toEqual(TradeType.EXACT_INPUT);
                    expect(trade.inputAmount).toEqual(inputAmount);
                    expect(trade.outputAmount).toEqual(expectedOutputAmount);

                    expect(trade.executionPrice.toSignificant(18)).toEqual("1.66249791562447891");
                    expect(trade.executionPrice.invert().toSignificant(18)).toEqual("0.601504513540621866");
                    expect(trade.executionPrice.quote(inputAmount)).toEqual(expectedOutputAmount);
                    expect(trade.executionPrice.invert().quote(expectedOutputAmount)).toEqual(inputAmount);

                    expect(trade.nextMidPrice.toSignificant(18)).toEqual("1.38958368072925352");
                    expect(trade.nextMidPrice.invert().toSignificant(18)).toEqual("0.71964");

                    expect(trade.priceImpact.toSignificant(18)).toEqual("16.8751042187760547");
                });

                it("TradeType.EXACT_OUTPUT", () => {
                    const outputAmount = new CurrencyAmount(testWWDOGE, "1662497915624478906");
                    const expectedInputAmount = new CurrencyAmount(tokens[1], decimalize(1, tokens[1].decimals));
                    const trade = new Trade(route, outputAmount, TradeType.EXACT_OUTPUT, testWWDOGE, factoryAddress);
                    expect(trade.route).toEqual(route);
                    expect(trade.tradeType).toEqual(TradeType.EXACT_OUTPUT);
                    expect(trade.outputAmount).toEqual(outputAmount);
                    expect(trade.inputAmount).toEqual(expectedInputAmount);

                    expect(trade.executionPrice.toSignificant(18)).toEqual("1.66249791562447891");
                    expect(trade.executionPrice.invert().toSignificant(18)).toEqual("0.601504513540621866");
                    expect(trade.executionPrice.quote(expectedInputAmount)).toEqual(outputAmount);
                    expect(trade.executionPrice.invert().quote(outputAmount)).toEqual(expectedInputAmount);

                    expect(trade.nextMidPrice.toSignificant(18)).toEqual("1.38958368072925352");
                    expect(trade.nextMidPrice.invert().toSignificant(18)).toEqual("0.71964");

                    expect(trade.priceImpact.toSignificant(18)).toEqual("16.8751042187760547");
                });

                it("minimum TradeType.EXACT_INPUT", () => {
                    if ([9, 18].includes(tokens[1].decimals)) {
                        const route = new Route(
                            [
                                new Pair(
                                    new CurrencyAmount(tokens[1], decimalize(1, tokens[1].decimals)),
                                    new CurrencyAmount(
                                        testWWDOGE,
                                        JSBI.add(
                                            decimalize(10, testWWDOGE.decimals),
                                            tokens[1].decimals === 9
                                                ? JSBI.BigInt("30090280812437312")
                                                : JSBI.BigInt("30090270812437322"),
                                        ),
                                    ),
                                    factoryAddress,
                                ),
                            ],
                            testWWDOGE,
                            tokens[1],
                        );
                        const outputAmount = new CurrencyAmount(tokens[1], "1");
                        const trade = new Trade(route, outputAmount, TradeType.EXACT_INPUT, testWWDOGE, factoryAddress);

                        expect(trade.priceImpact.toSignificant(18)).toEqual(
                            tokens[1].decimals === 9 ? "0.300000099400899902" : "0.3000000000000001",
                        );
                    }
                });
            });

            it("CurrencyAmount", () => {
                const amount = new CurrencyAmount(testWWDOGE, "1234567000000000000000");
                expect(amount.toExact()).toEqual("1234.567");
                expect(amount.toExact({ groupSeparator: "," })).toEqual("1,234.567");
            });
        });
    });
});
