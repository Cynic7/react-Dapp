const { ethers } = require("hardhat");
const config = require("../src/config.json");

// const tokens = (n)=>{
//     return ethers.utils.parseEther(n.toString());
// }
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const sleep = (time)=>new Promise(resolve=>setTimeout(resolve,time*1000))

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
    

    //user1 存入 100 QHY
    transaction = await QHY.connect(user1).approve(exchange.address,tokens(1000));
    result = await transaction.wait();

    transaction = await exchange.connect(user1).depositToken(QHY.address,tokens(100));
    await transaction.wait();

    //user1 存入 100 mETH
    transaction = await mETH.connect(user1).approve(exchange.address,tokens(1000));
    result = await transaction.wait();

    transaction = await exchange.connect(user1).depositToken(mETH.address,tokens(100));
    await transaction.wait();

    //user1 转账给user2 1000 QHY
    transaction = await QHY.connect(user1).transfer(user2.address,tokens(1000))
    await transaction.wait();

    //user2 存入 100 QHY
    transaction = await QHY.connect(user2).approve(exchange.address,tokens(1000));
    result = await transaction.wait();
    transaction = await exchange.connect(user2).depositToken(QHY.address,tokens(100));
    await transaction.wait();

    //user1 转账给user2 1000 mETH
    transaction = await mETH.connect(user1).transfer(user2.address,tokens(1000))
    await transaction.wait();

    //user2 存入 100 mETH
    transaction = await mETH.connect(user2).approve(exchange.address,tokens(1000));
    result = await transaction.wait();
    transaction = await exchange.connect(user2).depositToken(mETH.address,tokens(100));
    await transaction.wait();

    //user1 创建订单
    for(let i=0;i<10;i++){
      //买4个QHY 换 10个mETH  2.5
      //i = 4,买5个QHY 换13个mETH
      transaction = await exchange.connect(user1).makeOrder(QHY.address,tokens(i+1),mETH.address,tokens(i*3+1))
      await transaction.wait();

      //i=3，卖4个QHY，得14个mETH <2.5
      //i=4，卖5个QHY，得18个mETH <2.5
      transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(i*4+2),QHY.address,tokens(i+1))
      await transaction.wait();
    }

    sleep(2)
   
    try{
      //取消订单
      transaction = await exchange.connect(user1).cancelOrder(1);
      await transaction.wait();

      transaction = await exchange.connect(user1).cancelOrder(3);
      await transaction.wait();

      transaction = await exchange.connect(user1).cancelOrder(5);
      await transaction.wait();

      //成交订单
      transaction = await exchange.connect(user1).fillOrder(2);
      await transaction.wait();

      transaction = await exchange.connect(user2).fillOrder(6);
      await transaction.wait();

      transaction = await exchange.connect(user2).fillOrder(9);
      await transaction.wait();

    }catch(e){
      console.log('503',e);
    }
    


    console.log(await exchange.balanceOf(QHY.address,user1.address));

  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});