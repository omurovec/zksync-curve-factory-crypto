## zkSync 2.0

### Deployment addresses

```shell
Deployed weth at: 0x8C3F6Ef772beBa509dE4cD1B974A097E459b1532
Deployed usdc at: 0x2Fd28805229C35083E73f3F15A7887c09E20525c
Deployed euroc at: 0x964d8C21BCb491f4618C6f29F5A1252f3a0956eb
Deployed tokenImpl at: 0x71E37e02346381083958802C67Ee029D3C38Cf1C
Deployed poolImpl at: 0x9E4769613a9De3fA1327dB7F1f5Ee26e4F65Cd32
Deployed guageImpl at: 0x63cB2bf47dFd79EF2B6a7886d783a5e7aA1bc36E
Deployed factory at: 0xa70bc65e90c206bE6944447e8C1E04d72334215b
Deployed pool (EUROC/USDC) at: 0x017Ea1e2beD295e18E9c0E32df351F6889c3be71
```

### Example transactions

```shell
factory.deploy_pool(): 0xb4c8e094fb32588c15b4c1b64205465428f78fbd66a5a8e6c203164e4164fffb
pool.provide_liquidity(): 0xb2d26b43f2c87ffeb703582232225e4ca71e249aa11eef0141fa95b6aea44d97
pool.exchange(): 0x122a4a2f00211ab73e313f431445d9b0197e4ab56fce0cbed077395017c10f04
```

## Testing

To run all tests

```shell
brownie test
```

To run only zap tests

```shell
brownie test tests/zaps
```

To specify zap(`3pool` or `tricrypto` metapool)

```shell
brownie test tests/zaps --zap_base 3pool
```

You can also run forked tests for any network specified in [tricrypto data](contracts/testing/tricrypto/data) or
[3pool data](contracts/testing/3pool/data)

```shell
brownie test tests/zaps/forked --deployed_data arbitrum --network arbitrum-fork
```

### zkSync deployment

1. Add your mnemonic to `.env` in the root folder

```shell
MNEMONIC="test test test test test test test test test test test test"
```

2. Install dependencies

```shell
yarn
```

3. Compile contracts

```shell
yarn compile-zksync
```

4. Deploy contracts

```shell
yarn deploy-zksync
```

5. Deploy a pool, mint tokens, add liquidity, and test exchange

```shell
yarn scenario-zksync
```
