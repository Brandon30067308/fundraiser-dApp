// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Fundraiser.sol";

contract FundraiserFactory {
    uint256 constant maxLimit = 20;
    Fundraiser[] private _fundraisers;

    event FundraiserCreated(Fundraiser indexed fundraiser, address indexed owner);

    function createFundraiser(
        string memory name,
        string memory url,
        string memory imageURL,
        string memory bio,
        address payable beneficiary
    ) public {
        Fundraiser fundraiser = new Fundraiser(name, url, imageURL, bio, beneficiary, msg.sender);
        _fundraisers.push(fundraiser);
        emit FundraiserCreated(fundraiser, msg.sender);
    }

    function fundraisersCount() public view returns(uint256) {
        return _fundraisers.length;
    }

    function fundraisers(uint256 limit, uint256 offset) public view returns(Fundraiser[] memory coll) {
        // prevents out of bounds error
        require(offset <= fundraisersCount(), "offset out of bounds");

        uint256 size = fundraisersCount() < limit ? fundraisersCount() : limit;
        coll = new Fundraiser[](size);
        // size should not exceed the maxLimit
        size = size < maxLimit ? size : maxLimit;

        for(uint256 i = 0; i < size; i++) {
            coll[i] = _fundraisers[offset + i];
        }

        return coll;
    }
}