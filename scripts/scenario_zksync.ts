import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet, Provider } from "zksync-web3";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { BigNumber, Contract } from "ethers";
import * as dotenv from "dotenv";

const hre = require("hardhat");
dotenv.config();

const POOL_CONFIG = {
  A: BigNumber.from(5000)
    .mul(2 ** 2)
    .mul(10000),
  gamma: parseEther("0.0001"),
  mid_fee: parseUnits("0.0005", 10),
  out_fee: parseUnits("0.005", 10),
  allowed_extra_profit: parseUnits("10", 10),
  fee_gamma: parseEther("0.005"),
  adjustment_step: parseEther("0.0000055"),
  admin_fee: parseEther("0"), // set admin fee to zero
  ma_half_time: BigNumber.from(600),
};

async function main() {
  const provider = new Provider(hre.userConfig.zkSyncDeploy?.zkSyncNetwork);
  let wallet = Wallet.fromMnemonic(process.env.MNEMONIC);
  wallet = wallet.connect(provider);

  const deployer = new Deployer(hre, wallet);
  const mockTokenArtifact = await deployer.loadArtifact("ERC20Mock");
  const poolArtifact = await deployer.loadArtifact("CurveCryptoSwap2ETH");
  const factoryArtifact = await deployer.loadArtifact("Factory");

  const factory = new Contract(
    "0xa70bc65e90c206bE6944447e8C1E04d72334215b", // Change for your deployment
    factoryArtifact.abi,
    wallet
  );
  const euroc = new Contract(
    "0x964d8C21BCb491f4618C6f29F5A1252f3a0956eb", // Change for your deployment
    mockTokenArtifact.abi,
    wallet
  );
  const usdc = new Contract(
    "0x2Fd28805229C35083E73f3F15A7887c09E20525c", // Change for your deployment
    mockTokenArtifact.abi,
    wallet
  );

  // Create pool
  console.log("Deploying pool...");
  await (
    await factory.deploy_pool(
      "EUR/USD Circle",
      "EUROCUSDC",
      [euroc.address, usdc.address],
      POOL_CONFIG.A,
      POOL_CONFIG.gamma,
      POOL_CONFIG.mid_fee,
      POOL_CONFIG.out_fee,
      POOL_CONFIG.allowed_extra_profit,
      POOL_CONFIG.fee_gamma,
      POOL_CONFIG.adjustment_step,
      POOL_CONFIG.admin_fee,
      POOL_CONFIG.ma_half_time,
      parseEther("1")
    )
  ).wait();

  const poolCount = await factory.pool_count();
  const poolAddress = await factory.pool_list(poolCount.sub(1));

  console.log("Pool deployed to " + poolAddress);
  const pool = new Contract(poolAddress, poolArtifact.abi, wallet);

  // Mint tokens and provide to pool
  console.log("Minting and approving tokens...");
  const tokenAmount = parseEther("200");
  await (await euroc._mint_for_testing(wallet.address, tokenAmount)).wait();
  await (await usdc._mint_for_testing(wallet.address, tokenAmount)).wait();
  await (await euroc.approve(poolAddress, tokenAmount)).wait();
  await (await usdc.approve(poolAddress, tokenAmount)).wait();

  console.log("Adding Liquidity...");
  const addLiquidityParams = pool.interface.encodeFunctionData(
    "add_liquidity(uint256[2],uint256)",
    [[tokenAmount.div(2), tokenAmount.div(2)], parseEther("0")]
  );
  await (
    await wallet.sendTransaction({
      to: pool.address,
      from: wallet.address,
      data: addLiquidityParams,
      value: 0,
      chainId: 280, // zkSync 2.0 testnet
      type: 0,
    })
  ).wait();
  console.log("Liquidity added");

  console.log("Testing an exchange...");
  const exchangeParams = pool.interface.encodeFunctionData(
    "exchange(uint256,uint256,uint256,uint256)",
    [0, 1, parseEther("5"), 0]
  );
  await (
    await wallet.sendTransaction({
      to: pool.address,
      from: wallet.address,
      data: exchangeParams,
      value: 0,
      chainId: 280, // zkSync 2.0 testnet
      type: 0,
    })
  ).wait();
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch(console.error);
