require("@nomiclabs/hardhat-vyper");
require("@matterlabs/hardhat-zksync-vyper");
require("@matterlabs/hardhat-zksync-deploy");

module.exports = {
  zkvyper: {
    version: "1.2.0",
    compilerSource: "binary", // binary or docker
    // settings: {
    //   compilerPath: "zkvyper", // ignored for compilerSource: "docker"
    //   experimental: {
    //     dockerImage: "matterlabs/zkvyper", // required for compilerSource: "docker"
    //     tag: "latest", // required for compilerSource: "docker"
    //   },
    // },
  },
  zkSyncDeploy: {
    zkSyncNetwork: "https://zksync2-testnet.zksync.dev",
    ethNetwork: "https://goerli.infura.io/v3/e635e27a17ce42f399167a0e58507dae", // Can also be the RPC URL of the network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
  },
  networks: {
    hardhat: {
      zksync: true,
    },
  },
  vyper: {
    compilers: [{ version: "0.3.3" }],
  },
};
