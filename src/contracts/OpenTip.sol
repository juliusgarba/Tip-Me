// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract OpenTip {
    struct Wallet {
        string name;
        address walletAddress;
    }

    struct Tip {
        string message;
        uint256 amount;
        address sender;
        address receiver;
        uint256 timeStamp;
    }

    mapping(string => address) nameToAddressMapping;
    mapping(uint256 => Tip) tips;
    mapping (address => Wallet) wallets;
    mapping(address => uint256[]) ownTips;
    string[] namesTaken;

    uint256 tipsTracker = 0;    

    // return true if "_name" is taken, false otherwise
    function isTaken(string calldata _name, string[] memory _namesTaken) private pure returns (bool) {
            
        for (uint256 i = 0; i < _namesTaken.length; i++) {
            if (keccak256(abi.encodePacked(_namesTaken[i])) == keccak256(abi.encodePacked(_name))) {                
                return true;
            }
        }
        return false;
    }

    // Staff create new wallet here
    function createNewWallet(string calldata _name, address _walletAddress)
        public
    {        
        bool taken = isTaken(_name, namesTaken);
        require(taken == false, "Name already taken");
        namesTaken.push(_name);
        wallets[_walletAddress] = Wallet(_name, _walletAddress);
        nameToAddressMapping[_name] = _walletAddress;
    }

    // User tip a staff
    function tip(
        string calldata _message,
        string calldata _name,
        address _to        
    ) public payable {
        require(
            nameToAddressMapping[_name] == _to,
            "Name or Address not registered yet!"
        );
        uint256 _amount = msg.value;
        // create a  new tip object
        tips[tipsTracker] = Tip(_message, _amount, msg.sender, _to, block.timestamp);
        // assign tips object to staff
        ownTips[_to].push(tipsTracker);
        tipsTracker += 1;
        // transfer tip amount to staff
        (bool sent, ) = payable(_to).call{value: _amount}("");
        require(sent);
    }

    // read a tip details from storage
    function readTip(uint256 tipId)
        public
        view
        returns (
            string memory message,
            uint256 amount,
            address sender,            
            uint256 timeStamp
        )
    {
        Tip memory _tip = tips[tipId];
        require(msg.sender == _tip.receiver, "Not allowed to view tip");
        message = _tip.message;
        amount = _tip.amount;
        sender = _tip.sender;        
        timeStamp = _tip.timeStamp;
    }

    // return an array of IDs of user's tips
    function readMyTips() public view returns (uint256[] memory) {
        return ownTips[msg.sender];
    }

    // return list of names taken
    function readNamesTaken() public view returns(string[] memory) {
        return namesTaken;
    }
    // check if user is a staff member
    function isStaff(string calldata _name) public view returns (bool) {
        return (nameToAddressMapping[_name] != address(0));
    }

    // return address of an associated name
    function checkAddressWithName(string calldata _name)
        public
        view
        returns (address)
    {
        return nameToAddressMapping[_name];
    }

    // get wallet details 
    function checkNameWithAddress(address _address) public view returns (string memory) {
        Wallet memory wallet = wallets[_address];        
        string memory name = wallet.name;
        return name;
    }
}
