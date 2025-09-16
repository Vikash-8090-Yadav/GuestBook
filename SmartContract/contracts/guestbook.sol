// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DigitalGuestbook {
    // Define a struct for each message
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
    }

    // Array to store all public messages
    Message[] public messages;

    // Event emitted when a new message is added
    event MessageAdded(address indexed sender, uint256 indexed id, string content, uint256 timestamp);

    // Function to add a new message
    function addMessage(string memory _content) public {
        uint256 id = messages.length;
        uint256 currentTime = block.timestamp;
        messages.push(Message({sender: msg.sender, content: _content, timestamp: currentTime}));
        emit MessageAdded(msg.sender, id, _content, currentTime);
    }

    // Function to get the total number of messages
    function getMessageCount() public view returns (uint256) {
        return messages.length;
    }

    // Function to get details of a specific message by index
    function getMessage(uint256 _index) public view returns (address sender, string memory content, uint256 timestamp) {
    require(_index < messages.length, "Message index out of bounds");
    Message memory message = messages[_index]; // Renamed the variable from `msg` to `message`
    return (message.sender, message.content, message.timestamp);
}
}