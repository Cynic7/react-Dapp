pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol";
contract QhyNFT {
    string public name;
    string public symbol;
    address public deployer;
    uint256 private tokenId = 0;
    uint256 public maxSupply = 10000;

    mapping(uint256 tokenId => address) private _owners;
    mapping(address owner => uint256) private _balances;

    mapping(uint256 tokenId => address) private _tokenApprovals;
    mapping(address owner => mapping(address operator => bool)) private _operatorApprovals;
    //出售列表
    mapping(uint256 tokenId => sellMessage) public sellList;
    struct sellMessage {
        uint256 tokenId;
        uint256 price;
        string tokenURI;
        bool isSell;
        address owners;
    }

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 indexed _tokenId
    );
    event Approval(
        address indexed _owner,
        address indexed _approved,
        uint256 indexed _tokenId
    );
    event ApprovalForAll(
        address indexed _owner,
        address indexed _operator,
        bool _approved
    );
    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI, bool isSell, uint256 price);
    event SetSell(uint256 tokenId, bool isSell, uint256 price, string tokenURI);

    constructor(
        string memory name_,
        string memory symbol_
    ) {
        name = name_;
        symbol = symbol_;
        deployer = msg.sender;
    }

    function balanceOf(address _owner) external view returns (uint256) {
        require(_owner != address(0));
        return _balances[_owner];
    }

    function ownerOf(uint256 _tokenId) external view returns (address) {
        return _owners[_tokenId];
    }

    function approve(address _approved, uint256 _tokenId) public payable {
        require(_approved != address(0), "Approve to zero address");
        require(_owners[_tokenId] != address(0), "Token does not exist");
        require(msg.sender == _owners[_tokenId], "Not owner");

        _tokenApprovals[_tokenId] = _approved;

        emit Approval(msg.sender, _approved, _tokenId);
    }

    //授权或取消授权operator管理所有者所有代币
    function setApprovalForAll(address _operator, bool _approved) external {
        require(_operator != msg.sender, "Approve to caller");
        require(_operator != address(0), "Approve to zero address");
        require(_balances[msg.sender] > 0, "Owner has no tokens");

        _operatorApprovals[msg.sender][_operator] = _approved;

        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public payable {
        require(_to != address(0), "Transfer to zero address");
        address owner = _owners[_tokenId];
        require(owner == _from && owner != address(0), "From is not owner");
        sellMessage storage _sellMes = sellList[_tokenId];

        //如果是上架状态，且金额大于价格，则被买下，不需要验证权限
        if(_sellMes.isSell && msg.value >= _sellMes.price){
            payable(_from).transfer(msg.value);
        }else{
            // 权限检查
            require(
                _checkAuthorized(owner, msg.sender, _tokenId),
                "Not authorized to transfer"
            );
        }
       
        // 1.减少主人的余额，清除tokenId的授权信息
        _balances[_from] -= 1;
        delete _tokenApprovals[_tokenId];

        // 2.增加接收者的余额，变更tokenId的主人
        _balances[_to] += 1;
        _owners[_tokenId] = _to;
        _sellMes.owners = _to;

        emit Transfer(_from, _to, _tokenId);
    }

    function _checkAuthorized(
        address _owner,
        address _spender,
        uint256 _tokenId
    ) internal view returns (bool) {
        return
            _owner == _spender ||
            _tokenApprovals[_tokenId] == _spender ||
            _operatorApprovals[_owner][_spender];
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 _tokenId
    ) public {
        safeTransferFrom(from, to, _tokenId, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 _tokenId,
        bytes memory data
    ) public virtual {
        transferFrom(from, to, _tokenId);
        //验证合约是否能接收 ERC721 token
        ERC721Utils.checkOnERC721Received(msg.sender, from, to, _tokenId, data);
    }

    function getApproved(uint256 _tokenId) external view returns (address) {
        return _tokenApprovals[_tokenId];
    }

    function isApprovedForAll(
        address _owner,
        address _operator
    ) external view returns (bool) {
        require(_owner != address(0), "Owner is zero address");
        require(_operator != address(0), "Operator is zero address");
        return _operatorApprovals[_owner][_operator];
    }

    function mint(address to, string memory tokenURI) public payable {
        mintAndSell(to, tokenURI, false, 0);
    }
    //铸造
    function mintAndSell(address to, string memory tokenURI, bool _isSell, uint256 _price) public payable {
        require(to != address(0), "Mint to zero address");
        //如果不是部署者，要花费一些ether
        if (msg.sender != deployer) {
            require(msg.value > 0.0001 ether, "Mint: insufficient ether");
        }
        require(tokenId < maxSupply, "Mint: max supply reached");

        tokenId++;
        _owners[tokenId] = to;
        _balances[to] += 1;

        sellList[tokenId] = sellMessage(tokenId, _price, tokenURI, _isSell, to);

        if (msg.sender != deployer) {
            payable(deployer).transfer(msg.value);
        }

        emit Minted(to, tokenId, tokenURI, _isSell, _price);
    }

    //上下架、修改价格
    function setSell(uint256 _tokenId, bool _isSell, uint256 _price) external {
        if (_isSell) {
            require(_price > 0, "price error");
        }

        // 权限检查
        require(
            _checkAuthorized(_owners[_tokenId], msg.sender, _tokenId),
            "Not authorized"
        );
       
        sellMessage storage _mes = sellList[_tokenId];
        require(_mes.tokenId > 0, "setSell error");
        _mes.price = _price;
        _mes.isSell = _isSell;

        if(_isSell){
            //如果上架，则授权给合约
            approve(address(this), _tokenId);
        }else{
            //如果下架，则授权收回
            delete _tokenApprovals[_tokenId];
        }


        emit SetSell(_tokenId, _isSell, _price, _mes.tokenURI);
    }
}
