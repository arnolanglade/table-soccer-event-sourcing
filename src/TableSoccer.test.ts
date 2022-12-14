import {aGame, Game, GameEnded, GameStarted, GoalScored, Score, Team, TeamColor} from "./TableSoccer";

describe('Game', () => {
    test('it starts a one versus one game', () => {
        expect(
            Game.startOneVersusOne('arn0', 'Popeye')
        ).toEqual(
            new aGame().withRedPlayer('arn0')
                .withBluePlayer('Popeye')
                .withScore(0, 0)
                .withGameStartedEvent()
                .build()
        );
    })

    test('it starts a two versus two game', () => {
        expect(
            Game.startTwoVersusTwo('arn0', 'momos', 'Popeye', 'coco')
        ).toEqual(
            new aGame().withRedTeam('arn0', 'momos')
                .withBlueTeam('Popeye', 'coco')
                .withScore(0, 0)
                .withGameStartedEvent()
                .build()
        );
    })

    test('it builds a game from events', () => {
        expect(
            Game.fromEvents([
                new GameStarted(
                    Team.ofTwoPlayer('arn0', 'momos'),
                    Team.ofTwoPlayer('Popeye', 'coco'),
                ),
                new GoalScored(
                    TeamColor.Red,
                    'arn0',
                    new Score(1, 0)
                ),
                new GameEnded(
                    Team.ofTwoPlayer('arn0', 'momos'),
                    Team.ofTwoPlayer('Popeye', 'coco'),
                    new Score(10, 0)
                )
            ])
        ).toEqual(
            new aGame().withRedTeam('arn0', 'momos')
                .withBlueTeam('Popeye', 'coco')
                .withScore(10, 0)
                .withGameStartedEvent()
                .withGoalScoredEvent('arn0', 1, 0)
                .withGameEndedEvent()
                .build()
        );
    })

    describe('goalScoredBy', () => {
        test('records a gaol scored by a registered player', () => {
            const game = new aGame()
                .withRedPlayer('arn0')
                .withBluePlayer('Popeye')
                .withScore(0, 0)
                .withGameStartedEvent()
                .build();

            expect(game.goalScoredBy('arn0')).toEqual(
                new aGame()
                    .withRedPlayer('arn0')
                    .withBluePlayer('Popeye')
                    .withScore(1, 0)
                    .withGameStartedEvent()
                    .withGoalScoredEvent('arn0', 1, 0)
                .build()
            );
        })

        test('records a game ended event when the first player has 10 points', () => {
            const game = new aGame()
                .withRedPlayer('arn0')
                .withBluePlayer('Popeye')
                .withScore(9, 1)
                .withGameStartedEvent()
                .build();

            expect(game.goalScoredBy('arn0')).toEqual(
                new aGame()
                    .withRedPlayer('arn0')
                    .withBluePlayer('Popeye')
                    .withScore(10, 1)
                    .withGameStartedEvent()
                    .withGoalScoredEvent('arn0', 10, 1)
                    .withGameEndedEvent()
                    .build()
            );
        })
    })

    test('it turns a game to its state', () => {
        let game = Game.startTwoVersusTwo('arn0', 'momos', 'Popeye', 'coco')
        game = game.goalScoredBy('coco')
        game = game.goalScoredBy('momos')
        game = game.goalScoredBy('momos')
        game = game.goalScoredBy('coco')
        game = game.goalScoredBy('arn0')
        game = game.goalScoredBy('arn0')
        game = game.goalScoredBy('arn0')
        game = game.goalScoredBy('coco')
        game = game.goalScoredBy('momos')
        game = game.goalScoredBy('momos')
        game = game.goalScoredBy('momos')
        game = game.goalScoredBy('arn0')
        game = game.goalScoredBy('arn0')

        expect(game.toState()).toEqual([
            ['Game', '{"red":["arn0","momos"],"blue":["Popeye","coco"]}'],
            ['Game', '{"teamColor":1,"player":"coco","score":[0,1]}'],
            ['Game', '{"teamColor":0,"player":"momos","score":[1,1]}'],
            ['Game', '{"teamColor":0,"player":"momos","score":[2,1]}'],
            ['Game', '{"teamColor":1,"player":"coco","score":[2,2]}'],
            ['Game', '{"teamColor":0,"player":"arn0","score":[3,2]}'],
            ['Game', '{"teamColor":0,"player":"arn0","score":[4,2]}'],
            ['Game', '{"teamColor":0,"player":"arn0","score":[5,2]}'],
            ['Game', '{"teamColor":1,"player":"coco","score":[5,3]}'],
            ['Game', '{"teamColor":0,"player":"momos","score":[6,3]}'],
            ['Game', '{"teamColor":0,"player":"momos","score":[7,3]}'],
            ['Game', '{"teamColor":0,"player":"momos","score":[8,3]}'],
            ['Game', '{"teamColor":0,"player":"arn0","score":[9,3]}'],
            ['Game', '{"teamColor":0,"player":"arn0","score":[10,3]}'],
            ['Game', '{"red":["arn0","momos"],"blue":["Popeye","coco"],"score":[10,3]}'],
        ]);
    })
});

describe('Score', () => {
    test('the score is 0 - 0 at the beginning of the game', () => {
        expect(Score.playersHaveNotScored()).toEqual(new Score(0, 0));
    })

    test('it increases the score for a team', () => {
        expect(new Score(5, 5).increase(TeamColor.Red)).toEqual(
            new Score(6, 5)
        );
    })

    describe('canIncrease', () => {
        test('return false if a team has reached the max score', () => {
            expect(new Score(10, 5).canIncrease(TeamColor.Red)).toEqual(false);
        })

        test('return true if a team still can score', () => {
            expect(new Score(9, 5).canIncrease(TeamColor.Red)).toEqual(true);
        })
    })

    test('it turns a score to its state', () => {
        expect(new Score(10, 5).toState() ).toEqual(
            [10, 5]
        );
    })
});

describe('Team', () => {
    test('it builds a team of one player', () => {
        expect(Team.ofOnePlayer('arn0')).toEqual(new Team(['arn0']));
    })

    test('it builds a team of two players', () => {
        expect(Team.ofTwoPlayer('arn0', 'momos')).toEqual(new Team(['arn0', 'momos']));
    })

    describe('isTeammate', () => {
        test('returns true if the player belongs to the team', () => {
            expect(Team.ofTwoPlayer('arn0', 'momos').isTeammate('momos')).toEqual(true);
        })

        test('returns false if the player does not belong to the team', () => {
            expect(Team.ofTwoPlayer('arn0', 'momos').isTeammate('Popeye')).toEqual(false);
        })
    })

    describe('toState', () => {
        test('turns a two players team to its state', () => {
            expect(
                Team.ofTwoPlayer('arn0', 'momos').toState()
            ).toEqual(
                ['arn0', 'momos']
            );
        })

        test('turns a one player team to its state', () => {
            expect(
                Team.ofOnePlayer('arn0').toState()
            ).toEqual(
                ['arn0', '']
            );
        })
    })
});

describe('Event', () => {
    test('it turns a GameStarted to its state', () => {
        expect(
            new GameStarted(
                Team.ofTwoPlayer('arn0', 'momos'),
                Team.ofTwoPlayer('Popeye', 'coco'),
            ).toState()
        ).toEqual(
            '{"red":["arn0","momos"],"blue":["Popeye","coco"]}'
        );
    })

    test('it turns a GameEnded to its state', () => {
        expect(
            new GameEnded(
                Team.ofTwoPlayer('arn0', 'momos'),
                Team.ofTwoPlayer('Popeye', 'coco'),
                new Score(10, 0)
            ).toState()
        ).toEqual(
            '{"red":["arn0","momos"],"blue":["Popeye","coco"],"score":[10,0]}'
        );
    })

    test('it turns a GoalScored to its state', () => {
        expect(
            new GoalScored(
                TeamColor.Red,
                'arn0',
                new Score(10, 0)
            ).toState()
        ).toEqual(
            '{"teamColor":0,"player":"arn0","score":[10,0]}'
        );
    })
});