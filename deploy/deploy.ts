import { Wallet, utils } from "zksync-web3";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as dotenv from "dotenv";

dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the Greeter contract`);

  // Initialize the wallet.
  const wallet = Wallet.fromMnemonic(process.env.MNEMONIC);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const mockTokenArtifact = await deployer.loadArtifact("ERC20Mock");
  const wethArtifact = await deployer.loadArtifact("WETH");
  const tokenArtifact = await deployer.loadArtifact("CurveTokenV5");
  const poolArtifact = await deployer.loadArtifact("CurveCryptoSwap2ETH");
  const guageArtifact = await deployer.loadArtifact("LiquidityGauge");
  const factoryArtifact = await deployer.loadArtifact("Factory");

  // Estimate contract deployment fee
  let deploymentFee = await deployer.estimateDeployFee(wethArtifact, []);
  deploymentFee = deploymentFee.add(
    await deployer.estimateDeployFee(mockTokenArtifact, ["USDC", "USDC", "6"])
  );
  deploymentFee = deploymentFee.add(
    await deployer.estimateDeployFee(mockTokenArtifact, ["EUROC", "EUROC", "6"])
  );
  deploymentFee = deploymentFee.add(
    await deployer.estimateDeployFee(tokenArtifact, [])
  );
  deploymentFee = deploymentFee.add(
    await deployer.estimateDeployFee(poolArtifact, [ZERO_ADDRESS])
  );
  deploymentFee = deploymentFee.add(
    await deployer.estimateDeployFee(guageArtifact, [])
  );
  deploymentFee = deploymentFee.add(
    await deployer.estimateDeployFee(factoryArtifact, [
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
    ])
  );

  // Deposit funds to L2
  const depositHandle = await deployer.zkWallet.deposit({
    to: deployer.zkWallet.address,
    token: utils.ETH_ADDRESS,
    amount: deploymentFee.mul(2),
  });
  // Wait until the deposit is processed on zkSync
  await depositHandle.wait();

  // Deploy contracts
  const weth = await deployer.deploy(wethArtifact, []);
  console.log("Deployed weth at: " + weth.address);
  const usdc = await deployer.deploy(mockTokenArtifact, ["USDC", "USDC", "6"]);
  console.log("Deployed usdc at: " + usdc.address);
  const euroc = await deployer.deploy(mockTokenArtifact, [
    "EUROC",
    "EUROC",
    "6",
  ]);

  console.log("Deployed euroc at: " + euroc.address);
  const tokenImpl = await deployer.deploy(tokenArtifact, []);
  console.log("Deployed tokenImpl at: " + tokenImpl.address);
  const poolImpl = await deployer.deploy(poolArtifact, [weth.address]);
  console.log("Deployed poolImpl at: " + poolImpl.address);
  const guageImpl = await deployer.deploy(guageArtifact, []);
  console.log("Deployed guageImpl at: " + guageImpl.address);
  const factory = await deployer.deploy(factoryArtifact, [
    ZERO_ADDRESS,
    poolImpl.address,
    tokenImpl.address,
    guageImpl.address,
    weth.address,
  ]);
  console.log("Deployed factory at: " + factory.address);
}
