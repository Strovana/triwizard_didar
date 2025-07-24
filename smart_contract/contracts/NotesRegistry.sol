// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NotesRegistry {
    struct Note {
        string cid;
        string title;
        address uploader;
        uint timestamp;
    }

    Note[] public notes;

    event NoteUploaded(string cid, string title, address indexed uploader);

    function uploadNote(string memory _cid, string memory _title) public {
        notes.push(Note(_cid, _title, msg.sender, block.timestamp));
        emit NoteUploaded(_cid, _title, msg.sender);
    }

    function getNotesCount() public view returns (uint) {
        return notes.length;
    }

    function getNote(uint index) public view returns (string memory, string memory, address, uint) {
        Note memory note = notes[index];
        return (note.cid, note.title, note.uploader, note.timestamp);
    }
}
