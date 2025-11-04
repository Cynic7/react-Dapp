const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("测试TokenSwap", async () => {
  let myContract, deployer, user, token, transaction, result;

  beforeEach(async () => {
    let Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("QHY", "QHY", "1000000");

    let _myContract = await ethers.getContractFactory("TokenSwap");
    myContract = await _myContract.deploy(token.address);

    [deployer, user] = await ethers.getSigners();
  });

  it("基本信息", async () => {
    expect(await myContract.exchangeRate()).to.equal(100000);
    expect(await myContract.swapKey()).to.equal(true);
    expect(await myContract.token()).to.equal(token.address);
    expect(await myContract.myAddress()).to.equal(deployer.address);
  });
  it("向合约存取代币", async () => {
    transaction = await token
      .connect(deployer)
      .transfer(myContract.address, tokens("100"));
    await transaction.wait();
    transaction = await myContract.connect(deployer).withdrawToken(tokens("1"));
    await transaction.wait();

    expect(await token.balanceOf(myContract.address)).to.equal(tokens("99"));

    expect(
      myContract.connect(deployer).withdrawToken(tokens("1000"))
    ).to.revertedWith("withdrawToken: no tokenAmount");
    expect(myContract.connect(user).withdrawToken(tokens("1"))).to.reverted;
  });
  describe("测试交换", () => {
    describe("成功", () => {
      let originETH;
      beforeEach(async () => {
        transaction = await token
          .connect(deployer)
          .transfer(myContract.address, tokens("100"));
        await transaction.wait();
        originETH = ethers.utils.formatEther(
          await ethers.provider.getBalance(deployer.address)
        );
        //user向合约发送 0.001 原生代币，理应收到100 QHY代币，deployer的原生代币应该 += 0.01
        transaction = await myContract
          .connect(user)
          .swapTokens({ value: ethers.utils.parseEther("0.001") });
        result = await transaction.wait();
      });
      it("发送原生货币", async () => {
        expect(await token.balanceOf(user.address)).to.equal(tokens("100"));
        expect(await token.balanceOf(myContract.address)).to.equal(0);
        expect(
          Number(
            ethers.utils.formatEther(
              await ethers.provider.getBalance(deployer.address)
            )
          )
        ).to.equal(Number(originETH) + 0.001);
      });
      it("发射事件", async () => {
        let event = result.events[1];
        expect(event.event).to.equal("TokensSwapped");
        expect(event.args.user).to.equal(user.address);
        expect(event.args.nativeAmount).to.equal(
          ethers.utils.parseEther("0.001")
        );
        expect(event.args.tokenAmount).to.equal(tokens("100"));
      });
    });
    describe("失败", () => {
      it("发送货币数量不在范围内", async () => {
        expect(myContract.connect(user).swapTokens({ value: 0 })).to.reverted;
        expect(myContract.connect(user).swapTokens()).to.reverted;
        expect(myContract.connect(user).swapTokens({value:ethers.utils.parseEther("0.002") })).to.reverted;
      });
      it("没有足够的ERC20代币", async () => {
        expect(
          myContract
            .connect(user)
            .swapTokens({ value: ethers.utils.parseEther("0.001") })
        ).to.revertedWith("swapTokens: no ERC20 balance");
      });
      it("只能兑换一次", async () => {
        transaction = await token
          .connect(deployer)
          .transfer(myContract.address, tokens("1000"));
        await transaction.wait();

        transaction = await myContract
          .connect(user)
          .swapTokens({ value: ethers.utils.parseEther("0.001") });
        await transaction.wait();

        expect( myContract
          .connect(user)
          .swapTokens({ value: ethers.utils.parseEther("0.001") })).to.revertedWith('swapTokens: only once')
      });
    });
  });

  it("测试开关", async () => {
    transaction = await myContract.connect(deployer).switchSwapKey(false);
    await transaction.wait();
    expect(myContract.connect(user).swapTokens({ value: 1 })).to.revertedWith(
      "swapTokens: swapKey error"
    );
  });
  it("调整比率", async () => {
    transaction = await token
      .connect(deployer)
      .transfer(myContract.address, tokens("100"));
    await transaction.wait();

    transaction = await myContract.connect(deployer).changeExchangeRate(10000);
    await transaction.wait();
   
    //user向合约发送 0.001 原生代币，理应收到100 QHY代币，deployer的原生代币应该 += 0.01
    transaction = await myContract
      .connect(user)
      .swapTokens({ value: ethers.utils.parseEther("0.001") });
    result = await transaction.wait();

    expect(await token.balanceOf(user.address) ).to.equal(tokens('10'))

  });
});
