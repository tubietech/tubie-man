//////////////////////////////////////////////////////////////////////////////////////
// States
// (main loops for each state of the game)
// state is set to any of these states, each containing an init(), draw(), and update()

// current game state
var state;

// switches to another game state
var switchState = function(nextState,fadeDuration, continueUpdate1, continueUpdate2) {
    state = (fadeDuration) ? fadeNextState(state,nextState,fadeDuration,continueUpdate1, continueUpdate2) : nextState;
    const isCurrentStateMenu = state.hasOwnProperty("getMenu") && state.getMenu() instanceof Menu;
    const isNextStateMenu = nextState.hasOwnProperty("getMenu") && nextState.getMenu() instanceof Menu;

    // Don't pause menu when switching from one menu to another
    if(!(isCurrentStateMenu && isNextStateMenu))
        audio.silence();

    state.init();
    if (executive.isPaused()) {
        executive.togglePause();
    }
};

//////////////////////////////////////////////////////////////////////////////////////
// Fade state

// Creates a state that will fade from a given state to another in the given amount of time.
// if continueUpdate1 is true, then prevState.update will be called while fading out
// if continueUpdate2 is true, then nextState.update will be called while fading in
var fadeNextState = function (prevState, nextState, frameDuration, continueUpdate1, continueUpdate2) {
    var frames;
    var midFrame = Math.floor(frameDuration/2);
    var inFirstState = function() { return frames < midFrame; };
    var getStateTime = function() { return frames/frameDuration*2 + (inFirstState() ? 0 : -1); };
    var initialized = false;

    return {
        init: function() {
            frames = 0;
            initialized = true;
        },
        draw: function() {
            if (!initialized) return;
            var t = getStateTime();
            if (frames < midFrame) {
                if (prevState) {
                    prevState.draw();
                    renderer.setOverlayColor("rgba(0,0,0,"+t+")");
                }
            }
            else if (frames > midFrame) {
                nextState.draw();
                renderer.setOverlayColor("rgba(0,0,0,"+(1-t)+")");
            }
        },
        update: function() {

            // update prevState
            if (frames < midFrame) {
                if (continueUpdate1) {
                    prevState.update();
                }
            }
            // change to nextState
            else if (frames == midFrame) {
                nextState.init();
            }
            // update nextState
            else if (frames < frameDuration) {
                if (continueUpdate2) {
                    nextState.update();
                }
            }
            // hand over state to nextState
            else {
                state = nextState;
                initialized = false;
            }

            frames++;
        },
    }
};

//////////////////////////////////////////////////////////////////////////////////////
// Game Title
// (provides functions for managing the game title with clickable player and enemies below it)

var gameTitleState = (function() {

    var name,nameColor;

    var resetTitle = function() {
        if (playerBtn.isSelected) {
            name = getGameName();
            nameColor = "#47b8ff";
        }
       else if (redBtn.isSelected) {
            name = getEnemyNames()[0];
            nameColor = enemy1.color;
        }
        else if (pinkBtn.isSelected) {
            name = getEnemyNames()[1];
            nameColor = enemy2.color;
        }
        else if (cyanBtn.isSelected) {
            name = getEnemyNames()[2];
            nameColor = enemy3.color;
        }
        else if (orangeBtn.isSelected) {
            name = getEnemyNames()[3];
            nameColor = enemy4.color;
        }
        else {
            name = getGameName();
            nameColor = "#FFF";
        }
    };

    var w = 30;
    var h = 40;
    var x = mapWidth / 2 - 3 * w;
    var y = 3 * tileSize;
    var playerBtn = new Button(x,y,w,h,function() {
        if (gameMode == GAME_MSPACMAN) {
            gameMode = GAME_OTTO;
        }
        else if (gameMode == GAME_OTTO) {
            gameMode = GAME_MSPACMAN;
        }
    });
    playerBtn.setIcon(function (ctx,x,y,frame) {
        ctx.save();
        ctx.scale(1.25, 1.25);
        getPlayerDrawFunc()(ctx,x/1.25,y/1.25,DIR_RIGHT,player.getAnimFrame(player.getStepFrame(Math.floor(frame/1.5))),true);
        ctx.restore();
    });

    x += 2*w;
    var redBtn = new Button(x,y,w,h);
    redBtn.setIcon(function (ctx,x,y,frame) {
        ctx.save();
        ctx.scale(1.25, 1.25);
        getEnemyDrawFunc()(ctx,x/1.25,y/1.25,Math.floor(frame/6)%2,DIR_LEFT,undefined,undefined,undefined,enemy1.color);
        ctx.restore();
    });

    x += w;
    var pinkBtn = new Button(x,y,w,h);
    pinkBtn.setIcon(function (ctx,x,y,frame) {
        ctx.save();
        ctx.scale(1.25, 1.25);
        getEnemyDrawFunc()(ctx,x/1.25,y/1.25,Math.floor(frame/6)%2,DIR_LEFT,undefined,undefined,undefined,enemy2.color);
        ctx.restore();
    });

    x += w;
    var cyanBtn = new Button(x,y,w,h)
    cyanBtn.setIcon(function (ctx,x,y,frame) {
        ctx.save();
        ctx.scale(1.25, 1.25);
        getEnemyDrawFunc()(ctx,x/1.25,y/1.25,Math.floor(frame/6)%2,DIR_LEFT,undefined,undefined,undefined,enemy3.color);
        ctx.restore();
    });

    x += w;
    var orangeBtn = new Button(x,y,w,h);
    orangeBtn.setIcon(function (ctx,x,y,frame) {
        ctx.save();
        ctx.scale(1.25, 1.25);
        getEnemyDrawFunc()(ctx,x / 1.25,y / 1.25,Math.floor(frame/6)%2,DIR_LEFT,undefined,undefined,undefined,enemy4.color);
        ctx.restore();
    });
    
    var forEachCharBtn = function(callback) {
        callback(playerBtn);
        callback(redBtn);
        callback(pinkBtn);
        callback(cyanBtn);
        callback(orangeBtn);
    };

    forEachCharBtn(function(btn) {
        btn.borderBlurColor = btn.borderFocusColor = "#000";
    });

    const titleButtons = [playerBtn, redBtn, pinkBtn, cyanBtn, orangeBtn];

    return {
        init: function() {
            resetTitle();
            forEachCharBtn(function (btn) {
                btn.enable();
            });
        },
        shutdown: function() {
            forEachCharBtn(function (btn) {
                btn.disable();
            });
        },
        draw: function() {
            setScreenAndMapDimensions();
            
            const w = 20;
            let x = mapWidth / 2 - 3 * w;
            const y = 3 * tileSize;

            playerBtn.setPosition(x, y);
            redBtn.setPosition(x += 2 * w, y);
            pinkBtn.setPosition(x += w, y);
            cyanBtn.setPosition(x += w, y);
            orangeBtn.setPosition(x += w, y);
            
            forEachCharBtn(function (btn) {
                renderer.renderFunc(btn.draw,btn);
            });

            resetTitle();
            renderer.renderFunc(function(ctx){
                ctx.font = tileSize + "px 'Press Start 2P'";
                ctx.fillStyle = nameColor;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillText(name, mapWidth / 2, tileSize);
            });
        },
        update: function() {
            forEachCharBtn(function (btn) {
                btn.update();
            });
        },
        getplayerBtn: function() {
            return playerBtn;
        },
        getTitleButtons: function() {
            return titleButtons;
        },
        selectNextTitleButton: function() {
            if(!audio.isPlaying())
                audio.mainMenuMusic.startLoop(true);

            const selectedTitleButtonIndex = titleButtons.map((btn) => btn.isSelected).reduce((prev, current, index) => current === true ? index : prev, -1);
            const nextTitleButtonIndex = selectedTitleButtonIndex >= titleButtons.length - 1 ? 0 : selectedTitleButtonIndex + 1;

            if(selectedTitleButtonIndex >= 0)
                titleButtons[selectedTitleButtonIndex].blur();
            titleButtons[nextTitleButtonIndex].focus();
        },
        selectPrevTitleButton: function() {
            if(!audio.isPlaying())
                audio.mainMenuMusic.startLoop(true);
            
            const selectedTitleButtonIndex = titleButtons.map((btn) => btn.isSelected).reduce((prev, current, index) => current === true ? index : prev, -1);
            const nextTitleButtonIndex = selectedTitleButtonIndex <= 0 ? titleButtons.length - 1 : selectedTitleButtonIndex - 1;

            if(selectedTitleButtonIndex >= 0)
                titleButtons[selectedTitleButtonIndex].blur();
            titleButtons[nextTitleButtonIndex].focus();
        },
        blurTitleButtons: function() {
            titleButtons.forEach((btn) => { if(btn.isSelected) btn.blur()});
        }
    };

})();

//////////////////////////////////////////////////////////////////////////////////////
// Pre New Game State
// (the main menu for the currently selected game)

var preNewGameState = (function() {

    var exitTo = function(s,fade) {
        gameTitleState.shutdown();
        menu.disable();
        switchState(s,fade);
    };

    var menu = new Menu("",2*tileSize,0,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px 'Press Start 2P'", "#EEE");

    menu.addSpacer(2);
    menu.addTextButton("PLAY",
        function() { 
            practiceMode = false;
            turboMode = false;
            newGameState.setStartLevel(1);
            exitTo(newGameState, 60);
        });
    menu.addSpacer(0.5);
    menu.addTextButton("CUTSCENES",
        function() { 
            exitTo(cutSceneMenuState);
        });
    menu.addTextButton("ABOUT",
        function() { 
            exitTo(aboutGameState);
        });

    return {
        init: function() {
            if(!audio.mainMenuMusic.isPlaying())
                audio.mainMenuMusic.startLoop();
            menu.enable();
            gameTitleState.init();
            map = undefined;
        },
        draw: function() {
            setScreenAndMapDimensions();
            renderer.clearMapFrame();
            renderer.renderFunc(menu.draw,menu);
            menu.setSize(2 * tileSize, 0, mapWidth - 4 * tileSize , 3 * tileSize);
            gameTitleState.draw();
        },
        update: function() {
            gameTitleState.update();
        },
        getMenu: function() {
            return menu;
        },
    };
})();

var homeState = preNewGameState;

//////////////////////////////////////////////////////////////////////////////////////
// About Game State
// (the screen shows some information about the game)

var aboutGameState = (function() {

    var exitTo = function(s,fade) {
        gameTitleState.shutdown();
        menu.disable();
        switchState(s,fade);
    };

    var menu = new Menu("",2*tileSize,0,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px 'Press Start 2P'", "#EEE");

    menu.addSpacer(8);
    menu.addTextButton("BACK",
        function() {
            exitTo(preNewGameState);
        });
    menu.backButton = menu.buttons[menu.buttonCount-1];

    var desc;
    var numDescLines;

    var drawDesc = function(ctx){
        const wsSizeModifier = getIsWidescreen() ? 0.75 : 1;

        ctx.font = wsSizeModifier * tileSize + "px 'Press Start 2P'";
        ctx.fillStyle = "#FFF";
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        var y = 10 * tileSize;
        var i;
        for (i=0; i<numDescLines; i++) {
            ctx.fillText(desc[i], (getIsWidescreen() ? 20 : 14) * tileSize , y + i * 1.8 * wsSizeModifier * tileSize);
        }
    };

    return {
        init: function() {
            menu.enable();
            gameTitleState.init();
        },
        draw: function() {
            setScreenAndMapDimensions();
            renderer.clearMapFrame();
            menu.setSize(2 * tileSize, 0, mapWidth - 4 * tileSize, 3 * tileSize);
            renderer.renderFunc(menu.draw,menu);
            gameTitleState.draw();
            desc = getGameDescription();
            numDescLines = desc.length;
            renderer.renderFunc(drawDesc);
        },
        update: function() {
            gameTitleState.update();
            menu.backButton.setDimensions(mapWidth - (getIsWidescreen() ? 18 : 10) * tileSize, 3 * tileSize);
            menu.backButton.setPosition(menu.x + menu.pad, mapHeight - (4 * tileSize));
        },
        getMenu: function() {
            return menu;
        },
    };
})();

//////////////////////////////////////////////////////////////////////////////////////
// Cut Scene Menu State
// (the screen that shows a list of the available cutscenes for the current game)

var cutSceneMenuState = (function() {

    var exitTo = function(s,fade) {
        gameTitleState.shutdown();
        menu.disable();
        switchState(s,fade);
    };

    var exitToCutscene = function(s) {
        if (s) {
            gameTitleState.shutdown();
            menu.disable();
            playCutScene(s,cutSceneMenuState);
        }
    };

    var menu = new Menu("",2*tileSize,0,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px 'Press Start 2P'", "#EEE");

    menu.addSpacer(2);
    menu.addTextButton("CUTSCENE 1",
        function() { 
            exitToCutscene(cutscenes[0]);
        });
    menu.addTextButton("CUTSCENE 2",
        function() { 
            exitToCutscene(cutscenes[1]);
        });
    // menu.addTextButton("CUTSCENE 3",
    //     function() { 
    //         exitToCutscene(cutscenes[2]);
    //     });
    menu.addSpacer();
    menu.addTextButton("BACK",
        function() {
            exitTo(preNewGameState);
        });
    menu.cutscene1Btn = menu.buttons[0];
    menu.cutscene2Btn = menu.buttons[1];
    menu.backButton = menu.buttons[menu.buttonCount-1];

    return {
        init: function() {
            menu.enable();
            gameTitleState.init();
            level = 0;
        },
        draw: function() {
            renderer.clearMapFrame();
            setScreenAndMapDimensions();

            menu.setSize(2 * tileSize, 0, mapWidth - 4 * tileSize , 3 * tileSize);

            const btnX = menu.x + menu.pad;
            const btnWidth = mapWidth - (getIsWidescreen() ? 18 : 10) * tileSize;
            const btnHeight = 3 * tileSize;

            menu.backButton.setDimensions(btnWidth, btnHeight);
            menu.cutscene1Btn.setPosition(btnX, mapHeight - (20 * tileSize));
            menu.backButton.setDimensions(btnWidth, btnHeight);
            menu.cutscene2Btn.setPosition(btnX, mapHeight - (16 * tileSize));
            menu.backButton.setDimensions(btnWidth, btnHeight);
            menu.backButton.setPosition(btnX * (getIsWidescreen() ? 3 : 1.5), mapHeight - (8 * tileSize));

            renderer.renderFunc(menu.draw, menu);
            gameTitleState.draw();
        },
        update: function() {
            gameTitleState.update();
        },
        getMenu: function() {
            return menu;
        },
    };
})();

//////////////////////////////////////////////////////////////////////////////////////
// Score State
// (the high score screen state)

var scoreState = (function(){

    var exitTo = function(s) {
        switchState(s);
        menu.disable();
    };

    var menu = new Menu("", 2*tileSize,mapHeight-6*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px 'Press Start 2P'", "#EEE");
    menu.addTextButton("BACK",
        function() {
            exitTo(preNewGameState);
        });
    menu.backButton = menu.buttons[menu.buttonCount-1];

    var frame = 0;

    var bulbs = {};
    var numBulbs;
    (function(){
        var x = -1.5*tileSize;
        var y = -1*tileSize;
        var w = 18*tileSize;
        var h = 29*tileSize;
        var s = 3;

        var i=0;
        var x0 = x;
        var y0 = y;
        var addBulb = function(x,y) { bulbs[i++] = { x:x, y:y }; };
        for (; y0<y+h; y0+=s) { addBulb(x0,y0); }
        for (; x0<x+w; x0+=s) { addBulb(x0,y0); }
        for (; y0>y; y0-=s) { addBulb(x0,y0); }
        for (; x0>x; x0-=s) { addBulb(x0,y0); }

        numBulbs = i;
    })();

    var drawScoreBox = function(ctx) {

        // draw chaser lights around the marquee
        ctx.fillStyle = "#555";
        var i,b,s=2;
        for (i=0; i<numBulbs; i++) {
            b = bulbs[i];
            ctx.fillRect(b.x, b.y, s, s);
        }
        ctx.fillStyle = "#FFF";
        for (i=0; i<63; i++) {
            b = bulbs[(i*4+Math.floor(frame/2))%numBulbs];
            ctx.fillRect(b.x, b.y, s, s);
        }

        ctx.font = tileSize+"px 'Press Start 2P'";
        ctx.textBaseline = "top";
        ctx.textAlign = "right";
        var scoreColor = "#AAA";
        var captionColor = "#444";

        var x,y;
        x = 9*tileSize;
        y = 0;
        ctx.fillStyle = "#FFF"; ctx.fillText("HIGH SCORES", x+4*tileSize,y);
        y += tileSize*4;

        var drawContrails = function(x,y) {
            ctx.lineWidth = 1.0;
            ctx.lineCap = "round";
            ctx.strokeStyle = "rgba(255,255,255,0.5)";

            ctx.save();
            ctx.translate(-2.5,0);

            var dy;
            for (dy=-4; dy<=4; dy+=2) {
                ctx.beginPath();
                ctx.moveTo(x+tileSize,y+dy);
                ctx.lineTo(x+tileSize*(Math.random()*0.5+1.5),y+dy);
                ctx.stroke();
            }
            ctx.restore();

        };

        y += tileSize*3;
        ctx.fillStyle = scoreColor; ctx.fillText(highScores[4], x,y);
        atlas.drawTubieManSprite(ctx,x+2*tileSize,y+tileSize/2,DIR_LEFT,1);
        y += tileSize*2;
        ctx.fillStyle = scoreColor; ctx.fillText(highScores[5], x,y);
        drawContrails(x+2*tileSize,y+tileSize/2);
        atlas.drawTubieManSprite(ctx,x+2*tileSize,y+tileSize/2,DIR_LEFT,1);
    };

    var drawFood = function(ctx) {
        ctx.globalAlpha = 0.5;
        ctx.font = tileSize + "px sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";

        var x = 20*tileSize;
        var y = 0;

        ctx.fillStyle = "#ffb8ae";
        ctx.fillRect(x-1,y-1.5,2,2);
        ctx.fillStyle = "#FFF";
        ctx.fillText("10",x+tileSize,y);
        y += 1.5*tileSize;

        ctx.fillStyle = "#ffb8ae";
        ctx.beginPath();
        ctx.arc(x,y-0.5,tileSize/2,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#FFF";
        ctx.fillText("50",x+tileSize,y);

        y += 3*tileSize;
        atlas.drawEnemySprite(ctx,x,y,0,DIR_RIGHT,true);
        atlas.drawEnemyPoints(ctx,x+2*tileSize,y,200);

        var alpha = ctx.globalAlpha;

        y += 2*tileSize;
        ctx.globalAlpha = alpha*0.5;
        atlas.drawEnemySprite(ctx,x,y,0,DIR_RIGHT,true);
        ctx.globalAlpha = alpha;
        atlas.drawEnemySprite(ctx,x+2*tileSize,y,0,DIR_RIGHT,true);
        atlas.drawEnemyPoints(ctx,x+4*tileSize,y,400);

        y += 2*tileSize;
        ctx.globalAlpha = alpha*0.5;
        atlas.drawEnemySprite(ctx,x,y,0,DIR_RIGHT,true);
        atlas.drawEnemySprite(ctx,x+2*tileSize,y,0,DIR_RIGHT,true);
        ctx.globalAlpha = alpha;
        atlas.drawEnemySprite(ctx,x+4*tileSize,y,0,DIR_RIGHT,true);
        atlas.drawEnemyPoints(ctx,x+6*tileSize,y,800);

        y += 2*tileSize;
        ctx.globalAlpha = alpha*0.5;
        atlas.drawEnemySprite(ctx,x,y,0,DIR_RIGHT,true);
        atlas.drawEnemySprite(ctx,x+2*tileSize,y,0,DIR_RIGHT,true);
        atlas.drawEnemySprite(ctx,x+4*tileSize,y,0,DIR_RIGHT,true);
        ctx.globalAlpha = alpha;
        atlas.drawEnemySprite(ctx,x+6*tileSize,y,0,DIR_RIGHT,true);
        atlas.drawEnemyPoints(ctx,x+8*tileSize,y,1600);

        // var tm_fruits = [
        //     {name: 'cherry',     points: 100},
        //     {name: 'strawberry', points: 200},
        //     {name: 'orange',     points: 500},
        //     {name: 'pretzel',    points: 700},
        //     {name: 'apple',      points: 1000},
        //     {name: 'pear',       points: 2000},
        //     {name: 'banana',     points: 5000},
        // ];

        const tm_fruits = fruit.fruits;

        x += 6*tileSize;
        y = 13.5*tileSize;
        for (i=0; i<tm_fruits.length; i++) {
            f = tm_fruits[i];
            atlas.drawBonusSprite(ctx,x,y,f.name);
            atlas.drawBonusPoints(ctx,x+2*tileSize,y,f.points);
            y += 2*tileSize;
        }
        ctx.globalAlpha = 1;
    };

    return {
        init: function() {
            menu.enable();
        },
        draw: function() {
            renderer.clearMapFrame();
            renderer.renderFunc(drawScoreBox);
            renderer.renderFunc(drawFood);
            renderer.renderFunc(menu.draw,menu);
        },
        update: function() {
            menu.update();
            frame++;
        },
        getMenu: function() {
            return menu;
        },
    };

})();

//////////////////////////////////////////////////////////////////////////////////////
// About State
// (the about screen state)

var aboutState = (function(){

    var exitTo = function(s) {
        switchState(s);
        menu.disable();
    };

    var menu = new Menu("", 2*tileSize,mapHeight-11*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px 'Press Start 2P'", "#EEE");
    menu.addTextButton("VIEW ON GITHUB",
        function() {
            window.open("https://github.com/tubietech/tubie-man");
        });
    menu.addTextButton("BACK",
        function() {
            exitTo(preNewGameState);
        });
    menu.backButton = menu.buttons[menu.buttonCount-1];

    var drawBody = function(ctx) {
        ctx.font = (getIsWidescreen() ? tileSize * 0.75: tileSize) + "px 'Press Start 2P'";
        ctx.textBaseline = "top";
        ctx.textAlign = "left";

        var x,y;
        x = 2*tileSize;
        y = 0*tileSize;
        ctx.fillStyle = "#0FF";
        ctx.fillText("DEVELOPER", x,y);
        y += tileSize*2;
        ctx.fillStyle = "#777";
        ctx.fillText("ERIC WEBER", x,y);

        y += tileSize*4;
        ctx.fillStyle = "#0FF";
        ctx.fillText("BASED ON WORK BY",x,y);
        y += tileSize*2;
        ctx.fillStyle = "#777";
        ctx.fillText("SHAUN WILLIAMS",x,y);

        y += tileSize*4;
        ctx.fillStyle = "#0FF";
        ctx.fillText("REVERSE-ENGINEERS",x,y);
        y += tileSize*2;
        ctx.fillStyle = "#777";
        ctx.fillText("JAMEY PITTMAN",x,y);
        y += tileSize*2;
        ctx.fillText("BART GRANTHAM",x,y);
    };

    return {
        init: function() {
            menu.enable();
            galagaStars.init();
        },
        draw: function() {
            renderer.clearMapFrame();
            renderer.beginMapClip();
            renderer.renderFunc(galagaStars.draw);
            renderer.renderFunc(drawBody);
            renderer.renderFunc(menu.draw,menu);
            renderer.endMapClip();
        },
        update: function() {
            galagaStars.update();
            menu.update();
        },
        getMenu: function() {
            return menu;
        },
    };

})();

////////////////////////////////////////////////////
// New Game state
// (state when first starting a new game)

var newGameState = (function() {
    var frames;
    var duration = 0;
    var startLevel = 1;

    return {
        init: function() {
            clearCheats();
            frames = 0;
            level = startLevel-1;
            extraLives = practiceMode ? Infinity : 3;
            setScore(0);
            readyNewState.init();
        },
        setStartLevel: function(i) {
            startLevel = i;
        },
        draw: function() {
            if (!map)
                return;
            renderer.blitMap();
            renderer.drawScore();
            renderer.drawMessage("PLAYER ONE", "#0FF", mapDimensions.standard.col / 2, 14);
            renderer.drawReadyMessage();
        },
        update: function() {
            if (frames == duration*60) {
                extraLives--;
                state = readyNewState;
                renderer.drawMap();
            }
            else 
                frames++;
        },
    };
})();

////////////////////////////////////////////////////
// Ready state
// (state when map is displayed and pausing before play)

var readyState =  (function(){
    var frames;
    var duration = 4;
    
    return {
        init: function() {
            audio.startMusic.play();
            var i;
            for (i=0; i<5; i++)
                actors[i].reset();
            ghostCommander.reset();
            fruit.reset();
            energizer.reset();
            map.resetTimeEaten();
            frames = 0;
            vcr.init();
        },
        draw: function() {
            if (!map)
                return;
            renderer.blitMap();
            renderer.drawScore();
            renderer.drawActors();
            renderer.drawReadyMessage();
        },
        update: function() {
            if (frames == duration*60)
                switchState(playState);
            else
                frames++;
        },
    };
})();

////////////////////////////////////////////////////
// Ready New Level state
// (ready state when pausing before new level)

var readyNewState = newChildObject(readyState, {

    init: function() {

        // increment level and ready the next map
        level++;
        setNextTubieManMap();
        map.resetCurrent();
        fruit.onNewLevel();
        renderer.drawMap();

        // notify other objects of new level
        ghostReleaser.onNewLevel();
        elroyTimer.onNewLevel();

        // inherit attributes from readyState
        readyState.init.call(this);
    },
});

////////////////////////////////////////////////////
// Ready Restart Level state
// (ready state when pausing before restarted level)

var readyRestartState = newChildObject(readyState, {

    init: function() {
        extraLives--;
        ghostReleaser.onRestartLevel();
        elroyTimer.onRestartLevel();
        renderer.drawMap();

        // inherit attributes from readyState
        readyState.init.call(this);
    },
});

////////////////////////////////////////////////////
// Play state
// (state when playing the game)

var playState = {
    init: function() { 
        if (practiceMode) {
            vcr.reset();
        }
    },
    draw: function() {
        renderer.setLevelFlash(false);
        renderer.blitMap();
        renderer.drawScore();
        renderer.beginMapClip();
        renderer.drawBonus();
        renderer.drawPaths();
        renderer.drawActors();
        renderer.drawTargets();
        renderer.endMapClip();
    },

    // handles collision between pac-man and ghosts
    // returns true if collision happened
    isPacmanCollide: function() {
        var i,g;
        for (i = 0; i<4; i++) {
            g = ghosts[i];
            if (g.tile.x == player.tile.x && g.tile.y == player.tile.y && g.mode == GHOST_OUTSIDE) {
                if (g.scared) { // eat ghost
                    energizer.addPoints();
                    g.onEaten();
                }
                else if (player.invincible) // pass through ghost
                    continue;
                else // killed by ghost
                    switchState(deadState);
                return true;
            }
        }
        return false;
    },
    update: function() {
        
        if (vcr.isSeeking()) {
            vcr.seek();
        }
        else {
            // record current state
            if (vcr.getMode() == VCR_RECORD) {
                vcr.record();
            }

            var i,j; // loop index
            var maxSteps = 2;
            var skip = false;

            // skip this frame if needed,
            // but update ghosts running home
            if (energizer.showingPoints()) {
                for (j=0; j<maxSteps; j++)
                    for (i=0; i<4; i++)
                        if (ghosts[i].mode == GHOST_GOING_HOME || ghosts[i].mode == GHOST_ENTERING_HOME)
                            ghosts[i].update(j);
                energizer.updatePointsTimer();
                skip = true;
            }
            else { // make ghosts go home immediately after points disappear
                for (i=0; i<4; i++)
                    if (ghosts[i].mode == GHOST_EATEN) {
                        ghosts[i].mode = GHOST_GOING_HOME;
                        ghosts[i].targetting = 'door';
                    }
                    ghosts[0].playSounds();
            }
            
            if (!skip) {

                // update counters
                ghostReleaser.update();
                ghostCommander.update();
                elroyTimer.update();
                fruit.update();
                energizer.update();

                // update actors one step at a time
                for (j=0; j<maxSteps; j++) {

                    // advance player
                    player.update(j);

                    // test collision with fruit
                    fruit.testCollide();

                    // finish level if all dots have been eaten
                    if (map.allDotsEaten()) {
                        //this.draw(); 
                        switchState(finishState);
                        audio.win.play();
                        break;
                    }

                    // test player collision before and after updating ghosts
                    // (redundant to prevent pass-throughs)
                    // (if collision happens, stop immediately.)
                    if (this.isPacmanCollide()) break;
                    for (i=0;i<4;i++) actors[i].update(j);
                    if (this.isPacmanCollide()) break;
                }

                // update frame counts
                for (i=0; i<5; i++)
                    actors[i].frames++;
            }
        }
    },
};

////////////////////////////////////////////////////
// Script state
// (a state that triggers functions at certain times)

var scriptState = (function(){

    return {
        init: function() {
            this.frames = 0;        // frames since state began
            this.triggerFrame = 0;  // frames since last trigger

            var trigger = this.triggers[0];
            this.drawFunc = trigger ? trigger.draw : undefined;   // current draw function
            this.updateFunc = trigger ? trigger.update : undefined; // current update function
        },
        update: function() {

            // if trigger is found for current time,
            // call its init() function
            // and store its draw() and update() functions
            var trigger = this.triggers[this.frames];
            if (trigger) {
                if (trigger.init) trigger.init();
                this.drawFunc = trigger.draw;
                this.updateFunc = trigger.update;
                this.triggerFrame = 0;
            }

            // call the last trigger's update function
            if (this.updateFunc) 
                this.updateFunc(this.triggerFrame);

            this.frames++;
            this.triggerFrame++;
        },
        draw: function() {
            // call the last trigger's draw function
            if (this.drawFunc) 
                this.drawFunc(this.triggerFrame);
        },
    };
})();

////////////////////////////////////////////////////
// Seekable Script state
// (a script state that can be controled by the VCR)

var seekableScriptState = newChildObject(scriptState, {

    init: function() {
        scriptState.init.call(this);
        this.savedFrames = {};
        this.savedTriggerFrame = {};
        this.savedDrawFunc = {};
        this.savedUpdateFunc = {};
    },

    save: function(t) {
        this.savedFrames[t] = this.frames;
        this.savedTriggerFrame[t] = this.triggerFrame;
        this.savedDrawFunc[t] = this.drawFunc;
        this.savedUpdateFunc[t] = this.updateFunc;
    },
    load: function(t) {
        this.frames = this.savedFrames[t];
        this.triggerFrame = this.savedTriggerFrame[t];
        this.drawFunc = this.savedDrawFunc[t];
        this.updateFunc = this.savedUpdateFunc[t];
    },
    update: function() {
        if (vcr.isSeeking()) {
            vcr.seek();
        }
        else {
            if (vcr.getMode() == VCR_RECORD) {
                vcr.record();
            }
            scriptState.update.call(this);
        }
    },
    draw: function() {
        if (this.drawFunc) {
            scriptState.draw.call(this);
        }
    },
});

////////////////////////////////////////////////////
// Dead state
// (state when player has lost a life)

var deadState = (function() {
    
    // this state will always have these drawn
    var commonDraw = function() {
        renderer.blitMap();
        renderer.drawScore();
    };

    return newChildObject(seekableScriptState, {

        // script functions for each time
        triggers: {
            0: { // freeze
                init: function() {
                    audio.die.play();
                },
                update: function() {
                    var i;
                    for (i=0; i<4; i++) 
                        actors[i].frames++; // keep animating ghosts
                },
                draw: function() {
                    commonDraw();
                    renderer.beginMapClip();
                    renderer.drawBonus();
                    renderer.drawActors();
                    renderer.endMapClip();
                }
            },
            60: {
                draw: function() { // isolate player
                    commonDraw();
                    renderer.beginMapClip();
                    renderer.drawPlayer();
                    renderer.endMapClip();
                },
            },
            120: {
                draw: function(t) { // dying animation
                    commonDraw();
                    renderer.beginMapClip();
                    renderer.drawDyingPlayer(t/75);
                    renderer.endMapClip();
                },
            },
            195: {
                draw: function() {
                    commonDraw();
                    renderer.beginMapClip();
                    renderer.drawDyingPlayer(1);
                    renderer.endMapClip();
                },
            },
            240: {
                draw: function() {
                    commonDraw();
                    renderer.beginMapClip();
                    renderer.drawDyingPlayer(1);
                    renderer.endMapClip();
                },
                init: function() { // leave
                    switchState( extraLives == 0 ? overState : readyRestartState);
                }
            },
        },
    });
})();

////////////////////////////////////////////////////
// Finish state
// (state when player has completed a level)

var finishState = (function(){

    // this state will always have these drawn
    var commonDraw = function() {
        renderer.blitMap();
        renderer.drawScore();

        renderer.beginMapClip();
        renderer.drawPlayer();
        renderer.endMapClip();
    };
    
    // flash the floor and draw
    var flashFloorAndDraw = function(on) {
        renderer.setLevelFlash(on);
        commonDraw();
    };

    return newChildObject(seekableScriptState, {

        // script functions for each time
        triggers: {
            0:   { draw: function() {
                    renderer.setLevelFlash(false);
                    renderer.blitMap();
                    renderer.drawScore();
                    renderer.beginMapClip();
                    renderer.drawBonus();
                    renderer.drawActors();
                    renderer.drawTargets();
                    renderer.endMapClip();
            } },
            120:  { draw: function() { flashFloorAndDraw(true); } },
            132: { draw: function() { flashFloorAndDraw(false); } },
            144: { draw: function() { flashFloorAndDraw(true); } },
            156: { draw: function() { flashFloorAndDraw(false); } },
            168: { draw: function() { flashFloorAndDraw(true); } },
            180: { draw: function() { flashFloorAndDraw(false); } },
            192: { draw: function() { flashFloorAndDraw(true); } },
            204: { draw: function() { flashFloorAndDraw(false); } },
            216: {
                init: function() {
                    if (!triggerCutsceneAtEndLevel()) {
                        switchState(readyNewState,60);
                    }
                }
            },
        },
    });
})();

////////////////////////////////////////////////////
// Game Over state
// (state when player has lost last life)

var overState = (function() {
    var frames;
    return {
        init: function() {
            frames = 0;
        },
        draw: function() {
            renderer.blitMap();
            renderer.drawScore();
            renderer.drawMessage("GAME  OVER", "#F00", mapDimensions.standard.col / 2, mapRows / 2 + 4);
        },
        update: function() {
            if (frames == 120) {
                switchState(preNewGameState,60);
            }
            else
                frames++;
        },
    };
})();

