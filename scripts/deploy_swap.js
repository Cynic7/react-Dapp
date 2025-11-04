const { ethers } = require("hardhat");
const config = require("../src/config.json");

async function main() {
  const TokenSwap = await ethers.getContractFactory("TokenSwap");
  const { chainId } = await ethers.provider.getNetwork();
  const signer = await ethers.provider.getSigner();

  const tokenSwap = await TokenSwap.deploy(config[chainId].QHY.address);
  await tokenSwap.deployed();
  console.log("TokenSwap部署地址：" + tokenSwap.address);

  //部署完成后，给合约转1w个QHY代币,最多可以被兑换100次

  const QHY = await ethers.getContractAt("Token", config[chainId].QHY.address);

  let transaction = await QHY.connect(signer).transfer(
    tokenSwap.address,
    ethers.utils.parseEther("10000")
  );
  await transaction.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
