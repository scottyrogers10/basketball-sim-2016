BASE.require([
    "jQuery"
], function () {

    BASE.namespace("app.components.test");

    app.components.test.PlayByPlayData = function () {
        return [{
            quarter: 1,
            timeLeft: "11:45",
            score: "2-0",
            playType: {
                primaryType: "Jump Shot",
                result: "Made",
                description: "Pullup",
                primaryStatType: "points",
                secondaryType: "Assist",
                secondaryStatType: "assist",
            },
            possessionTeam: {
                abbreviation: "UTA"
            },
            primaryPlayer: {
                info: {
                    firstName: "Rodney",
                    lastName: "Hood",
                    profileImg: "img/rodney-hood-profile.png"
                },
                gameStats: {
                    points: {
                        value: 2,
                        abbr: "PTS"
                    }
                }
            },
            secondaryPlayer: {
                info: {
                    firstName: "Boris",
                    lastName: "Diaw"
                },
                gameStats: {
                    assist: {
                        value: 1,
                        abbr: "AST"
                    }
                }
            }
        },
        {
            quarter: 1,
            timeLeft: "11:30",
            score: "2-2",
            playType: {
                primaryType: "Jump Shot",
                result: "Made",
                description: "Pullup",
                primaryStatType: "points",
                secondaryType: "Assist",
                secondaryStatType: "assist",
            },
            possessionTeam: {
                abbreviation: "LAL"
            },
            primaryPlayer: {
                info: {
                    firstName: "Nick",
                    lastName: "Young",
                    profileImg: "img/nick-young-profile.png"
                },
                gameStats: {
                    points: {
                        value: 2,
                        abbr: "PTS"
                    }
                }
            },
            secondaryPlayer: {
                info: {
                    firstName: "Timothey",
                    lastName: "Mozgov"
                },
                gameStats: {
                    assist: {
                        value: 1,
                        abbr: "AST"
                    }
                }
            }
        },
        {
            quarter: 1,
            timeLeft: "11:07",
            score: "2-2",
            playType: {
                primaryType: "Turnover",
                result: "Bad Pass",
                description: "",
                primaryStatType: "turnover",
                secondaryType: "Steal",
                secondaryStatType: "steal",
            },
            possessionTeam: {
                abbreviation: "UTA"
            },
            primaryPlayer: {
                info: {
                    firstName: "Boris",
                    lastName: "Diaw",
                    profileImg: "img/boris-diaw-profile.png"
                },
                gameStats: {
                    turnover: {
                        value: 1,
                        abbr: "TO"
                    }
                }
            },
            secondaryPlayer: {
                info: {
                    firstName: "Deangelo",
                    lastName: "Russell"
                },
                gameStats: {
                    steal: {
                        value: 1,
                        abbr: "STL"
                    }
                }
            }
        },
        {
            quarter: 1,
            timeLeft: "11:01",
            score: "2-2",
            playType: {
                primaryType: "Shot",
                result: "Missed",
                description: "3pt",
                primaryStatType: "fg",
                secondaryType: "",
                secondaryStatType: "",
            },
            possessionTeam: {
                abbreviation: "LAL"
            },
            primaryPlayer: {
                info: {
                    firstName: "Deangelo",
                    lastName: "Russell",
                    profileImg: "img/deangelo-russell-profile.png"
                },
                gameStats: {
                    fg: {
                        value: "0-1",
                        abbr: "FG"
                    }
                }
            },
            secondaryPlayer: null
        },
        {
            quarter: 1,
            timeLeft: "10:50",
            score: "4-2",
            playType: {
                primaryType: "Shot",
                result: "",
                description: "",
                primaryStatType: "points",
                secondaryType: "",
                secondaryStatType: "",
            },
            possessionTeam: {
                abbreviation: "UTA"
            },
            primaryPlayer: {
                info: {
                    firstName: "Rodney",
                    lastName: "Hood",
                    profileImg: "img/rodney-hood-profile.png"
                },
                gameStats: {
                    points: {
                        value: 4,
                        abbr: "PTS"
                    }
                }
            },
            secondaryPlayer: null
        }];
    };

});
