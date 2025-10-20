const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("测试Exchange",() => {
 
  let token,exchange,deployer,feeAccount,spender,feePercent,transcation,result,mETH,mDai;
  let name = "QiHuoYue";
  let symbol = "QHY";
  let totalSupply = "1000000";

  beforeEach(async()=>{
     [deployer, feeAccount,spender] = await ethers.getSigners()

    //收取费用10%
    feePercent = 10;

    const Token = await ethers.getContractFactory('Token');
    token = await Token.deploy(name,symbol,totalSupply)

    const Token2 = await ethers.getContractFactory('Token');
    mETH = await Token2.deploy('mETH','mETH',totalSupply)

    const Token3 = await ethers.getContractFactory('Token');
    mDai = await Token3.deploy('mDai','mDai',totalSupply)

    const Exchange = await ethers.getContractFactory('Exchange');
    exchange = await Exchange.deploy(feeAccount.address,feePercent)
   
  })
  
  
  it('校验收费账户和收费比率',async ()=>{
    expect(await exchange.feeAccount()).to.equal(feeAccount.address)
    expect(await exchange.feePercent()).to.equal(feePercent)
  })
  describe('存款',()=>{

    beforeEach(async()=>{
      //授权1000tokens
      transcation = await token.connect(deployer).approve(exchange.address, tokens('1000'))
      result = await transcation.wait()

    })

    describe('成功',()=>{
      beforeEach(async()=>{
        //存入1000tokens
        transcation = await exchange.connect(deployer).depositToken(token.address,tokens('1000'))
        result = await transcation.wait()
      })
      it('存入1000 Token后，检查映射',async()=>{
        
        expect(await token.balanceOf(exchange.address)).to.equal(tokens('1000'))
        expect(await exchange.balanceOf(token.address,deployer.address)).to.equal(tokens('1000'))
      })
      it('发射存款事件',async()=>{
        const event = result.events[1];
        expect(event.event).to.equal('DepositToken');
        const args = event.args;
        expect(args.user).to.equal(deployer.address);
        expect(args.tokenAddress).to.equal(token.address);
        expect(args.value).to.equal(tokens('1000'));
        expect(args.balance).to.equal(tokens('1000'));
      })
    })
    describe('失败',()=>{
      it('存入超过授权的金额',async()=>{
        expect(exchange.connect(deployer).depositToken(token.address,tokens('1001'))).to.be.reverted
      })
    })

  })

  describe('取款',()=>{

    beforeEach(async()=>{
      //授权1000tokens
      transcation = await token.connect(deployer).approve(exchange.address, tokens('1000'))
      result = await transcation.wait()

       //存入1000tokens
      transcation = await exchange.connect(deployer).depositToken(token.address,tokens('1000'))
      result = await transcation.wait()
    })

    describe('成功',()=>{
      beforeEach(async()=>{
        //取出400tokens
        transcation = await exchange.connect(deployer).withdrawToken(token.address,tokens('400'))
        result = await transcation.wait()
      })
      it('取出400 Token后，检查映射',async()=>{
        
        expect(await token.balanceOf(exchange.address)).to.equal(tokens('600'))
        expect(await exchange.balanceOf(token.address,deployer.address)).to.equal(tokens('600'))
      })
      it('发射取款事件',async()=>{
        const event = result.events[1];
        expect(event.event).to.equal('WithdrawToken');
        const args = event.args;
        expect(args.user).to.equal(deployer.address);
        expect(args.tokenAddress).to.equal(token.address);
        expect(args.value).to.equal(tokens('400'));
        expect(args.balance).to.equal(tokens('600'));
      })
    })
    describe('失败',()=>{
      it('取出超额的金额',async()=>{
        expect(exchange.connect(deployer).withdrawToken(token.address,tokens('1001'))).to.be.reverted
      })
    })

  })

  describe('下单',()=>{
    beforeEach(async()=>{
      //授权1000tokens
      transcation = await token.connect(deployer).approve(exchange.address, tokens('1000'))
      result = await transcation.wait()

        //存入1000tokens
      transcation = await exchange.connect(deployer).depositToken(token.address,tokens('1000'))
      result = await transcation.wait()
    })


    describe('成功',()=>{
      beforeEach(async()=>{
        //下单，用10个token交换10个mEth
        transcation = await exchange.connect(deployer).makeOrder(mETH.address,tokens('10'),token.address,tokens('10'))
        result = await transcation.wait()
      })
      it('下单后，检查映射',async()=>{
        let orderObj = await exchange.orders(1);
        expect(orderObj.orderId ).to.equal(1)
        expect(orderObj.user).to.equal(deployer.address)
        expect(orderObj.tokenGet).to.equal(mETH.address)
      })
      it('发射下单事件',async()=>{
        const event = result.events[0];
        expect(event.event).to.equal('MakeOrder');
        const args = event.args;
        expect(args.orderId).to.equal(1);
        expect(args.user).to.equal(deployer.address);
        expect(args.tokenGet).to.equal(mETH.address);
        expect(args.getValue).to.equal(tokens('10'));
        expect(args.tokenGive).to.equal(token.address);
        expect(args.giveValue).to.equal(tokens('10'));
        expect(args.timestamp).to.at.least(1);
      })
    })
    describe('失败',()=>{
      it('下单时token不足',async()=>{
        expect(exchange.connect(deployer).makeOrder(mETH.address,tokens('10'),token.address,tokens('1001'))).to.be.reverted
      })
    })

  });

  
  describe('取消订单',()=>{
    beforeEach(async()=>{
      //授权1000tokens
      transcation = await token.connect(deployer).approve(exchange.address, tokens('1000'))
      result = await transcation.wait()

        //存入1000tokens
      transcation = await exchange.connect(deployer).depositToken(token.address,tokens('1000'))
      result = await transcation.wait()

      //下单，用10个token交换10个mEth
      transcation = await exchange.connect(deployer).makeOrder(mETH.address,tokens('10'),token.address,tokens('10'))
      result = await transcation.wait()
    })


    describe('成功',()=>{
      beforeEach(async()=>{
        //取消订单id为1的订单
        transcation = await exchange.connect(deployer).cancelOrder(1)
        result = await transcation.wait()
      })
      it('取消订单后，检查映射',async()=>{
        expect(await exchange.cancelOrders(1)).to.equal(true)
      })
      it('发射取消订单事件',async()=>{
        const event = result.events[0];
        expect(event.event).to.equal('CancelOrder');
        const args = event.args;
        expect(args.orderId).to.equal(1);
        expect(args.user).to.equal(deployer.address);
        expect(args.tokenGet).to.equal(mETH.address);
        expect(args.getValue).to.equal(tokens('10'));
        expect(args.tokenGive).to.equal(token.address);
        expect(args.giveValue).to.equal(tokens('10'));
        expect(args.timestamp).to.at.least(1);
      })
    })
    describe('失败',()=>{
      it('重复取消',async()=>{
        transcation = await exchange.connect(deployer).cancelOrder(1)
        result = await transcation.wait()
        expect(exchange.connect(deployer).cancelOrder(1)).to.be.reverted
      })
      it('取消不属于自己的订单',async()=>{
        expect(exchange.connect(feeAccount).cancelOrder(1)).to.be.reverted
      })
      it('取消无效订单',async()=>{
        expect(exchange.connect(feeAccount).cancelOrder(999)).to.be.reverted
      })
    })

  });

  describe('买下订单',()=>{
    beforeEach(async()=>{
      //授权1000tokens
      transcation = await token.connect(deployer).approve(exchange.address, tokens('1000'))
      result = await transcation.wait()

        //存入1000tokens
      transcation = await exchange.connect(deployer).depositToken(token.address,tokens('1000'))
      result = await transcation.wait()

      //下单，用10个token交换10个mEth
      transcation = await exchange.connect(deployer).makeOrder(mETH.address,tokens('10'),token.address,tokens('10'))
      result = await transcation.wait()

      //spender拥有15个mETH
      transcation = await mETH.connect(deployer).transfer(spender.address, tokens('15'))
      result = await transcation.wait()

      //授权15 mETH
      transcation = await mETH.connect(spender).approve(exchange.address, tokens('15'))
      result = await transcation.wait()

    })


    describe('成功',()=>{
      beforeEach(async()=>{
        //spender存入15 mETH
        transcation = await exchange.connect(spender).depositToken(mETH.address,tokens('15'))
        result = await transcation.wait()

        //spender买下订单id为1的订单
        transcation = await exchange.connect(spender).fillOrder(1)
        result = await transcation.wait()
      })
      it('买下订单后，检查映射',async()=>{
        //spender剩余的mETH 15 - 11
        expect(await exchange.balanceOf(mETH.address,spender.address)).to.equal(tokens('4'))
        expect(await exchange.balanceOf(token.address,spender.address)).to.equal(tokens('10'))

        expect(await exchange.balanceOf(mETH.address,deployer.address)).to.equal(tokens(10))
        expect(await exchange.balanceOf(token.address,deployer.address)).to.equal(tokens(1000 - 10))

        expect(await exchange.balanceOf(mETH.address,feeAccount.address)).to.equal(tokens(1))

      })
      it('发射成交订单事件',async()=>{
        const event = result.events[0];
        expect(event.event).to.equal('FillOrder');
        const args = event.args;
        expect(args.orderId).to.equal(1);
        expect(args.spender).to.equal(spender.address);
        expect(args.user).to.equal(deployer.address);
        expect(args.tokenGet).to.equal(mETH.address);
        expect(args.getValue).to.equal(tokens('10'));
        expect(args.tokenGive).to.equal(token.address);
        expect(args.giveValue).to.equal(tokens('10'));
        expect(args.timestamp).to.at.least(1);
      })
    })
    describe('失败',()=>{
      it('买单的钱不够',async()=>{
        //spender存入8 mETH
        transcation = await exchange.connect(spender).depositToken(mETH.address,tokens('8'))
        result = await transcation.wait()
        expect(exchange.connect(spender).fillOrder(1)).to.be.reverted
      })
      it('不能购买已被取消的订单',async()=>{
        transcation = await exchange.connect(spender).depositToken(mETH.address,tokens('15'))
        result = await transcation.wait()

        transcation = await exchange.connect(deployer).cancelOrder(1)
        result = await transcation.wait()
        expect(exchange.connect(feeAccount).fillOrder(1)).to.be.reverted
      })
      it('不能购买已被购买的订单',async()=>{
        transcation = await exchange.connect(spender).depositToken(mETH.address,tokens('15'))
        result = await transcation.wait()

        transcation = await exchange.connect(spender).fillOrder(1)
        result = await transcation.wait()
        expect(exchange.connect(spender).fillOrder(1)).to.be.reverted
      })
      it('无效订单',async()=>{
        transcation = await exchange.connect(spender).depositToken(mETH.address,tokens('15'))
        result = await transcation.wait()
        expect(exchange.connect(spender).fillOrder(999)).to.be.reverted
      })
    })

  });

});
