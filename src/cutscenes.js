////////////////////////////////////////////////
// Cutscenes
//

var playCutScene = function(cutScene, nextState) {

    // redraw map buffer with fruit list but no map structure
    map = undefined;
    renderer.drawMap(true);

    // miss the audio silence and time it cleanly for pacman cut scene 1
    setTimeout(audio.coffeeBreakMusic.startLoop, 1200);
    cutScene.nextState = nextState;
    switchState(cutScene, 60);

};

var tubieManCutscene1 = newChildObject(scriptState, {

    init: function() {
        scriptState.init.call(this);

        // initialize actor positions
        player.setPos(232, 164);
        enemy1.setPos(257, 164);

        // initialize actor directions
        enemy1.setDir(DIR_LEFT);
        enemy1.faceDirEnum = DIR_LEFT;
        player.setDir(DIR_LEFT);

        // initialize misc actor properties
        enemy1.scared = false;
        enemy1.mode = GHOST_OUTSIDE;

        // clear other states
        backupCheats();
        clearCheats();
        energizer.reset();

        // temporarily override actor step sizes
        player.getNumSteps = function() {
            return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_PACMAN);
        };
        enemy1.getNumSteps = function() {
            return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_ELROY2);
        };

        // temporarily override steering functions
        player.steer = enemy1.steer = function(){};
    },
    triggers: {

        // Enemy1 chases Player Character
        0: {
            update: function() {
                var j;
                for (j=0; j<2; j++) {
                    player.update(j);
                    enemy1.update(j);
                }
                player.frames++;
                enemy1.frames++;
            },
            draw: function() {
                renderer.blitMap();
                renderer.beginMapClip();
                renderer.drawPlayer();
                renderer.drawGhost(enemy1);
                renderer.endMapClip();
            },
        },

        // Player character chases Enemy1
        260: {
            init: function() {
                player.setPos(-193, 164);
                enemy1.setPos(-8, 155);

                // initialize actor directions
                enemy1.setDir(DIR_RIGHT);
                enemy1.faceDirEnum = DIR_RIGHT;
                player.setDir(DIR_RIGHT);

                // initialize misc actor properties
                enemy1.scared = true;

                // temporarily override step sizes
                player.getNumSteps = function() {
                    return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_PACMAN_FRIGHT);
                };
                enemy1.getNumSteps = function() {
                    return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_GHOST_FRIGHT);
                };
            },
            update: function() {
                var j;
                for (j=0; j<2; j++) {
                    player.update(j);
                    enemy1.update(j);
                }
                player.frames++;
                enemy1.frames++;
            },
            draw: function() {
                renderer.blitMap();
                renderer.beginMapClip();
                renderer.drawPlayer();
                renderer.renderFunc(function(ctx) {
                    var y = enemy1.getBounceY(enemy1.pixel.x, enemy1.pixel.y, DIR_RIGHT);
                    var x = enemy1.pixel.x;
                    ctx.save();
                    ctx.translate(x,y);
                    var s = 16/6;
                    ctx.scale(s,s);
                    drawCookie(ctx,0,0);
                    ctx.restore();
                });
                renderer.endMapClip();
            },
        },

        // end
        640: {
            init: function() {
                // disable custom steps
                delete player.getNumSteps;
                delete enemy1.getNumSteps;

                // disable custom steering
                delete player.steer;
                delete enemy1.steer;

                // exit to next level
                restoreCheats();
                switchState(tubieManCutscene1.nextState, 60);
            },
        },
    },
});

var tubieManCutscene2 = (function() {

    /*
    NOTE:
    This is a copy-paste of mspacmanCutscene1.
    pac is replaced with a scared ghost (bouncing cookie)
    mspac is replaced with Tubie-Man
    */

    // create new players pac and mspac for this scene
    var pac = new Ghost();
    pac.scared = true;
    pac.mode = GHOST_OUTSIDE;
    var mspac = new Player();

    // draws pac or mspac
    var drawPlayer = function(ctx,player) {
        var frame = player.getAnimFrame();
        var func;
        if (player == pac) {
            var y = player.getBounceY(player.pixel.x, player.pixel.y, player.dirEnum);
            atlas.drawMonsterSprite(ctx, player.pixel.x, y, 0, player.dirEnum, true, false);
        }
        else if (player == mspac) {
            drawTubieManSprite(ctx, player.pixel.x, player.pixel.y, player.dirEnum, frame, true);
        }
    };

    // draws all actors
    var draw = function() {
        renderer.blitMap();
        renderer.beginMapClip();
        renderer.renderFunc(function(ctx) {
            drawPlayer(ctx,pac);
            drawPlayer(ctx,mspac);
        });
        renderer.drawGhost(enemy3);
        renderer.drawGhost(enemy2);
        renderer.endMapClip();
    };

    // updates all actors
    var update = function() {
        var j;
        for (j=0; j<2; j++) {
            pac.update(j);
            mspac.update(j);
            enemy3.update(j);
            enemy2.update(j);
        }
        pac.frames++;
        mspac.frames++;
        enemy3.frames++;
        enemy2.frames++;
    };

    var exit = function() {
        // disable custom steps
        delete enemy3.getNumSteps;
        delete enemy2.getNumSteps;

        // disable custom steering
        delete enemy3.steer;
        delete enemy2.steer;

        // disable custom animation steps
        delete enemy3.getAnimFrame;
        delete enemy2.getAnimFrame;

        // exit to next level
        restoreCheats();
        switchState(tubieManCutscene2.nextState, 60);
    };

    return newChildObject(scriptState, {

        init: function() {
            scriptState.init.call(this);

            // chosen by trial-and-error to match animations
            mspac.frames = 14;
            pac.frames = 12;

            // initialize actor states
            pac.setPos(-10, 99);
            pac.setDir(DIR_RIGHT);
            mspac.setPos(232, 180);
            mspac.setDir(DIR_LEFT);
            
            // initial ghost states
            enemy3.frames = 0;
            enemy3.mode = GHOST_OUTSIDE;
            enemy3.scared = false;
            enemy3.setPos(pac.pixel.x-42, 99);
            enemy3.setDir(DIR_RIGHT);
            enemy3.faceDirEnum = DIR_RIGHT;
            enemy2.frames = 3;
            enemy2.mode = GHOST_OUTSIDE;
            enemy2.scared = false;
            enemy2.setPos(mspac.pixel.x+49, 180);
            enemy2.setDir(DIR_LEFT);
            enemy2.faceDirEnum = DIR_LEFT;

            // clear other states
            backupCheats();
            clearCheats();
            energizer.reset();

            // step player animation every four frames
            pac.getStepFrame = function() { return Math.floor(this.frames/4)%4; };
            mspac.getStepFrame = function() { return Math.floor(this.frames/4)%4; };

            // step ghost animation every six frames
            enemy3.getAnimFrame = function() { return Math.floor(this.frames/8)%2; };
            enemy2.getAnimFrame = function() { return Math.floor(this.frames/8)%2; };

            // set actor step sizes
            pac.getNumSteps = function() { return 1; };
            mspac.getNumSteps = function() { return 1; };
            enemy3.getNumSteps = function() { return 1; };
            enemy2.getNumSteps = function() { return 1; };

            // set steering functions
            pac.steer = function(){};
            mspac.steer = function(){};
            enemy3.steer = function(){};
            enemy2.steer = function(){};
        },
        triggers: {

            // Enemy3 chases Player, Pinky chases Mspac
            0: {
                update: function() {
                    update();
                    if (enemy3.pixel.x == 105) {
                        // speed up the ghosts
                        enemy3.getNumSteps = function() {
                            return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_ELROY2);
                        };
                        enemy2.getNumSteps = function() {
                            return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_ELROY2);
                        };
                    }
                },
                draw: draw,
            },

            // MsPac and Pac converge with ghosts chasing
            300: (function(){

                // bounce animation when ghosts bump heads
                var enemy3BounceX =  [ 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
                var enemy3BounceY =  [-1, 0,-1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0,-1, 0,-1, 0, 0, 0, 0, 0, 1, 0, 1];
                var enemy2BounceX = [ 0, 0, 0, 0,-1, 0,-1, 0, 0,-1, 0,-1, 0,-1, 0, 0,-1, 0,-1, 0,-1, 0, 0,-1, 0,-1, 0,-1, 0, 0];
                var enemy2BounceY = [ 0, 0, 0,-1, 0,-1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0,-1, 0,-1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0];
                var enemy3BounceFrame = 0;
                var enemy2BounceFrame = 0;
                var enemy3BounceFrameLen = enemy3BounceX.length;
                var enemy2BounceFrameLen = enemy2BounceX.length;

                // ramp animation for players
                var rampX = [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1];
                var rampY = [0, 0,-1,-1,-1, 0, 0, 0, 0, 0, 0, 0, 0];
                var rampFrame = 0;
                var rampFrameLen = rampX.length;

                // climbing
                var climbFrame = 0;

                // meeting
                var meetFrame = 0;

                var ghostMode;
                var GHOST_RUN = 0;
                var GHOST_BUMP = 1;

                var playerMode;
                var PLAYER_RUN = 0;
                var PLAYER_RAMP = 1;
                var PLAYER_CLIMB = 2;
                var PLAYER_MEET = 3;
                     
                return {
                    init: function() {
                        // reset frames
                        enemy3BounceFrame = enemy2BounceFrame = rampFrame = climbFrame = meetFrame = 0;

                        // set modes
                        ghostMode = GHOST_RUN;
                        playerMode = PLAYER_RUN;

                        // set initial positions and directions
                        mspac.setPos(-8,143);
                        mspac.setDir(DIR_RIGHT);

                        enemy2.setPos(-81,143);
                        enemy2.faceDirEnum = DIR_RIGHT;
                        enemy2.setDir(DIR_RIGHT);

                        pac.setPos(223+8+3,142);
                        pac.setDir(DIR_LEFT);

                        enemy3.setPos(302,143);
                        enemy3.faceDirEnum = DIR_LEFT;
                        enemy3.setDir(DIR_LEFT);

                        // set ghost speed
                        enemy3.getNumSteps = enemy2.getNumSteps = function() {
                            return "11211212"[this.frames%8];
                        };
                    },
                    update: function() {
                        var j;

                        // update players
                        if (playerMode == PLAYER_RUN) {
                            for (j=0; j<2; j++) {
                                pac.update(j);
                                mspac.update(j);
                            }
                            if (mspac.pixel.x == 102) {
                                playerMode++;
                            }
                        }
                        else if (playerMode == PLAYER_RAMP) {
                            pac.pixel.x -= rampX[rampFrame];
                            pac.pixel.y += rampY[rampFrame];
                            pac.commitPos();
                            mspac.pixel.x += rampX[rampFrame];
                            mspac.pixel.y += rampY[rampFrame];
                            mspac.commitPos();
                            rampFrame++;
                            if (rampFrame == rampFrameLen) {
                                playerMode++;
                            }
                        }
                        else if (playerMode == PLAYER_CLIMB) {
                            if (climbFrame == 0) {
                                // set initial climb state for mspac
                                mspac.pixel.y -= 2;
                                mspac.commitPos();
                                mspac.setDir(DIR_UP);
                            }
                            else {
                                for (j=0; j<2; j++) {
                                    mspac.update(j);
                                }
                            }
                            climbFrame++;
                            if (mspac.pixel.y == 91) {
                                playerMode++;
                            }
                        }
                        else if (playerMode == PLAYER_MEET) {
                            if (meetFrame == 0) {
                                // set initial meet state for mspac
                                mspac.pixel.y++;
                                mspac.setDir(DIR_RIGHT);
                                mspac.commitPos();
                            }
                            if (meetFrame > 18) {
                                // pause player frames after a certain period
                                mspac.frames--;
                            }
                            if (meetFrame == 78) {
                                exit();
                            }
                            meetFrame++;
                        }
                        pac.frames++;
                        mspac.frames++;

                        // update ghosts
                        if (ghostMode == GHOST_RUN) {
                            for (j=0; j<2; j++) {
                                enemy3.update(j);
                                enemy2.update(j);
                            }

                            // stop at middle
                            enemy3.pixel.x = Math.max(120, enemy3.pixel.x);
                            enemy3.commitPos();
                            enemy2.pixel.x = Math.min(105, enemy2.pixel.x);
                            enemy2.commitPos();

                            if (enemy2.pixel.x == 105) {
                                ghostMode++;
                            }
                        }
                        else if (ghostMode == GHOST_BUMP) {
                            if (enemy3BounceFrame < enemy3BounceFrameLen) {
                                enemy3.pixel.x += enemy3BounceX[enemy3BounceFrame];
                                enemy3.pixel.y += enemy3BounceY[enemy3BounceFrame];
                            }
                            if (enemy2BounceFrame < enemy2BounceFrameLen) {
                                enemy2.pixel.x += enemy2BounceX[enemy2BounceFrame];
                                enemy2.pixel.y += enemy2BounceY[enemy2BounceFrame];
                            }
                            enemy3BounceFrame++;
                            enemy2BounceFrame++;
                        }
                        enemy3.frames++;
                        enemy2.frames++;
                    },
                    draw: function() {
                        renderer.blitMap();
                        renderer.beginMapClip();
                        renderer.renderFunc(function(ctx) {
                            if (playerMode <= PLAYER_RAMP) {
                                drawPlayer(ctx,pac);
                            }
                            drawPlayer(ctx,mspac);
                        });
                        if (enemy3BounceFrame < enemy3BounceFrameLen) {
                            renderer.drawGhost(enemy3);
                        }
                        if (enemy2BounceFrame < enemy2BounceFrameLen) {
                            renderer.drawGhost(enemy2);
                        }
                        if (playerMode == PLAYER_MEET) {
                            renderer.renderFunc(function(ctx) {
                                drawHeartSprite(ctx, 112, 73);
                            });
                        }
                        renderer.endMapClip();
                    },
                }; // returned object
            })(), // trigger at 300
        }, // triggers
    }); // returned object
})(); // mspacCutscene1

var cutscenes = [tubieManCutscene1, tubieManCutscene2]; // GAME_TUBIE_MAN

var isInCutScene = function() {
    var scenes = cutscenes;
    var i,len = scenes.length;
    for (i=0; i<len; i++) {
        if (state == scenes[i]) {
            return true;
        }
    }
    return false;
};

// TODO: no cutscene after board 17 (last one after completing board 17)
var triggerCutsceneAtEndLevel = function() {
    if (level == 2) {
        playCutScene(tubieManCutscene1, readyNewState);
        return true;
    }
    else if (level == 5) {
        playCutScene(tubieManCutscene2, readyNewState);
        return true;
    }

    // no cutscene triggered
    return false;
};

