// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract JustArtMarket is
    Ownable,
    ReentrancyGuard,
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // EVENTS
    event ItemCreated(
        address indexed owner,
        string itemStringId,
        uint256 price
    );

    event ItemRemoved(address indexed owner, string itemStringId);

    event ItemRelisted(
        address indexed owner,
        string itemStringId,
        uint256 price
    );

    event ItemSold(address indexed buyer, string itemStringId, uint256 price);

    event NewMarketFee(address owner, uint256 newPercentage);

    // STRUCTS
    enum Type {
        UNAVAILABLE,
        ADD,
        REMOVE,
        BUY
    }

    struct Transaction {
        uint256 id;
        Type tranType;
        address from;
        uint256 price;
        uint256 createdAt;
    }

    struct Item {
        string id;
        uint256 price;
        string location;
        address owner;
        bool isItemListed;
        Transaction[] history;
    }

    // VARIABLES
    uint256 private marketFeePercentage;
    mapping(uint256 => Item) private Items;

    mapping(string => bool) private stringIdExists;

    // keeps track of ids that exist
    mapping(uint256 => bool) private exists;

    mapping(address => uint[]) public userItems;

    // METHODS
    constructor() ERC721("justArt Token", "jART Token") {
        // so the marketFee percentage will be deducted from the selling price of the item
        // currently set to 5%
        // marketToken is currently set to celo
        marketFeePercentage = 5;
    }

    /// @dev checks if item with id _itemTokenId exist
    modifier exist(uint256 _itemTokenId) {
        require(exists[_itemTokenId], "Query of nonexistent token");
        _;
    }

    /// @dev checks if caller is owner of item with id _itemTokenId exist
    modifier checkIfItemOwner(uint256 _itemTokenId) {
        require(Items[_itemTokenId].owner == msg.sender, "Only item owner");
        _;
    }

    /// @dev checks if item with id _itemTokenId is listed
    modifier checkIfListed(uint256 _itemTokenId) {
        require(Items[_itemTokenId].isItemListed, "Item isn't listed");
        _;
    }

    /// @dev checks if price is valid
    modifier checkPrice(uint _price) {
        require(_price >= 1 ether, "Price of item must be at least one CELO");
        _;
    }

    /// @dev allow users to add an item to the marketplace
    function addNewItem(
        string calldata _itemStringId,
        string calldata _uri,
        string calldata _location,
        uint256 _price
    ) external checkPrice(_price) {
        require(bytes(_itemStringId).length > 0, "Empty item's string id");
        require(bytes(_uri).length > 0, "Empty uri");
        require(
            !stringIdExists[_itemStringId],
            "Item with this string id already exists"
        );
        uint256 itemTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        stringIdExists[_itemStringId] = true;

        // create item data
        Item storage _Item = Items[itemTokenId];
        _Item.id = _itemStringId;
        _Item.owner = msg.sender;
        _Item.location = _location;
        _Item.price = _price;
        _Item.isItemListed = true;

        // transfer from msg.sender to market
        _transfer(msg.sender, address(this), itemTokenId);

        //mint to caller
        _safeMint(msg.sender, itemTokenId);

        // set token uri
        _setTokenURI(itemTokenId, _uri);

        //add new transaction history
        newHistory(itemTokenId, Type.ADD);

        // sets item exist to true
        exists[itemTokenId] = true;

        //add to user items
        userItems[msg.sender].push(itemTokenId);

        emit ItemCreated(msg.sender, _Item.id, _price);
    }

    /// @dev allow users to buy a listed item
    function buyItems(uint256 _itemTokenId)
        external
        payable
        exist(_itemTokenId)
        checkIfListed(_itemTokenId)
        nonReentrant
    {
        Item storage _Item = Items[_itemTokenId];

        // check if amount attached is equal to item price
        require(_Item.price == msg.value, "AMOUNT_NOT_EQUAL");
        require(_Item.owner != msg.sender, "You can't buy your own item");
        // calculate due market fee for item
        uint256 fee = getItemFee(_itemTokenId);
        uint256 remaining = _Item.price - fee;

        // add item to buyer
        userItems[msg.sender].push(_itemTokenId);

        //unlist Item from market
        _Item.isItemListed = false;

        address previousOwner = _Item.owner;

        //set buyer as item owner
        _Item.owner = msg.sender;

        //add new transaction history
        newHistory(_itemTokenId, Type.BUY);

        // transfer item to buyer
        _transfer(address(this), msg.sender, _itemTokenId);
        // transfer fees
        (bool success, ) = payable(owner()).call{value: fee}("");
        require(success, "Transfer of fee failed");
        (bool sent, ) = payable(previousOwner).call{value: remaining}("");
        require(sent, "Transfer failed");

        emit ItemSold(msg.sender, _Item.id, _Item.price);
    }

    /// @dev allow users to relist an item
    function relistItem(
        uint256 _itemTokenId,
        string calldata _newLocation,
        uint256 _price
    )
        public
        exist(_itemTokenId)
        checkIfItemOwner(_itemTokenId)
        checkPrice(_price)
    {
        // get item from storage
        Item storage _Item = Items[_itemTokenId];

        require(!Items[_itemTokenId].isItemListed, "Item already listed");

        // transfer item from owner to market
        _transfer(msg.sender, address(this), _itemTokenId);

        //update location, price and listed parameter
        _Item.location = _newLocation;
        _Item.price = _price;
        _Item.isItemListed = true;

        //add new transaction history
        newHistory(_itemTokenId, Type.ADD);

        emit ItemRelisted(msg.sender, _Item.id, _Item.price);
    }

    /// @dev allow users to unlist an item
    function unlistItem(uint256 _itemTokenId)
        public
        exist(_itemTokenId)
        checkIfItemOwner(_itemTokenId)
        checkIfListed(_itemTokenId)
    {
        // get item from storage
        Item storage _Item = Items[_itemTokenId];

        // transfer item from market to owner
        _transfer(address(this), msg.sender, _itemTokenId);

        //update location, price and listed parameter
        _Item.isItemListed = false;
        _Item.price = 0;

        //add new transaction history
        newHistory(_itemTokenId, Type.REMOVE);
        emit ItemRemoved(msg.sender, _Item.id);
    }

    /// @dev allows the contract's owner to change the market fee
    /// @notice fee percentage can't be higher than 10%
    function updateMarketFeePercentage(uint256 newPercentage) public onlyOwner {
        require(newPercentage <= 10, "Fee can't be higher than 10%");
        marketFeePercentage = newPercentage;
        emit NewMarketFee(msg.sender, newPercentage);
    }

    /// @dev returns the due market fee for item
    function getItemFee(uint256 _itemTokenId)
        private
        view
        exist(_itemTokenId)
        returns (uint256)
    {
        require(Items[_itemTokenId].isItemListed, "Item isn't listed");
        // to avoid overflow/underflow issues, price is divided by 100 to get the feeAmount per each percent
        uint256 feePerPecent = Items[_itemTokenId].price / 100;
        return feePerPecent * marketFeePercentage;
    }

    /// @dev push a transaction log onto the history array of an item
    function newHistory(uint256 _itemTokenId, Type _tranType) private {
        Item storage _Item = Items[_itemTokenId];

        _Item.history.push(
            Transaction({
                id: _Item.history.length,
                tranType: _tranType,
                from: msg.sender,
                price: _Item.price,
                createdAt: block.timestamp
            })
        );
    }

    // View Methods

    //returns item from itemTokenId
    function getItemFromID(uint256 _itemTokenId)
        public
        view
        returns (Item memory)
    {
        return Items[_itemTokenId];
    }

    /// @dev return item count
    function getItemCounts() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /// @dev return useritems array
    function getUserItems(address _user) public view returns (Item[] memory) {
        require(_user != address(0), "Invalid address");
        Item[] memory itemsArray = new Item[](balanceOf(_user));
        uint256 index = 0;
        for (uint256 i = 0; i < userItems[_user].length; i++) {
            uint256 currentId = userItems[_user][i];
            if (ownerOf(currentId) == msg.sender) {
                itemsArray[index] = Items[currentId];
                index++;
            }
        }
        return itemsArray;
    }

    // returns marketfee percentage
    function getMarketFee() public view returns (uint256) {
        return marketFeePercentage;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    //    destroy an NFT
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    //    return IPFS url of NFT metadata
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC721-transferFrom}.
     * Changes is made to transferFrom to make necessary changes to userItems
     */
    function transferFrom(
        address from,
        address to,
        uint256 _tokenId
    ) public override {
        userItems[to].push(_tokenId);
        super.transferFrom(from, to, _tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     * Changes is made to transferFrom to make necessary changes to userItems
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 _tokenId,
        bytes memory data
    ) public override {
        userItems[to].push(_tokenId);
        _safeTransfer(from, to, _tokenId, data);
    }
}
