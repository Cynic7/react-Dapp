const { ethers } = require("hardhat");

async function main() {
  const QhyNFT = await ethers.getContractFactory("QhyNFT");
  const Qhy_NFT = await QhyNFT.deploy('QhyNFT','QhyNFT');
  await Qhy_NFT.deployed();

  console.log("Qhy_NFT部署地址：" + Qhy_NFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
