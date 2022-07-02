// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ElectionPortal{
    address owner;
    Election[] public elections;
    mapping(string => uint) electionIDmap;
    uint public electionCount=0;
    Candidate[] public electionCandidates;

    function compare(string memory _a, string memory _b) internal pure returns (int) {
        bytes memory a = bytes(_a);
        bytes memory b = bytes(_b);
        uint minLength = a.length;
        if (b.length < minLength) minLength = b.length;
        for (uint i = 0; i < minLength; i ++)
            if (a[i] < b[i])
                return -1;
            else if (a[i] > b[i])
                return 1;
        if (a.length < b.length)
            return -1;
        else if (a.length > b.length)
            return 1;
        else
            return 0;
    }
    
    function toString(uint256 value) internal pure returns (string memory) {

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    struct Candidate{
        uint id;
        string name;
        string agendas;
        string punchline;
        string imageLink;
        uint votes;
    }

    struct Election{
        string id;
        mapping(uint => Candidate) candidates;
        string position;
        uint endtime;
        uint votes;
        uint totalCandidates;
    }

    struct ElectionInfo{
        string id;
        string position;
        uint endtime;
        uint votes;
        uint totalCandidates;
    }

    modifier checkOwner(){
        require(msg.sender==owner,"You are not owner");
        _;
    }

    function getElectionInfo() public checkOwner() view returns (ElectionInfo[] memory){
        ElectionInfo[] memory toRtn = new ElectionInfo[](elections.length);
        for(uint i=0;i<elections.length;i++){
            ElectionInfo memory toAdd = ElectionInfo(elections[i].id,elections[i].position,elections[i].endtime,elections[i].votes,elections[i].totalCandidates);
            toRtn[i]=toAdd;
        }
        return toRtn;
    }

    function addElection(string memory _id,uint _endtime,string memory _position) public checkOwner() payable{
        elections.push();
        elections[electionCount].id=_id;
        for(uint i=0;i<electionCandidates.length;i++){
            elections[electionCount].candidates[i+1] = electionCandidates[i];
        }
        //elections[electionCount].candidates=electionCandidates;
        elections[electionCount].position=_position;
        elections[electionCount].endtime=_endtime;
        elections[electionCount].totalCandidates=electionCandidates.length;
        ++electionCount;
        electionIDmap[_id]=electionCount;
        while(electionCandidates.length>0){
            electionCandidates.pop();
        }
    }

    function addCandidate(string memory _name, string memory _agendas, string memory _imageLink, string memory _punchline) checkOwner() public payable{
        uint candiatesNumber = electionCandidates.length;
        electionCandidates.push();
        electionCandidates[candiatesNumber].id=electionCandidates.length;
        electionCandidates[candiatesNumber].name=_name;
        electionCandidates[candiatesNumber].agendas=_agendas;
        electionCandidates[candiatesNumber].imageLink=_imageLink;
        electionCandidates[candiatesNumber].punchline=_punchline;
    }

    function deleteCandidatesList() public checkOwner() payable{
        while(electionCandidates.length>0){
            electionCandidates.pop();
        }
    }

    function deleteElections() public checkOwner() payable{
        while(elections.length>0){
            elections.pop();
        }
        electionCount=0;
    }

    function incrVote(string memory electionID, uint candidateID) public checkOwner() payable{
        elections[electionIDmap[electionID]-1].candidates[candidateID].votes++;
        elections[electionIDmap[electionID]-1].votes++;
    }

    function getElectionDetails(string memory electionID) public checkOwner() view returns(string[3] memory){
        uint idx = electionIDmap[electionID]-1;
        require(idx>=0, "Not valid");
        string[3] memory toRtn;
        toRtn[0] = elections[idx].position;
        toRtn[1] = toString(elections[idx].endtime);
        toRtn[2] = toString(elections[idx].totalCandidates);
        return toRtn;
    }

    function getElectionEndTime(string memory electionID) public checkOwner() view returns(uint){
        uint idx = electionIDmap[electionID]-1;
        require(idx>=0, "Not valid");
        return elections[idx].endtime;
    }

    function getCandidateDetails(uint candidateID, string memory electionID) public checkOwner() view returns(string[4] memory){
        uint idx = electionIDmap[electionID]-1;
        require(idx>=0, "Not valid");
        Candidate memory queriedCandidate = elections[idx].candidates[candidateID];
        string[4] memory candidateDetails;
        candidateDetails[0]=queriedCandidate.name;
        candidateDetails[1]=queriedCandidate.agendas;
        candidateDetails[2]=queriedCandidate.punchline;
        candidateDetails[3]=queriedCandidate.imageLink;
        return candidateDetails;
    }
    
    function getElectionCandidatesNames(string memory electionID) public checkOwner() view returns (string[] memory){
        uint idx = electionIDmap[electionID]-1;
        require(idx>=0, "Not valid");
        // emit checkIndex(elections[idx-1].totalCandidates);
        string[] memory candidateNames = new string[](elections[idx].totalCandidates);
        for(uint i=0;i<elections[idx].totalCandidates;i++){
            // emit checkIndex(elections[idx-1].totalCandidates);
            candidateNames[i]=elections[idx].candidates[i+1].name;
        }
        return candidateNames;
    }

    function getElectionCandidatesVotes(string memory electionID) public checkOwner() view returns (uint[] memory){
        uint idx = electionIDmap[electionID]-1;
        require(idx>=0, "Not valid");
        uint candidatesCount = elections[idx].totalCandidates;
        uint[] memory votesArray = new uint[](candidatesCount);
        for(uint i=0;i<candidatesCount;i++){
            votesArray[i]=elections[idx].candidates[i+1].votes;
        }
        return votesArray;
    }

    function getElectionWinner(string memory electionID) public checkOwner() view returns (string[] memory){
        uint idx = electionIDmap[electionID]-1;
        require(idx>=0, "Not valid");
        Candidate memory ansCandidate = elections[idx].candidates[1];
        for(uint i=1;i<elections[idx].totalCandidates;i++){
            if(ansCandidate.votes<elections[idx].candidates[i+1].votes){
                ansCandidate = elections[idx].candidates[i+1];
            }
        }
        string[] memory candidateRtn = new string[](5);
        candidateRtn[0] = ansCandidate.name;
        candidateRtn[1] = ansCandidate.agendas;
        candidateRtn[2] = ansCandidate.punchline;
        candidateRtn[3] = ansCandidate.imageLink;
        candidateRtn[4] = toString(ansCandidate.votes);
        return candidateRtn;
    }

    constructor(){
        owner=msg.sender;
    }
}
