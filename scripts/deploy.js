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

    const currentGasPrice = await ethers.provider.getGasPrice();
    // console.log('当前gas费用：'+currentGasPrice.toString());
    //取当前gas费用的70%
    const lowGasPrice = currentGasPrice.mul(7).div(10);
    
    const exchange = await Exchange.deploy(accounts[1].address, 1, {
        gasPrice: lowGasPrice,
        gasLimit: 2500000
    });
    await exchange.deployed();
    console.log('exchange部署地址：'+exchange.address);


    const TokenSwap = await ethers.getContractFactory("TokenSwap");
    const signer = await ethers.provider.getSigner();

    const tokenSwap = await TokenSwap.deploy(QHY.address);
    await tokenSwap.deployed();
    console.log("TokenSwap部署地址：" + tokenSwap.address);
    
    let transaction = await QHY.connect(signer).transfer(
      tokenSwap.address,
      ethers.utils.parseEther("10000")
    );
    await transaction.wait();

    const QhyNFT = await ethers.getContractFactory("QhyNFT");
  const Qhy_NFT = await QhyNFT.deploy('QhyNFT','QhyNFT');
  await Qhy_NFT.deployed();

  console.log("Qhy_NFT部署地址：" + Qhy_NFT.address);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});