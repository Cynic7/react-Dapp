require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  nextworks:{
    localhost:{
      url: "http://127.0.0.1:8545",
      chainId: 31337, // Hardhat 本地网络的默认链ID :cite[7]
      accounts: [process.env.DEPLOYER_PRIVATE_KEY] // 从环境变量读取部署账户私钥
    }
  }
};
