require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks:{
    sepolia:{
      chainId: 11155111,
      url: "https://sepolia.infura.io/v3/"+process.env.INFURA_API_KEY,
      accounts: process.env.PRIVATE_KES.split(',') // 从环境变量读取部署账户私钥
    },
    localhost:{
      url: "http://127.0.0.1:8545",
      chainId: 31337, // Hardhat 本地网络的默认链ID :cite[7]
    },
  }
};
