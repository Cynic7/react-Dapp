const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("测试Token", async () => {
  let name = "QiHuoYue";
  let symbol = "QHY";
  let totalSupply = "1000000";
  let token, deployer, reciver, transaction, result;

  beforeEach(async () => {
    // 从ethers 获取合同
    const Token = await ethers.getContractFactory("Token");
    //部署合同
    token = await Token.deploy(name, symbol, totalSupply);

    const account = await ethers.getSigners();

    deployer = account[0];
    reciver = account[1];
    spender = account[2];
  });

  describe("基本信息", () => {
    it("检查名字、符号、供应量", async () => {
      //期望合同的名字=xx
      expect(await token.name()).to.equal(name);
      expect(await token.symbol()).to.equal(symbol);
      expect(await token.decimals()).to.equal(18);
      //JS不能出现太大的数字，从始至终都需要是字符串
      expect(await token.totalSupply()).to.equal(tokens(totalSupply));
    });

    it("部署账号拿到全部代币", async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(
        tokens(totalSupply)
      );
    });
  });

  describe("转移 transfer", () => {
    beforeEach(async () => {
      transaction = await token
        .connect(deployer)
        .transfer(reciver.address, tokens("100"));
      result = await transaction.wait();
    });
    describe("成功", () => {
      it("检查双方钱包余额变化", async () => {
        expect(await token.balanceOf(reciver.address)).to.equal(tokens("100"));
        expect(await token.balanceOf(deployer.address)).to.equal(
          tokens(totalSupply - "100")
        );
      });
      it("发射转移事件", async () => {
        let event = result.events[0];
        expect(event.event).to.equal("Transfer");
        expect(event.args.from).to.equal(deployer.address);
        expect(event.args.to).to.equal(reciver.address);
        expect(event.args.value).to.equal(tokens("100"));
      });
    });

    describe("失败", () => {
      it("转移超额的钱", async () => {
        // revertedWith
        expect(token.transfer(reciver.address, tokens("10000000"))).to.be
          .reverted;
      });
      it("无效地址", async () => {
        let address = "0x";
        for (let i = 0; i < 40; i++) {
          address += "0";
        }
        expect(token.transfer(address, tokens("10"))).to.be.reverted;
      });
    });
  });

  describe("授权 approve", () => {
    describe("成功", () => {
      beforeEach(async () => {
        transaction = await token
          .connect(deployer)
          .approve(spender.address, tokens("1000"));
        result = await transaction.wait();
      });
      it("被授权1000 tokens", async () => {
        expect(
          await token.allowance(deployer.address, spender.address)
        ).to.equal(tokens("1000"));
      });
      it("发射授权事件", async () => {
        let event = result.events[0];
        expect(event.event).to.equal("Approval");
        expect(event.args.owner).to.equal(deployer.address);
        expect(event.args.spender).to.equal(spender.address);
        expect(event.args.value).to.equal(tokens("1000"));
      });
    });

    describe("失败", () => {
      it("授权人钱不够", async () => {
        expect(
          token.connect(deployer).approve(spender.address, tokens("1000000"))
        ).to.be.reverted;
      });
      it("无效地址", async () => {
        let address = "0x";
        for (let i = 0; i < 40; i++) {
          address += "0";
        }
        expect(token.approve(address, tokens("10"))).to.be.reverted;
      });
    });
  });

  describe("转移 transferFrom", () => {
    describe("成功", () => {
      beforeEach(async () => {
        // 授权1000
        transaction = await token
          .connect(deployer)
          .approve(spender.address, tokens("1000"));
        result = await transaction.wait();
      });

      it("检查转移后的余额", async () => {
        //spender调用transferFrom 从 deployer 口袋转给 recevier 1000块
        transaction = await token
          .connect(spender)
          .transferFrom(deployer.address, reciver.address, tokens("1000"));
        result = await transaction.wait();

        //allowance映射，spender余额从1000 -> 0
        expect(
          await token.allowance(deployer.address, spender.address)
        ).to.equal("0");

        //balanceOf映射，deployer少了1000
        expect(await token.balanceOf(deployer.address)).to.equal(
          tokens(totalSupply - "1000")
        );
        
        //balanceOf映射，reciver从0 -> 1000
        expect(await token.balanceOf(reciver.address)).to.equal(tokens("1000"));
      });
    });

    describe("失败", () => {
      it("被授权人钱不够", async () => {
        expect(
          token
            .connect(spender)
            .transferFrom(deployer.address, reciver.address, tokens("10000"))
        ).to.be.reverted;
      });
      it("无效地址", async () => {
        let address = "0x";
        for (let i = 0; i < 40; i++) {
          address += "0";
        }
        expect(
          token.connect(spender).transferFrom(address, address, tokens("10"))
        ).to.be.reverted;
      });
    });
  });
});
