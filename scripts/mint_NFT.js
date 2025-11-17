const { ethers } = require("hardhat");
const config = require("../src/config.json");

async function main() {
  const {chainId} = await ethers.provider.getNetwork()
  const myContrct = await ethers.getContractAt('QhyNFT',config[chainId].QhyNFT.address)
  const signer = await ethers.provider.getSigner()
  const accounts = await ethers.getSigners();

  for(let i = 1;i<=15;i++){
    let transcation = await myContrct.connect(signer).mintAndSell(accounts[0].address,JSON.stringify(
        {
          "name":'数字艺术 #00' + i,
          "url":'/NFTs/'+i+'.jpg',
         
        }
      ),
      true,
      ethers.utils.parseEther((0.001*i).toFixed(3))
    )
    await transcation.wait()
    console.log('铸造成功'+i);
  }
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
