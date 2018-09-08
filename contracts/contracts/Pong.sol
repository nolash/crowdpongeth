pragma solidity ^0.4.23;

contract Pong {

	struct Game {
		address[] participants;
		mapping (address => string) participants_idx;
		uint8 maxScore;
		uint256 startTimestamp;
		address owner;
		string teamA;
		string teamB;
	}

	Game[] public games;
	uint256 latestGame = 0;

	event NewGame(uint256 index, string teamA, string teamB);
	event NewParticipant(uint256 gameIndex, address user, string name);

	// creates a new game
	// sender will be owner
	// sender names the teams
	function newGame(uint8 maxScore, string teamA, string teamB) public {
		Game memory g;
		g.owner = msg.sender;
		g.maxScore = maxScore;
		g.teamA = teamA;
		g.teamB = teamB;
		games.push(g);
		emit NewGame(latestGame, teamA, teamB);
		latestGame++;
	}

	// joins the sender to the game
	function joinGame(uint256 gameIndex, address addr, string name) public {
		require(canJoin(gameIndex));
		require(!isParticipating(gameIndex, addr));
		bytes memory memoryString = bytes(name);
		require(memoryString.length > 0);
		games[gameIndex].participants_idx[addr] = name;
		games[gameIndex].participants.push(addr);
		NewParticipant(gameIndex, addr, name);
	}

	// game team A name
	function getTeamA(uint256 gameIndex) public view returns (string) {
		return games[gameIndex].teamA;
	}

	// game team B name
	function getTeamB(uint256 gameIndex) public view returns (string) {
		return games[gameIndex].teamB;
	}

	// start block of game
	function getStartBlock(uint256 gameIndex) public view returns (uint256) {
		return games[gameIndex].startTimestamp;
	}

	// number of participants in game
	function getParticipantCount(uint256 gameIndex) public view returns (uint256) {
		return games[gameIndex].participants.length;
	}

	// get name of participant at index
	function getParticipantName(uint256 gameIndex, uint256 idx) public view returns (string) {
		require(games[gameIndex].participants.length > idx);
		return games[gameIndex].participants_idx[games[gameIndex].participants[idx]];
	}

	// if a new user is currently allowed to join the active game
	function canJoin(uint256 gameIndex) public view returns (bool) {
		return !isParticipating(gameIndex, msg.sender) && games[gameIndex].startTimestamp < now;
	}

	// check if address is already participating in this game
	function isParticipating(uint256 gameIndex, address addr) public view returns (bool) {
		bytes memory memoryString = bytes(games[gameIndex].participants_idx[addr]);
		return memoryString.length == 0;
	}

}
