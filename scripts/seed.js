const { ethers } = require("hardhat");
const config = require("../src/config.json");

// const tokens = (n)=>{
//     return ethers.utils.parseEther(n.toString());
// }
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function main(){
    console.log(config);
    let transaction,result;
    const {chainId} = await ethers.provider.getNetwork()
    console.log(chainId);
    const [user1,user2] = await ethers.getSigners();

    //拿到已部署的合同
    let QHY = await ethers.getContractAt('Token',config[chainId].QHY.address);
    console.log(config[chainId].QHY.address);
    // let QHY = await ethers.getContractAt('Token','0x5FbDB2315678afecb367f032d93F642f64180aa3');
    const mETH = await ethers.getContractAt('Token',config[chainId].mETH.address);
    const mDAI = await ethers.getContractAt('Token',config[chainId].mDAI.address);
    let exchange = await ethers.getContractAt('Exchange',config[chainId].exchange.address);
    

    transaction = await QHY.connect(user1).approve(exchange.address,tokens(1000));
    result = await transaction.wait();

    transaction = await exchange.connect(user1).depositToken(QHY.address,tokens(100));
    await transaction.wait();
   

    console.log(await exchange.balanceOf(QHY.address,user1.address));

    // const Exchange = await ethers.getContractFactory('Exchange')


    // const QHY = await Token.deploy('QiHuoYue','QHY','1000000');
    // console.log('QHY部署地址：'+QHY.address);

    // const mETH = await Token.deploy('mETH','mETH','1000000');
    // console.log('mETH部署地址：'+mETH.address);

    // const mDAI = await Token.deploy('mDAI','mDAI','1000000');
    // console.log('mDAI部署地址：'+mDAI.address);
    
    // const exchange = await Exchange.deploy(accounts[1].address,1);
    // console.log('exchange部署地址：'+exchange.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});