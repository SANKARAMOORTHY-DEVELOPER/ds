import { ERC20_DECIMALS } from "./constants";
import BigNumber from "bignumber.js"

// format a wallet address
export const truncateAddress = (address: string) => {
    if (!address) return;
    return (
        address.slice(0, 5) +
        "..." +
        address.slice(address.length - 4, address.length)
    );
};

// convert from big number
export const formatBigNumber = (num: BigNumber) => {
    if (!num) return;
    return num.shiftedBy(-ERC20_DECIMALS).toFixed(2);
};

export function typeformat(type: number) {
    switch (type) {
        case 0: {
            return "UNAVAILABLE";
        }
        case 1: {
            return "ADD";
        }
        case 2: {
            return "REMOVE";
        }
        case 3: {
            return "BUY"
        }
        default: {
            return "Loading";
        }
    }
}
