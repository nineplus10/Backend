# 9p10 server

> What's nine plus 10? <br>
> Twenty-one <br>
>
> ~ An excerpt from a once-well-known piece of internet culture

This repo holds the brain of the game! and... its supporting functionalities

## Feature Roadmap

- [ ] Core game
- [ ] Leaderboard
- [ ] Spectactor chat
- [ ] Match Playback (Replay)
- [ ] Custom room

## Tech Stack

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) 
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Zod](https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white)
![Valkey](https://img.shields.io/badge/Valkey-677EF6?style=for-the-badge)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

## Cloning

If you don't want wire up the dependencies (db, message brokers, etc.) yourself, you could use Docker to spin up the development setup I use. 

```
docker compose up
```

> For running the first time, please prepare a good Internet connection as some docker images needed to be downloaded

## Documentation

Check this [documentation](https://82kin4x1s8.apidog.io) for the reference on consuming the API. It isn't usable on the documentation platform since the server hasn't been hosted anywhere, but hey, at least it could provide clues on what to expect.

> Documentation on design choices and reasoning coming soon!

Devblogs are available!
- [0x01 — The Initiation](https://medium.com/@allenrasheed/9p10-establishing-the-foundation-daed994e6a9c)
- [0x02 — Finally, A Worthy Opponent](https://medium.com/@allenrasheed/9p10-finally-a-worthy-opponent-a64eb3053726)
