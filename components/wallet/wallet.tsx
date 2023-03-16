import React from "react";
import { Dropdown, Stack, Spinner } from "react-bootstrap";
import { truncateAddress, formatBigNumber } from "lib/utils";
import BigNumber from "bignumber.js";

import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";

export function Wallet({ address, amount, symbol, destroy }: { address: string; amount: BigNumber; symbol: string; destroy: Function }) {
  if (address) {
    return (
      <>
        <Dropdown>
          <Dropdown.Toggle
            variant="light"
            id="dropdown-basic"
            className="d-flex align-items-center border rounded-pill py-1"
          >
            {amount ? (
              <>
                {formatBigNumber(amount)} <span className="ms-1"> {symbol}</span>
              </>
            ) : (
              <Spinner animation="border" size="sm" className="opacity-25" />
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-lg border-0">
            <Dropdown.Item
              href={`https://alfajores-blockscout.celo-testnet.org/address/${address}/transactions`}
              target="_blank"
            >
              <Stack direction="horizontal" gap={2}>
                <i className="bi bi-person-circle fs-4" />
                <span className="font-monospace">{truncateAddress(address)}</span>
              </Stack>
            </Dropdown.Item>

            <Dropdown.Divider />
            <Dropdown.Item
              as="button"
              className="d-flex align-items-center"
              onClick={() => {
                destroy();
              }}
            >
              <i className="bi bi-box-arrow-right me-2 fs-4" />
              Disconnect
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }

  return null;
};
