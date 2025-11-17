const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("测试NFT", async () => {
  let myContract, deployer, user, user2, transaction, result;
  let url = 'https://img0.baidu.com/it/u=2025401329,69940443&fm=253&fmt=auto&app=138&f=JPEG?w=712&h=1803'

  beforeEach(async () => {
    let _myContract = await ethers.getContractFactory("QhyNFT");
    myContract = await _myContract.deploy('QhyNFT','QhyNFT');

    [deployer, user, user2] = await ethers.getSigners();

  });

  it("基本信息", async () => {
    expect(await myContract.name()).to.equal('QhyNFT');
    expect(await myContract.symbol()).to.equal('QhyNFT');
    expect(await myContract.deployer()).to.equal(deployer.address);
    expect(await myContract.maxSupply()).to.equal(10000);
  });

  describe('铸造',()=>{
    describe('成功',()=>{
      beforeEach(async()=>{
        transaction = await myContract.connect(deployer).mint(deployer.address,url)
        result = await transaction.wait();
      })
      
      it('检查映射',async()=>{
        expect(await myContract.balanceOf(deployer.address)).to.equal(1);
        expect(await myContract.ownerOf(1)).to.equal(deployer.address);
        let sellList = await myContract.sellList(1);
        expect(sellList).to.have.property('tokenURI', url);
        expect(sellList.tokenId.toString()).to.equal('1');
      })
      it('部署者收到ether',async()=>{
        let beforeEther = await ethers.provider.getBalance(deployer.address);
        transaction = await myContract.connect(user).mint(
          user.address,
          url,
          {value: ethers.utils.parseEther('0.001') },
        )
        result = await transaction.wait();
        let afterEther = await ethers.provider.getBalance(deployer.address)

        let etherNum1 = Number(ethers.utils.formatEther(beforeEther))
        let etherNum2 = Number(ethers.utils.formatEther(afterEther))
        expect(etherNum1).to.be.gte(etherNum2-0.001)

      })
      it('发射事件',async()=>{
        let event = result.events[0];
        expect(event.event).to.equal("Minted");
        expect(event.args.to).to.equal(deployer.address);
        expect(event.args.tokenId).to.equal(1);
        expect(event.args.tokenURI).to.equal(url);
      })

    })
    describe('失败',()=>{
      it('没有发送ether',async()=>{
        expect(myContract.connect(user).mint(
          user.address,
          url
        )).to.revertedWith("Mint: insufficient ether");
      })
    })
  })
  describe('上下架、修改价格',()=>{
    describe('成功',()=>{
      beforeEach(async()=>{
        transaction = await myContract.connect(deployer).mint(
          deployer.address,
          'https://img0.baidu.com/it/u=2025401329,69940443&fm=253&fmt=auto&app=138&f=JPEG?w=712&h=1803'
        )
        result = await transaction.wait();
      })

      it('上架、修改价格',async()=>{
        //上架
        await myContract.connect(deployer).setSell(1,true, ethers.utils.parseEther('0.0001'))
        let sellList = await myContract.sellList(1);
        expect(sellList.price).to.equal(ethers.utils.parseEther('0.0001'));
        expect(sellList.isSell).to.equal(true);

      })
      it('下架、修改价格',async()=>{
        //下架
        await myContract.connect(deployer).setSell(1,false, 0)
        sellList = await myContract.sellList(1);
        expect(sellList.price.toString()).to.equal('0');
        expect(sellList.isSell).to.equal(false);
      })

    })

  })

  describe('转移',()=>{
    beforeEach(async()=>{
      transaction = await myContract.connect(deployer).mint(deployer.address,url)
      result = await transaction.wait();
    })

    describe('成功',()=>{
      beforeEach(async()=>{
        transaction = await myContract.connect(deployer).transferFrom(deployer.address, user.address,1)
        result = await transaction.wait();
      })
      
      it('检查映射',async()=>{
        expect(await myContract.balanceOf(deployer.address)).to.equal(0);
        expect(await myContract.balanceOf(user.address)).to.equal(1);
        expect(await myContract.ownerOf(1)).to.equal(user.address);
      })

      it('购买NFT',async()=>{
        transaction = await myContract.connect(deployer).mintAndSell(deployer.address,url,true,ethers.utils.parseEther('0.01'))
        result = await transaction.wait();
        transaction = await myContract.connect(user).transferFrom(deployer.address, user.address,2,{value:ethers.utils.parseEther('0.01')})
        result = await transaction.wait();
        expect( await myContract.ownerOf(2)).to.equal(user.address)
      })
     
      it('发射事件',async()=>{
        let event = result.events[0];
        expect(event.event).to.equal("Transfer");
        expect(event.args._from).to.equal(deployer.address);
        expect(event.args._to).to.equal(user.address);
        expect(event.args._tokenId).to.equal(1);
      })

    })
    describe('失败',()=>{
      it('没有权限',async()=>{
        expect(myContract.connect(user).transferFrom(deployer.address, user.address,1)).to.revertedWith('Not authorized to transfer')
      })
      it('不是所有者',async()=>{
        expect(myContract.connect(deployer).transferFrom(user.address, deployer.address,1)).to.revertedWith('From is not owner')
      })
    })
  })

  describe('授权',()=>{
    beforeEach(async()=>{
      transaction = await myContract.connect(deployer).mint(deployer.address,url)
      result = await transaction.wait();

      transaction = await myContract.connect(deployer).approve(user.address,1)
      result = await transaction.wait();
      
    })

    describe('成功',()=>{
      it('检查映射',async()=>{
        expect(await myContract.getApproved(1)).to.equal(user.address);
      })
      it('授权后可以转移',async()=>{
        transaction = await myContract.connect(user).transferFrom(deployer.address,user2.address,1)
        result = await transaction.wait();
        expect(await myContract.balanceOf(user2.address) ).to.equal(1);
      })
     
      it('发射事件',async()=>{
        let event = result.events[0];
        expect(event.event).to.equal("Approval");
        expect(event.args._owner).to.equal(deployer.address);
        expect(event.args._approved).to.equal(user.address);
        expect(event.args._tokenId).to.equal(1);
      })

    })
    describe('失败',()=>{
      it('tokenId不存在',async()=>{
        expect(myContract.connect(deployer).approve(user.address,99)).to.reverted
      })
      it('不是所有者',async()=>{
        expect(myContract.connect(user).transferFrom(user2.address, deployer.address,1)).to.reverted
      })
    })
  })

  describe('授权所有',()=>{
    beforeEach(async()=>{
      //铸造2个
      transaction = await myContract.connect(deployer).mint(deployer.address,url)
      result = await transaction.wait();
      transaction = await myContract.connect(deployer).mint(deployer.address,url)
      result = await transaction.wait();

      transaction = await myContract.connect(deployer).setApprovalForAll(user.address,true)
      result = await transaction.wait();
      
    })

    describe('成功',()=>{
      it('检查映射',async()=>{
        expect(await myContract.isApprovedForAll(deployer.address,user.address)).to.equal(true);
      })
      it('授权后可以转移',async()=>{
        transaction = await myContract.connect(user).transferFrom(deployer.address,user2.address,1)
        result = await transaction.wait();
        expect(await myContract.balanceOf(user2.address) ).to.equal(1);

        transaction = await myContract.connect(user).transferFrom(deployer.address,user2.address,2)
        result = await transaction.wait();
        expect(await myContract.balanceOf(user2.address) ).to.equal(2);
      })
     
      it('发射事件',async()=>{
        let event = result.events[0];
        expect(event.event).to.equal("ApprovalForAll");
        expect(event.args._owner).to.equal(deployer.address);
        expect(event.args._operator).to.equal(user.address);
        expect(event.args._approved).to.equal(true);
      })

    })
    describe('失败',()=>{
      it('授权者没有代币',async()=>{
        expect(myContract.connect(user2).setApprovalForAll(user.address,true)).to.reverted
      })
    })
  })

});