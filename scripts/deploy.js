const { ethers } = require("hardhat");

async function main(){
    const Token = await ethers.getContractFactory('Token')
    const Exchange = await ethers.getContractFactory('Exchange')

    const accounts = await ethers.getSigners();

    const QHY = await Token.deploy('QiHuoYue','QHY','1000000');
    await QHY.deployed();
    console.log('QHY部署地址：'+QHY.address);

    const mETH = await Token.deploy('mETH','mETH','1000000');
    await mETH.deployed();
    console.log('mETH部署地址：'+mETH.address);

    const mDAI = await Token.deploy('mDAI','mDAI','1000000');
    await mDAI.deployed();
    console.log('mDAI部署地址：'+mDAI.address);
    
    const exchange = await Exchange.deploy(accounts[1].address,1);
    await exchange.deployed();
    console.log('exchange部署地址：'+exchange.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});