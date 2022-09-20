// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract OpenTip {
    address private owner;

    struct Wallet {
        string name;
        Tip[] tips;
        bool approved;
    }

    struct Tip {
        string message;
        uint256 amount;
        address sender;
        uint256 timeStamp;
    }

    mapping(string => address) private nameToAddressMapping;
    mapping(address => Wallet) private wallets;

    constructor() {
        owner = msg.sender;
    }

    /// @dev allow users to check if a name is taken
    /// @notice return true if "_name" is taken, false otherwise
    function isTaken(string calldata _name) public view returns (bool) {
        require(bytes(_name).length > 0, "Empty name");
        return nameToAddressMapping[_name] != address(0);
    }

    /// @dev allows staff members to create a wallet
    function createNewWallet(string calldata _name, address _walletAddress)
        public
    {
        require(
            _walletAddress != address(0),
            "Error: Address zero is not a valid address"
        );
        bool taken = isTaken(_name);
        require(taken == false, "Name already taken");

        Wallet storage newWallet = wallets[_walletAddress];
        require(
            bytes(newWallet.name).length == 0,
            "Address already has a registered wallet"
        );
        newWallet.name = _name;
        nameToAddressMapping[_name] = _walletAddress;
    }

    /**
     * @dev allow the contract's owner to verify and approve a wallet
     */
    function approveWallet(address _walletAddress) public {
        require(
            bytes(wallets[_walletAddress].name).length > 0,
            "User hasn't created a wallet"
        );
        require(owner == msg.sender, "Unauthorized caller");
        wallets[_walletAddress].approved = true;
    }

    /// @dev allow users to tip a staff
    function tip(string calldata _message, string calldata _name)
        public
        payable
    {
        require(isTaken(_name), "Name or Address not registered yet!");
        address staffAddress = checkAddressWithName(_name);
        require(
            wallets[staffAddress].approved,
            "This wallet hasn't been approved"
        );
        uint256 _amount = msg.value;

        wallets[staffAddress].tips.push(
            Tip(_message, _amount, msg.sender, block.timestamp)
        );
        // transfer tip amount to staff
        (bool sent, ) = payable(staffAddress).call{value: msg.value}("");
        require(sent);
    }

    /// @dev allow users to check if user is a staff member
    function isStaff(string calldata _name) public view returns (bool) {
        address staffAddress = checkAddressWithName(_name);
        return (wallets[staffAddress].approved);
    }

    ///  @return address of an associated name
    function checkAddressWithName(string calldata _name)
        public
        view
        returns (address)
    {
        return nameToAddressMapping[_name];
    }

    /// @dev get wallet details
    function getWallet(address _address) public view returns (Wallet memory) {
        return wallets[_address];
    }
}
