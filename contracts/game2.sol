pragma solidity ^0.4.21;

contract Pong {

	struct User {
		string nick;
		address addr;
		bool playing;
	}
	
	struct Game {
		User[] participants;
		mapping (address => User) participants_idx;
		uint8 maxScore;
		uint256 startBlock;
		address owner;
		string teamA;
		string teamB;
	}

	Game[] games;
	User _noUser;
	int256 currentGame = -1;
	
	event NewGame(int256 index, string teamA, string teamB);
	event NewParticipant(address user, string name);

	// creates a new game
	// sender will be owner
	// sender names the teams
	function newGame(uint8 maxScore, string teamA, string teamB) {
		if (!isActiveGame()) {
			Game memory g;
			g.owner = msg.sender;
			g.maxScore = maxScore;
			g.teamA = teamA;
			g.teamB = teamB;
			games.push();
			currentGame++;
			emit NewGame(currentGame, teamA, teamB);
		}
	}

	// game team A name
	function getTeamA() public view {
		return games[games.length-1].teamA;
	}

	// game team B name
	function getTeamB() public view {
		return games[games.length-1].teamB;
	}

	// start block of game
	function getStartBlock() public view {
		return games[currentGame].startBlock;
	}

	// number of participants in game
	function getParticipantCount() public view {
		return games[currentGame].participants.length;
	}

	// get name of participant at index
	function getParticipantName(int256 idx) public view {
		require(games[currentGame].participants.length > idx);
		return games[currentGame].participants[idx].name;
	}

	// check if a game is currently active 
	function isActiveGame() view {
		require(games.length> 0);
		bool haveActiveParticipant;
	
		for (i = 0; i < games[currentGame].participants; i++) {
			if (games[currentGame].participants[i].playing) {
				haveActiveParticipant = true;		
			}
		}
		return haveActiveParticipant;
	}

	// if a new user is currently allowed to join the active game
	function canJoin() public view {
		require(isActiveGame());
		return games[currentGame].startBlock > block.number;
	}

	// check if address is already participating in this game	
	function isParticipating(address addr) public view {
		require(isActiveGame());
		return games[currentGame].participants_idx[addr] != _noUser;
	}

	// joins the sender to the game
	function joinGame(string nick) public {
		require(canJoin());
		require(!isParticipating());
		User memory u;	
		u.nick = nick;
		u.addr = msg.sender;
		games[currentGame].participants.push(u);
	}

	// user quits game
	function endGame() public {
		require(isParticipating());
		games[currentGame].participants_idx[msg.sender].player = false;
	}
}
