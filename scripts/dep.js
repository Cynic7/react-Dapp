const { ethers } = require("hardhat");

async function main(){
    const Token = await ethers.getContractFactory('Token')
    const token = await Token.deploy()
    console.log(token.address);
    console.log(await token.name());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});