import React, { useState, useEffect } from 'react';
import Navbar from './component/Navbar.js'
import { useDispatch, useSelector } from 'react-redux'
import config from './config.json'
import Alert from './component/Alert.js'
import interactions from './store/interactions.js'
const { getDispatch,loadBlockchain,loadAccount,loadQhyNFT,QhyNFT_searchAll,QhyNFT_setSell,QhyNFT_transfer } = interactions;


// NFT数据结构和模拟数据
const initialNFTs = [];
let myContrct,account;

const NFTMarketplace = () => {
  const [nfts, setNfts] = useState(initialNFTs);
  const [filter, setFilter] = useState('all'); // all, listed, unlisted, mine
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  account = useSelector(state=>state.blockchain.account)
  let dispatch = useDispatch();
  getDispatch(dispatch)

  const queryList = async()=>{
    let data = await QhyNFT_searchAll(myContrct)
    data = data.map(item=>{
      let obj = JSON.parse(item.tokenURI)
      return {
        id: item.tokenId.toString(),
        name: obj.name,
        image: obj.url,
        price: item.price.toString(),
        isListed: item.isSell,
        owner: item.owners,
        isOwnedByUser: item.owners?.toLowerCase() == account?.toLowerCase() || false
      }
    })
    setNfts(data)
    setEditingPrice(null);
  }

  const mounted = async()=>{
    const chainId = await loadBlockchain()
    let myConfig = config[chainId];
    console.log(chainId);
    try{
      myContrct = loadQhyNFT(myConfig.QhyNFT.address)
      console.log(myContrct);
      queryList()
        //监听事件
      myContrct.on('SetSell',async()=>{
        dispatch({ type: "QhyNFT_REQUEST", status:{pendding:false,success:true} });
        queryList()
      })
      myContrct.on('Transfer',async()=>{
        dispatch({ type: "QhyNFT_REQUEST", status:{pendding:false,success:true} });
        loadAccount()
        queryList()
      })
    }catch(e){
      console.log(e);
    }

    window.ethereum.on('accountsChanged',()=>{
      console.log('账号变更');
      loadAccount()
    })

    window.ethereum.on('chainChanged',()=>{
      window.location.reload()
    })
  }

  useEffect(()=>{
    mounted()
    
  },[])

  useEffect(()=>{
    let data = JSON.parse(JSON.stringify(nfts))
    data.forEach(item=>{
      console.log(item.owner,account,item.owner.toLowerCase() == account.toLowerCase());
      if(item.owner.toLowerCase() == account.toLowerCase()){
        item.isOwnedByUser = true;
      }else{
        item.isOwnedByUser = false;
      }
    })
    setNfts(data)
  },[account])

  // 过滤NFT显示
  const filteredNFTs = nfts.filter(nft => {
    switch (filter) {
      case 'listed':
        return nft.isListed;
      case 'unlisted':
        return !nft.isListed;
      case 'mine':
        return nft.isOwnedByUser;
      default:
        return true;
    }
  });

  // 购买NFT
  const handleBuy = (nft) => {
    console.log(nft.owner);
    QhyNFT_transfer(myContrct, nft.owner, account, nft.id, nft.price)
    // const updatedNFTs = nfts.map(nft => 
    //   nft.id === nftId ? { ...nft, isOwnedByUser: true, isListed: false } : nft
    // );
    // setNfts(updatedNFTs);
    // alert('购买成功！');
  };

  // 上架NFT
  const handleList = (nft) => {
    QhyNFT_setSell(myContrct,nft.id,true,nft.price)
    
  };

  // 下架NFT
  const handleUnlist = async(nft) => {
    await QhyNFT_setSell(myContrct,nft.id,false,nft.price)
    // const updatedNFTs = nfts.map(item => 
    //   item.id === nft.id ? { ...item, isListed: false } : item
    // );
    // setNfts(updatedNFTs);
  };

  // 开始编辑价格
  const startEditPrice = (nftId, currentPrice) => {
    setEditingPrice(nftId);
    setNewPrice(currentPrice);
  };

  // 保存价格
  const savePrice = async(nft) => {
    if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) <= 0) {
      alert('请输入有效的价格');
      return;
    }
    await QhyNFT_setSell(myContrct,nft.id,nft.isListed,newPrice)
    
    // const updatedNFTs = nfts.map(nft => 
    //   nft.id === nftId ? { ...nft, price: newPrice } : nft
    // );
    // setNfts(updatedNFTs);
    // setEditingPrice(null);
    // setNewPrice('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingPrice(null);
    setNewPrice('');
  };

  return (
    <div style={styles.container}>
      <Navbar title='QhyNFT交易所' />
      <header style={styles.header}>
        <div style={styles.filterContainer}>
          <button 
            style={{...styles.filterButton, ...(filter === 'all' ? styles.activeFilter : {})}}
            onClick={() => setFilter('all')}
          >
            所有NFT
          </button>
          <button 
            style={{...styles.filterButton, ...(filter === 'listed' ? styles.activeFilter : {})}}
            onClick={() => setFilter('listed')}
          >
            已上架
          </button>
          <button 
            style={{...styles.filterButton, ...(filter === 'unlisted' ? styles.activeFilter : {})}}
            onClick={() => setFilter('unlisted')}
          >
            未上架
          </button>
          <button 
            style={{...styles.filterButton, ...(filter === 'mine' ? styles.activeFilter : {})}}
            onClick={() => setFilter('mine')}
          >
            我的NFT
          </button>
        </div>
      </header>

      <div style={styles.nftGrid}>
        {filteredNFTs.map(nft => (
          <div key={nft.id} style={styles.nftCard}>
            <img src={nft.image} alt={nft.name} style={styles.nftImage} />
            <div style={styles.nftInfo}>
              <h3 style={styles.nftName}>{nft.name}</h3>
              
              {editingPrice === nft.id ? (
                <div style={styles.priceEditContainer}>
                  <input
                    type="text"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    style={styles.priceInput}
                    placeholder="输入价格"
                  />
                  <button 
                    onClick={() => savePrice(nft)}
                    style={styles.saveButton}
                  >
                    保存
                  </button>
                  <button 
                    onClick={cancelEdit}
                    style={styles.cancelButton}
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div style={styles.priceContainer}>
                  <span style={styles.price}>{nft.price} ETH</span>
                  {nft.isOwnedByUser && (
                    <button 
                      onClick={() => startEditPrice(nft.id, nft.price)}
                      style={styles.editButton}
                    >
                      编辑
                    </button>
                  )}
                </div>
              )}

              <div style={styles.ownerInfo}>
                所有者: {nft.owner && nft.owner.slice(0,6) + '...' + nft.owner.slice(36,42)}
                {nft.isOwnedByUser &&
                 <span style={styles.ownedBadge}>我的</span>}
              </div>

              <div style={styles.buttonContainer}>
                {!nft.isOwnedByUser  && (
                  nft.isListed?(
                    <button 
                      onClick={() => handleBuy(nft)}
                      style={styles.buyButton}
                    >
                      购买
                    </button>
                  ):(
                      <button 
                        style={{...styles.unlistButton, backgroundColor: '#a1a1a1ff',cursor:'normal'}}
                        disabled
                      >
                        已下架
                      </button>
                  )
                )}
                
                {nft.isOwnedByUser && (
                  <>
                    {nft.isListed ? (
                      <button 
                        onClick={() => handleUnlist(nft)}
                        style={styles.unlistButton}
                      >
                        下架
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleList(nft)}
                        style={styles.listButton}
                      >
                        上架
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNFTs.length === 0 && (
        <div style={styles.emptyState}>
          <p>暂无NFT数据</p>
        </div>
      )}
      <Alert name='Qhy_NFT' />
    </div>
  );
};

// 样式定义
const styles = {
  container: {
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    background:'#0D121D',
    minHeight:1000
  },
  header: {
    marginBottom: '5px',
    textAlign: 'center'
  },
  title: {
    color: '#333',
    fontSize: '2.5rem',
    marginBottom: '20px'
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '5px'
  },
  filterButton: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    backgroundColor: '#f5f5f5',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  activeFilter: {
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff'
  },
  nftGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    padding:45
  },
  nftCard: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    backgroundColor: 'white'
  },
  nftImage: {
    width: '100%',
    height: '250px',
    objectFit: 'cover'
  },
  nftInfo: {
    padding: '15px'
  },
  nftName: {
    margin: '0 0 10px 0',
    fontSize: '1.2rem',
    color: '#333'
  },
  priceContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    height:29
  },
  price: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#007bff'
  },
  priceEditContainer: {
    display: 'flex',
    gap: '5px',
    marginBottom: '10px'
  },
  priceInput: {
    flex: 1,
    padding: '5px',
    border: '1px solid #ddd',
    borderRadius: '3px'
  },
  ownerInfo: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height:23
  },
  ownedBadge: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.8rem'
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px'
  },
  buyButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  listButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  unlistButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  editButton: {
    padding: '5px 10px',
    backgroundColor: '#ffc107',
    color: '#212529',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '0.8rem'
  },
  saveButton: {
    padding: '5px 10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  cancelButton: {
    padding: '5px 10px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center',
    padding: '50px',
    color: '#666',
    fontSize: '1.2rem'
  }
};

export default NFTMarketplace;