const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("测试Exchange",() => {
 
  let token,deployer,feeAccount,feePercent;

  beforeEach(async()=>{
    const accounts = await ethers.getSigners()
    //收取费用10%
    deployer = accounts[0]
    feeAccount = accounts[1];
    feePercent = 10;
    const Token = await ethers.getContractFactory('Exchange');
    token = await Token.deploy(feeAccount.address,feePercent)
  })
  
  
  it('校验收费账户和收费比率',async ()=>{
    expect(await token.feeAccount()).to.equal(feeAccount.address)
    expect(await token.feePercent()).to.equal(feePercent)
    
  })
});
