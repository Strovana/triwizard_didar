// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Sociva {
    struct Siv {
        uint256 id;
        string sivText;
        bool isDeleted;
        address username;
        string cid; // IPFS CID
        uint256 timestamp;
    }

    mapping(uint256 => Siv) private sivs;
    uint256 private sivCounter;

    event SivCreated(uint256 indexed id, address indexed author, string cid);
    event SivDeleted(uint256 indexed id, address indexed author);

    // Add a new Siv
    function addSiv(string memory _sivText, string memory _cid) external {
        sivCounter++;

        sivs[sivCounter] = Siv({
            id: sivCounter,
            sivText: _sivText,
            isDeleted: false,
            username: msg.sender,
            cid: _cid,
            timestamp: block.timestamp
        });

        emit SivCreated(sivCounter, msg.sender, _cid);
    }

    // Get all non-deleted Sivs
    function getAllSivs() external view returns (Siv[] memory) {
        uint256 totalSivs = sivCounter;
        uint256 count = 0;

        // Count how many non-deleted Sivs exist
        for (uint256 i = 1; i <= totalSivs; i++) {
            if (!sivs[i].isDeleted) {
                count++;
            }
        }

        Siv[] memory result = new Siv[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= totalSivs; i++) {
            if (!sivs[i].isDeleted) {
                result[idx] = sivs[i];
                idx++;
            }
        }
        return result;
    }

    // Get Sivs owned by caller that are not deleted
    function getMySivs() external view returns (Siv[] memory) {
        uint256 totalSivs = sivCounter;
        uint256 count = 0;

        for (uint256 i = 1; i <= totalSivs; i++) {
            if (sivs[i].username == msg.sender && !sivs[i].isDeleted) {
                count++;
            }
        }

        Siv[] memory result = new Siv[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= totalSivs; i++) {
            if (sivs[i].username == msg.sender && !sivs[i].isDeleted) {
                result[idx] = sivs[i];
                idx++;
            }
        }
        return result;
    }

    // Soft delete a Siv (no undo)
    function deleteSiv(uint256 _id) external {
        require(_id > 0 && _id <= sivCounter, "Invalid Siv ID");
        Siv storage siv = sivs[_id];
        require(siv.username == msg.sender, "Only author can delete");
        require(!siv.isDeleted, "Already deleted");

        siv.isDeleted = true;
        emit SivDeleted(_id, msg.sender);
    }

    // Get Siv by ID (no deletion check - returns even deleted items)
    function getSivById(uint256 _id) external view returns (Siv memory) {
        require(_id > 0 && _id <= sivCounter, "Invalid Siv ID");
        return sivs[_id];
    }

    // Get total Sivs count (including deleted)
    function getTotalSivs() external view returns (uint256) {
        return sivCounter;
    }
}
