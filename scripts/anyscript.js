const { ethers } = require("hardhat");
const config = require("../src/config.json");

async function main() {
  const [signer,user] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork();

  const TokenSwap = await ethers.getContractAt("TokenSwap", config[chainId].TokenSwap.address);

  //清除交换次数
  let transaction = await TokenSwap.connect(signer).clearOnlyOnce(user.address)
  await transaction.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
