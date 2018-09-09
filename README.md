# CrowdPongETH

This project is inspired by Loren Carpenter's collaborative pong experiment.

http://www.interactivearchitecture.org/collaborative-control-experiments.html

It seeks to demonstrate a use of the Mutable Resource Update feature of development Swarm, which allows for updating of swarm data under a predictable pointer name, without resorting to ENS.

In short: New games and the participants are recorded on a contract, and two teams are formed. When the game loop starts (after a grace period after contract creation), every participant has one "vote" per second on whether the paddle should go up, down or remain in place. The votes are submitted in individual Mutable Resource Update streams, which are then retrieved by the client and rendered directly. 

The player area has identical pixel sizes and paddle/ball velocities. Thus, given that all updates can be retrieved without network issues, the game should be able to run identically on every client. The Mutable Resources are stored as normal data on swarm, chunked up and distributed. In other words, totally decentralized.

* Up: Q
* Down: A

### Team

* Jiří Chadima @JirkaChadima
* Deniel Horvatic @FollowJack
* Louis Holbrook @nolash
* Augusto Lemble @AugustoL
* Mike Calvanese @mikec

### Stash

* Contract: 0x957a63a9c458c5c40b84e558a7d0b279871be622
* Application: http://37.157.197.161:8500/bzz:/crowdpongeth.test
* Code: https://github.com/nolash/crowdpongeth

### Swarm:

http://swarm-gateways.net/bzz:/theswarm.eth

### MRU

https://github.com/ethersphere/go-ethereum/pull/881
