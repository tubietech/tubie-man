
// Copyright 2012 Shaun Williams
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License Version 3 as 
//  published by the Free Software Foundation.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.

// ==========================================================================
// PAC-MAN
// an accurate remake of the original arcade game

// Based on original works by Namco, GCC, and Midway.
// Research by Jamey Pittman and Bart Grantham
// Developed by Shaun Williams, Mason Borda

// ==========================================================================

(function(){

//@line 1 "src/inherit.js"
//  Apparently, the mutable, non-standard __proto__ property creates a lot of complexity for JS optimizers,
//   so it may be phased out in future JS versions.  It's not even supported in Internet Explorer.
//
//  Object.create does everything that I would use a mutable __proto__ for, but this isn't implemented everywhere yet.
// 
//  So instead of the following:
//
//      var obj = {
//          __proto__: parentObj,
//          hello: function() { return "world"; },
//      };
//
//  You can use this:
//
//      var obj = newChildObject(parentObj, {
//          hello: function() { return "world"; },
//      };

var newChildObject = function(parentObj, newObj) {

    // equivalent to: var resultObj = { __proto__: parentObj };
    var x = function(){};
    x.prototype = parentObj;
    var resultObj = new x();

    // store new members in resultObj
    if (newObj) {
        var hasProp = {}.hasOwnProperty;
        for (var name in newObj) {
            if (hasProp.call(newObj, name)) {
                resultObj[name] = newObj[name];
            }
        }
    }

    return resultObj;
};

var DEBUG = false;
//@line 1 "src/sound.js"
/* Sound handlers added by Dr James Freeman who was sad such a great reverse was a silent movie  */

var audio = new preloadAudio();

// Ammount to increase/decrease volume with buttons
const VOLUME_STEP_SIZE = 10;

let globalVolume = 100;

function audioTrack(url, volume) {
    var audio = new Audio(url);
    this.baseVolume = volume !== undefined ? volume : 100;

    if (volume)
        audio.volume = volume * (globalVolume / 100);

    audio.load();
    var looping = false;
    this.play = function(noResetTime) {
        playSound(noResetTime);
    };
    this.startLoop = function(noResetTime) {
        if (looping) return;
        audio.addEventListener('ended', audioLoop);
        audioLoop(noResetTime);
        looping = true;
    };
    this.stopLoop = function(noResetTime) {
        try{ audio.removeEventListener('ended', audioLoop) } catch (e) {};
        audio.pause();
        if (!noResetTime) audio.currentTime = 0;
        looping = false;
    };
    this.isPlaying = function() {
        return !audio.paused;
    };
    this.isPaused = function() {
        return audio.paused;
    }; 
    this.stop = this.stopLoop;

    function audioLoop(noResetTime) {
        playSound(noResetTime);
    }
    function playSound(noResetTime) {
        // for really rapid sound repeat set noResetTime
        if(!audio.paused) {
            audio.pause();
            if (!noResetTime ) audio.currentTime = 0;
        }
        try{
            audio.volume
            var playPromise = audio.play();
            if(playPromise) {
                playPromise.then(function(){}).catch(function(err){});
            }
        } 
        catch(err){ console.error(err) }
    }
    this.updateVolume = function(volume) {
        if(typeof volume !== "number")
            throw new Error("Volume must be a number");

        if(volume < -100 || volume > 100)
            throw new Error("Volume must be a number between -100 and 100 inclusive");

        audio.volume = Math.max(0.0, Math.min(1.0, this.baseVolume * (volume / 100)));
    }
    this.mute = function() {
        audio.muted = true;
    }
    this.unmute = function() {
        audio.muted = false;
    }
    this.toggleMute = function() {
        audio.muted = !audio.muted;
    }
}

/**
"Getting it Done" by Kevin MacLeod (incompetech.com)
"Robobozo" by Kevin MacLeod (incompetech.com)
"Spazzmatica" Kevin MacLeod (incompetech.com)
"Pixel Peeker Polka" Kevin MacLeod (incompetech.com)
"Bit Shift" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
 */

function preloadAudio() {
    this.coffeeBreakMusic  = new audioTrack('sounds/coffee-break-music.mp3');
    this.die               = new audioTrack('sounds/robobozo-death.mp3');
    this.ghostReturnToHome = new audioTrack('sounds/enemy_return.mp3');
    this.eatingEnemy       = new audioTrack('sounds/spazzmatica-powerup.mp3');
    this.ghostTurnToBlue   = new audioTrack('sounds/spazzmatica-running-2.mp3');
    this.eatingBonus       = new audioTrack('sounds/pixel-peeker-polka-bonus.mp3');
    this.enemyMove         = new audioTrack('sounds/chase_2.mp3');
    this.win               = new audioTrack('sounds/win.mp3');
    this.eating            = new audioTrack('sounds/tubie-tubie-8.mp3');
    this.startMusic        = new audioTrack('sounds/bit-shift-clip.mp3');
    this.mainMenuMusic     = new audioTrack('sounds/getting-it-done.mp3');

    this.tracks = [
        this.coffeeBreakMusic, this.die, this.ghostReturnToHome, this.eatingEnemy, 
        this.ghostTurnToBlue, this.eatingBonus, this.enemyMove, this.win,
        this.eating, this.startMusic, this.mainMenuMusic 
    ];

    this.ghostReset = function(noResetTime) {
        for (var s in this) {
            if (s == 'silence' || s == 'ghostReset' ) return;
            if (s.match(/^ghost/) && this[s].hasOwnProperty("stopLoop")) this[s].stopLoop(noResetTime);
        }
    }

    this.silence = function(noResetTime) {
        for (var s in this) {
            if ((s == 'silence' || s == 'ghostReset') || !this[s].hasOwnProperty("stopLoop")) return;
            this[s].stopLoop(noResetTime);
        }
    }

    this.isPlaying = function() {
        return this.tracks
            .map((track) => track.isPlaying())
            .reduce((acc, current) => acc || current, false);
    }
    
    this.setVolume = (volume) => {
        if(typeof volume !== "number")
            throw new Error("Volume must be a number");

        if(volume < -100 || volume > 100)
            throw new Error("Volume must be a number between -100 and 100 inclusive");

        globalVolume = Math.max(0, Math.min(100, volume));
        this.tracks.forEach((track) => track.updateVolume(volume));
    }

    this.changeVolume = (stepSize) => {
        console.log(stepSize);

        if(typeof stepSize !== "number")
            throw new Error("Volume step size must be a number");

        if(stepSize < -100 || stepSize > 100)
            throw new Error("Volume Step size must be a number between -100 and 100 inclusive");

        this.setVolume(Math.max(-100, Math.min(100, globalVolume + stepSize)));
    }

    this.volumeUp = (stepSize) => {
        if(stepSize !== undefined && typeof stepSize !== "number")
            throw new Error("If specifying a volume step size, it must be a number");

        if(stepSize !== undefined && (stepSize < 0 || stepSize > 100))
            throw new Error("Volume Step size must be a number between 0 and 100 inclusive");

        this.changeVolume(Math.min(100, (stepSize !== undefined) ? stepSize : VOLUME_STEP_SIZE));
    }

    this.volumeDown = (stepSize) => {
        if(stepSize !== undefined && typeof stepSize !== "number")
            throw new Error("If specifying a volume step size, it must be a number");

        if(stepSize !== undefined && (stepSize < 0 || stepSize >= 100))
            throw new Error("Volume Step size must be a number between 0 and 100 inclusive");

        this.changeVolume(Math.max(-100, (stepSize !== undefined) ? -stepSize : -VOLUME_STEP_SIZE));
    }

    this.mute = function() {
        this.tracks.forEach((track) => track.mute());
    }

    this.unmute = function() {
        this.tracks.forEach((track) => track.unmute());
    }

    this.toggleMute = function() {
        this.tracks.forEach((track) => track.toggleMute());
    }
}
//@line 1 "src/random.js"

var getRandomColor = function() {
    return '#'+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6);
};

var getRandomInt = function(min,max) {
    return Math.floor(Math.random() * (max-min+1)) + min;
};

//@line 1 "src/game.js"
//////////////////////////////////////////////////////////////////////////////////////
// Game

// game modes
var GAME_PACMAN = 0;
var GAME_MSPACMAN = 1;
var GAME_TUBIE_MAN = 2;
var GAME_OTTO = 3;

var practiceMode = false;
var turboMode = false;

// current game mode
var gameMode = GAME_TUBIE_MAN;
var getGameName = function(){
    return "TUBIE-MAN";
};

var getGameDescription = function() {
    return[
            "A TUBIE THEMED PAC-MAN LIKE GAME",
            "WITH RANDOM LEVELS:",
            "TUBIE TECH (C) 2025",
            "",
            "FORKED FROM THE REPO",
            "github.com/masonicGIT/pacman",
            "SHAUN WILLIAMS (C) 2012",
            "",
            "PAC-MAN CROSSOVER CONCEPT:",
            "TANG YONGFA",
        ];
};

var getEnemyNames = function() {
    return ghosts.map((ghost) => ghost.name)
}

var getEnemyDrawFunc = function() { return atlas.drawSyringeSprite; }

var getPlayerDrawFunc = function() { return atlas.drawTubieManSprite; }


// for clearing, backing up, and restoring cheat states (before and after cutscenes presently)
var clearCheats, backupCheats, restoreCheats;
(function(){
    clearCheats = function() {
        player.invincible = false;
        player.ai = false;
        for (i=0; i<5; i++) {
            actors[i].isDrawPath = false;
            actors[i].isDrawTarget = false;
        }
        executive.setUpdatesPerSecond(60);
    };

    var i, invincible, ai, isDrawPath, isDrawTarget;
    isDrawPath = {};
    isDrawTarget = {};
    backupCheats = function() {
        invincible = player.invincible;
        ai = player.ai;
        for (i=0; i<5; i++) {
            isDrawPath[i] = actors[i].isDrawPath;
            isDrawTarget[i] = actors[i].isDrawTarget;
        }
    };
    restoreCheats = function() {
        player.invincible = invincible;
        player.ai = ai;
        for (i=0; i<5; i++) {
            actors[i].isDrawPath = isDrawPath[i];
            actors[i].isDrawTarget = isDrawTarget[i];
        }
    };
})();

// current level, lives, and score
var level = 1;
var extraLives = 0;

// VCR functions

var savedLevel = {};
var savedExtraLives = {};
var savedHighScore = {};
var savedScore = {};
var savedState = {};

var saveGame = function(t) {
    savedLevel[t] = level;
    savedExtraLives[t] = extraLives;
    savedHighScore[t] = getHighScore();
    savedScore[t] = getScore();
    savedState[t] = state;
};
var loadGame = function(t) {
    level = savedLevel[t];
    if (extraLives != savedExtraLives[t]) {
        extraLives = savedExtraLives[t];
        renderer.drawMap();
    }
    setHighScore(savedHighScore[t]);
    setScore(savedScore[t]);
    state = savedState[t];
};

/// SCORING
// (manages scores and high scores for each game type)
//TODO: Remove non tubie-man scores
var scores = [
    0,0, // pacman
    0,0, // mspac
    0,0, // tubie
    0,0, // otto
    0 ];
var highScores = [
    10000,10000, // pacman
    10000,10000, // mspac
    // 10000,10000, // tubie
    0, 0,
    10000,10000, // otto
    ];

var getScoreIndex = function() {
    if (practiceMode) {
        return 8;
    }
    return gameMode*2 + (turboMode ? 1 : 0);
};

// handle a score increment
var addScore = function(p) {

    // get current scores
    var score = getScore();

    // handle extra life at 10000 points
    if (score < 10000 && score+p >= 10000) {
        extraLives++;
        renderer.drawMap();
    }

    score += p;
    setScore(score);

    if (!practiceMode) {
        if (score > getHighScore()) {
            setHighScore(score);
        }
    }
};

var getScore = function() {
    return scores[getScoreIndex()];
};
var setScore = function(score) {
    scores[getScoreIndex()] = score;
};

var getHighScore = function() {
    return highScores[getScoreIndex()];
};
var setHighScore = function(highScore) {
    highScores[getScoreIndex()] = highScore;
    saveHighScores();
};
// High Score Persistence

var loadHighScores = function() {
    var hs;
    var hslen;
    var i;
    if (localStorage && localStorage.highScores) {
        hs = JSON.parse(localStorage.highScores);
        hslen = hs.length;
        for (i=0; i<hslen; i++) {
            highScores[i] = Math.max(highScores[i],hs[i]);
        }
    }
};
var saveHighScores = function() {
    if (localStorage) {
        localStorage.highScores = JSON.stringify(highScores);
    }
};
//@line 1 "src/direction.js"
//////////////////////////////////////////////////////////////////////////////////////
// Directions
// (variables and utility functions for representing actor heading direction)

// direction enums (in counter-clockwise order)
// NOTE: changing the order of these enums may effect the enums.
//       I've tried abstracting away the uses by creating functions to rotate them.
// NOTE: This order determines tie-breakers in the shortest distance turn logic.
//       (i.e. higher priority turns have lower enum values)
var DIR_UP = 0;
var DIR_LEFT = 1;
var DIR_DOWN = 2;
var DIR_RIGHT = 3;

const Directions = Object.freeze({
    UP: 0,
    LEFT: 1,
    DOWN: 2,
    RIGHT: 3
});

var getClockwiseAngleFromTop = function(dirEnum) {
    return -dirEnum*Math.PI/2;
};

var rotateLeft = function(dirEnum) {
    return (dirEnum+1)%4;
};

var rotateRight = function(dirEnum) {
    return (dirEnum+3)%4;
};

var rotateAboutFace = function(dirEnum) {
    return (dirEnum+2)%4;
};

// get direction enum from a direction vector
var getEnumFromDir = function(dir) {
    if (dir.x==-1) return DIR_LEFT;
    if (dir.x==1) return DIR_RIGHT;
    if (dir.y==-1) return DIR_UP;
    if (dir.y==1) return DIR_DOWN;
};

// set direction vector from a direction enum
var setDirFromEnum = function(dir,dirEnum) {
    if (dirEnum == DIR_UP)         { dir.x = 0; dir.y =-1; }
    else if (dirEnum == DIR_RIGHT)  { dir.x =1; dir.y = 0; }
    else if (dirEnum == DIR_DOWN)  { dir.x = 0; dir.y = 1; }
    else if (dirEnum == DIR_LEFT) { dir.x = -1; dir.y = 0; }
};

// return the direction of the open, surrounding tile closest to our target
var getTurnClosestToTarget = function(tile,targetTile,openTiles) {

    var dx,dy,dist;                      // variables used for euclidean distance
    var minDist = Infinity;              // variable used for finding minimum distance path
    var dir = {};
    var dirEnum = 0;
    var i;
    for (i=0; i<4; i++) {
        if (openTiles[i]) {
            setDirFromEnum(dir,i);
            dx = dir.x + tile.x - targetTile.x;
            dy = dir.y + tile.y - targetTile.y;
            dist = dx*dx+dy*dy;
            if (dist < minDist) {
                minDist = dist;
                dirEnum = i;
            }
        }
    }
    return dirEnum;
};

// retrieve four surrounding tiles and indicate whether they are open
var getOpenTiles = function(tile,dirEnum) {

    // get open passages
    var openTiles = {};
    openTiles[DIR_UP] =    map.isFloorTile(tile.x, tile.y-1);
    openTiles[DIR_RIGHT] = map.isFloorTile(tile.x+1, tile.y);
    openTiles[DIR_DOWN] =  map.isFloorTile(tile.x, tile.y+1);
    openTiles[DIR_LEFT] =  map.isFloorTile(tile.x-1, tile.y);

    var numOpenTiles = 0;
    var i;
    if (dirEnum != undefined) {

        // count number of open tiles
        for (i=0; i<4; i++)
            if (openTiles[i])
                numOpenTiles++;

        // By design, no mazes should have dead ends,
        // but allow player to turn around if and only if it's necessary.
        // Only close the passage behind the player if there are other openings.
        var oppDirEnum = rotateAboutFace(dirEnum); // current opposite direction enum
        if (numOpenTiles > 1)
            openTiles[oppDirEnum] = false;
    }

    return openTiles;
};

// returns if the given tile coordinate plus the given direction vector has a walkable floor tile
var isNextTileFloor = function(tile,dir) {
    return map.isFloorTile(tile.x+dir.x,tile.y+dir.y);
};

//@line 1 "src/Map.js"
//////////////////////////////////////////////////////////////////////////////////////
// Map
// (an ascii map of tiles representing a level maze)

// size of a square tile in pixels
var tileSize = 8;

// the center pixel of a tile
var midTile = {x:3, y:4};

// constructor
var Map = function(numCols, numRows, tiles) {

    // sizes
    this.numCols = numCols;
    this.numRows = numRows;
    this.numTiles = numCols*numRows;
    this.widthPixels = numCols*tileSize;
    this.heightPixels = numRows*tileSize;

    // ascii map
    this.tiles = tiles;

    // ghost home location
    this.doorTile = {x:13, y:14};
    this.doorPixel = {
        x:(this.doorTile.x+1)*tileSize-1, 
        y:this.doorTile.y*tileSize + midTile.y
    };
    this.homeTopPixel = 17*tileSize;
    this.homeBottomPixel = 18*tileSize;

    this.timeEaten = {};

    this.resetCurrent();
    this.parseDots();
    this.parseTunnels();
    this.parseWalls();
};

Map.prototype.save = function(t) {
};

Map.prototype.eraseFuture = function(t) {
    // current state at t.
    // erase all states after t.
    var i;
    for (i=0; i<this.numTiles; i++) {
        if (t <= this.timeEaten[i]) {
            delete this.timeEaten[i];
        }
    }
};

Map.prototype.load = function(t,abs_t) {
    var firstTile,curTile;
    var refresh = function(i) {
        var x,y;
        x = i%this.numCols;
        y = Math.floor(i/this.numCols);
        renderer.refreshPellet(x,y);
    };
    var i;
    for (i=0; i<this.numTiles; i++) {
        firstTile = this.startTiles[i];
        if (firstTile == '.' || firstTile == 'o') {
            if (abs_t <= this.timeEaten[i]) { // dot should be present
                if (this.currentTiles[i] != firstTile) {
                    this.dotsEaten--;
                    this.currentTiles[i] = firstTile;
                    refresh.call(this,i);
                }
            }
            else if (abs_t > this.timeEaten[i]) { // dot should be missing
                if (this.currentTiles[i] != ' ') {
                    this.dotsEaten++;
                    this.currentTiles[i] = ' ';
                    refresh.call(this,i);
                }
            }
        }
    }
};

Map.prototype.resetTimeEaten = function()
{
    this.startTiles = this.currentTiles.slice(0);
    this.timeEaten = {};
};

// reset current tiles
Map.prototype.resetCurrent = function() {
    this.currentTiles = this.tiles.split(""); // create a mutable list copy of an immutable string
    this.dotsEaten = 0;
};

// This is a procedural way to generate original-looking maps from a simple ascii tile
// map without a spritesheet.
Map.prototype.parseWalls = function() {

    var that = this;

    // creates a list of drawable canvas paths to render the map walls
    this.paths = [];

    // a map of wall tiles that already belong to a built path
    var visited = {};

    // we extend the x range to suggest the continuation of the tunnels
    var toIndex = function(x,y) {
        if (x>=-2 && x<that.numCols+2 && y>=0 && y<that.numRows)
            return (x+2)+y*(that.numCols+4);
    };

    // a map of which wall tiles that are not completely surrounded by other wall tiles
    var edges = {};
    var i=0,x,y;
    for (y=0;y<this.numRows;y++) {
        for (x=-2;x<this.numCols+2;x++,i++) {
            if (this.getTile(x,y) == '|' &&
                (this.getTile(x-1,y) != '|' ||
                this.getTile(x+1,y) != '|' ||
                this.getTile(x,y-1) != '|' ||
                this.getTile(x,y+1) != '|' ||
                this.getTile(x-1,y-1) != '|' ||
                this.getTile(x-1,y+1) != '|' ||
                this.getTile(x+1,y-1) != '|' ||
                this.getTile(x+1,y+1) != '|')) {
                edges[i] = true;
            }
        }
    }

    // walks along edge wall tiles starting at the given index to build a canvas path
    var makePath = function(tx,ty) {

        // get initial direction
        var dir = {};
        var dirEnum;
        if (toIndex(tx+1,ty) in edges)
            dirEnum = DIR_RIGHT;
        else if (toIndex(tx, ty+1) in edges)
            dirEnum = DIR_DOWN;
        else
            throw "tile shouldn't be 1x1 at "+tx+","+ty;
        setDirFromEnum(dir,dirEnum);

        // increment to next tile
        tx += dir.x;
        ty += dir.y;

        // backup initial location and direction
        var init_tx = tx;
        var init_ty = ty;
        var init_dirEnum = dirEnum;

        var path = [];
        var pad; // (persists for each call to getStartPoint)
        var point;
        var lastPoint;

        var turn,turnAround;

        /*

           We employ the 'right-hand rule' by keeping our right hand in contact
           with the wall to outline an individual wall piece.

           Since we parse the tiles in row major order, we will always start
           walking along the wall at the leftmost tile of its topmost row.  We
           then proceed walking to the right.  

           When facing the direction of the walk at each tile, the outline will
           hug the left side of the tile unless there is a walkable tile to the
           left.  In that case, there will be a padding distance applied.
           
        */
        var getStartPoint = function(tx,ty,dirEnum) {
            var dir = {};
            setDirFromEnum(dir, dirEnum);
            if (!(toIndex(tx+dir.y,ty-dir.x) in edges))
                pad = that.isFloorTile(tx+dir.y,ty-dir.x) ? 5 : 0;
            var px = -tileSize/2+pad;
            var py = tileSize/2;
            var a = getClockwiseAngleFromTop(dirEnum);
            var c = Math.cos(a);
            var s = Math.sin(a);
            return {
                // the first expression is the rotated point centered at origin
                // the second expression is to translate it to the tile
                x:(px*c - py*s) + (tx+0.5)*tileSize,
                y:(px*s + py*c) + (ty+0.5)*tileSize,
            };
        };
        while (true) {
            
            visited[toIndex(tx,ty)] = true;

            // determine start point
            point = getStartPoint(tx,ty,dirEnum);

            if (turn) {
                // if we're turning into this tile, create a control point for the curve
                //
                // >---+  <- control point
                //     |
                //     V
                lastPoint = path[path.length-1];
                if (dir.x == 0) {
                    point.cx = point.x;
                    point.cy = lastPoint.y;
                }
                else {
                    point.cx = lastPoint.x;
                    point.cy = point.y;
                }
            }

            // update direction
            turn = false;
            turnAround = false;
            if (toIndex(tx+dir.y, ty-dir.x) in edges) { // turn left
                dirEnum = rotateLeft(dirEnum);
                turn = true;
            }
            else if (toIndex(tx+dir.x, ty+dir.y) in edges) { // continue straight
            }
            else if (toIndex(tx-dir.y, ty+dir.x) in edges) { // turn right
                dirEnum = rotateRight(dirEnum);
                turn = true;
            }
            else { // turn around
                dirEnum = rotateAboutFace(dirEnum);
                turnAround = true;
            }
            setDirFromEnum(dir,dirEnum);

            // commit path point
            path.push(point);

            // special case for turning around (have to connect more dots manually)
            if (turnAround) {
                path.push(getStartPoint(tx-dir.x, ty-dir.y, rotateAboutFace(dirEnum)));
                path.push(getStartPoint(tx, ty, dirEnum));
            }

            // advance to the next wall
            tx += dir.x;
            ty += dir.y;

            // exit at full cycle
            if (tx==init_tx && ty==init_ty && dirEnum == init_dirEnum) {
                that.paths.push(path);
                break;
            }
        }
    };

    // iterate through all edges, making a new path after hitting an unvisited wall edge
    i=0;
    for (y=0;y<this.numRows;y++)
        for (x=-2;x<this.numCols+2;x++,i++)
            if (i in edges && !(i in visited)) {
                visited[i] = true;
                makePath(x,y);
            }
};

// count pellets and store energizer locations
Map.prototype.parseDots = function() {

    this.numDots = 0;
    this.numEnergizers = 0;
    this.energizers = [];

    var x,y;
    var i = 0;
    var tile;
    for (y=0; y<this.numRows; y++) for (x=0; x<this.numCols; x++) {
        tile = this.tiles[i];
        if (tile == '.') {
            this.numDots++;
        }
        else if (tile == 'o') {
            this.numDots++;
            this.numEnergizers++;
            this.energizers.push({'x':x,'y':y});
        }
        i++;
    }
};

// get remaining dots left
Map.prototype.dotsLeft = function() {
    return this.numDots - this.dotsEaten;
};

// determine if all dots have been eaten
Map.prototype.allDotsEaten = function() {
    return this.dotsLeft() == 0;
};

// create a record of tunnel locations
Map.prototype.parseTunnels = (function(){
    
    // starting from x,y and increment x by dx...
    // determine where the tunnel entrance begins
    var getTunnelEntrance = function(x,y,dx) {
        while (!this.isFloorTile(x,y-1) && !this.isFloorTile(x,y+1) && this.isFloorTile(x,y))
            x += dx;
        return x;
    };

    // the number of margin tiles outside of the map on one side of a tunnel
    // There are (2*marginTiles) tiles outside of the map per tunnel.
    var marginTiles = 2;

    return function() {
        this.tunnelRows = {};
        var y;
        var i;
        var left,right;
        for (y=0;y<this.numRows;y++)
            // a map row is a tunnel if opposite ends are both walkable tiles
            if (this.isFloorTile(0,y) && this.isFloorTile(this.numCols-1,y))
                this.tunnelRows[y] = {
                    'leftEntrance': getTunnelEntrance.call(this,0,y,1),
                    'rightEntrance':getTunnelEntrance.call(this,this.numCols-1,y,-1),
                    'leftExit': -marginTiles*tileSize,
                    'rightExit': (this.numCols+marginTiles)*tileSize-1,
                };
    };
})();

// teleport actor to other side of tunnel if necessary
Map.prototype.teleport = function(actor){
    var i;
    var t = this.tunnelRows[actor.tile.y];
    if (t) {
        if (actor.pixel.x < t.leftExit)       actor.pixel.x = t.rightExit;
        else if (actor.pixel.x > t.rightExit) actor.pixel.x = t.leftExit;
    }
};

Map.prototype.posToIndex = function(x,y) {
    if (x>=0 && x<this.numCols && y>=0 && y<this.numRows) 
        return x+y*this.numCols;
};

// define which tiles are inside the tunnel
Map.prototype.isTunnelTile = function(x,y) {
    var tunnel = this.tunnelRows[y];
    return tunnel && (x < tunnel.leftEntrance || x > tunnel.rightEntrance);
};

// retrieves tile character at given coordinate
// extended to include offscreen tunnel space
Map.prototype.getTile = function(x,y) {
    if (x>=0 && x<this.numCols && y>=0 && y<this.numRows) 
        return this.currentTiles[this.posToIndex(x,y)];
    if ((x<0 || x>=this.numCols) && (this.isTunnelTile(x,y-1) || this.isTunnelTile(x,y+1)))
        return '|';
    if (this.isTunnelTile(x,y))
        return ' ';
};

// determines if the given character is a walkable floor tile
Map.prototype.isFloorTileChar = function(tile) {
    return tile==' ' || tile=='.' || tile=='o';
};

// determines if the given tile coordinate has a walkable floor tile
Map.prototype.isFloorTile = function(x,y) {
    return this.isFloorTileChar(this.getTile(x,y));
};

// mark the dot at the given coordinate eaten
Map.prototype.onDotEat = function(x,y) {
    this.dotsEaten++;
    var i = this.posToIndex(x,y);
    this.currentTiles[i] = ' ';
    this.timeEaten[i] = vcr.getTime();
    renderer.erasePellet(x,y);
};
//@line 1 "src/colors.js"
// source: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    r *= 255;
    g *= 255;
    b *= 255;

    return [r,g,b];
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    r *= 255;
    g *= 255;
    b *= 255;

    return [r,g,b];
}

function rgbString(rgb) {
    var r = Math.floor(rgb[0]);
    var g = Math.floor(rgb[1]);
    var b = Math.floor(rgb[2]);
    return 'rgb('+r+','+g+','+b+')';
}
//@line 1 "src/mapgen.js"
var mapgen = (function(){

    var shuffle = function(list) {
        var len = list.length;
        var i,j;
        var temp;
        for (i=0; i<len; i++) {
            j = getRandomInt(0,len-1);
            temp = list[i];
            list[i] = list[j];
            list[j] = temp;
        }
    };

    var randomElement = function(list) {
        var len = list.length;
        if (len > 0) {
            return list[getRandomInt(0,len-1)];
        }
    };

    var UP = 0;
    var RIGHT = 1;
    var DOWN = 2;
    var LEFT = 3;

    var cells = [];
    var tallRows = [];
    var narrowCols = [];

    var rows = 9;
    var cols = 5;

    var reset = function() {
        var i;
        var c;

        // initialize cells
        for (i=0; i<rows*cols; i++) {
            cells[i] = {
                x: i%cols,
                y: Math.floor(i/cols),
                filled: false,
                connect: [false, false, false, false],
                next: [],
                no: undefined,
                group: undefined,
            };
        }

        // allow each cell to refer to surround cells by direction
        for (i=0; i<rows*cols; i++) {
            var c = cells[i];
            if (c.x > 0)
                c.next[LEFT] = cells[i-1];
            if (c.x < cols - 1)
                c.next[RIGHT] = cells[i+1];
            if (c.y > 0)
                c.next[UP] = cells[i-cols];
            if (c.y < rows - 1)
                c.next[DOWN] = cells[i+cols];
        }

        // define the ghost home square

        i = 3*cols;
        c = cells[i];
        c.filled=true;
        c.connect[LEFT] = c.connect[RIGHT] = c.connect[DOWN] = true;

        i++;
        c = cells[i];
        c.filled=true;
        c.connect[LEFT] = c.connect[DOWN] = true;

        i+=cols-1;
        c = cells[i];
        c.filled=true;
        c.connect[LEFT] = c.connect[UP] = c.connect[RIGHT] = true;

        i++;
        c = cells[i];
        c.filled=true;
        c.connect[UP] = c.connect[LEFT] = true;
    };

    var genRandom = function() {

        var getLeftMostEmptyCells = function() {
            var x;
            var leftCells = [];
            for (x=0; x<cols; x++) {
                for (y=0; y<rows; y++) {
                    var c = cells[x+y*cols];
                    if (!c.filled) {
                        leftCells.push(c);
                    }
                }

                if (leftCells.length > 0) {
                    break;
                }
            }
            return leftCells;
        };
        var isOpenCell = function(cell,i,prevDir,size) {

            // prevent wall from going through starting position
            if (cell.y == 6 && cell.x == 0 && i == DOWN ||
                cell.y == 7 && cell.x == 0 && i == UP) {
                return false;
            }

            // prevent long straight pieces of length 3
            if (size == 2 && (i==prevDir || rotateAboutFace(i)==prevDir)) {
                return false;
            }

            // examine an adjacent empty cell
            if (cell.next[i] && !cell.next[i].filled) {
                
                // only open if the cell to the left of it is filled
                if (cell.next[i].next[LEFT] && !cell.next[i].next[LEFT].filled) {
                }
                else {
                    return true;
                }
            }

            return false;
        };
        var getOpenCells = function(cell,prevDir,size) {
            var openCells = [];
            var numOpenCells = 0;
            for (i=0; i<4; i++) {
                if (isOpenCell(cell,i,prevDir,size)) {
                    openCells.push(i);
                    numOpenCells++;
                }
            }
            return { openCells: openCells, numOpenCells: numOpenCells };
        };
        var connectCell = function(cell,dir) {
            cell.connect[dir] = true;
            cell.next[dir].connect[rotateAboutFace(dir)] = true;
            if (cell.x == 0 && dir == RIGHT) {
                cell.connect[LEFT] = true;
            }
        };

        var gen = function() {
        
            var cell;      // cell at the center of growth (open cells are chosen around this cell)
            var newCell;   // most recent cell filled
            var firstCell; // the starting cell of the current group

            var openCells;    // list of open cells around the center cell
            var numOpenCells; // size of openCells

            var dir; // the most recent direction of growth relative to the center cell
            var i;   // loop control variable used for iterating directions

            var numFilled = 0;  // current count of total cells filled
            var numGroups;      // current count of cell groups created
            var size;           // current number of cells in the current group
            var probStopGrowingAtSize = [ // probability of stopping growth at sizes...
                    0,     // size 0
                    0,     // size 1
                    0.10,  // size 2
                    0.5,   // size 3
                    0.75,  // size 4
                    1];    // size 5

            // A single cell group of size 1 is allowed at each row at y=0 and y=rows-1,
            // so keep count of those created.
            var singleCount = {};
            singleCount[0] = singleCount[rows-1] = 0;
            var probTopAndBotSingleCellJoin = 0.35;

            // A count and limit of the number long pieces (i.e. an "L" of size 4 or "T" of size 5)
            var longPieces = 0;
            var maxLongPieces = 1;
            var probExtendAtSize2 = 1;
            var probExtendAtSize3or4 = 0.5;

            var fillCell = function(cell) {
                cell.filled = true;
                cell.no = numFilled++;
                cell.group = numGroups;
            };

            for (numGroups=0; ; numGroups++) {

                // find all the leftmost empty cells
                openCells = getLeftMostEmptyCells();

                // stop add pieces if there are no more empty cells.
                numOpenCells = openCells.length;
                if (numOpenCells == 0) {
                    break;
                }

                // choose the center cell to be a random open cell, and fill it.
                firstCell = cell = openCells[getRandomInt(0,numOpenCells-1)];
                fillCell(cell);

                // randomly allow one single-cell piece on the top or bottom of the map.
                if (cell.x < cols-1 && (cell.y in singleCount) && Math.random() <= probTopAndBotSingleCellJoin) {
                    if (singleCount[cell.y] == 0) {
                        cell.connect[cell.y == 0 ? UP : DOWN] = true;
                        singleCount[cell.y]++;
                        continue;
                    }
                }

                // number of cells in this contiguous group
                size = 1;

                if (cell.x == cols-1) {
                    // if the first cell is at the right edge, then don't grow it.
                    cell.connect[RIGHT] = true;
                    cell.isRaiseHeightCandidate = true;
                }
                else {
                    // only allow the piece to grow to 5 cells at most.
                    while (size < 5) {

                        var stop = false;

                        if (size == 2) {
                            // With a horizontal 2-cell group, try to turn it into a 4-cell "L" group.
                            // This is done here because this case cannot be reached when a piece has already grown to size 3.
                            var c = firstCell;
                            if (c.x > 0 && c.connect[RIGHT] && c.next[RIGHT] && c.next[RIGHT].next[RIGHT]) {
                                if (longPieces < maxLongPieces && Math.random() <= probExtendAtSize2) {

                                    c = c.next[RIGHT].next[RIGHT];
                                    var dirs = {};
                                    if (isOpenCell(c,UP)) {
                                        dirs[UP] = true;
                                    }
                                    if (isOpenCell(c,DOWN)) {
                                        dirs[DOWN] = true;
                                    }

                                    if (dirs[UP] && dirs[DOWN]) {
                                        i = [UP,DOWN][getRandomInt(0,1)];
                                    }
                                    else if (dirs[UP]) {
                                        i = UP;
                                    }
                                    else if (dirs[DOWN]) {
                                        i = DOWN;
                                    }
                                    else {
                                        i = undefined;
                                    }

                                    if (i != undefined) {
                                        connectCell(c,LEFT);
                                        fillCell(c);
                                        connectCell(c,i);
                                        fillCell(c.next[i]);
                                        longPieces++;
                                        size+=2;
                                        stop = true;
                                    }
                                }
                            }
                        }

                        if (!stop) {
                            // find available open adjacent cells.
                            var result = getOpenCells(cell,dir,size);
                            openCells = result['openCells'];
                            numOpenCells = result['numOpenCells'];

                            // if no open cells found from center point, then use the last cell as the new center
                            // but only do this if we are of length 2 to prevent numerous short pieces.
                            // then recalculate the open adjacent cells.
                            if (numOpenCells == 0 && size == 2) {
                                cell = newCell;
                                result = getOpenCells(cell,dir,size);
                                openCells = result['openCells'];
                                numOpenCells = result['numOpenCells'];
                            }

                            // no more adjacent cells, so stop growing this piece.
                            if (numOpenCells == 0) {
                                stop = true;
                            }
                            else {
                                // choose a random valid direction to grow.
                                dir = openCells[getRandomInt(0,numOpenCells-1)];
                                newCell = cell.next[dir];

                                // connect the cell to the new cell.
                                connectCell(cell,dir);

                                // fill the cell
                                fillCell(newCell);

                                // increase the size count of this piece.
                                size++;

                                // don't let center pieces grow past 3 cells
                                if (firstCell.x == 0 && size == 3) {
                                    stop = true;
                                }

                                // Use a probability to determine when to stop growing the piece.
                                if (Math.random() <= probStopGrowingAtSize[size]) {
                                    stop = true;
                                }
                            }
                        }

                        // Close the piece.
                        if (stop) {

                            if (size == 1) {
                                // This is provably impossible because this loop is never entered with size==1.
                            }
                            else if (size == 2) {

                                // With a vertical 2-cell group, attach to the right wall if adjacent.
                                var c = firstCell;
                                if (c.x == cols-1) {

                                    // select the top cell
                                    if (c.connect[UP]) {
                                        c = c.next[UP];
                                    }
                                    c.connect[RIGHT] = c.next[DOWN].connect[RIGHT] = true;
                                }
                                
                            }
                            else if (size == 3 || size == 4) {

                                // Try to extend group to have a long leg
                                if (longPieces < maxLongPieces && firstCell.x > 0 && Math.random() <= probExtendAtSize3or4) {
                                    var dirs = [];
                                    var dirsLength = 0;
                                    for (i=0; i<4; i++) {
                                        if (cell.connect[i] && isOpenCell(cell.next[i],i)) {
                                            dirs.push(i);
                                            dirsLength++;
                                        }
                                    }
                                    if (dirsLength > 0) {
                                        i = dirs[getRandomInt(0,dirsLength-1)];
                                        c = cell.next[i];
                                        connectCell(c,i);
                                        fillCell(c.next[i]);
                                        longPieces++;
                                    }
                                }
                            }

                            break;
                        }
                    }
                }
            }
            setResizeCandidates();
        };


        var setResizeCandidates = function() {
            var i;
            var c,q,c2,q2;
            var x,y;
            for (i=0; i<rows*cols; i++) {
                c = cells[i];
                x = i % cols;
                y = Math.floor(i/cols);

                // determine if it has flexible height

                //
                // |_|
                //
                // or
                //  _
                // | |
                //
                q = c.connect;
                if ((c.x == 0 || !q[LEFT]) &&
                    (c.x == cols-1 || !q[RIGHT]) &&
                    q[UP] != q[DOWN]) {
                    c.isRaiseHeightCandidate = true;
                }

                //  _ _
                // |_ _|
                //
                c2 = c.next[RIGHT];
                if (c2 != undefined) {
                    q2 = c2.connect;
                    if (((c.x == 0 || !q[LEFT]) && !q[UP] && !q[DOWN]) &&
                        ((c2.x == cols-1 || !q2[RIGHT]) && !q2[UP] && !q2[DOWN])
                        ) {
                        c.isRaiseHeightCandidate = c2.isRaiseHeightCandidate = true;
                    }
                }

                // determine if it has flexible width

                // if cell is on the right edge with an opening to the right
                if (c.x == cols-1 && q[RIGHT]) {
                    c.isShrinkWidthCandidate = true;
                }

                //  _
                // |_
                // 
                // or
                //  _
                //  _|
                //
                if ((c.y == 0 || !q[UP]) &&
                    (c.y == rows-1 || !q[DOWN]) &&
                    q[LEFT] != q[RIGHT]) {
                    c.isShrinkWidthCandidate = true;
                }

            }
        };

        // Identify if a cell is the center of a cross.
        var cellIsCrossCenter = function(c) {
            return c.connect[UP] && c.connect[RIGHT] && c.connect[DOWN] && c.connect[LEFT];
        };

        var chooseNarrowCols = function() {

            var canShrinkWidth = function(x,y) {

                // Can cause no more tight turns.
                if (y==rows-1) {
                    return true;
                }

                // get the right-hand-side bound
                var x0;
                var c,c2;
                for (x0=x; x0<cols; x0++) {
                    c = cells[x0+y*cols];
                    c2 = c.next[DOWN]
                    if ((!c.connect[RIGHT] || cellIsCrossCenter(c)) &&
                        (!c2.connect[RIGHT] || cellIsCrossCenter(c2))) {
                        break;
                    }
                }

                // build candidate list
                var candidates = [];
                var numCandidates = 0;
                for (; c2; c2=c2.next[LEFT]) {
                    if (c2.isShrinkWidthCandidate) {
                        candidates.push(c2);
                        numCandidates++;
                    }

                    // cannot proceed further without causing irreconcilable tight turns
                    if ((!c2.connect[LEFT] || cellIsCrossCenter(c2)) &&
                        (!c2.next[UP].connect[LEFT] || cellIsCrossCenter(c2.next[UP]))) {
                        break;
                    }
                }
                shuffle(candidates);

                var i;
                for (i=0; i<numCandidates; i++) {
                    c2 = candidates[i];
                    if (canShrinkWidth(c2.x,c2.y)) {
                        c2.shrinkWidth = true;
                        narrowCols[c2.y] = c2.x;
                        return true;
                    }
                }

                return false;
            };

            var x;
            var c;
            for (x=cols-1; x>=0; x--) {
                c = cells[x];
                if (c.isShrinkWidthCandidate && canShrinkWidth(x,0)) {
                    c.shrinkWidth = true;
                    narrowCols[c.y] = c.x;
                    return true;
                }
            }

            return false;
        };

        var chooseTallRows = function() {

            var canRaiseHeight = function(x,y) {

                // Can cause no more tight turns.
                if (x==cols-1) {
                    return true;
                }

                // find the first cell below that will create too tight a turn on the right
                var y0;
                var c;
                var c2;
                for (y0=y; y0>=0; y0--) {
                    c = cells[x+y0*cols];
                    c2 = c.next[RIGHT]
                    if ((!c.connect[UP] || cellIsCrossCenter(c)) && 
                        (!c2.connect[UP] || cellIsCrossCenter(c2))) {
                        break;
                    }
                }

                // Proceed from the right cell upwards, looking for a cell that can be raised.
                var candidates = [];
                var numCandidates = 0;
                for (; c2; c2=c2.next[DOWN]) {
                    if (c2.isRaiseHeightCandidate) {
                        candidates.push(c2);
                        numCandidates++;
                    }

                    // cannot proceed further without causing irreconcilable tight turns
                    if ((!c2.connect[DOWN] || cellIsCrossCenter(c2)) &&
                        (!c2.next[LEFT].connect[DOWN] || cellIsCrossCenter(c2.next[LEFT]))) {
                        break;
                    }
                }
                shuffle(candidates);

                var i;
                for (i=0; i<numCandidates; i++) {
                    c2 = candidates[i];
                    if (canRaiseHeight(c2.x,c2.y)) {
                        c2.raiseHeight = true;
                        tallRows[c2.x] = c2.y;
                        return true;
                    }
                }

                return false;
            };

            // From the top left, examine cells below until hitting top of ghost house.
            // A raisable cell must be found before the ghost house.
            var y;
            var c;
            for (y=0; y<3; y++) {
                c = cells[y*cols];
                if (c.isRaiseHeightCandidate && canRaiseHeight(0,y)) {
                    c.raiseHeight = true;
                    tallRows[c.x] = c.y;
                    return true;
                }
            }

            return false;
        };

        // This is a function to detect impurities in the map that have no heuristic implemented to avoid it yet in gen().
        var isDesirable = function() {

            // ensure a solid top right corner
            var c = cells[4];
            if (c.connect[UP] || c.connect[RIGHT]) {
                return false;
            }

            // ensure a solid bottom right corner
            c = cells[rows*cols-1];
            if (c.connect[DOWN] || c.connect[RIGHT]) {
                return false;
            }

            // ensure there are no two stacked/side-by-side 2-cell pieces.
            var isHori = function(x,y) {
                var q1 = cells[x+y*cols].connect;
                var q2 = cells[x+1+y*cols].connect;
                return !q1[UP] && !q1[DOWN] && (x==0 || !q1[LEFT]) && q1[RIGHT] && 
                       !q2[UP] && !q2[DOWN] && q2[LEFT] && !q2[RIGHT];
            };
            var isVert = function(x,y) {
                var q1 = cells[x+y*cols].connect;
                var q2 = cells[x+(y+1)*cols].connect;
                if (x==cols-1) {
                    // special case (we can consider two single cells as vertical at the right edge)
                    return !q1[LEFT] && !q1[UP] && !q1[DOWN] &&
                           !q2[LEFT] && !q2[UP] && !q2[DOWN];
                }
                return !q1[LEFT] && !q1[RIGHT] && !q1[UP] && q1[DOWN] && 
                       !q2[LEFT] && !q2[RIGHT] && q2[UP] && !q2[DOWN];
            };
            var x,y;
            var g;
            for (y=0; y<rows-1; y++) {
                for (x=0; x<cols-1; x++) {
                    if (isHori(x,y) && isHori(x,y+1) ||
                        isVert(x,y) && isVert(x+1,y)) {

                        // don't allow them in the middle because they'll be two large when reflected.
                        if (x==0) {
                            return false;
                        }

                        // Join the four cells to create a square.
                        cells[x+y*cols].connect[DOWN] = true;
                        cells[x+y*cols].connect[RIGHT] = true;
                        g = cells[x+y*cols].group;

                        cells[x+1+y*cols].connect[DOWN] = true;
                        cells[x+1+y*cols].connect[LEFT] = true;
                        cells[x+1+y*cols].group = g;

                        cells[x+(y+1)*cols].connect[UP] = true;
                        cells[x+(y+1)*cols].connect[RIGHT] = true;
                        cells[x+(y+1)*cols].group = g;

                        cells[x+1+(y+1)*cols].connect[UP] = true;
                        cells[x+1+(y+1)*cols].connect[LEFT] = true;
                        cells[x+1+(y+1)*cols].group = g;
                    }
                }
            }

            if (!chooseTallRows()) {
                return false;
            }

            if (!chooseNarrowCols()) {
                return false;
            }

            return true;
        };

        // set the final position and size of each cell when upscaling the simple model to actual size
        var setUpScaleCoords = function() {
            var i,c;
            for (i=0; i<rows*cols; i++) {
                c = cells[i];
                c.final_x = c.x*3;
                if (narrowCols[c.y] < c.x) {
                    c.final_x--;
                }
                c.final_y = c.y*3;
                if (tallRows[c.x] < c.y) {
                    c.final_y++;
                }
                c.final_w = c.shrinkWidth ? 2 : 3;
                c.final_h = c.raiseHeight ? 4 : 3;
            }
        };

        var reassignGroup = function(oldg,newg) {
            var i;
            var c;
            for (i=0; i<rows*cols; i++) {
                c = cells[i];
                if (c.group == oldg) {
                    c.group = newg;
                }
            }
        };

        var createTunnels = function() {

            // declare candidates
            var singleDeadEndCells = [];
            var topSingleDeadEndCells = [];
            var botSingleDeadEndCells = [];

            var voidTunnelCells = [];
            var topVoidTunnelCells = [];
            var botVoidTunnelCells = [];

            var edgeTunnelCells = [];
            var topEdgeTunnelCells = [];
            var botEdgeTunnelCells = [];

            var doubleDeadEndCells = [];

            var numTunnelsCreated = 0;

            // prepare candidates
            var y;
            var c;
            var upDead;
            var downDead;
            for (y=0; y<rows; y++) {
                c = cells[cols-1+y*cols];
                if (c.connect[UP]) {
                    continue;
                }
                if (c.y > 1 && c.y < rows-2) {
                    c.isEdgeTunnelCandidate = true;
                    edgeTunnelCells.push(c);
                    if (c.y <= 2) {
                        topEdgeTunnelCells.push(c);
                    }
                    else if (c.y >= 5) {
                        botEdgeTunnelCells.push(c);
                    }
                }
                upDead = (!c.next[UP] || c.next[UP].connect[RIGHT]);
                downDead = (!c.next[DOWN] || c.next[DOWN].connect[RIGHT]);
                if (c.connect[RIGHT]) {
                    if (upDead) {
                        c.isVoidTunnelCandidate = true;
                        voidTunnelCells.push(c);
                        if (c.y <= 2) {
                            topVoidTunnelCells.push(c);
                        }
                        else if (c.y >= 6) {
                            botVoidTunnelCells.push(c);
                        }
                    }
                }
                else {
                    if (c.connect[DOWN]) {
                        continue;
                    }
                    if (upDead != downDead) {
                        if (!c.raiseHeight && y < rows-1 && !c.next[LEFT].connect[LEFT]) {
                            singleDeadEndCells.push(c);
                            c.isSingleDeadEndCandidate = true;
                            c.singleDeadEndDir = upDead ? UP : DOWN;
                            var offset = upDead ? 1 : 0;
                            if (c.y <= 1+offset) {
                                topSingleDeadEndCells.push(c);
                            }
                            else if (c.y >= 5+offset) {
                                botSingleDeadEndCells.push(c);
                            }
                        }
                    }
                    else if (upDead && downDead) {
                        if (y > 0 && y < rows-1) {
                            if (c.next[LEFT].connect[UP] && c.next[LEFT].connect[DOWN]) {
                                c.isDoubleDeadEndCandidate = true;
                                if (c.y >= 2 && c.y <= 5) {
                                    doubleDeadEndCells.push(c);
                                }
                            }
                        }
                    }
                }
            }

            // choose tunnels from candidates
            var numTunnelsDesired = Math.random() <= 0.45 ? 2 : 1;
            var c;
            var selectSingleDeadEnd = function(c) {
                c.connect[RIGHT] = true;
                if (c.singleDeadEndDir == UP) {
                    c.topTunnel = true;
                }
                else {
                    c.next[DOWN].topTunnel = true;
                }
            };
            if (numTunnelsDesired == 1) {
                if (c = randomElement(voidTunnelCells)) {
                    c.topTunnel = true;
                }
                else if (c = randomElement(singleDeadEndCells)) {
                    selectSingleDeadEnd(c);
                }
                else if (c = randomElement(edgeTunnelCells)) {
                    c.topTunnel = true;
                }
                else {
                    return false;
                }
            }
            else if (numTunnelsDesired == 2) {
                if (c = randomElement(doubleDeadEndCells)) {
                    c.connect[RIGHT] = true;
                    c.topTunnel = true;
                    c.next[DOWN].topTunnel = true;
                }
                else {
                    numTunnelsCreated = 1;
                    if (c = randomElement(topVoidTunnelCells)) {
                        c.topTunnel = true;
                    }
                    else if (c = randomElement(topSingleDeadEndCells)) {
                        selectSingleDeadEnd(c);
                    }
                    else if (c = randomElement(topEdgeTunnelCells)) {
                        c.topTunnel = true;
                    }
                    else {
                        // could not find a top tunnel opening
                        numTunnelsCreated = 0;
                    }

                    if (c = randomElement(botVoidTunnelCells)) {
                        c.topTunnel = true;
                    }
                    else if (c = randomElement(botSingleDeadEndCells)) {
                        selectSingleDeadEnd(c);
                    }
                    else if (c = randomElement(botEdgeTunnelCells)) {
                        c.topTunnel = true;
                    }
                    else {
                        // could not find a bottom tunnel opening
                        if (numTunnelsCreated == 0) {
                            return false;
                        }
                    }
                }
            }

            // don't allow a horizontal path to cut straight through a map (through tunnels)
            var exit,topy;
            for (y=0; y<rows; y++) {
                c = cells[cols-1+y*cols];
                if (c.topTunnel) {
                    exit = true;
                    topy = c.final_y;
                    while (c.next[LEFT]) {
                        c = c.next[LEFT];
                        if (!c.connect[UP] && c.final_y == topy) {
                            continue;
                        }
                        else {
                            exit = false;
                            break;
                        }
                    }
                    if (exit) {
                        return false;
                    }
                }
            }

            // clear unused void tunnels (dead ends)
            var len = voidTunnelCells.length;
            var i;

            var replaceGroup = function(oldg,newg) {
                var i,c;
                for (i=0; i<rows*cols; i++) {
                    c = cells[i];
                    if (c.group == oldg) {
                        c.group = newg;
                    }
                }
            };
            for (i=0; i<len; i++) {
                c = voidTunnelCells[i];
                if (!c.topTunnel) {
                    replaceGroup(c.group, c.next[UP].group);
                    c.connect[UP] = true;
                    c.next[UP].connect[DOWN] = true;
                }
            }

            return true;
        };

        var joinWalls = function() {

            // randomly join wall pieces to the boundary to increase difficulty

            var x,y;
            var c;

            // join cells to the top boundary
            for (x=0; x<cols; x++) {
                c = cells[x];
                if (!c.connect[LEFT] && !c.connect[RIGHT] && !c.connect[UP] &&
                    (!c.connect[DOWN] || !c.next[DOWN].connect[DOWN])) {

                    // ensure it will not create a dead-end
                    if ((!c.next[LEFT] || !c.next[LEFT].connect[UP]) &&
                        (c.next[RIGHT] && !c.next[RIGHT].connect[UP])) {

                        // prevent connecting very large piece
                        if (!(c.next[DOWN] && c.next[DOWN].connect[RIGHT] && c.next[DOWN].next[RIGHT].connect[RIGHT])) {
                            c.isJoinCandidate = true;
                            if (Math.random() <= 0.25) {
                                c.connect[UP] = true;
                            }
                        }
                    }
                }
            }

            // join cells to the bottom boundary
            for (x=0; x<cols; x++) {
                c = cells[x+(rows-1)*cols];
                if (!c.connect[LEFT] && !c.connect[RIGHT] && !c.connect[DOWN] &&
                    (!c.connect[UP] || !c.next[UP].connect[UP])) {

                    // ensure it will not creat a dead-end
                    if ((!c.next[LEFT] || !c.next[LEFT].connect[DOWN]) &&
                        (c.next[RIGHT] && !c.next[RIGHT].connect[DOWN])) {

                        // prevent connecting very large piece
                        if (!(c.next[UP] && c.next[UP].connect[RIGHT] && c.next[UP].next[RIGHT].connect[RIGHT])) {
                            c.isJoinCandidate = true;
                            if (Math.random() <= 0.25) {
                                c.connect[DOWN] = true;
                            }
                        }
                    }
                }
            }

            // join cells to the right boundary
            var c2;
            for (y=1; y<rows-1; y++) {
                c = cells[cols-1+y*cols];
                if (c.raiseHeight) {
                    continue;
                }
                if (!c.connect[RIGHT] && !c.connect[UP] && !c.connect[DOWN] &&
                    !c.next[UP].connect[RIGHT] && !c.next[DOWN].connect[RIGHT]) {
                    if (c.connect[LEFT]) {
                        c2 = c.next[LEFT];
                        if (!c2.connect[UP] && !c2.connect[DOWN] && !c2.connect[LEFT]) {
                            c.isJoinCandidate = true;
                            if (Math.random() <= 0.5) {
                                c.connect[RIGHT] = true;
                            }
                        }
                    }
                }
            }
        };

        // try to generate a valid map, and keep count of tries.
        var genCount = 0;
        while (true) {
            reset();
            gen();
            genCount++;
            if (!isDesirable()) {
                continue;
            }

            setUpScaleCoords();
            joinWalls();
            if (!createTunnels()) {
                continue;
            }

            break;
        }

    };

    // Transform the simple cells to a tile array used for creating the map.
    var getTiles = function() {

        var tiles = []; // each is a character indicating a wall(|), path(.), or blank(_).
        var tileCells = []; // maps each tile to a specific cell of our simple map
        var subrows = rows*3+1+3;
        var subcols = cols*3-1+2;

        var midcols = subcols-2;
        var fullcols = (subcols-2)*2;

        // getter and setter for tiles (ensures vertical symmetry axis)
        var setTile = function(x,y,v) {
            if (x<0 || x>subcols-1 || y<0 || y>subrows-1) {
                return;
            }
            x -= 2;
            tiles[midcols+x+y*fullcols] = v;
            tiles[midcols-1-x+y*fullcols] = v;
        };
        var getTile = function(x,y) {
            if (x<0 || x>subcols-1 || y<0 || y>subrows-1) {
                return undefined;
            }
            x -= 2;
            return tiles[midcols+x+y*fullcols];
        };

        // getter and setter for tile cells
        var setTileCell = function(x,y,cell) {
            if (x<0 || x>subcols-1 || y<0 || y>subrows-1) {
                return;
            }
            x -= 2;
            tileCells[x+y*subcols] = cell;
        };
        var getTileCell = function(x,y) {
            if (x<0 || x>subcols-1 || y<0 || y>subrows-1) {
                return undefined;
            }
            x -= 2;
            return tileCells[x+y*subcols];
        };

        // initialize tiles
        var i;
        for (i=0; i<subrows*fullcols; i++) {
            tiles.push('_');
        }
        for (i=0; i<subrows*subcols; i++) {
            tileCells.push(undefined);
        }

        // set tile cells
        var c;
        var x,y,w,h;
        var x0,y0;
        for (i=0; i<rows*cols; i++) {
            c = cells[i];
            for (x0=0; x0<c.final_w; x0++) {
                for (y0=0; y0<c.final_h; y0++) {
                    setTileCell(c.final_x+x0,c.final_y+1+y0,c);
                }
            }
        }

        // set path tiles
        var cl, cu;
        for (y=0; y<subrows; y++) {
            for (x=0; x<subcols; x++) {
                c = getTileCell(x,y); // cell
                cl = getTileCell(x-1,y); // left cell
                cu = getTileCell(x,y-1); // up cell

                if (c) {
                    // inside map
                    if (cl && c.group != cl.group || // at vertical boundary
                        cu && c.group != cu.group || // at horizontal boundary
                        !cu && !c.connect[UP]) { // at top boundary
                        setTile(x,y,'.');
                    }
                }
                else {
                    // outside map
                    if (cl && (!cl.connect[RIGHT] || getTile(x-1,y) == '.') || // at right boundary
                        cu && (!cu.connect[DOWN] || getTile(x,y-1) == '.')) { // at bottom boundary
                        setTile(x,y,'.');
                    }
                }

                // at corner connecting two paths
                if (getTile(x-1,y) == '.' && getTile(x,y-1) == '.' && getTile(x-1,y-1) == '_') {
                    setTile(x,y,'.');
                }
            }
        }

        // extend tunnels
        var y;
        for (c=cells[cols-1]; c; c = c.next[DOWN]) {
            if (c.topTunnel) {
                y = c.final_y+1;
                setTile(subcols-1, y,'.');
                setTile(subcols-2, y,'.');
            }
        }

        // fill in walls
        for (y=0; y<subrows; y++) {
            for (x=0; x<subcols; x++) {
                // any blank tile that shares a vertex with a path tile should be a wall tile
                if (getTile(x,y) != '.' && (getTile(x-1,y) == '.' || getTile(x,y-1) == '.' || getTile(x+1,y) == '.' || getTile(x,y+1) == '.' ||
                    getTile(x-1,y-1) == '.' || getTile(x+1,y-1) == '.' || getTile(x+1,y+1) == '.' || getTile(x-1,y+1) == '.')) {
                    setTile(x,y,'|');
                }
            }
        }

        // create the ghost door
        setTile(2,12,'-');

        // set energizers
        var getTopEnergizerRange = function() {
            var miny;
            var maxy = subrows/2;
            var x = subcols-2;
            var y;
            for (y=2; y<maxy; y++) {
                if (getTile(x,y) == '.' && getTile(x,y+1) == '.') {
                    miny = y+1;
                    break;
                }
            }
            maxy = Math.min(maxy,miny+7);
            for (y=miny+1; y<maxy; y++) {
                if (getTile(x-1,y) == '.') {
                    maxy = y-1;
                    break;
                }
            }
            return {miny:miny, maxy:maxy};
        };
        var getBotEnergizerRange = function() {
            var miny = subrows/2;
            var maxy;
            var x = subcols-2;
            var y;
            for (y=subrows-3; y>=miny; y--) {
                if (getTile(x,y) == '.' && getTile(x,y+1) == '.') {
                    maxy = y;
                    break;
                }
            }
            miny = Math.max(miny,maxy-7);
            for (y=maxy-1; y>miny; y--) {
                if (getTile(x-1,y) == '.') {
                    miny = y+1;
                    break;
                }
            }
            return {miny:miny, maxy:maxy};
        };
        var x = subcols-2;
        var y;
        var range;
        if (range = getTopEnergizerRange()) {
            y = getRandomInt(range.miny, range.maxy);
            setTile(x,y,'o');
        }
        if (range = getBotEnergizerRange()) {
            y = getRandomInt(range.miny, range.maxy);
            setTile(x,y,'o');
        }

        // erase pellets in the tunnels
        var eraseUntilIntersection = function(x,y) {
            var adj;
            while (true) {
                adj = [];
                if (getTile(x-1,y) == '.') {
                    adj.push({x:x-1,y:y});
                }
                if (getTile(x+1,y) == '.') {
                    adj.push({x:x+1,y:y});
                }
                if (getTile(x,y-1) == '.') {
                    adj.push({x:x,y:y-1});
                }
                if (getTile(x,y+1) == '.') {
                    adj.push({x:x,y:y+1});
                }
                if (adj.length == 1) {
                    setTile(x,y,' ');
                    x = adj[0].x;
                    y = adj[0].y;
                }
                else {
                    break;
                }
            }
        };
        x = subcols-1;
        for (y=0; y<subrows; y++) {
            if (getTile(x,y) == '.') {
                eraseUntilIntersection(x,y);
            }
        }

        // erase pellets on starting position
        setTile(1,subrows-8,' ');

        // erase pellets around the ghost house
        var i,j;
        var y;
        for (i=0; i<7; i++) {

            // erase pellets from bottom of the ghost house proceeding down until
            // reaching a pellet tile that isn't surround by walls
            // on the left and right
            y = subrows-14;
            setTile(i, y, ' ');
            j = 1;
            while (getTile(i,y+j) == '.' &&
                    getTile(i-1,y+j) == '|' &&
                    getTile(i+1,y+j) == '|') {
                setTile(i,y+j,' ');
                j++;
            }

            // erase pellets from top of the ghost house proceeding up until
            // reaching a pellet tile that isn't surround by walls
            // on the left and right
            y = subrows-20;
            setTile(i, y, ' ');
            j = 1;
            while (getTile(i,y-j) == '.' &&
                    getTile(i-1,y-j) == '|' &&
                    getTile(i+1,y-j) == '|') {
                setTile(i,y-j,' ');
                j++;
            }
        }
        // erase pellets on the side of the ghost house
        for (i=0; i<7; i++) {

            // erase pellets from side of the ghost house proceeding right until
            // reaching a pellet tile that isn't surround by walls
            // on the top and bottom.
            x = 6;
            y = subrows-14-i;
            setTile(x, y, ' ');
            j = 1;
            while (getTile(x+j,y) == '.' &&
                    getTile(x+j,y-1) == '|' &&
                    getTile(x+j,y+1) == '|') {
                setTile(x+j,y,' ');
                j++;
            }
        }

        // return a tile string (3 empty lines on top and 2 on bottom)
        return (
            "____________________________" +
            "____________________________" +
            "____________________________" +
            tiles.join("") +
            "____________________________" +
            "____________________________");
    };

    var randomColor = function() {
        return '#'+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6);
    };

    // dijkstra's algorithm to find shortest path to all tiles from (x0,y0)
    // we also remove (destroyX,destroyY) from the map to try to constrain the path
    // from going a certain way from the start.
    // (We created this because the ghost's minimum distance direction is not always sufficient in procedural maps)
    var getShortestDistGraph = function(map,x0,y0,isNodeTile) {

        // build graph
        var graph = {};
        var x,y,i,j;
        for (y=0; y<36; y++) {
            for (x=0; x<28; x++) {
                if (isNodeTile(x,y)) {
                    i = x+y*28;
                    graph[i] = {'x':x, 'y':y, 'dist':Infinity, 'penult':undefined, 'neighbors':[], 'completed':false};
                    if (isNodeTile(x-1,y)) {
                        j = i-1;
                        graph[i].neighbors.push(graph[j]);
                        graph[j].neighbors.push(graph[i]);
                    }
                    if (isNodeTile(x,y-1)) {
                        j = i-28;
                        graph[i].neighbors.push(graph[j]);
                        graph[j].neighbors.push(graph[i]);
                    }
                }
            }
        }

        var node = graph[x0+y0*28];
        node.completed = true;
        node.dist = 0;
        var d;
        var next_node,min_dist,dist;
        while (true) {

            // update distances of current node's neighbors
            for (i=0; i<4; i++) {
                d = node.neighbors[i];
                if (d && !d.completed) {
                    dist = node.dist+1;
                    if (dist == d.dist) {
                        if (Math.random() < 0.5) {
                            d.penult = node;
                        }
                    }
                    else if (dist < d.dist) {
                        d.dist = dist;
                        d.penult = node;
                    }
                }
            }

            // find next node to process (closest fringe node)
            next_node = undefined;
            min_dist = Infinity;
            for (i=0; i<28*36; i++) {
                d = graph[i];
                if (d && !d.completed) {
                    if (d.dist < min_dist) { 
                        next_node = d;
                        min_dist = d.dist;
                    }
                }
            }

            if (!next_node) {
                break;
            }

            node = next_node;
            node.completed = true;
        }

        return graph;
    };

    // retrieves the direction enum from a node's penultimate node to itself.
    var getDirFromPenult = function(node) {
        if (!node.penult) {
            return undefined;
        }
        var dx = node.x - node.penult.x;
        var dy = node.y - node.penult.y;
        if (dy == -1) {
            return DIR_UP;
        }
        else if (dy == 1) {
            return DIR_DOWN;
        }
        else if (dx == -1) {
            return DIR_LEFT;
        }
        else if (dx == 1) {
            return DIR_RIGHT;
        }
    };

    // sometimes the ghosts can get stuck in loops when trying to return home
    // so we build a path from all tiles to the ghost door tile
    var makeExitPaths = function(map) {
        var isNodeTile = function(x,y) {
            if (x<0 || x>=28 || y<0 || y>=36) {
                return false;
            }
            return map.isFloorTile(x,y);
        };
        var graph = getShortestDistGraph(map,map.doorTile.x,map.doorTile.y,isNodeTile);

        // give the map a function that tells the ghost which direction to go to return home
        map.getExitDir = function(x,y) {
            if (x<0 || x>=28 || y<0 || y>=36) {
                return undefined;
            }
            var node = graph[x+y*28];
            var dirEnum = getDirFromPenult(node);
            if (dirEnum != undefined) {
                return rotateAboutFace(dirEnum); // reverse direction (door->ghost to door<-ghost)
            }
        };
    };

    // add fruit paths to a map
    var makeFruitPaths = (function(){
        var reversed = {
            'v':'^',
            '^':'v',
            '<':'>',
            '>':'<',
        };
        var reversePath = function(path) {
            var rpath = "";
            var i;
            for (i=path.length-1; i>=0; i--) {
                rpath += reversed[path[i]];
            }
            return rpath;
        };

        var dirChars = {};
        dirChars[DIR_UP] = '^';
        dirChars[DIR_DOWN] = 'v';
        dirChars[DIR_LEFT] = '<';
        dirChars[DIR_RIGHT] = '>';

        var getPathFromGraph = function(graph,x0,y0,x1,y1,reverse) {
            // from (x0,y0) to (x1,y1)
            var start_node = graph[x0+y0*28];
            var dx,dy;
            var path = "";
            var node;
            for (node=graph[x1+y1*28]; node!=start_node; node=node.penult) {
                path = dirChars[getDirFromPenult(node)] + path;
            }
            return reverse ? reversePath(path) : path;
        }

        return function(map) {

            paths = {entrances:[], exits:[]};

            var isFloorTile = function(x,y) {
                if (x<0 || x>=28 || y<0 || y>=36) {
                    return false
                }
                return map.isFloorTile(x,y);
            };

            enter_graph = getShortestDistGraph(map,15,20, function(x,y) { return (x==14 && y==20) ? false : isFloorTile(x,y); });
            exit_graph =  getShortestDistGraph(map,16,20, function(x,y) { return (x==17 && y==20) ? false : isFloorTile(x,y); });

            // start at (15,20)
            for (y=0; y<36; y++) {
                if (map.isFloorTile(-1,y)) {

                    // left entrance
                    paths.entrances.push({
                        'start': {'y':y*8+4, 'x': -4},
                        'path': '>'+getPathFromGraph(enter_graph, 15,20, 0,y, true)});

                    // right entrance
                    paths.entrances.push({
                        'start': {'y':y*8+4, 'x': 28*8+4},
                        'path': '<'+getPathFromGraph(enter_graph, 15,20, 27,y, true)});

                    // left exit
                    paths.exits.push({
                        'start': {'y':y*8+4, 'x': -4},
                        'path': getPathFromGraph(exit_graph, 16,20, 0,y, false)+'<'});

                    // right exit
                    paths.exits.push({
                        'start': {'y':y*8+4, 'x': 28*8+4},
                        'path': getPathFromGraph(exit_graph, 16,20, 27,y, false)+'>'});
                }
            }

            map.fruitPaths = paths;
        };
    })();

    return function() {
        genRandom();
        var map = new Map(28,36,getTiles());

        makeFruitPaths(map);
        makeExitPaths(map);

        map.name = "Random Map";
        map.wallFillColor = randomColor();
        map.wallStrokeColor = rgbString(hslToRgb(Math.random(), Math.random(), Math.random() * 0.4 + 0.6));
        map.pelletColor = "#ffb8ae";

        return map;
    };
})();
//@line 1 "src/atlas.js"

var atlas = (function(){

    var canvas,ctx;
    var size = 22;
    var cols = 15; // has to be ONE MORE than intended to fix some sort of CHROME BUG (last cell always blank?)
    var rows = 22;

    var creates = 0;

    var drawGrid = function() {
        // draw grid overlay
        var canvas = document.getElementById('gridcanvas');
        if (!canvas) {
            return;
        }
        var w = size*cols*renderScale;
        var h = size*rows*renderScale;
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,w,h);
        var x,y;
        var step = size*renderScale;
        ctx.beginPath();
        for (x=0; x<=w; x+=step) {
            ctx.moveTo(x,0);
            ctx.lineTo(x,h);
        }
        for (y=0; y<=h; y+=step) {
            ctx.moveTo(0,y);
            ctx.lineTo(w,y);
        }
        ctx.lineWidth = "1px";
        ctx.lineCap = "square";
        ctx.strokeStyle="rgba(255,255,255,0.5)";
        ctx.stroke();
    };

    var create = function() {
        drawGrid();
        canvas = document.getElementById('atlas');
        ctx = canvas.getContext("2d");
        /*
        canvas.style.left = 0;
        canvas.style.top = 0;
        canvas.style.position = "absolute";
        */

        var w = size*cols*renderScale;
        var h = size*rows*renderScale;
        canvas.width = w;
        canvas.height = h;

        if (creates > 0) {
            ctx.restore();
        }
        creates++;

        ctx.save();
        ctx.clearRect(0,0,w,h);
        ctx.scale(renderScale,renderScale);

        var drawAtCell = function(f,row,col) {
            var x = col*size + size/2;
            var y = row*size + size/2;
            f(x,y);
        };

        var row = 0;
        drawAtCell(function(x,y) { drawGTube(ctx,x,y); },      row,0);
        drawAtCell(function(x,y) { drawEndlessPump(ctx,x,y); },  row,1);
        drawAtCell(function(x,y) { drawMarsupialPump(ctx,x,y); },      row,2);
        drawAtCell(function(x,y) { drawJamiePump(ctx,x,y); },       row,3);
        drawAtCell(function(x,y) { drawUsbCharger(ctx,x,y); },       row,4);
        drawAtCell(function(x,y) { drawFeedingBag(ctx,x,y); },    row,5);
        drawAtCell(function(x,y) { drawFormulaBottle(ctx,x,y); },        row,6);
        drawAtCell(function(x,y) { drawExtension(ctx,x,y); },         row,7);
        drawAtCell(function(x,y) { drawEnFitWrench(ctx,x,y); },     row,8);
        drawAtCell(function(x,y) { drawFlyingSquirrel(ctx,x,y); },        row,9);
        drawAtCell(function(x,y) { drawStraightenPump(ctx,x,y); },      row,10);
        drawAtCell(function(x,y) { drawCookie(ctx,x,y); },      row,11);
        drawAtCell(function(x,y) { drawCookieFlash(ctx,x,y); },      row,12);
        drawAtCell(function(x,y) { drawCrossedBandaids(ctx, x, y); }, row, 13)

        var drawEnemyCells = function(row,color) {
            var i,f;
            var col = 0;
            for (i=0; i<4; i++) { // dirEnum
                for (f=0; f<2; f++) { // frame
                    drawAtCell(function(x,y) { drawEnemySprite(ctx, x,y, f, i, false, false, false, color); },   row,col);
                    col++;
                }
            }
        };

        row++;
        drawEnemyCells(row, "#DE373A");
        row++;
        drawEnemyCells(row, "#55D400");
        row++;
        drawEnemyCells(row, "#099EDE");
        row++;
        drawEnemyCells(row, "#FFB851");

        row++;
        // draw disembodied eyes
        (function(){
            var i;
            var col = 0;
            for (i=0; i<4; i++) { // dirEnum
                drawAtCell(function(x,y) { drawEnemySprite(ctx, x,y, 0, i, false, false, true, "#3F3F3F"); },     row,col);
                col++;
            }
        })();

        // draw ghosts scared
        drawAtCell(function(x,y) { drawEnemySprite(ctx, x,y, 0, DIR_UP, true, false, false, "#3F3F3F"); }, row,4);
        drawAtCell(function(x,y) { drawEnemySprite(ctx, x,y, 1, DIR_UP, true, false, false, "#3F3F3F"); }, row,5);
        drawAtCell(function(x,y) { drawEnemySprite(ctx, x,y, 0, DIR_UP, true, true, false, "#3F3F3F"); },  row,6);
        drawAtCell(function(x,y) { drawEnemySprite(ctx, x,y, 1, DIR_UP, true, true, false, "#3F3F3F"); },  row,7);


        row++;

        // draw player mouth closed
        drawAtCell(function(x,y) { drawPacmanSprite(ctx, x,y, DIR_RIGHT, 0); }, row, 0);
        row ++;
        // draw player directions
        var drawTubieManCells = function(row,col,dir) {
            drawAtCell(function(x,y) { drawTubieManSprite(ctx, x,y, dir, 0, true); }, row, col);
            drawAtCell(function(x,y) { drawTubieManSprite(ctx, x,y, dir, 1, true); }, row, col+1);
            drawAtCell(function(x,y) { drawTubieManSprite(ctx, x,y, dir, 2, true); }, row, col+2);
        };
        row++;
        (function(){
            var i;
            var col=0;
            for (i=0; i<4; i++) {
                drawTubieManCells(row,col,i);
                col+=3;
            }
        })();

        var drawMonsterCells = function(row,color) {
            var i,f;
            var col=0;
            for (i=0; i<4; i++) { // dirEnum
                for (f=0; f<2; f++) { // frame
                    drawAtCell(function(x,y) { drawMonsterSprite(ctx, x,y, f, i, false, false, false, color); },   row,col);
                    col++;
                }
            }
        };

        row++;
        drawMonsterCells(row, "#DE373A");
        row++;
        // drawMonsterCells(row, "#FFB8FF");
        drawMonsterCells(row, "#55D400");
        row++;
        drawMonsterCells(row, "#099EDE");
        row++;
        drawMonsterCells(row, "#FFB851");

        row++;
        (function(){
            var i;
            var col = 0;
            for (i=0; i<4; i++) { // dirEnum
                drawAtCell(function(x,y) { drawMonsterSprite(ctx, x,y, 0, i, false, false, true, "#fff"); },     row,col);
                col++;
            }
        })();
        drawAtCell(function(x,y) { drawMonsterSprite(ctx, x,y, 0, DIR_UP, true, false, false, "#fff"); }, row,4);
        drawAtCell(function(x,y) { drawMonsterSprite(ctx, x,y, 1, DIR_UP, true, false, false, "#fff"); }, row,5);
        drawAtCell(function(x,y) { drawMonsterSprite(ctx, x,y, 0, DIR_UP, true, true, false, "#fff"); },  row,6);
        drawAtCell(function(x,y) { drawMonsterSprite(ctx, x,y, 1, DIR_UP, true, true, false, "#fff"); },  row,7);

        // row++;
        // row++;

        // row++;
        row += 3;
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 200, "#33ffff"); }, row, 0);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 400, "#33ffff"); }, row, 1);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 800, "#33ffff"); }, row, 2);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 1600, "#33ffff");}, row, 3);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 100, "#ffb8ff"); }, row, 4);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 300, "#ffb8ff"); }, row, 5);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 500, "#ffb8ff"); }, row, 6);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 700, "#ffb8ff"); }, row, 7);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 1000, "#ffb8ff"); }, row, 8);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 2000, "#ffb8ff"); }, row, 9);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 3000, "#ffb8ff"); }, row, 10);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 5000, "#ffb8ff"); }, row, 11);
        row++;
        drawAtCell(function(x,y) { drawBonusPoints(ctx, x,y, 100, "#fff"); }, row, 0);
        drawAtCell(function(x,y) { drawBonusPoints(ctx, x,y, 200, "#fff"); }, row, 1);
        drawAtCell(function(x,y) { drawBonusPoints(ctx, x,y, 500, "#fff"); }, row, 2);
        drawAtCell(function(x,y) { drawBonusPoints(ctx, x,y, 700, "#fff"); }, row, 3);
        drawAtCell(function(x,y) { drawBonusPoints(ctx, x,y, 1000, "#fff"); }, row, 4);
        drawAtCell(function(x,y) { drawBonusPoints(ctx, x,y, 2000, "#fff"); }, row, 5);
        drawAtCell(function(x,y) { drawBonusPoints(ctx, x,y, 5000, "#fff"); }, row, 6);
    };

    var copyCellTo = function(row, col, destCtx, x, y,display) {
        var sx = col*size*renderScale;
        var sy = row*size*renderScale;
        var sw = renderScale*size;
        var sh = renderScale*size;

        var dx = x - size/2;
        var dy = y - size/2;
        var dw = size;
        var dh = size;

        if (display) {
            console.log(sx,sy,sw,sh,dw,dy,dw,dh);
        }

        destCtx.drawImage(canvas,sx,sy,sw,sh,dx,dy,dw,dh);
    };

    var copyGhostPoints = function(destCtx,x,y,points) {
        var row = 16;
        var col = {
            200: 0,
            400: 1,
            800: 2,
            1600: 3,
        }[points];
        if (col != undefined) {
            copyCellTo(row, col, destCtx, x, y);
        }
    };

    var copyBonusPoints = function(destCtx,x,y,points) {
        // var row = 17;
        const row = 16;
        const col = {
            100: 4,
            200: 0,
            300: 5,
            500: 6,
            700: 7,
            800: 2,
            1000: 8,
            1600: 3,
            2000: 9,
            3000: 10,
            5000: 11,
        }[points];

        if (col != undefined) {
            copyCellTo(row, col, destCtx, x, y);
        }
    };

    var copyGhostSprite = function(destCtx,x,y,frame,dirEnum,scared,flash,eyes_only,color) {
        var row,col;
        if (eyes_only) {
            row = 5;
            col = dirEnum;
        }
        else if (scared) {
            row = 5;
            col = flash ? 6 : 4;
            col += frame;
        }
        else {
            col = dirEnum*2 + frame;
            if (color == enemy1.color) {
                row = 1;
            }
            else if (color == enemy2.color) {
                row = 2;
            }
            else if (color == enemy3.color) {
                row = 3;
            }
            else if (color == enemy4.color) {
                row = 4;
            }
            else {
                row = 5;
            }
        }

        copyCellTo(row, col, destCtx, x, y);
    };

    var copySyringeSprite = function(destCtx,x,y,frame,dirEnum,scared,flash,eyes_only,color) {
            copyGhostSprite(destCtx,x,y,frame,dirEnum,scared,flash,eyes_only,color);
    };

    var copyMonsterSprite = function(destCtx,x,y,frame,dirEnum,scared,flash,eyes_only,color) {
        var row,col;
        if (eyes_only) {
            row = 13;
            col = dirEnum;
        }
        else if (scared) {
            row = 13;
            col = flash ? 6 : 4;
            col += frame;
        }
        else {
            col = dirEnum*2 + frame;
            if (color == enemy1.color) {
                row = 9;
            }
            else if (color == enemy2.color) {
                row = 10;
            }
            else if (color == enemy3.color) {
                row = 11;
            }
            else if (color == enemy4.color) {
                row = 12;
            }
            else {
                row = 13;
            }
        }

        copyCellTo(row, col, destCtx, x, y);
    };

    var copyTubieManSprite = function(destCtx,x,y,dirEnum,frame) {
        var row = 8;
        var col = dirEnum*3+frame;
        copyCellTo(row,col,destCtx,x,y);
    };

    var copyBonusSprite = function(destCtx,x,y,name) {
        var row = 0;
        var col = {
            "gtube": 0,
            "endless_pump": 1,
            "marsupial_pump": 2,
            "jamie_pump": 3,
            "usb_charger": 4,
            "feeding_bag": 5,
            "formula_bottle": 6,
            "y_extension": 7,
            "enfit_wrench": 8,
            "flying_squirrel": 9,
            "straighten_pump": 10,
            "cookie": 11,
            "cookieface": 12,
        }[name];

        copyCellTo(row,col,destCtx,x,y);
    };

    const copyCrossedBandaids = (destCtx, x, y) => {
        const row = 0;
        const col = 13;
        copyCellTo(row, col, destCtx, x, y);
    }

    return {
        create: create,
        getCanvas: function() { return canvas; },
        drawMonsterSprite: copyMonsterSprite,
        drawSyringeSprite: copySyringeSprite,
        drawTubieManSprite: copyTubieManSprite,
        drawBonusSprite: copyBonusSprite,
        drawEnemyPoints: copyGhostPoints,
        drawBonusPoints: copyBonusPoints,
        drawCrossedBandaids: copyCrossedBandaids
    };
})();
//@line 1 "src/renderers.js"
//////////////////////////////////////////////////////////////
// Renderers

// Draws everything in the game using swappable renderers
// to enable to different front-end displays for Pac-Man.

// current renderer
let renderer;

var renderScale;

const getIsWidescreen = () => window.matchMedia("(orientation: landscape)").matches;

const mapDimensions = {
    standard: {
        row: 36,
        col: 28
    },
    widescreen: {
        row: 31,
        col: 38
    }
}

const setScreenAndMapDimensions = () => {
    isWidescreen = getIsWidescreen();
    
    mapMargin = (getIsWidescreen() ? 1 : 4) * tileSize; // margin between the map and the screen

    // padding between the map and its clipping
    mapPadX = tileSize / (getIsWidescreen() ? 10 : 8);
    mapPadY = getIsWidescreen() ? mapPadX : mapPadX;

    mapYOffset = (getIsWidescreen() ? -2 : 0) * tileSize;

    mapCols = (isWidescreen ? mapDimensions.widescreen: mapDimensions.standard).col;
    mapRows = (isWidescreen ? mapDimensions.widescreen: mapDimensions.standard).row;

    mapWidth = mapCols * tileSize + mapPadX * 2;
    mapHeight = mapRows * tileSize + mapPadY * 2 + 5;

    screenWidth = mapWidth + mapMargin * 2;
    screenHeight = mapHeight + mapMargin * (isWidescreen ? 1 : 2);
}

let isWidescreen, mapMargin, mapPadX, mapPadY, mapYOffset, mapcols, mapRows, mapWidth, mapHeight, screenWidth, screenheight;
setScreenAndMapDimensions();

// all rendering will be shown on this canvas
var canvas;

const backgroundColor = "#000";
const marginColor = "#000";

let initialRender = true;

// switch to the given renderer index
var switchRenderer = function(i) {
    renderer = renderer_list[i];
    renderer.drawMap();
};

var getDevicePixelRatio = function() {
    // Only consider the device pixel ratio for devices that are <= 320 pixels in width.
    // This is necessary for the iPhone4's retina display; otherwise the game would be blurry.
    // The iPad3's retina display @ 2048x1536 starts slowing the game down.
    return 1;
    // if (window.innerWidth <= 320) {
    //     return window.devicePixelRatio || 1;
    // }
    // return 1;
};

var initRenderer = function(){
    var bgCanvas;
    var ctx, bgCtx;

    // drawing scale
    var scale = 2;// scale everything by this amount

    // (temporary global version of scale just to get things quickly working)
    renderScale = scale; 

    var resets = 0;

    // rescale the canvases
    var resetCanvasSizes = function() {

        setScreenAndMapDimensions();

        canvas.width = screenWidth * scale;
        canvas.height = screenHeight * scale;

        // set the size of the canvas in browser pixels
        var ratio = getDevicePixelRatio();
        canvas.style.width = canvas.width / ratio;
        canvas.style.height = canvas.height / ratio;

        ctx.translate(0, (isWidescreen ? -2 : 0) * tileSize);

        if (resets > 0) {
            ctx.restore();
        }
        ctx.save();
        ctx.scale(scale,scale);

        bgCanvas.width = mapWidth * scale;
        bgCanvas.height = mapHeight * scale;
        bgCtx.translate(0, (isWidescreen ? -2 : 0) * tileSize);

        if (resets > 0) {
            bgCtx.restore();
        }
        bgCtx.save();
        bgCtx.scale(scale,scale);
        resets++;
    };

    // get the target scale that will cause the canvas to fit the window
    var getTargetScale = function() {
        var sx = (window.innerWidth - 10) / screenWidth;
        var sy = (window.innerHeight - 10) / screenHeight;
        var s = Math.min(sx,sy);
        s *= getDevicePixelRatio();
        return s;
    };

    // maximize the scale to fit the window
    var fullscreen = function() {
        
        setScreenAndMapDimensions();
        // NOTE: css-scaling alternative at https://gist.github.com/1184900
        scale = getTargetScale();
        renderScale = scale;

        resetCanvasSizes();
        atlas.create();
        
        if(inGameMenu)
            inGameMenu.draw(ctx, true);

        if (renderer) {
            renderer.drawMap();
        }

        center();
    };

    // center the canvas in the window
    var center = function() {
        var s = getTargetScale()/getDevicePixelRatio();
        var w = screenWidth*s;

        document.body.style.marginLeft = (window.innerWidth - w ) / 2 + "px";
    };

    // create foreground and background canvases
    canvas = document.getElementById('canvas');
    bgCanvas = document.createElement('canvas');
    ctx = canvas.getContext("2d");
    bgCtx = bgCanvas.getContext("2d");

    // initialize placement and size
    fullscreen();

    // adapt placement and size to window resizes
    var resizeTimeout;
    
    const changeHandler = (event) => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(fullscreen, 100);
    }

    window.addEventListener('resize', changeHandler, false);
    screen.orientation.addEventListener("change", changeHandler, false);

    //////////////////////

    var beginMapFrame = function() {
        bgCtx.save();
        if(getIsWidescreen() && initialRender) {
            bgCtx.translate(0,-5 * tileSize); // Translate up to compensate for the HUD movign to the side
            initialRender = false;
        }
        bgCtx.fillStyle = backgroundColor;
        bgCtx.fillRect(-5, -5, mapWidth + 5, mapHeight + 5);
        bgCtx.restore();
    };

    var endMapFrame = function() {};

    //////////////////////////////////////////////////////////////
    // Common Renderer
    // (attributes and functionality that are currently common to all renderers)

    // constructor
    var CommonRenderer = function() {
        this.actorSize = (tileSize-1)*2;
        this.energizerSize = tileSize+2;
        this.pointsEarnedTextSize = tileSize;

        this.energizerColor = "#FFF";
        this.pelletColor = "#888";

        this.flashLevel = false;
    };

    CommonRenderer.prototype = {

        setOverlayColor: function(color) {
            this.overlayColor = color;
        },

        beginMapClip: function() {
            ctx.save();
            ctx.beginPath();

            // subtract one from size due to shift done for sprite realignment?
            // (this fixes a bug that leaves unerased artifacts after actors use right-side tunnel
            ctx.fillStyle = "red";
            ctx.rect(-mapPadX, -mapPadY ,mapWidth - 1, mapHeight - 1);
            ctx.clip();
        },

        endMapClip: function() {
            ctx.restore();
        },

        beginFrame: function() {
            
            checkGamepads();
            
            this.setOverlayColor(undefined);
            ctx.save();

            // clear margin area
            ctx.fillStyle = marginColor;
            (function(w,h,p){
                ctx.fillRect(0, 0, w, p + 1); //top
                ctx.fillRect(0, p, p + 2, h - 2 * p); //left
                ctx.fillRect(w-p-2,p,p+2,h-2*p); //right
                ctx.fillRect(0,h-p-2,w,p+2); // bottom
            })(screenWidth, screenHeight, mapMargin);

            // draw fps
            if (DEBUG) {
                ctx.font = (tileSize-2) + "px 'Press Start 2P'";
                ctx.textBaseline = "bottom";
                ctx.textAlign = "right";
                ctx.fillStyle = "#333";
                ctx.fillText(Math.floor(executive.getFps())+" FPS", screenWidth, screenHeight);
            }

            // translate to map space
            ctx.translate(mapMargin + mapPadX, mapMargin + mapPadY);
        },

        endFrame: function() {
            ctx.restore();
            if (this.overlayColor != undefined) {
                ctx.fillStyle = this.overlayColor;
                ctx.fillRect(0,0,screenWidth,screenHeight);
            }
        },

        clearMapFrame: function() {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(-5, -5, mapWidth + 5, mapHeight + 5);
        },

        renderFunc: function(f,that) {
            if (that) {
                f.call(that,ctx);
            }
            else {
                f(ctx);
            }
        },

        // scaling the canvas can incur floating point roundoff errors
        // which manifest as "grout" between tiles that are otherwise adjacent in integer-space
        // This function extends the width and height of the tile if it is adjacent to equivalent tiles
        // that are to the bottom or right of the given tile
        drawNoGroutTile: function(ctx,x,y,w) {
            var tileChar = map.getTile(x,y);
            this.drawCenterTileSq(ctx,x,y,tileSize,
                    map.getTile(x+1,y) == tileChar,
                    map.getTile(x,y+1) == tileChar,
                    map.getTile(x+1,y+1) == tileChar);
        },

        // draw square centered at the given tile with optional "floating point grout" filling
        drawCenterTileSq: function (ctx,tx,ty,w, rightGrout, downGrout, downRightGrout) {
            this.drawCenterPixelSq(ctx, tx*tileSize+midTile.x, ty*tileSize+midTile.y,w,
                    rightGrout, downGrout, downRightGrout);
        },

        // draw square centered at the given pixel
        drawCenterPixelSq: function (ctx,px,py,w,rightGrout, downGrout, downRightGrout) {
            ctx.fillRect(px-w/2, py-w/2,w,w);

            // fill "floating point grout" gaps between tiles
            var gap = 1;
            if (rightGrout) ctx.fillRect(px-w/2, py-w/2,w+gap,w);
            if (downGrout) ctx.fillRect(px-w/2, py-w/2,w,w+gap);
            //if (rightGrout && downGrout && downRightGrout) ctx.fillRect(px-w/2, py-w/2,w+gap,w+gap);
        },

        // this flag is used to flash the level upon its successful completion
        toggleLevelFlash: function () {
            this.flashLevel = !this.flashLevel;
        },

        setLevelFlash: function(on) {
            if (on != this.flashLevel) {
                this.flashLevel = on;
                this.drawMap();
            }
        },

        // draw the target visualizers for each actor
        drawTargets: function() {
            var i;
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.lineWidth = "1.5";
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            for (i=0;i<5;i++)
                if (actors[i].isDrawTarget)
                    actors[i].drawTarget(ctx);
        },

        drawPaths: function() {
            var backupAlpha = ctx.globalAlpha;
            ctx.globalAlpha = 0.7;
            var i;
            for (i=0;i<5;i++)
                if (actors[i].isDrawPath)
                    this.drawPath(actors[i]);
            ctx.globalAlpha = backupAlpha;
        },

        // draw a predicted path for the actor if it continues pursuing current target
        drawPath: function(actor) {
            if (!actor.targetting) return;

            // current state of the predicted path
            var tile = { x: actor.tile.x, y: actor.tile.y};
            var target = actor.targetTile;
            var dir = { x: actor.dir.x, y: actor.dir.y };
            var dirEnum = actor.dirEnum;
            var openTiles;

            // exit if we're already on the target
            if (tile.x == target.x && tile.y == target.y) {
                return;
            }

            // if we are past the center of the tile, we cannot turn here anymore, so jump to next tile
            if ((dirEnum == DIR_UP && actor.tilePixel.y <= midTile.y) ||
                (dirEnum == DIR_DOWN && actor.tilePixel.y >= midTile.y) ||
                (dirEnum == DIR_LEFT && actor.tilePixel.x <= midTile.x) ||
                (dirEnum == DIR_RIGHT & actor.tilePixel.x >= midTile.x)) {
                tile.x += dir.x;
                tile.y += dir.y;
            }
            var pixel = { x:tile.x*tileSize+midTile.x, y:tile.y*tileSize+midTile.y };
            
            // dist keeps track of how far we're going along this path, stopping at maxDist
            // distLeft determines how long the last line should be
            var dist = Math.abs(tile.x*tileSize+midTile.x - actor.pixel.x + tile.y*tileSize+midTile.y - actor.pixel.y);
            var maxDist = actorPathLength*tileSize;
            var distLeft;
            
            // add the first line
            ctx.strokeStyle = actor.pathColor;
            ctx.lineWidth = "2.0";
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(
                    actor.pixel.x+actor.pathCenter.x,
                    actor.pixel.y+actor.pathCenter.y);
            ctx.lineTo(
                    pixel.x+actor.pathCenter.x,
                    pixel.y+actor.pathCenter.y);

            if (tile.x == target.x && tile.y == target.y) {
                // adjust the distance left to create a smoothly interpolated path end
                distLeft = actor.getPathDistLeft(pixel, dirEnum);
            }
            else while (true) {
                // predict next turn from current tile
                openTiles = getOpenTiles(tile, dirEnum);
                if (actor != player && map.constrainGhostTurns)
                    map.constrainGhostTurns(tile, openTiles, dirEnum);
                dirEnum = getTurnClosestToTarget(tile, target, openTiles);
                setDirFromEnum(dir,dirEnum);
                
                // if the next tile is our target, determine how mush distance is left and break loop
                if (tile.x+dir.x == target.x && tile.y+dir.y == target.y) {
                
                    // adjust the distance left to create a smoothly interpolated path end
                    distLeft = actor.getPathDistLeft(pixel, dirEnum);

                    // cap distance left
                    distLeft = Math.min(maxDist-dist, distLeft);

                    break;
                }
                
                // exit if we're going past the max distance
                if (dist + tileSize > maxDist) {
                    distLeft = maxDist - dist;
                    break;
                }

                // move to next tile and add a line to its center
                tile.x += dir.x;
                tile.y += dir.y;
                pixel.x += tileSize*dir.x;
                pixel.y += tileSize*dir.y;
                dist += tileSize;
                ctx.lineTo(
                        tile.x*tileSize+midTile.x+actor.pathCenter.x,
                        tile.y*tileSize+midTile.y+actor.pathCenter.y);
            }

            // calculate final endpoint
            var px = pixel.x+actor.pathCenter.x+distLeft*dir.x;
            var py = pixel.y+actor.pathCenter.y+distLeft*dir.y;

            // add an arrow head
            ctx.lineTo(px,py);
            var s = 3;
            if (dirEnum == DIR_LEFT || dirEnum == DIR_RIGHT) {
                ctx.lineTo(px-s*dir.x,py+s*dir.x);
                ctx.moveTo(px,py);
                ctx.lineTo(px-s*dir.x,py-s*dir.x);
            }
            else {
                ctx.lineTo(px+s*dir.y,py-s*dir.y);
                ctx.moveTo(px,py);
                ctx.lineTo(px-s*dir.y,py-s*dir.y);
            }

            // draw path    
            ctx.stroke();
        },

        // erase pellet from background
        erasePellet: function(x,y) {
            bgCtx.fillStyle = this.floorColor;
            this.drawNoGroutTile(bgCtx,x,y,tileSize);

            // fill in adjacent floor tiles
            if (map.getTile(x+1,y)==' ') this.drawNoGroutTile(bgCtx,x+1,y,tileSize);
            if (map.getTile(x-1,y)==' ') this.drawNoGroutTile(bgCtx,x-1,y,tileSize);
            if (map.getTile(x,y+1)==' ') this.drawNoGroutTile(bgCtx,x,y+1,tileSize);
            if (map.getTile(x,y-1)==' ') this.drawNoGroutTile(bgCtx,x,y-1,tileSize);
        },

        // draw a center screen message (e.g. "start", "ready", "game over")
        drawMessage: function(text, color, x, y) {
            ctx.save()
            ctx.translate(0, mapYOffset);

            ctx.font = 1.75 * tileSize + "px 'Press Start 2P'";
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
            ctx.fillStyle = color;
            ctx.fillText(text, x*tileSize, y*tileSize);

            ctx.restore();
        },

        drawReadyMessage: function() {
            this.drawMessage("READY!", "#FF0", mapDimensions.standard.col / 2, mapRows / 2 + 4);
        },

        // draw the points earned from the most recently eaten ghost
        drawEatenPoints: function() {
            atlas.drawEnemyPoints(ctx, player.pixel.x, player.pixel.y, energizer.getPoints());
        },

        // draw each actor (ghosts and player)
        drawActors: function() {
            var i;
            // draw such that player appears on top
            if (energizer.isActive()) {
                for (i=0; i<4; i++) {
                    this.drawEnemy(ghosts[i]);
                }
                if (!energizer.showingPoints())
                    this.drawPlayer();
                else
                    this.drawEatenPoints();
            }
            // draw such that player appears on bottom
            else {
                this.drawPlayer();
                for (i=3; i>=0; i--) {
                    if (ghosts[i].isVisible) {
                        this.drawEnemy(ghosts[i]);
                    }
                }
                if (enemy3.isVisible && !enemy1.isVisible) {
                    this.drawEnemy(enemy1,0.5);
                }
            }
        },

    };

    //////////////////////////////////////////////////////////////
    // Arcade Renderer
    // (render a display close to the original arcade)

    // constructor
    var ArcadeRenderer = function(ctx,bgCtx) {

        // inherit attributes from Common Renderer
        CommonRenderer.call(this,ctx,bgCtx);

        this.messageRow = 20;
        this.pelletSize = 2;
        this.energizerSize = tileSize;

        this.backColor = backgroundColor;
        this.floorColor = "backgroundColor";
        this.flashWallColor = "#FFF";

        this.name = "Arcade";
    };

    ArcadeRenderer.prototype = newChildObject(CommonRenderer.prototype, {
        // copy background canvas to the foreground canvas
        blitMap: function() {
            ctx.scale(1/scale,1/scale);
            ctx.translate(2 * mapPadX, 3 * mapPadY);
            ctx.drawImage(bgCanvas, 0, 0);
            ctx.scale(scale,scale);
        },

        drawMap: function(isCutscene) {
            // fill background
            beginMapFrame();

            if (map) {
                bgCtx.save();

                if(!isCutscene)
                    bgCtx.translate(0, mapYOffset);
                
                // Sometimes pressing escape during a flash can cause flash to be permanently enabled on maps.
                // so just turn it off when not in the finish state.
                if (state != finishState) {
                    this.flashLevel = false;
                }

                var x,y;
                var i,j;
                var tile;

                // ghost house door
                i=0;
                for (y=0; y<map.numRows; y++)
                for (x=0; x<map.numCols; x++) {
                    if (map.currentTiles[i] == '-' && map.currentTiles[i+1] == '-') {
                        bgCtx.fillStyle = "#ffb8de";
                        bgCtx.fillRect(x*tileSize,y*tileSize+tileSize-2,tileSize*2,2);
                    }
                    i++;
                }

                if (this.flashLevel) {
                    bgCtx.fillStyle = "#000";
                    bgCtx.strokeStyle = "#fff";
                }
                else {
                    bgCtx.fillStyle = map.wallFillColor;
                    bgCtx.strokeStyle = map.wallStrokeColor;
                }

                for (i = 0; i < map.paths.length; i++) {
                    var path = map.paths[i];
                    bgCtx.beginPath();
                    bgCtx.moveTo(path[0].x, path[0].y);
                    for (j=1; j<path.length; j++) {
                        if (path[j].cx != undefined)
                            bgCtx.quadraticCurveTo(path[j].cx, path[j].cy, path[j].x, path[j].y);
                        else
                            bgCtx.lineTo(path[j].x, path[j].y);
                    }
                    bgCtx.quadraticCurveTo(path[j-1].x, path[0].y, path[0].x, path[0].y);
                    bgCtx.fill();
                    bgCtx.stroke();
                }

                // draw pellet tiles
                bgCtx.fillStyle = map.pelletColor;
                i=0;
                for (y=0; y<map.numRows; y++)
                for (x=0; x<map.numCols; x++) {
                    this.refreshPellet(x,y,true);
                }

                if (map.shouldDrawMapOnly) {
                    endMapFrame();
                    return;
                }
                bgCtx.restore();
            }

            if (level > 0) {
                if (!isCutscene) {
                    // Hide the right edge of the map in widescreen mode
                    if(isWidescreen && !isCutscene) {
                        bgCtx.save();
                        bgCtx.translate((mapCols - 10) * tileSize + 1, 0); //+1 offsets for the map outline pixel
                        bgCtx.fillStyle = backgroundColor;
                        bgCtx.fillRect(0, 0, 3 * tileSize, (mapRows + 1) * tileSize);
                        bgCtx.restore();
                    }

                    // draw extra lives
                    var i;
                    bgCtx.fillStyle = player.color;

                    bgCtx.save();
                    bgCtx.translate(isWidescreen ? (mapCols - 6) * tileSize : 3 * tileSize, isWidescreen ? (mapRows - 5) * tileSize : (mapRows-1) * tileSize);
                    bgCtx.scale(0.9, 0.9);
                    
                    var lives = extraLives == Infinity ? 1 : extraLives;
                    for(i=0; i < lives; i++) {
                        drawTubieManSprite(bgCtx, 0, 0, DIR_RIGHT, 1, false);
                        bgCtx.translate(2 * tileSize, 0);
                    }
                    if(extraLives == Infinity) {
                        bgCtx.translate(-4 * tileSize, 0);

                        // draw Infinity symbol
                        var r = 2; // radius of each half-circle
                        var d = 3; // distance between the two focal points
                        bgCtx.beginPath();
                        bgCtx.moveTo(-d-r,0);
                        bgCtx.quadraticCurveTo(-d-r,-r,-d,-r);
                        bgCtx.bezierCurveTo(-(d-r),-r,d-r,r,d,r);
                        bgCtx.quadraticCurveTo(d+r,r,d+r,0);
                        bgCtx.quadraticCurveTo(d+r,-r,d,-r);
                        bgCtx.bezierCurveTo(d-r,-r,-(d-r),r,-d,r);
                        bgCtx.quadraticCurveTo(-d-r,r,-d-r,0);
                        bgCtx.lineWidth = 1;
                        bgCtx.strokeStyle = "#FFF";
                        bgCtx.stroke();
                    }

                    bgCtx.restore();
                }

                // draw level fruit
                var fruits = fruit.fruitHistory;
                var f,drawFunc;
                var numFruit = fruit.getNumFruit();
                // stop after the 11th fruit
                var startLevel = Math.min(numFruit, Math.max(numFruit, level));
                var scale = 0.85;
                
                const DEBUG_LEVEL_FRUIT = false;

                for (let i = 0, j = startLevel - numFruit + 1; i < numFruit && j <= (DEBUG_LEVEL_FRUIT ? numFruit: level); j++, i++) {
                    f = fruits[j];
                    if (f) {
                        drawFunc = getSpriteFuncFromBonusName(f.name);
                        if (!isCutscene && drawFunc) {
                            bgCtx.save();
                            // For 'traditional' layout, all fruit are in a single row
                            // For 'widescreen' layout, fruit are stacked in 2 rows of 4
                            const fruitX = isWidescreen ? (mapCols - (i > 7 ? 5.25 : 6)) * tileSize + ((i % 4) * 1.65 * tileSize): (mapCols - 3.5) * tileSize - i * 16 * scale;
                            const fruitY = isWidescreen ? (mapRows - (i > 3 ? i > 7 ? 7.5 : 9.25 : 11)) * tileSize : (mapRows - 1) * tileSize;

                            bgCtx.translate(fruitX, fruitY);
                            bgCtx.scale(scale,scale);
                            drawFunc(bgCtx,0,0);
                            bgCtx.restore();
                        }
                    }
                }
                
                if (!isCutscene) {
                    if (level >= 100) {
                        bgCtx.font = (tileSize-3) + "px 'Press Start 2P'";
                    }
                    else {
                        bgCtx.font = (tileSize-1) + "px 'Press Start 2P'";
                    }
                    bgCtx.textAlign = "left";
                    
                    if(isWidescreen) {
                        bgCtx.textBaseline = "bottom";
                        bgCtx.textAlign = "right";
                        bgCtx.fillStyle = "orange";
                        bgCtx.fillText(level, (mapCols - 6) * tileSize, (mapRows - 1) * tileSize);
                    } else {
                        bgCtx.textBaseline = "middle";
                        bgCtx.fillStyle = "#777";
                        bgCtx.fillText(level,(mapCols - 2) * tileSize, (mapRows - 1) * tileSize);
                    }
                }
            }
            endMapFrame();
        },

        erasePellet: function(x,y,isTranslated) {
            bgCtx.save();

            if (!isTranslated) {
                bgCtx.translate(mapPadX, mapYOffset + mapPadY);
            }

            bgCtx.fillStyle = backgroundColor;
            bgCtx.fillStyle = backgroundColor;
            var i = map.posToIndex(x,y);
            var size = map.tiles[i] == 'o' ? this.energizerSize : this.pelletSize;
            this.drawCenterTileSq(bgCtx,x,y,size+2);

            bgCtx.restore();
        },

        refreshPellet: function(x,y,isTranslated) {
            if (!isTranslated) {
                bgCtx.translate(mapPadX, mapPadY);
            }
            var i = map.posToIndex(x,y);
            var tile = map.currentTiles[i];
            if (tile == ' ') {
                this.erasePellet(x,y,isTranslated);
            }
            else if (tile == '.') {
                bgCtx.fillStyle = map.pelletColor;
                bgCtx.translate(0.5, 0.5);
                this.drawCenterTileSq(bgCtx,x,y,this.pelletSize);
                bgCtx.translate(-0.5, -0.5);
            }
            else if (tile == 'o') {
                bgCtx.save();
                bgCtx.scale(0.5, 0.5);
                drawCrossedBandaids(bgCtx, 2*x*tileSize+midTile.x+3.5, 2*y*tileSize+midTile.y+5);
                bgCtx.restore();
            }
            if (!isTranslated) {
                bgCtx.translate(-mapPadX, -mapPadY);
            }
        },

        // draw the current score and high score
        drawScore: function() {
            ctx.font = tileSize + "px 'Press Start 2P'";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#FFF";

            const wsScoreBlockX = (mapCols - 3) * tileSize;
            const wsScoreBlockY = 4 * tileSize;
            const ws1UpScoreY = 10 * tileSize;
            const scoreTopMargin = 2;

            if(isWidescreen) {
                ctx.textAlign = "center";
                ctx.fillText("HIGH", wsScoreBlockX, wsScoreBlockY);
                ctx.fillText("SCORE",wsScoreBlockX, wsScoreBlockY + tileSize);
                ctx.fillText("1UP", wsScoreBlockX, ws1UpScoreY);
            } else { 
                ctx.textAlign = "right";
                ctx.fillText("HIGH SCORE", 19 * tileSize, 0);
                ctx.fillText("1UP", 6 * tileSize, 0);
            }
            //ctx.fillText("2UP", 25*tileSize, 0);

            // TODO: player two score
            var score = getScore();
            if (score === 0) {
                score = "00";
            }
            const y = tileSize + 1;

            var highScore = getHighScore();
            if (highScore === 0) {
                highScore = "00";
            }
            
            if(isWidescreen) {
                ctx.fillStyle = "orange";
                ctx.textAlign = "center";
                ctx.fillText(highScore, wsScoreBlockX, wsScoreBlockY + (2 * tileSize) + scoreTopMargin);
                ctx.fillText(score, wsScoreBlockX, ws1UpScoreY + tileSize + scoreTopMargin);
            } else {
                ctx.fillText(highScore, 17 * tileSize, y);
                ctx.fillText(score, 7 * tileSize, y);
            }
        },

        // draw ghost
        drawEnemy: function(g,alpha) {
            ctx.save()
            ctx.translate(0, isWidescreen ? 1.25 * mapYOffset : 0);

            var backupAlpha;
            if (alpha) {
                backupAlpha = ctx.globalAlpha;
                ctx.globalAlpha = alpha;
            }

            var draw = function(mode, pixel, frames, faceDirEnum, scared, isFlash ,color, dirEnum) {
                if (mode == GHOST_EATEN)
                    return;
                var frame = g.getAnimFrame(frames);
                var eyes = (mode == GHOST_GOING_HOME || mode == GHOST_ENTERING_HOME);
                var func = getEnemyDrawFunc();
                var y = g.getBounceY(pixel.x, pixel.y, dirEnum);
                var x = (g == enemy1 && scared) ? pixel.x+1 : pixel.x; // blinky's sprite is shifted right when scared

                func(ctx,x,y,frame,faceDirEnum,scared,isFlash,eyes,color);
            };

            draw(g.mode, g.pixel, g.frames, g.faceDirEnum, g.scared, energizer.isFlash(), g.color, g.dirEnum);
            if (alpha) {
                ctx.globalAlpha = backupAlpha;
            }
            ctx.restore();
        },

        // draw player
        drawPlayer: function() {
            ctx.save()
            ctx.translate(0, isWidescreen ? 1.25 * mapYOffset : 0);

            // Query the InptuQueue for the most recent input direction of the player
            // TODO: Possibly add gamepad input update here
            const input = inputQueue.getActiveInput();
            if(input instanceof Input) {
                const action = input.getAction();

                //TODO: Simplify switch statement w/ map
                switch(action) {
                    case Actions.UP:
                        player.setInputDir(Directions.UP);
                        break;
                    case Actions.DOWN:
                        player.setInputDir(Directions.DOWN);
                        break;
                    case Actions.LEFT:
                        player.setInputDir(Directions.LEFT);
                        break;
                    case Actions.RIGHT:
                        player.setInputDir(Directions.RIGHT);
                        break;
                    default:
                        player.setInputDir(Directions.LEFT);
                        break;
                }
            }

            var frame = player.getAnimFrame();
            if (player.invincible) {
                ctx.globalAlpha = 0.6;
            }

            var draw = function(pixel, dirEnum, steps) {
                var frame = player.getAnimFrame(player.getStepFrame(steps));
                var func = getPlayerDrawFunc();
                func(ctx, pixel.x, pixel.y, dirEnum, frame, true);
            };

            
            draw(player.pixel, player.dirEnum, player.steps);
            if (player.invincible) {
                ctx.globalAlpha = 1;
            }

            if(isWidescreen) {
                ctx.save();
                ctx.translate((mapCols - 10) * tileSize + 1, 0); //+1 offsets for the map outline pixel
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, 3 * tileSize, (mapRows + 1) * tileSize);
                ctx.restore();
            }

            ctx.restore();
        },

        // draw dying player animation (with 0<=t<=1)
        drawDyingPlayer: function(t) {
            ctx.save();
            
            ctx.translate(0, isWidescreen ? 1.25 * mapYOffset : 0);

            var frame = player.getAnimFrame();

            // spin 540 degrees
            var maxAngle = Math.PI*5;
            var step = (Math.PI/4) / maxAngle; // 45 degree steps
            var angle = Math.floor(t/step)*step*maxAngle;
            drawTubieManSprite(ctx, player.pixel.x, player.pixel.y, player.dirEnum, frame, false, angle);
            
            ctx.restore();
        },

        // draw exploding player animation (with 0<=t<=1)
        drawExplodingPlayer: function(t) {            
            ctx.save();
            
            ctx.translate(0, mapYOffset - tileSize / 1.5);

            var frame = player.getAnimFrame();
            drawPacmanSprite(ctx, player.pixel.x, player.pixel.y, player.dirEnum, 0, 0, t,-3,1-t);

            ctx.restore();
        },

        // draw fruit
        drawBonus: function() {
            ctx.save();
            ctx.translate(0, isWidescreen ? 1.25 * mapYOffset : 0);

            if (fruit.getCurrentFruit()) {
                var name = fruit.getCurrentFruit().name;

                if (fruit.isPresent()) {
                    atlas.drawBonusSprite(ctx, fruit.pixel.x, fruit.pixel.y, name);
                }
                else if (fruit.isScorePresent()) {
                    atlas.drawBonusPoints(ctx, fruit.pixel.x, fruit.pixel.y, fruit.getPoints());
                }
            }
            ctx.restore();
        },

    });

    renderer = new ArcadeRenderer();
};
//@line 1 "src/hud.js"

var hud = (function(){

    var on = false;

    return {

        update: function() {
            var valid = this.isValidState();
            if (valid != on) {
                on = valid;
                if (on) {
                    inGameMenu.onHudEnable();
                    vcr.onHudEnable();
                }
                else {
                    inGameMenu.onHudDisable();
                    vcr.onHudDisable();
                }
            }
        },
        draw: function(ctx) {
            inGameMenu.draw(ctx);
            vcr.draw(ctx);
        },
        isValidState: function() {
            return (
                state == playState ||
                state == newGameState ||
                state == readyNewState ||
                state == readyRestartState ||
                state == finishState ||
                state == deadState ||
                state == overState);
        },
    };

})();
//@line 1 "src/galagaStars.js"

var galagaStars = (function() {

    var stars = {};
    var numStars = 200;

    var width = mapWidth;
    var height = Math.floor(mapHeight*1.5);

    var ypos;
    var yspeed=-0.5;

    var t;
    var flickerPeriod = 120;
    var flickerSteps = 4;
    var flickerGap = flickerPeriod / flickerSteps;

    var init = function() {
        t = 0;
        ypos = 0;
        var i;
        for (i=0; i<numStars; i++) {
            stars[i] = {
                x: getRandomInt(0,width-1),
                y: getRandomInt(0,height-1),
                color: getRandomColor(),
                phase: getRandomInt(0,flickerPeriod-1),
            };
        }
    };

    var update = function() {
        t++;
        t %= flickerPeriod;

        ypos += yspeed;
        ypos %= height;
        if (ypos < 0) {
            ypos += height;
        }
    };

    var draw = function(ctx) {
        var i;
        var star;
        var time;
        var y;
        ctx.fillStyle = "#FFF";
        for (i=0; i<numStars; i++) {
            star = stars[i];
            time = (t + star.phase) % flickerPeriod;
            if (time >= flickerGap) {
                y = star.y - ypos;
                if (y < 0) {
                    y += height;
                }
                ctx.fillStyle = star.color;
                ctx.fillRect(star.x, y, 1,1);
            }
        }
    };

    return {
        init: init,
        draw: draw,
        update: update,
    };

})();
//@line 1 "src/Button.js"
var getPointerPos = function(evt) {
    var obj = canvas;
    var top = 0;
    var left = 0;
    while (obj.tagName != 'BODY') {
        top += obj.offsetTop;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
    }

    // calculate relative mouse position
    var mouseX = evt.pageX - left;
    var mouseY = evt.pageY - top;

    // make independent of scale
    var ratio = getDevicePixelRatio();
    mouseX /= (renderScale / ratio);
    mouseY /= (renderScale / ratio);

    // offset
    mouseX -= mapMargin;
    mouseY -= mapMargin;

    return { x: mouseX, y: mouseY };
};

var Button = function(x,y,w,h,onclick) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.onclick = onclick;

    // text and icon padding
    this.pad = tileSize;

    // icon attributes
    this.frame = 0;

    this.borderBlurColor = "#333";
    this.borderFocusColor = "#EEE";

    this.isSelected = false;

    // touch events
    this.startedInside = false;
    var that = this;
    var touchstart = function(evt) {
        evt.preventDefault();
        var fingerCount = evt.touches.length;
        if (fingerCount == 1) {
            var pos = getPointerPos(evt.touches[0]);
            (that.startedInside=that.contains(pos.x,pos.y)) ? that.focus() : that.blur();
        }
        else {
            touchcancel(evt);
        }
    };
    var touchmove = function(evt) {
        evt.preventDefault();
        var fingerCount = evt.touches.length;
        if (fingerCount == 1) {
            if (that.startedInside) {
                var pos = getPointerPos(evt.touches[0]);
                that.contains(pos.x, pos.y) ? that.focus() : that.blur();
            }
        }
        else {
            touchcancel(evt);
        }
    };
    var touchend = function(evt) {
        evt.preventDefault();
        var registerClick = (that.startedInside && that.isSelected);
        if (registerClick) {
            that.click();
        }
        touchcancel(evt);
        if (registerClick) {
            // focus the button to keep it highlighted after successful click
            that.focus();
        }
    };
    var touchcancel = function(evt) {
        evt.preventDefault();
        this.startedInside = false;
        that.blur();
    };


    // mouse events
    var click = function(evt) {
        var pos = getPointerPos(evt);
        if (that.contains(pos.x, pos.y)) {
            that.click();
        }
    };
    var mousemove = function(evt) {
        var pos = getPointerPos(evt);
        that.contains(pos.x, pos.y) ? that.focus() : that.blur();
    };
    var mouseleave = function(evt) {
        that.blur();
    };

    this.isEnabled = false;
    this.onEnable = function() {
        canvas.addEventListener('click', click);
        canvas.addEventListener('mousemove', mousemove);
        canvas.addEventListener('mouseleave', mouseleave);
        canvas.addEventListener('touchstart', touchstart);
        canvas.addEventListener('touchmove', touchmove);
        canvas.addEventListener('touchend', touchend);
        canvas.addEventListener('touchcancel', touchcancel);
        this.isEnabled = true;
    };

    this.onDisable = function() {
        canvas.removeEventListener('click', click);
        canvas.removeEventListener('mousemove', mousemove);
        canvas.removeEventListener('mouseleave', mouseleave);
        canvas.removeEventListener('touchstart', touchstart);
        canvas.removeEventListener('touchmove', touchmove);
        canvas.removeEventListener('touchend', touchend);
        canvas.removeEventListener('touchcancel', touchcancel);
        that.blur();
        this.isEnabled = false;
    };
};

Button.prototype = {
    
    setPosition: function(x, y) {
        this.x = x;
        this.y = y;
    },

    setDimensions: function(w, h) {
        this.w = w;
        this.h = h;
    },

    contains: function(x,y) {
        return x >= this.x && x <= this.x+this.w &&
               y >= this.y && y <= this.y+this.h;
    },

    click: function() {
        // disable current click timeout (to prevent double clicks on some devices)
        clearTimeout(this.clickTimeout);

        // set a click delay
        var that = this;
        if (that.onclick) {
            this.clickTimeout = setTimeout(function() { that.onclick(); }, 200);
        }
    },

    enable: function() {
        this.frame = 0;
        this.onEnable();
    },

    disable: function() {
        this.onDisable();
    },

    focus: function() {
        this.isSelected = true;
        this.onfocus && this.onfocus();
    },

    blur: function() {
        this.isSelected = false;
        this.onblur && this.onblur();
    },

    setText: function(msg) {
        this.msg = msg;
    },

    setFont: function(font,fontcolor) {
        this.font = font;
        this.fontcolor = fontcolor;
    },

    setIcon: function(drawIcon) {
        this.drawIcon = drawIcon;
    },

    draw: function(ctx) {

        // draw border
        ctx.lineWidth = 2;
        ctx.beginPath();
        var x=this.x, y=this.y, w=this.w, h=this.h;
        var r=h/4;
        ctx.moveTo(x,y+r);
        ctx.quadraticCurveTo(x,y,x+r,y);
        ctx.lineTo(x+w-r,y);
        ctx.quadraticCurveTo(x+w,y,x+w,y+r);
        ctx.lineTo(x+w,y+h-r);
        ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
        ctx.lineTo(x+r,y+h);
        ctx.quadraticCurveTo(x,y+h,x,y+h-r);
        ctx.closePath();
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();
        ctx.strokeStyle = this.isSelected && this.onclick ? this.borderFocusColor : this.borderBlurColor;
        ctx.stroke();

        // draw icon
        if (this.drawIcon) {
            if (!this.msg) {
                this.drawIcon(ctx,this.x+this.w/2,this.y+this.h/2,this.frame);
            }
            else {
                this.drawIcon(ctx,this.x+this.pad+tileSize,this.y+this.h/2,this.frame);
            }
        }

        // draw text
        if (this.msg) {
            ctx.font = this.font;
            ctx.fillStyle = this.isSelected && this.onclick ? this.fontcolor : "#777";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            //ctx.fillText(this.msg, 2*tileSize+2*this.pad+this.x, this.y + this.h/2 + 1);
            ctx.fillText(this.msg, this.x + this.w/2, this.y + this.h/2 + 1);
        }
    },

    update: function() {
        if (this.drawIcon) {
            this.frame = this.isSelected ? this.frame+1 : 0;
        }
    },
};

var ToggleButton = function(x,y,w,h,isOn,setOn) {
    var that = this;
    var onclick = function() {
        setOn(!isOn());
        that.refreshMsg();
    };
    this.isOn = isOn;
    this.setOn = setOn;
    Button.call(this,x,y,w,h,onclick);
};

ToggleButton.prototype = newChildObject(Button.prototype, {

    enable: function() {
        Button.prototype.enable.call(this);
        this.refreshMsg();
    },
    setToggleLabel: function(label) {
        this.label = label;
    },
    refreshMsg: function() {
        if (this.label) {
            this.msg = this.label + ": " + (this.isOn() ? "ON" : "OFF");
        }
    },
    refreshOnState: function() {
        this.setOn(this.isOn());
    },

});
//@line 1 "src/Menu.js"
var Menu = function(title,x,y,w,h,pad,font,fontcolor) {
    this.title = title;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.pad = pad;
    this.buttons = [];
    this.buttonCount = 0;
    this.currentY = this.y+this.pad;

    if (title) {
        this.currentY += 1*(this.h + this.pad);
    }

    this.font = font;
    this.fontcolor = fontcolor;
    this.enabled = false;

    this.backButton = undefined;
};

Menu.prototype = {
    setSize: function (x, y, width, height) {
        const dx = this.x - x;
        const dy = this.y - y;
        const dw = this.w - width;
        const dh = this.h = height;

        this.x = x;
        this.y = y;
        this.width = width;
        this.w = width;
        this.height = height;
        this.h = height;

        // Update all buttons positions
        this.buttons.forEach((btn) => {
            btn.setPosition(dx + btn.x, dy + btn.y);
            btn.setDimensions(this.w - this.pad * 2, this.h);
        });
    },

    clickCurrentOption: function() {
        var i;
        for (i=0; i<this.buttonCount; i++) {
            if (this.buttons[i].isSelected) {
                this.buttons[i].onclick();
                break;
            }
        }
    },

    selectNextOption: function() {
        gameTitleState.blurTitleButtons();
        var i;
        var nextBtn;
        for (i=0; i<this.buttonCount; i++) {
            if (this.buttons[i].isSelected) {
                this.buttons[i].blur();
                nextBtn = this.buttons[(i+1)%this.buttonCount];
                break;
            }
        }
        nextBtn = nextBtn || this.buttons[0];
        nextBtn.focus();
    },

    selectPrevOption: function() {
        gameTitleState.blurTitleButtons();
        var i;
        var nextBtn;
        for (i=0; i<this.buttonCount; i++) {
            if (this.buttons[i].isSelected) {
                this.buttons[i].blur();
                nextBtn = this.buttons[i==0?this.buttonCount-1:i-1];
                break;
            }
        }
        nextBtn = nextBtn || this.buttons[this.buttonCount-1];
        nextBtn.focus();
    },

    selectNextTitleOption: function() {
        this.buttons.forEach((btn) => { if(btn.isSelected) btn.blur() });
        gameTitleState.selectNextTitleButton();
    },

    selectPrevTitleOption: function() {
        this.buttons.forEach((btn) => { if(btn.isSelected) btn.blur() });
        gameTitleState.selectPrevTitleButton();
    },

    addToggleButton: function(isOn,setOn) {
        var b = new ToggleButton(this.x+this.pad,this.currentY,this.w-this.pad*2,this.h,isOn,setOn);
        this.buttons.push(b);
        this.buttonCount++;
        this.currentY += this.pad + this.h;
    },

    addToggleTextButton: function(label,isOn,setOn) {
        var b = new ToggleButton(this.x+this.pad,this.currentY,this.w-this.pad*2,this.h,isOn,setOn);
        b.setFont(this.font,this.fontcolor);
        b.setToggleLabel(label);
        this.buttons.push(b);
        this.buttonCount++;
        this.currentY += this.pad + this.h;
    },

    addTextButton: function(msg,onclick) {
        var b = new Button(this.x+this.pad,this.currentY,this.w-this.pad*2,this.h,onclick);
        b.setFont(this.font,this.fontcolor);
        b.setText(msg);
        this.buttons.push(b);
        this.buttonCount++;
        this.currentY += this.pad + this.h;
    },

    addTextIconButton: function(msg,onclick,drawIcon) {
        var b = new Button(this.x+this.pad,this.currentY,this.w-this.pad*2,this.h,onclick);
        b.setFont(this.font,this.fontcolor);
        b.setText(msg);
        b.setIcon(drawIcon);
        this.buttons.push(b);
        this.buttonCount++;
        this.currentY += this.pad + this.h;
    },

    addIconButton: function(drawIcon,onclick) {
        var b = new Button(this.x+this.pad,this.currentY,this.w-this.pad*2,this.h,onclick);
        b.setIcon(drawIcon);
        this.buttons.push(b);
        this.buttonCount++;
        this.currentY += this.pad + this.h;
    },

    addSpacer: function(count) {
        if (count == undefined) {
            count = 1;
        }
        this.currentY += count*(this.pad + this.h);
    },

    enable: function() {
        var i;
        for (i=0; i<this.buttonCount; i++) {
            this.buttons[i].enable();
        }
        this.enabled = true;
    },

    disable: function() {
        var i;
        for (i=0; i<this.buttonCount; i++) {
            this.buttons[i].disable();
        }
        this.enabled = false;
    },

    isEnabled: function() {
        return this.enabled;
    },

    draw: function(ctx) {
        if (this.title) {
            ctx.font = tileSize+"px 'Press Start 2P'";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = "#FFF";
            ctx.fillText(this.title,this.x + this.w/2, this.y+this.pad + this.h/2);
        }
        var i;
        for (i=0; i<this.buttonCount; i++) {
            this.buttons[i].draw(ctx);
        }
    },

    update: function() {
        var i;
        for (i=0; i<this.buttonCount; i++) {
            this.buttons[i].update();
        }
    },
};
//@line 1 "src/inGameMenu.js"
////////////////////////////////////////////////////
// In-Game Menu
let inGameMenuBtnX, inGameMenuBtnY;

const inGameMenuBtnDimensions = {
    width: tileSize * 6,
    height: tileSize * 3
}

const setInGameMenuBtnPosition = () => {
    inGameMenuBtnX = getIsWidescreen() ? (mapCols - 3) * tileSize - inGameMenuBtnDimensions.width / 2 : mapWidth / 2 - inGameMenuBtnDimensions.width / 2;
    inGameMenuBtnY = getIsWidescreen() ? (tileSize * 0.25) : mapHeight;
}

const getInGameMenuBtn = (handler) => {
    const btn = new Button(inGameMenuBtnX, inGameMenuBtnY, inGameMenuBtnDimensions.width, inGameMenuBtnDimensions.height, handler);
    btn.setText("MENU");
    btn.setFont(tileSize + "px 'Press Start 2P'","#FFF");
    
    return btn;
}

const buildInGameMenu = function() {
    let menu;
    const showMainMenu = () => menu.enable();
    const hideMainMenu = () => menu.disable();

    // confirms a menu action
    var confirmMenu = new Menu("QUESTION?",2*tileSize,5*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px 'Press Start 2P'", "#EEE");
    confirmMenu.addTextButton("YES", function() {
        confirmMenu.disable();
        confirmMenu.onConfirm();
    });
    confirmMenu.addTextButton("NO", function() {
        confirmMenu.disable();
        showMainMenu(menu);
    });
    confirmMenu.addTextButton("CANCEL", function() {
        confirmMenu.disable();
        showMainMenu(menu);
    });
    confirmMenu.backButton = confirmMenu.buttons[confirmMenu.buttonCount-1];

    var showConfirm = function(title,onConfirm) {
        hideMainMenu();
        confirmMenu.title = title;
        confirmMenu.onConfirm = onConfirm;
        confirmMenu.enable();
    };

    // regular menu
    menu = new Menu("PAUSED", 2 * tileSize, 5 * tileSize, mapWidth - 4 * tileSize, 3 * tileSize, tileSize, tileSize + "px 'Press Start 2P'", "#EEE");
    menu.addTextButton("RESUME", function() {
        menu.disable();
    });
    menu.addTextButton("QUIT", function() {
        showConfirm("QUIT GAME?", function() {
            switchState(preNewGameState, 60);
        });
    });
    menu.backButton = menu.buttons[0];

    setInGameMenuBtnPosition();
    const btn = getInGameMenuBtn(showMainMenu);

    var menus = [menu, confirmMenu];
    var getVisibleMenu = function() {
        var len = menus.length;
        var i;
        var m;
        for (i=0; i<len; i++) {
            m = menus[i];
            if (m.isEnabled()) {
                return m;
            }
        }
    };

    return {
        onHudEnable: function() {
            btn.enable();
        },
        onHudDisable: function() {
            btn.disable();
        },
        update: function() {
            if (btn.isEnabled) {
                btn.update();
            }
        },
        draw: (ctx) => {
            var m = getVisibleMenu();
            if (m) {
                ctx.fillStyle = "rgba(0,0,0,0.8)";
                ctx.fillRect(-mapPadX - 5, -mapPadY - 5, mapWidth + 5 ,mapHeight + 5);
                m.setSize(2 * tileSize, 5 * tileSize, mapWidth - 4 * tileSize, 3 * tileSize);
                m.draw(ctx);
            }
            else {
                setInGameMenuBtnPosition();
                btn.setPosition(inGameMenuBtnX, inGameMenuBtnY); 
                btn.draw(ctx);
            }
        },
        isOpen: () => getVisibleMenu() != undefined,
        getMenu: () => getVisibleMenu(),
        getMenuButton: () => btn
    };
}

const inGameMenu = buildInGameMenu();//@line 1 "src/sprites.js"
//////////////////////////////////////////////////////////////////////////////////////
// Sprites
// (sprites are created using canvas paths)

var scl = function(scale, value) { return scale * value }
var setColor = function(ctx, color) { ctx.strokeStyle = color; ctx.fillStyle = color; }
var drawLine = function(ctx, x, y, dx, dy, lineWidth, color) {
    if(color !== null) setColor(ctx, color);

    var cx = dx == 0 ? x + lineWidth / 2 : x; // X value corrected for line width
    var cy = dy == 0 ? y + lineWidth / 2 : y; // Y value corrected for line width

    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + dx, cy + dy);
    ctx.stroke();
}
var drawPixel = function(ctx, x, y, scale, color) { drawLine(ctx, x, y, scl(scale, 1), 0, scl(scale, 1), color) };

var drawEnemySprite = (function(){
    var drawSyringe = function(ctx, dirEnum, flash, color, eyesOnly) {
        var s = 0.6; // scale factor

        var EMPTY_COLOR = "#3F3F3F";
        var OUTLINE_COLOR = "#FFF";
        var PLUNGER_COLOR = "#E2E2E2"
        var FACE_COLOR = "#FFF";
        var PUPIL_COLOR = "#000";
        var ARM_COLOR = "#3F3F3F";

        var FLASH_FILL_COLOR = "#0000C9";
        var FLASH_PUPIL_COLOR = "#0000C9";
        var FLASH_FACE_COLOR = "#DE373A";
        var FLASH_OUTLINE_COLOR = "3F3F3F";
        var FLASH_ARM_COLOR = "#3F3F3F";
        var FLASH_PLUNGER_COLOR = "#0000C9";

        var addEyes = function(ctx, dirEnum , flash, eyesOnly) {
            var pupilColor = flash ? FLASH_PUPIL_COLOR : PUPIL_COLOR;
            var faceColor = flash ? FLASH_FACE_COLOR : FACE_COLOR;
            
            var drawEye = function(x, y) {
                var drawPupil = function(x, y) {
                    var pdx = 0; // Offset of Pupil in X axis
                    var pdy = 0; // Offset of Pupil in Y axis

                    switch(dirEnum) {
                        case DIR_LEFT:
                            pdx = x;
                            pdy = y + 1;
                            break;
                        case DIR_RIGHT:
                            pdx = x + 2;
                            pdy = y + 1;
                            break;
                        case DIR_UP:
                            pdx = x + 1;
                            pdy = y + 1;
                            break; 
                        case DIR_DOWN:
                            pdx = x + 1;
                            pdy = y + 2;
                            break;
                    }
                    
                    drawLine(ctx, scl(s, pdx), scl(s, pdy), scl(s, 2), scl(s, 0), scl(s, 1), pupilColor);
                }
                
                setColor(ctx, faceColor);
                ctx.fillRect(scl(s, x), scl(s, y + 1), scl(s, 4), scl(s, 2));
                drawLine(ctx, scl(s, x + 1), scl(s, y), scl(s, 2), scl(s, 0), scl(s, 1));
                drawPupil(x, y);
            }

            ctx.lineWidth = 0.0;
            ctx.lineJoin = 'round';

            var ex = 21;
            var ey = 20;

            var edx = eyesOnly ? ex - 8 : ex;
            var edy = eyesOnly ? ey - 1 : ey;

            drawEye(edx, ey);
            drawEye(edx + 5, ey);

            // Draw Left Eyebrow
            drawPixel(ctx, scl(s, edx), scl(s, edy - 4), scl(s, 1), faceColor);
            drawPixel(ctx, scl(s, edx + 1), scl(s, edy - 3), scl(s, 1), faceColor);
            drawLine(ctx, scl(s, edx + 2), scl(s, edy - 2), scl(s, 2), scl(s, 0), scl(s, 1), faceColor);

            // Draw Right Eyebrow
            drawPixel(ctx, scl(s, edx + 8), scl(s, edy - 4), scl(s, 1), faceColor);
            drawPixel(ctx, scl(s, edx + 7), scl(s, edy - 3), scl(s, 1), faceColor);
            drawLine(ctx, scl(s, edx + 5), scl(s, edy - 2), scl(s, 2), scl(s, 0), scl(s, 1), faceColor);
        }

        var addMouth = function(ctx, flash) {
            ctx.lineWidth = 0.0;
            ctx.lineJoin = 'round';

            var mouthColor = flash ? FLASH_FACE_COLOR : FACE_COLOR;

            setColor(ctx, mouthColor);
            ctx.fillRect(scl(s, 22), scl(s, 24), scl(s, 6), scl(s, 2));
            drawLine(ctx, scl(s, 21), scl(s, 25), scl(s, 0), scl(s, 3), scl(s, 1));
            drawLine(ctx, scl(s, 22), scl(s, 26), scl(s, 0), scl(s, 1), scl(s, 1));
            drawLine(ctx, scl(s, 28), scl(s, 25), scl(s, 0), scl(s, 3), scl(s, 1));
            drawLine(ctx, scl(s, 27), scl(s, 26), scl(s, 0), scl(s, 1), scl(s, 1));
            
        }

        var addOutline = function(ctx, flash) {
            ctx.lineWidth = 0.0;
            ctx.lineJoin = 'round';

            setColor(ctx, flash ? FLASH_OUTLINE_COLOR : OUTLINE_COLOR);

            // Plunger Outline
            drawLine(ctx, scl(s, 19), scl(s, 1), scl(s, 10), 0, scl(s, 1));
            drawLine(ctx, scl(s, 18), scl(s, 2), 0, scl(s, 3), scl(s, 1));
            drawLine(ctx, scl(s, 29), scl(s, 2), 0, scl(s, 3), scl(s, 1));
            drawLine(ctx, scl(s, 19), scl(s, 5), scl(s, 3), 0, scl(s, 1));
            drawLine(ctx, scl(s, 26), scl(s, 5), scl(s, 3), 0, scl(s, 1));
            drawLine(ctx, scl(s, 21), scl(s, 6), 0, scl(s, 3), scl(s, 1));
            drawLine(ctx, scl(s, 26), scl(s, 6), 0, scl(s, 3), scl(s, 1));
            drawLine(ctx, scl(s, 27), scl(s, 8), scl(s, 6), 0, scl(s, 1));
            drawLine(ctx, scl(s, 21), scl(s, 8), scl(s, -6), 0, scl(s, 1));
            drawLine(ctx, scl(s, 14), scl(s, 9), 0, scl(s, 3), scl(s, 1));
            drawLine(ctx, scl(s, 33), scl(s, 9), 0, scl(s, 3), scl(s, 1));
            drawLine(ctx, scl(s, 14), scl(s, 12), scl(s, 19), 0, scl(s, 1));

            // Body Outline
            drawLine(ctx, scl(s, 17), scl(s, 13), 0, scl(s, 22), scl(s, 1));
            drawPixel(ctx, scl(s, 18), scl(s, 34), s);
            drawLine(ctx, scl(s, 18), scl(s, 35), scl(s, 12), 0, scl(s, 1));
            drawPixel(ctx, scl(s, 29), scl(s, 34), s);
            drawLine(ctx, scl(s, 30), scl(s, 13), 0, scl(s, 22), scl(s, 1));
            
            // Lower Body Outline
            drawLine(ctx, scl(s, 21), scl(s, 36), 0, scl(s, 3), scl(s, 1));
            drawLine(ctx, scl(s, 26), scl(s, 36), 0, scl(s, 3), scl(s, 1));
            drawLine(ctx, scl(s, 22), scl(s, 39), scl(s, 4), 0, scl(s, 1));

            // Tip
            ctx.fillRect(scl(s, 23), scl(s, 40), scl(s, 2), scl(s, 7));
            drawPixel(ctx, scl(s, 23), scl(s, 47), s);

        }

        var addFill = function(ctx,flash,fillColor) {
            // Colored Fill
            setColor(ctx, flash ? FLASH_FILL_COLOR : fillColor);
            
            ctx.lineWidth = 0.0;
            ctx.lineJoin = 'round';
            ctx.fillRect(scl(s, 18), scl(s, 24), scl(s, 12), scl(s, 11));
            ctx.fillRect(scl(s, 22), scl(s, 36), scl(s, 4), scl(s, 3));

            // 'Empty' Fill
            setColor(ctx, EMPTY_COLOR);
            ctx.fillRect(scl(s, 18), scl(s, 13), scl(s, 12), scl(s, 11));
        }

        var addArms = function(ctx, flash) {
            ctx.lineWidth = 0.0;
            ctx.lineJoin = 'round';

            var outlineColor = flash ? FLASH_OUTLINE_COLOR : OUTLINE_COLOR;
            var armColor = flash ?  FLASH_ARM_COLOR : ARM_COLOR;

            // Left Arm outline
            setColor(ctx, outlineColor);
            ctx.fillRect(scl(s, 17), scl(s, 23), scl(s, -2), scl(s, 5));
            ctx.fillRect(scl(s, 15), scl(s, 24), scl(s, -1), scl(s, 5));
            ctx.fillRect(scl(s, 14), scl(s, 24), scl(s, -3), scl(s, 6));
            ctx.fillRect(scl(s, 11), scl(s, 25), scl(s, -1), scl(s, 5));
            ctx.fillRect(scl(s, 10), scl(s, 25), scl(s, -1), scl(s, 4));
            ctx.fillRect(scl(s, 9), scl(s, 25), scl(s, -1), scl(s, 3));
            ctx.fillRect(scl(s, 8), scl(s, 25), scl(s, -1), scl(s, 3));
            ctx.fillRect(scl(s, 5), scl(s, 23), scl(s, 2), scl(s, 4));
            drawLine(ctx, scl(s, 4), scl(s, 22), 0, scl(s, 4), scl(s, 1));
            drawLine(ctx, scl(s, 3), scl(s, 17), 0, scl(s, 8), scl(s, 1));
            drawLine(ctx, scl(s, 2), scl(s, 18), 0, scl(s, 5), scl(s, 1));
            drawLine(ctx, scl(s, 1), scl(s, 19), 0, scl(s, 3), scl(s, 1));
            drawLine(ctx, scl(s, 4), scl(s, 16), 0, scl(s, 5), scl(s, 1));
            ctx.fillRect(scl(s, 5), scl(s, 15), scl(s, 3), scl(s, 8));
            drawPixel(ctx, scl(s, 7), scl(s, 23), s);
            ctx.fillRect(scl(s, 8), scl(s, 16), scl(s, 2), scl(s, 9));
            drawLine(ctx, scl(s, 10), scl(s, 17), 0, scl(s, 8), scl(s, 1));
            drawLine(ctx, scl(s, 11), scl(s, 19), 0, scl(s, 5), scl(s, 1));
            drawLine(ctx, scl(s, 12), scl(s, 20), 0, scl(s, 2), scl(s, 1));
            drawPixel(ctx, scl(s, 12), scl(s, 23), s);

            // Right Arm Outline
            setColor(ctx, outlineColor);
            ctx.fillRect(scl(s, 31), scl(s, 24), scl(s, 1), scl(s, 5));
            ctx.fillRect(scl(s, 32), scl(s, 25), scl(s, 3), scl(s, 5));
            ctx.fillRect(scl(s, 35), scl(s, 24), scl(s, 3), scl(s, 5));
            ctx.fillRect(scl(s, 38), scl(s, 25), scl(s, 2), scl(s, 3));
            drawPixel(ctx, scl(s, 40), scl(s, 26), s, outlineColor);
            drawLine(ctx, scl(s, 40), scl(s, 25), scl(s, 2), 0, scl(s, 1), outlineColor);
            ctx.fillRect(scl(s, 37), scl(s, 18), scl(s, 7), scl(s, 7));
            drawLine(ctx, scl(s, 36), scl(s, 19), 0, scl(s, 5), scl(s, 1), outlineColor);
            drawLine(ctx, scl(s, 35), scl(s, 20), 0, scl(s, 2), scl(s, 1), outlineColor);
            ctx.fillRect(scl(s, 38), scl(s, 16), scl(s, 6), scl(s, 2));
            drawLine(ctx, scl(s, 39), scl(s, 15), scl(s, 3), 0, scl(s, 1), outlineColor);
            drawLine(ctx, scl(s, 44), scl(s, 17), 0, scl(s, 7), scl(s, 1), outlineColor);
            drawLine(ctx, scl(s, 45), scl(s, 19), 0, scl(s, 3), scl(s, 1), outlineColor);

            // Left Arm
            setColor(ctx, armColor);
            ctx.fillRect(scl(s, 17), scl(s, 24), scl(s, -2), scl(s, 3));
            ctx.fillRect(scl(s, 15), scl(s, 25), scl(s, -1), scl(s, 3));
            ctx.fillRect(scl(s, 14), scl(s, 25), scl(s, -3), scl(s, 4));
            ctx.fillRect(scl(s, 11), scl(s, 26), scl(s, -1), scl(s, 3));
            ctx.fillRect(scl(s, 10), scl(s, 26), scl(s, -1), scl(s, 2));
            drawPixel(ctx, scl(s, 8), scl(s, 26), s, armColor);
            drawPixel(ctx, scl(s, 4), scl(s, 21), s, armColor);
            drawPixel(ctx, scl(s, 5), scl(s, 17), s, armColor);
            drawPixel(ctx, scl(s, 6), scl(s, 18), s, armColor);
            drawLine(ctx, scl(s, 5), scl(s, 22), scl(s, 2), 0, scl(s, 1), armColor);
            drawLine(ctx, scl(s, 7), scl(s, 19), 0, scl(s, 3), scl(s, 1), armColor);
            drawPixel(ctx, scl(s, 7), scl(s, 24), s, armColor);
            drawPixel(ctx, scl(s, 8), scl(s, 20), s, armColor);
            drawPixel(ctx, scl(s, 8), scl(s, 22), s, armColor);
            drawPixel(ctx, scl(s, 9), scl(s, 22), s, armColor);
            drawLine(ctx, scl(s, 9), scl(s, 19), scl(s, 2), 0, scl(s, 1), armColor);
            drawLine(ctx, scl(s, 9), scl(s, 24), scl(s, 2), 0, scl(s, 1), armColor);
            drawPixel(ctx, scl(s, 11), scl(s, 23), s, armColor);

            //Right Arm
            setColor(ctx, armColor);
            ctx.fillRect(scl(s, 31), scl(s, 25), scl(s, 1), scl(s, 3));
            ctx.fillRect(scl(s, 32), scl(s, 26), scl(s, 3), scl(s, 3));
            ctx.fillRect(scl(s, 35), scl(s, 25), scl(s, 2), scl(s, 3));
            drawPixel(ctx, scl(s, 36), scl(s, 24), s, armColor);
            drawPixel(ctx, scl(s, 37), scl(s, 27), s, armColor);
            drawLine(ctx, scl(s, 37), scl(s, 26), scl(s, 3), 0, scl(s, 1), armColor);
            drawPixel(ctx, scl(s, 38), scl(s, 23), s, armColor);
            drawPixel(ctx, scl(s, 39), scl(s, 24), s, armColor);
            drawPixel(ctx, scl(s, 38), scl(s, 20), s, armColor);
            drawLine(ctx, scl(s, 38), scl(s, 18), scl(s, 2), 0, scl(s, 1), armColor);
            drawLine(ctx, scl(s, 40), scl(s, 19), 0, scl(s, 4), scl(s, 1), armColor);
            drawPixel(ctx, scl(s, 39), scl(s, 21), s, armColor);
            drawLine(ctx, scl(s, 41), scl(s, 17), 0, scl(s, 2), scl(s, 1), armColor);
            drawLine(ctx, scl(s, 41), scl(s, 22), scl(s, 2), 0, scl(s, 1), armColor);
            drawPixel(ctx, scl(s, 43), scl(s, 21), s, armColor);
        }

        var addPlunger = function(ctx, flash) {
            ctx.lineWidth = 0.0;
            ctx.lineJoin = 'round';

            setColor(ctx, flash ? FLASH_PLUNGER_COLOR : PLUNGER_COLOR);
            ctx.fillRect(scl(s, 19), scl(s, 2), scl(s, 10), scl(s, 3));
            ctx.fillRect(scl(s, 22), scl(s, 5), scl(s, 4), scl(s, 4));
            ctx.fillRect(scl(s, 15), scl(s, 9), scl(s, 18), scl(s, 3));
        }

        ctx.save();
        ctx.translate(-3, -3);

        if(!eyesOnly) {
            s = s * 2/3;
            addFill(ctx,flash,color);
            addPlunger(ctx, flash);
            addMouth(ctx, flash);
            addOutline(ctx, flash);
            addArms(ctx, flash);
        }
    
        addEyes(ctx, dirEnum, flash, eyesOnly);

        ctx.restore();
    }

    return function(ctx, x, y, frame, dirEnum, scared, flash, eyesOnly, color) {
        ctx.save();
        ctx.translate(x-7, y-7);

        drawSyringe(ctx, dirEnum, flash, color, eyesOnly)

        ctx.restore();
    };
})();

// draw points displayed when pac-man eats a ghost or a fruit
var drawPacPoints = (function(){
    var ctx;
    var color;

    var plotOutline = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.closePath();
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    var plotLine = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    var draw0 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotOutline([
            1,0,
            2,0,
            3,1,
            3,5,
            2,6,
            1,6,
            0,5,
            0,1,
        ],color);
        ctx.restore();
    };

    var draw1narrow = function(x,y) {
        plotLine([x,y,x,y+6],color);
    };

    var draw1 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            0,1,
            1,0,
            1,6,
            0,6,
            2,6,
        ],color);
        ctx.restore();
    };

    var draw2 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            0,2,
            0,1,
            1,0,
            3,0,
            4,1,
            4,2,
            0,6,
            4,6,
        ],color);
        ctx.restore();
    };

    var draw3 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            0,0,
            4,0,
            2,2,
            4,4,
            4,5,
            3,6,
            1,6,
            0,5,
        ],color);
        ctx.restore();
    };

    var draw4 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            3,6,
            3,0,
            0,3,
            0,4,
            4,4,
        ],color);
        ctx.restore();
    };

    var draw5 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            4,0,
            0,0,
            0,2,
            3,2,
            4,3,
            4,5,
            3,6,
            1,6,
            0,5,
        ],color);
        ctx.restore();
    };

    var draw6 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            3,0,
            1,0,
            0,1,
            0,5,
            1,6,
            2,6,
            3,5,
            3,3,
            0,3,
        ],color);
        ctx.restore();
    };

    var draw7 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            0,1,
            0,0,
            4,0,
            4,1,
            2,4,
            2,6,
        ],color);
        ctx.restore();
    };

    var draw8 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotOutline([
            1,0,
            3,0,
            4,1,
            4,2,
            3,3,
            1,3,
            0,4,
            0,5,
            1,6,
            3,6,
            4,5,
            4,4,
            3,3,
            1,3,
            0,2,
            0,1,
        ],color);
        ctx.restore();
    };

    var draw100 = function() {
        draw1(-5,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };

    var draw200 = function() {
        draw2(-7,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };

    var draw300 = function() {
        draw3(-7,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };
    
    var draw400 = function() {
        draw4(-7,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };

    var draw500 = function() {
        draw5(-7,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };

    var draw700 = function() {
        draw7(-7,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };

    var draw800 = function() {
        draw8(-7,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };

    var draw1000 = function() {
        draw1(-8,-3);
        draw0(-4,-3);
        draw0(1,-3);
        draw0(6,-3);
    };
    
    var draw1600 = function() {
        draw1narrow(-7,-3);
        draw6(-5,-3);
        draw0(0,-3);
        draw0(5,-3);
    };

    var draw2000 = function() {
        draw2(-10,-3);
        draw0(-4,-3);
        draw0(1,-3);
        draw0(6,-3);
    };

    var draw3000 = function() {
        draw3(-10,-3);
        draw0(-4,-3);
        draw0(1,-3);
        draw0(6,-3);
    };

    var draw5000 = function() {
        draw5(-10,-3);
        draw0(-4,-3);
        draw0(1,-3);
        draw0(6,-3);
    };

    return function(_ctx,x,y,points,_color) {
        ctx = _ctx;
        color = _color;

        ctx.save();
        ctx.translate(x+0.5,y+0.5);
        ctx.translate(0,-1);

        var f = {
            100: draw100,
            200: draw200,
            300: draw300,
            400: draw400,
            500: draw500,
            700: draw700,
            800: draw800,
            1000: draw1000,
            1600: draw1600,
            2000: draw2000,
            3000: draw3000,
            5000: draw5000,
        }[points];

        if (f) {
            f();
        }

        ctx.restore();
    };
})();

// draw points displayed when ms. pac-man eats a fruit
var drawBonusPoints = (function(){
    var ctx;
    var color = "#fff";

    var plotOutline = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.closePath();
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    var plotLine = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };


    var draw0 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotOutline([
            0,0,
            2,0,
            2,4,
            0,4,
        ],color);
        ctx.restore();
    };

    var draw1 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            1,0,
            1,4,
        ],color);
        ctx.restore();
    };

    var draw2 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            0,0,
            2,0,
            2,2,
            0,2,
            0,4,
            2,4,
        ],color);
        ctx.restore();
    };

    var draw5 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            2,0,
            0,0,
            0,2,
            2,2,
            2,4,
            0,4,
        ],color);
        ctx.restore();
    };

    var draw7 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            0,0,
            2,0,
            2,4,
        ],color);
        ctx.restore();
    };

    var draw100 = function() {
        draw1(-5,-5);
        draw0(-1,-2);
        draw0(3,1);
    };

    var draw200 = function() {
        draw2(-5,-5);
        draw0(-1,-2);
        draw0(3,1);
    };

    var draw500 = function() {
        draw5(-5,-5);
        draw0(-1,-2);
        draw0(3,1);
    };

    var draw700 = function() {
        draw7(-5,-5);
        draw0(-1,-2);
        draw0(3,1);
    };

    var draw1000 = function() {
        draw1(-7,-7);
        draw0(-3,-4);
        draw0(1,-1);
        draw0(5,2);
    };

    var draw2000 = function() {
        draw2(-7,-7);
        draw0(-3,-4);
        draw0(1,-1);
        draw0(5,2);
    };

    var draw5000 = function() {
        draw5(-7,-7);
        draw0(-3,-4);
        draw0(1,-1);
        draw0(5,2);
    };

    return function(_ctx,x,y,points) {
        ctx = _ctx;

        ctx.save();
        ctx.translate(x+0.5,y+0.5);

        var f = {
            100: draw100,
            200: draw200,
            500: draw500,
            700: draw700,
            1000: draw1000,
            2000: draw2000,
            5000: draw5000,
        }[points];

        if (f) {
            f();
        }

        ctx.restore();
    };
})();

var drawMonsterSprite = (function(){
    var ctx;
    var color;

    var plotOutline = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.closePath();
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    var plotLine = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    var plotSolid = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.closePath();
        ctx.lineWidth = 1.0;
        ctx.lineJoin = "round";
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.fill();
        ctx.stroke();
    };


    // draw regular ghost eyes
    var drawEye = function(dirEnum,x,y){
        var i;

        ctx.save();
        ctx.translate(x,y);

        plotSolid([
            0,1,
            1,0,
            2,0,
            3,1,
            3,3,
            2,4,
            1,4,
            0,3
        ],"#FFF");

        // translate pupil to correct position
        if (dirEnum == DIR_LEFT) ctx.translate(0,2);
        else if (dirEnum == DIR_RIGHT) ctx.translate(2,2);
        else if (dirEnum == DIR_UP) ctx.translate(1,0);
        else if (dirEnum == DIR_DOWN) ctx.translate(1,3);

        // draw pupil
        plotSolid([
            0,0,
            1,0,
            1,1,
            0,1,
        ],"#00F");

        ctx.restore();
    };

    var drawRightBody = function() {
        plotSolid([
            -7,-3,
            -3,-7,
            -1,-7,
            -2,-6,
            0,-4,
            3,-7,
            5,-7,
            4,-7,
            3,-6,
            6,-3,
            6,1,
            5,3,
            2,6,
            -4,6,
            -5,5,
            -7,1,
        ],color);
    };

    var drawRightShoe = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotSolid([
            0,0,
            3,-3,
            4,-3,
            5,-2,
            5,-1,
            4,0,
        ],"#00F");
        ctx.restore();
    };

    var drawRight0 = function() {
        // antenna tips
        plotLine([-1,-7,0,-6],"#FFF");
        plotLine([5,-7,6,-6],"#FFF");

        drawRightBody();

        drawRightShoe(1,6);
        plotLine([-4,6,-1,6],"#00F");

        drawEye(DIR_RIGHT,-4,-4);
        drawEye(DIR_RIGHT,2,-4);
    };

    var drawRight1 = function() {
        // antenna tips
        plotLine([-1,-7,0,-7],"#FFF");
        plotLine([5,-7,6,-7],"#FFF");

        drawRightBody();

        drawRightShoe(-4,6);
        plotLine([2,6,5,6],"#00F");

        drawEye(DIR_RIGHT,-4,-4);
        drawEye(DIR_RIGHT,2,-4);
    };

    var drawLeft0 = function() {
        ctx.scale(-1,1);
        ctx.translate(1,0);
        drawRight0();
    };
    
    var drawLeft1 = function() {
        ctx.scale(-1,1);
        ctx.translate(1,0);
        drawRight1();
    };

    var drawUpDownBody0 = function() {
        plotLine([-6,-7,-7,-6],"#FFF");
        plotLine([5,-7,6,-6],"#FFF");
        plotSolid([
            -7,-3,
            -4,-6,
            -5,-7,
            -6,-7,
            -4,-7,
            -3,-6,
            -2,-6,
            -1,-5,
            0,-5,
            1,-6,
            2,-6,
            3,-7,
            5,-7,
            4,-7,
            3,-6,
            6,-3,
            6,1,
            5,3,
            4,5,
            3,6,
            -4,6,
            -5,5,
            -6,3,
            -7,1,
        ],color);
    };

    var drawUpDownBody1 = function() {
        plotLine([-6,-6,-7,-5],"#FFF");
        plotLine([5,-6,6,-5],"#FFF");
        plotSolid([
            -7,-3,
            -4,-6,
            -5,-7,
            -6,-6,
            -5,-7,
            -4,-7,
            -3,-6,
            -2,-6,
            -1,-5,
            0,-5,
            1,-6,
            2,-6,
            3,-7,
            4,-7,
            5,-6,
            4,-7,
            3,-6,
            6,-3,
            6,1,
            5,3,
            4,5,
            3,6,
            -4,6,
            -5,5,
            -6,3,
            -7,1,
        ],color);
    };

    var drawUp0 = function() {
        drawUpDownBody0();
        drawEye(DIR_UP,-5,-5);
        drawEye(DIR_UP,1,-5);
        plotSolid([
            -4,6,
            -3,5,
            -2,5,
            -1,6,
        ],"#00F");
    };

    var drawUp1 = function() {
        drawUpDownBody1();
        drawEye(DIR_UP,-5,-5);
        drawEye(DIR_UP,1,-5);
        plotSolid([
            0,6,
            1,5,
            2,5,
            3,6,
        ],"#00F");
    };

    var drawDown0 = function() {
        drawUpDownBody0();
        drawEye(DIR_DOWN,-5,-4);
        drawEye(DIR_DOWN,1,-4);
        plotSolid([
            0,6,
            1,4,
            2,3,
            3,3,
            4,4,
            4,5,
            3,6,
        ],"#00F");
        plotLine([-4,6,-2,6],"#00F");
    };

    var drawDown1 = function() {
        drawUpDownBody1();
        drawEye(DIR_DOWN,-5,-4);
        drawEye(DIR_DOWN,1,-4);
        plotSolid([
            -1,6,
            -2,4,
            -3,3,
            -4,3,
            -5,4,
            -5,5,
            -4,6,
        ],"#00F");
        plotLine([1,6,3,6],"#00F");
    };

    var borderColor;
    var faceColor;

    var drawScaredBody = function() {
        plotOutline([
            -6,-2,
            -2,-5,
            -3,-6,
            -5,-6,
            -3,-6,
            -1,-4,
            1,-4,
            3,-6,
            5,-6,
            3,-6,
            2,-5,
            6,-2,
            6,4,
            5,6,
            4,7,
            -4,7,
            -5,6,
            -6,4
        ],borderColor);

        plotLine([
            -2,4,
            -1,3,
            1,3,
            2,4
        ],faceColor);
    };


    var drawScared0 = function(flash) {
        plotLine([-2,-2,-2,0],faceColor);
        plotLine([-3,-1,-1,-1],faceColor);
        plotLine([2,-2,2,0],faceColor);
        plotLine([3,-1,1,-1],faceColor);
        plotLine([-5,-6,-6,-7],"#FFF");
        plotLine([5,-6,6,-7],"#FFF");
        drawScaredBody();
    };

    var drawScared1 = function(flash) {
        plotLine([-3,-2,-1,0],faceColor);
        plotLine([-3,0,-1,-2],faceColor);
        plotLine([1,-2,3,0],faceColor);
        plotLine([1,0,3,-2],faceColor);
        plotLine([-5,-6,-6,-5],"#FFF");
        plotLine([5,-6,6,-5],"#FFF");
        drawScaredBody();
    };

    return function(_ctx,x,y,frame,dirEnum,scared,flash,eyes_only,_color) {
        if (eyes_only) {
            return; // invisible
        }

        ctx = _ctx;
        color = _color;

        ctx.save();
        ctx.translate(x+0.5,y+0.5);

        if (scared) {
            ctx.translate(0,-1); // correct alignment error from my chosen coordinates
            borderColor = flash ? "#FFF" : "#00F";
            faceColor = flash ? "#F00" : "#FF0";
            [drawScared0, drawScared1][frame]();
        }
        else if (dirEnum == DIR_RIGHT) {
            [drawRight0, drawRight1][frame]();
        }
        else if (dirEnum == DIR_LEFT) {
            [drawLeft0, drawLeft1][frame]();
        }
        else if (dirEnum == DIR_DOWN) {
            [drawDown0, drawDown1][frame]();
        }
        else if (dirEnum == DIR_UP) {
            [drawUp0, drawUp1][frame]();
        }

        ctx.restore();
    };
})();

// draw player body
var drawPacmanSprite = function(ctx,x,y,dirEnum,angle,mouthShift,scale,centerShift,alpha,color,rot_angle) {

    if (mouthShift == undefined) mouthShift = 0;
    if (centerShift == undefined) centerShift = 0;
    if (scale == undefined) scale = 1;
    if (alpha == undefined) alpha = 1;

    if (color == undefined) {
        color = "rgba(255,255,0," + alpha + ")";
    }

    ctx.save();
    ctx.translate(x,y);
    ctx.scale(scale,scale);
    if (rot_angle) {
        ctx.rotate(rot_angle);
    }

    // rotate to current heading direction
    var d90 = Math.PI/2;
    if (dirEnum == DIR_UP) ctx.rotate(3*d90);
    else if (dirEnum == DIR_RIGHT) ctx.rotate(0);
    else if (dirEnum == DIR_DOWN) ctx.rotate(d90);
    else if (dirEnum == DIR_LEFT) ctx.rotate(2*d90);

    // plant corner of mouth
    ctx.beginPath();
    ctx.moveTo(-3+mouthShift,0);

    // draw head outline
    ctx.arc(centerShift,0,6.5,angle,2*Math.PI-angle);
    ctx.closePath();

    //ctx.strokeStyle = color;
    //ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
};

// draw giant player body
var drawGiantPacmanSprite = function(ctx,x,y,dirEnum,frame) {

    var color = "#FF0";
    var mouthShift = 0;
    var angle = 0;
    if (frame == 1) {
        mouthShift = -4;
        angle = Math.atan(7/14);
    }
    else if (frame == 2) {
        mouthShift = -2;
        angle = Math.atan(13/9);
    }

    ctx.save();
    ctx.translate(x,y);

    // rotate to current heading direction
    var d90 = Math.PI/2;
    if (dirEnum == DIR_UP) ctx.rotate(3*d90);
    else if (dirEnum == DIR_RIGHT) ctx.rotate(0);
    else if (dirEnum == DIR_DOWN) ctx.rotate(d90);
    else if (dirEnum == DIR_LEFT) ctx.rotate(2*d90);

    // plant corner of mouth
    ctx.beginPath();
    ctx.moveTo(mouthShift,0);

    // draw head outline
    ctx.arc(0,0,16,angle,2*Math.PI-angle);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
};

var drawTubieManSprite = (function(){
    // TODO: draw pupils separately in atlas
    //       composite the body frame and a random pupil frame when drawing tubie-man
    var prevFrame = undefined;
    var sx1 = 0; // shift x for first pupil
    var sy1 = 0; // shift y for first pupil
    var sx2 = 0; // shift x for second pupil
    var sy2 = 0; // shift y for second pupil

    var er = 2.1; // eye radius
    var pr = 1; // pupil radius
    var tr = 1; // tube circle radius

    var movePupils = function() {
        var a1 = Math.random()*Math.PI*2;
        var a2 = Math.random()*Math.PI*2;
        var r1 = Math.random()*pr;
        var r2 = Math.random()*pr;

        sx1 = Math.cos(a1)*r1;
        sy1 = Math.sin(a1)*r1;
        sx2 = Math.cos(a2)*r2;
        sy2 = Math.sin(a2)*r2;
    };

    return function(ctx,x,y,dirEnum,frame,shake,rot_angle) {
        let angle = 0;

        // draw body
        const draw = function(angle) {
            //angle = Math.PI/6*frame;
            drawPacmanSprite(ctx,x,y,dirEnum,angle,undefined,undefined,undefined,undefined,"#FF6E31",rot_angle);
        };

        if (frame == 0) {
            // closed
            draw(0);
        }
        else if (frame == 1) {
            // open
            angle = Math.atan(4/5);
            draw(angle);
            angle = Math.atan(4/8); // angle for drawing eye
        }
        else if (frame == 2) {
            // wide
            angle = Math.atan(6/3);
            draw(angle);
            angle = Math.atan(6/6); // angle for drawing eye
        }

        ctx.save();
        ctx.translate(x,y);
        if (rot_angle) {
            ctx.rotate(rot_angle);
        }

        // reflect or rotate sprite according to current direction
        var d90 = Math.PI/2;
        if (dirEnum == DIR_UP)
            ctx.rotate(-d90);
        else if (dirEnum == DIR_DOWN)
            ctx.rotate(d90);
        else if (dirEnum == DIR_LEFT)
            ctx.scale(-1,1);

        const ex = -4; // pivot point
        const ey = -3.5;
        const tx = -3.5;
        const ty = 2;
        const ngx = -4.75;
        const ngy = -0.75;
        var r1 = 3; // distance from pivot of first eye
        var r2 = 6.5; // distance from pivot of second eye
        var r3 = 0; // distance from pivot of tube
        var r4 = 4.5; // distance from pivot of ng tube;
        angle /= 3; // angle from pivot point
        angle += Math.PI/8;
        var c = Math.cos(angle);
        var s = Math.sin(angle);

        if (shake) {
            if (frame != prevFrame) {
                movePupils();
            }
            prevFrame = frame;
        }

        // second eyeball
        ctx.beginPath();
        ctx.arc(ex+r2*c, ey-r2*s, er, 0, Math.PI*2);
        ctx.fillStyle = "#FFF";
        ctx.fill();
        // second pupil
        ctx.beginPath();
        ctx.arc(ex+r2*c+sx2, ey-r2*s+sy2, pr, 0, Math.PI*2);
        ctx.fillStyle = "#000";
        ctx.fill();

        // first eyeball
        ctx.beginPath();
        ctx.arc(ex+r1*c, ey-r1*1.8*s, er, 0, Math.PI*2);
        ctx.fillStyle = "#FFF";
        ctx.fill();
        // first pupil
        ctx.beginPath();
        ctx.arc(ex+r1*c+sx1, ey-r1*1.8*s+sy1, pr, 0, Math.PI*2);
        ctx.fillStyle = "#000";
        ctx.fill();

        const tubeColor = "#FFF";
        const tubeAccentColor = "#808080";
        const tubeLength = 3;
        const tubeThickness = 1.125

        //tube
        //tube-line
        ctx.beginPath();
        ctx.moveTo(tx+r3*c+tubeLength/3, ty-r3*s);
        ctx.lineTo(tx+r3*c-tubeLength/2,ty-r3*s);
        ctx.lineCap = 'round';
        ctx.strokeStyle = tubeColor;
        ctx.lineWidth = tubeThickness;
        ctx.stroke();
        //tube-center
        ctx.beginPath();
        ctx.arc(tx+r3*c, ty-r3*s, tr, 0, Math.PI*2);
        ctx.fillStyle = tubeColor;
        ctx.fill();
        //tube-center
        ctx.beginPath();
        ctx.arc(tx+r3*c, ty-r3*s, tr/2.5, 0, Math.PI*2);
        ctx.fillStyle = tubeAccentColor;
        ctx.fill();

        //ng-tube
        const centerX = 0;
        const centerY = 0;

        const ngTubeLength = 5.25;
        const ngTubeThickness = 0.5;
        const tubieManRadius = 7.65;

        const ngStartX = ngx - 0.75 + r4 * c + ngTubeLength / 3;
        const ngStartY = ngy - r4 * s;

        const distFromStartToCenter = Math.sqrt(Math.pow(ngStartX - centerX, 2) + Math.pow(ngStartY - centerY, 2));
        const distanceToEdge = tubieManRadius - distFromStartToCenter;

        const ngEndX = (ngx + r4 * c - distanceToEdge);
        const ngEndY = (ngy - r4 * s);

        const cp1X = (ngx - 1.5 + r4 - 1.2 * c + tubeLength / 2);
        const cp1Y = (ngy - r4/2 * s);
        const cp2X = (ngx - 1.5 + r4 - 2 * c + tubeLength / 2.5);
        const cp2Y = (ngy - r4/2 * s);

        const ngTubeColor = "#FFE9AC";
 
        ctx.beginPath();
        ctx.moveTo(ngStartX, ngStartY);
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, ngEndX, ngEndY);
        ctx.lineCap = 'round';
        ctx.strokeStyle = ngTubeColor;
        ctx.lineWidth = ngTubeThickness;
        ctx.stroke();

        const DEBUG_NG_TUBE = false;

        if(DEBUG_NG_TUBE) {
            ctx.fillStyle = "#0F0";
            ctx.beginPath();
            ctx.arc(cp1X, cp1Y, 0.25, 0, 2 * Math.PI); // Control point one
            ctx.arc(cp2X, cp2Y, 0.25, 0, 2 * Math.PI); // Control point two
            ctx.fill();

            ctx.fillStyle = "#00F";
            ctx.beginPath();
            ctx.arc(0, 0, 0.25, 0, 2 * Math.PI); // Tubie-Man center
            ctx.fill();
        }

        ctx.restore();
    };
})();

////////////////////////////////////////////////////////////////////
// FRUIT SPRITES

// GTube
var drawGTube = function(ctx, x, y) {
    ctx.save();
    ctx.translate(x - 8, y - 8);

    // Path generated from SVG w/ Inkscape
	ctx.fillStyle = 'rgb(227, 222, 219)';
	ctx.lineWidth = 1;
	ctx.lineJoin = 'round';

	ctx.beginPath();
	ctx.moveTo(6, 14);
	ctx.lineTo(6, 15);
	ctx.quadraticCurveTo(6, 15, 6, 15);
	ctx.lineTo(10, 15);
	ctx.quadraticCurveTo(10, 15, 10, 15);
	ctx.lineTo(10, 14);
	ctx.quadraticCurveTo(10, 14, 10, 14);
	ctx.lineTo(6, 14);
	ctx.quadraticCurveTo(6, 14, 6, 14);
	ctx.fill();
	
    // #rect3
	ctx.beginPath();
	ctx.rect(5, 13, 6, 1);
	ctx.fill();
	
    // #rect4
	ctx.beginPath();
	ctx.rect(4, 12, 8, 1);
	ctx.fill();
	
    // #rect5
	ctx.beginPath();
	ctx.rect(5, 11, 6, 1);
	ctx.fill();
	
    // #rect6
	ctx.beginPath();
	ctx.rect(6, 10, 4, 1);
	ctx.fill();
	
    // #rect8
	ctx.beginPath();
	ctx.moveTo(3, 3);
	ctx.lineTo(3, 5);
	ctx.quadraticCurveTo(3, 5, 3, 5);
	ctx.lineTo(11, 5);
	ctx.quadraticCurveTo(11, 5, 11, 5);
	ctx.lineTo(11, 3);
	ctx.quadraticCurveTo(11, 3, 11, 3);
	ctx.lineTo(3, 3);
	ctx.quadraticCurveTo(3, 3, 3, 3);
	ctx.fill();
	
    // #rect9
	ctx.beginPath();
	ctx.moveTo(10, 4);
	ctx.lineTo(10, 5);
	ctx.quadraticCurveTo(10, 5, 10, 5);
	ctx.lineTo(14, 5);
	ctx.quadraticCurveTo(14, 5, 14, 5);
	ctx.lineTo(14, 4);
	ctx.quadraticCurveTo(14, 4, 14, 4);
	ctx.lineTo(10, 4);
	ctx.quadraticCurveTo(10, 4, 10, 4);
	ctx.fill();
	
    // #rect10
	ctx.beginPath();
	ctx.moveTo(14, 2);
	ctx.lineTo(14, 4);
	ctx.quadraticCurveTo(14, 4, 14, 4);
	ctx.lineTo(15, 4);
	ctx.quadraticCurveTo(15, 4, 15, 4);
	ctx.lineTo(15, 2);
	ctx.quadraticCurveTo(15, 2, 15, 2);
	ctx.lineTo(14, 2);
	ctx.quadraticCurveTo(14, 2, 14, 2);
	ctx.fill();
	
    // #rect11
	ctx.beginPath();
	ctx.moveTo(5, 1);
	ctx.lineTo(5, 2);
	ctx.quadraticCurveTo(5, 2, 5, 2);
	ctx.lineTo(14, 2);
	ctx.quadraticCurveTo(14, 2, 14, 2);
	ctx.lineTo(14, 1);
	ctx.quadraticCurveTo(14, 1, 14, 1);
	ctx.lineTo(5, 1);
	ctx.quadraticCurveTo(5, 1, 5, 1);
	ctx.fill();
	
    // #rect12
	ctx.beginPath();
	ctx.moveTo(1, 2);
	ctx.lineTo(1, 5);
	ctx.quadraticCurveTo(1, 5, 1, 5);
	ctx.lineTo(4, 5);
	ctx.quadraticCurveTo(4, 5, 4, 5);
	ctx.lineTo(4, 2);
	ctx.quadraticCurveTo(4, 2, 4, 2);
	ctx.lineTo(1, 2);
	ctx.quadraticCurveTo(1, 2, 1, 2);
	ctx.fill();
	

	ctx.fillStyle = 'rgb(183, 190, 200)';

    // #rect13
	ctx.beginPath();
	ctx.moveTo(6, 2);
	ctx.lineTo(6, 3);
	ctx.quadraticCurveTo(6, 3, 6, 3);
	ctx.lineTo(10, 3);
	ctx.quadraticCurveTo(10, 3, 10, 3);
	ctx.lineTo(10, 2);
	ctx.quadraticCurveTo(10, 2, 10, 2);
	ctx.lineTo(6, 2);
	ctx.quadraticCurveTo(6, 2, 6, 2);
	ctx.fill();
	
    // #rect7
	ctx.beginPath();
	ctx.rect(7, 3, 2, 12);
	ctx.fill();
	

	ctx.fillStyle = 'rgb(170, 204, 255)';

    // #rect15
	ctx.beginPath();
	ctx.moveTo(2, 3);
	ctx.lineTo(2, 4);
	ctx.quadraticCurveTo(2, 4, 2, 4);
	ctx.lineTo(3, 4);
	ctx.quadraticCurveTo(3, 4, 3, 4);
	ctx.lineTo(3, 3);
	ctx.quadraticCurveTo(3, 3, 3, 3);
	ctx.lineTo(2, 3);
	ctx.quadraticCurveTo(2, 3, 2, 3);
	ctx.fill();

    ctx.restore();
}

// Endless Pump
var drawEndlessPump = function(ctx, x, y) {
    ctx.save();
    ctx.translate(x - 8, y - 8);

    // Path generated from SVG w/ Inkscape
	ctx.fillStyle = 'rgb(16, 164, 179)';
	ctx.lineWidth = 1;
	ctx.lineJoin = 'round';

    // #rect2
	ctx.beginPath();
	ctx.moveTo(2, 5);
	ctx.lineTo(2, 4);
	ctx.lineTo(14, 4);
	ctx.lineTo(14, 5);
	ctx.lineTo(15, 5);
	ctx.lineTo(15, 13);
	ctx.lineTo(1, 13);
	ctx.lineTo(1, 5);
	ctx.closePath();
	ctx.fill();
	
    // #rect14
	ctx.beginPath();
	ctx.fillStyle = 'rgb(214, 217, 224)';
	ctx.lineWidth = 1;
	ctx.lineJoin = 'round';
	ctx.moveTo(2, 4);
	ctx.lineTo(2, 3);
	ctx.lineTo(14, 3);
	ctx.lineTo(14, 4);
	ctx.lineTo(15, 4);
	ctx.lineTo(15, 7);
	ctx.lineTo(14, 7);
	ctx.lineTo(14, 8);
	ctx.lineTo(2, 8);
	ctx.lineTo(2, 7);
	ctx.lineTo(1, 7);
	ctx.lineTo(1, 4);
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = 'rgb(214, 217, 224)';

    // #rect4
	ctx.beginPath();
	ctx.rect(2, 9, 6, 3);
	ctx.fill();
    
	
	ctx.fillStyle = 'rgb(34, 149, 161)';

    // #rect5
	ctx.beginPath();
	ctx.rect(9, 9, 1, 1);
	ctx.fill();

    // #rect6
	ctx.beginPath();
	ctx.rect(9, 11, 1, 1);
	ctx.fill();
	
    // #rect7
	ctx.beginPath();
	ctx.rect(11, 9, 1, 1);
	ctx.fill();
	
    // #rect8
	ctx.beginPath();
	ctx.rect(11, 11, 1, 1);
	ctx.fill();
	
    // #rect9
	ctx.beginPath();
	ctx.rect(13, 9, 1, 1);
	ctx.fill();
	
    // #rect10
	ctx.beginPath();
	ctx.rect(13, 11, 1, 1);
	ctx.fill();
	
	ctx.fillStyle = 'rgb(119, 119, 126)';
	ctx.lineWidth = 0.5;

    // #path12
	ctx.beginPath();
	ctx.moveTo(2, 4);
	ctx.lineTo(2, 6);
	ctx.lineTo(9, 6);
	ctx.lineTo(9, 4);
	ctx.closePath();
	ctx.fill();
    
	ctx.fillStyle = 'rgb(34, 149, 161)';
	
    // #rect12
	ctx.beginPath();
	ctx.rect(13, 4, 1, 1);
	ctx.fill();
	
    // #rect13
	ctx.beginPath();
	ctx.rect(13, 6, 1, 1);
	ctx.fill();
    
	ctx.fillStyle = 'rgb(171, 65, 33)';
	ctx.lineWidth = 2;
	
    // #rect13-2
	ctx.beginPath();
	ctx.rect(5, 6, 4, 1);
	ctx.fill();

    ctx.fillStyle = 'rgb(119, 119, 126)';

    // #rect5-4
	ctx.beginPath();
	ctx.rect(3, 10, 4, 1);
	ctx.fill();

    ctx.restore();
};

// Marsupial Pump
var drawMarsupialPump = function(ctx, x, y) {
    ctx.save();
    ctx.translate(x - 8, y - 8);

    // Path generated from SVG w/ Inkscape
	ctx.fillStyle = 'rgb(230, 230, 230)';
	ctx.lineWidth = 0.5;
	ctx.lineJoin = 'round';

    ctx.beginPath();
	ctx.moveTo(2, 4);
	ctx.lineTo(3, 4);
	ctx.lineTo(3, 3);
	ctx.lineTo(13, 3);
	ctx.lineTo(13, 4);
	ctx.lineTo(14, 4);
	ctx.lineTo(14, 5);
	ctx.lineTo(15, 5);
	ctx.lineTo(15, 12);
	ctx.lineTo(14, 12);
	ctx.lineTo(14, 13);
	ctx.lineTo(2, 13);
	ctx.lineTo(2, 12);
	ctx.lineTo(1, 12);
	ctx.lineTo(1, 5);
	ctx.lineTo(2, 5);
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = 'rgb(96, 96, 107)';
	ctx.lineWidth = 1;

    // #rect6-5
	ctx.beginPath();
	ctx.rect(2, 7, 1, 1);
	ctx.fill();
	
    // #rect6-5-8
	ctx.beginPath();
	ctx.rect(2, 9, 1, 1);
	ctx.fill();
	
    // #rect6-5-1
	ctx.beginPath();
	ctx.rect(2, 11, 1, 1);
	ctx.fill();

    // #rect6-5-4
	ctx.beginPath();
	ctx.rect(9, 6, 1, 1);
	ctx.fill();
    
	ctx.fillStyle = 'rgb(120, 55, 181)';

    // #rect2
	ctx.beginPath();
	ctx.moveTo(3, 3);
	ctx.lineTo(10, 3);
	ctx.lineTo(10, 4);
	ctx.lineTo(4, 4);
	ctx.lineTo(4, 5);
	ctx.lineTo(3, 5);
	ctx.lineTo(3, 6);
	ctx.lineTo(1, 6);
	ctx.lineTo(1, 5);
	ctx.lineTo(2, 5);
	ctx.lineTo(2, 4);
	ctx.lineTo(3, 4);
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = 'rgb(0, 0, 0)';

    // #rect3
	ctx.beginPath();
	ctx.moveTo(4, 4);
	ctx.lineTo(10, 4);
	ctx.lineTo(10, 5);
	ctx.lineTo(9, 5);
	ctx.lineTo(9, 6);
	ctx.lineTo(3, 6);
	ctx.lineTo(3, 5);
	ctx.lineTo(4, 5);
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = 'rgb(0, 0, 128)';

    // #rect4
	ctx.beginPath();
	ctx.moveTo(12, 6);
	ctx.lineTo(12, 5);
	ctx.lineTo(13, 5);
	ctx.lineTo(13, 6);
	ctx.lineTo(14, 6);
	ctx.lineTo(14, 12);
	ctx.lineTo(11, 12);
	ctx.lineTo(11, 6);
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = 'rgb(194, 194, 200)';

    // #rect5
	ctx.beginPath();
	ctx.rect(14, 7, 1, 1);
	ctx.fill();
	
    // #rect7
	ctx.beginPath();
	ctx.rect(3, 7, 6, 5);
	ctx.fill();

    ctx.restore();
};

// Jamie Pump
var drawJamiePump = function(ctx, x, y) {
    ctx.save();
    ctx.translate(x - 8, y - 8);

    // Path generated from SVG w/ Inkscape
    // #rect1
	ctx.fillStyle = 'rgb(236, 236, 236)';
	ctx.lineWidth = 1;
	ctx.lineJoin = 'round';

	ctx.beginPath();
	ctx.moveTo(2, 3);
	ctx.lineTo(5, 3);
	ctx.lineTo(5, 2);
	ctx.lineTo(11, 2);
	ctx.lineTo(11, 3);
	ctx.lineTo(14, 3);
	ctx.lineTo(14, 4);
	ctx.lineTo(15, 4);
	ctx.lineTo(15, 11);
	ctx.lineTo(14, 11);
	ctx.lineTo(14, 12);
	ctx.lineTo(11, 12);
	ctx.lineTo(11, 13);
	ctx.lineTo(5, 13);
	ctx.lineTo(5, 12);
	ctx.lineTo(2, 12);
	ctx.lineTo(2, 11);
	ctx.lineTo(1, 11);
	ctx.lineTo(1, 4);
	ctx.lineTo(2, 4);
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = 'rgb(0, 0, 128)';

    // #rect2
	ctx.beginPath();
	ctx.moveTo(3, 4);
	ctx.lineTo(6, 4);
	ctx.lineTo(6, 3);
	ctx.lineTo(10, 3);
	ctx.lineTo(10, 4);
	ctx.lineTo(13, 4);
	ctx.lineTo(13, 5);
	ctx.lineTo(14, 5);
	ctx.lineTo(14, 10);
	ctx.lineTo(13, 10);
	ctx.lineTo(13, 11);
	ctx.lineTo(10, 11);
	ctx.lineTo(10, 12);
	ctx.lineTo(6, 12);
	ctx.lineTo(6, 11);
	ctx.lineTo(3, 11);
	ctx.lineTo(3, 10);
	ctx.lineTo(2, 10);
	ctx.lineTo(2, 5);
	ctx.lineTo(3, 5);
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = 'rgb(160, 160, 160)';

    // #rect3
	ctx.beginPath();
	ctx.rect(4, 5, 8, 5);
	ctx.fill();
	
    
	ctx.fillStyle = 'rgb(113, 180, 208)';

    // #rect4
	ctx.beginPath();
	ctx.rect(3, 5, 1, 1);
	ctx.fill();
	
    // #rect4-8
	ctx.beginPath();
	ctx.rect(3, 7, 1, 1);
	ctx.fill();
	
    // #rect4-5
	ctx.beginPath();
	ctx.rect(3, 9, 1, 1);
	ctx.fill();
	
    // #rect4-1
	ctx.beginPath();
	ctx.rect(12, 9, 1, 1);
	ctx.fill();
	
	ctx.fillStyle = 'rgb(255, 255, 255)';

    // #rect4-7
	ctx.beginPath();
	ctx.rect(12, 5, 1, 1);
	ctx.fill();
	
	ctx.fillStyle = 'rgb(0, 0, 128)';

    // #rect5
	ctx.beginPath();
	ctx.rect(2, 2, 3, 1);
	ctx.fill();
	
    // #rect5-2
	ctx.beginPath();
	ctx.rect(11, 2, 3, 1);
	ctx.fill();
	
    // #rect5-2-1
	ctx.beginPath();
	ctx.rect(11, 12, 3, 1);
	ctx.fill();
	
    // #rect5-2-7
	ctx.beginPath();
	ctx.rect(2, 12, 3, 1);
	ctx.fill();
    
    ctx.restore();
};

// USB-C Charger
var drawUsbCharger = function(ctx, x, y) {
    ctx.save();
    ctx.translate(x - 8, y - 8);

    // Path generated from SVG w/ Inkscape	
	ctx.fillStyle = 'rgb(255, 102, 0)';
	ctx.lineWidth = 1;
	ctx.lineJoin = 'round';

    // #rect1
	ctx.beginPath();
	ctx.moveTo(1, 3);
	ctx.lineTo(1, 13);
	ctx.lineTo(7, 13);
	ctx.lineTo(7, 11);
	ctx.lineTo(15, 11);
	ctx.lineTo(15, 5);
	ctx.lineTo(7, 5);
	ctx.lineTo(7, 3);
	ctx.lineTo(1, 3);
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = 'rgb(212, 85, 0)';
	ctx.lineWidth = 0.75;

    // #rect3-5
	ctx.beginPath();
	ctx.rect(7, 7.5, 8, 1);
	ctx.fill();
	
    // #rect3-2
	ctx.beginPath();
	ctx.rect(7, 9.25, 8, 0.75);
	ctx.fill();
	
    // #rect3
	ctx.beginPath();
	ctx.rect(7, 6, 8, 0.75);
	ctx.fill();
	
	ctx.lineWidth = 1;

    // #rect4
	ctx.beginPath();
	ctx.moveTo(2.5, 6.25);
	ctx.bezierCurveTo(2, 6.25, 2, 6.5, 2, 6.5);
	ctx.lineTo(2, 10.5);
	ctx.bezierCurveTo(2, 10.5, 2.25, 11, 2.5, 11);
	ctx.lineTo(2.5, 11);
	ctx.bezierCurveTo(2.75, 10.75, 3, 10.75, 3, 10.5);
	ctx.lineTo(3, 8.5);
	ctx.lineTo(6, 8.5);
	ctx.lineTo(6, 7.5);
	ctx.lineTo(3, 7.5);
	ctx.lineTo(3, 6.5);
	ctx.bezierCurveTo(3, 6.25, 3, 6.25, 2.5, 6.25);
	ctx.lineTo(2.5, 6.25);
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = 'rgb(170, 68, 0)';

    // #rect6
	ctx.beginPath();
	ctx.rect(3, 8.5, 2, 1);
	ctx.fill();

    ctx.restore();
};

// Feeding Bag
var drawFeedingBag = function(ctx, x, y) {
    ctx.save();
    ctx.translate(x - 8, y - 8);

    // Path generated from SVG w/ Inkscape
	ctx.fillStyle = 'rgb(233, 221, 175)';
	ctx.lineWidth = 1;
	ctx.lineJoin = 'round';

    ctx.beginPath();
	ctx.moveTo(1, 3);
	ctx.lineTo(1, 13);
	ctx.lineTo(4, 13);
	ctx.lineTo(4, 14);
	ctx.lineTo(5, 14);
	ctx.lineTo(5, 15);
	ctx.lineTo(11, 15);
	ctx.lineTo(11, 14);
	ctx.lineTo(12, 14);
	ctx.lineTo(12, 13);
	ctx.lineTo(15, 13);
	ctx.lineTo(15, 3);
	ctx.lineTo(1, 3);
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = 'rgb(16, 164, 179)';
	ctx.lineWidth = 3;

    // #rect2-9
	ctx.beginPath();
	ctx.rect(5, 1, 6, 5);
	ctx.fill();
	
	ctx.fillStyle = 'rgb(233, 221, 175)';
	ctx.lineWidth = 1;

    // #rect5
	ctx.beginPath();
	ctx.rect(5, 5, 1, 1);
	ctx.fill();
	
    // #rect6
	ctx.beginPath();
	ctx.rect(10, 5, 1, 1);
	ctx.fill();
	
	ctx.fillStyle = 'rgb(43, 136, 143)';

    // #rect9
	ctx.beginPath();
	ctx.rect(6, 2, 4, 3);
	ctx.fill();

	ctx.fillStyle = 'rgb(16, 164, 179)';

    // #rect10
	ctx.beginPath();
	ctx.rect(6, 2, 1, 1);
	ctx.fill();
	
    // #rect11
	ctx.beginPath();
	ctx.rect(9, 2, 1, 1);
	ctx.fill();
	
    // #rect12
	ctx.beginPath();
	ctx.rect(9, 4, 1, 1);
	ctx.fill();
	
    // #rect13
	ctx.beginPath();
	ctx.rect(6, 4, 1, 1);
	ctx.fill();
	
	ctx.fillStyle = 'rgb(0, 0, 0)';
    // #rect7
	ctx.beginPath();
	ctx.rect(5, 1, 1, 1);
	ctx.fill();
	
    // #rect8
	ctx.beginPath();
	ctx.rect(10, 1, 1, 1);
	ctx.fill();

    // #rect14
	ctx.beginPath();
	ctx.rect(1, 3, 1, 1);
	ctx.fill();
	
    // #rect15
	ctx.beginPath();
	ctx.rect(14, 3, 1, 1);
	ctx.fill();
	
	ctx.fillStyle = 'rgb(150, 150, 150)';

    // #rect16
	ctx.beginPath();
	ctx.rect(2, 6, 1, 6);
	ctx.fill();
	
    // #rect17
	ctx.beginPath();
	ctx.rect(11, 6, 3, 2);
	ctx.fill();
	
	ctx.fillStyle = 'rgb(217, 203, 161)';

    // #rect18
	ctx.beginPath();
	ctx.rect(5, 8, 6, 1);
	ctx.fill();
	
    // #rect19
	ctx.beginPath();
	ctx.rect(5, 10, 6, 1);
	ctx.fill();
	
    // #rect20
	ctx.beginPath();
	ctx.rect(5, 12, 6, 1);
	ctx.fill();

    ctx.restore();
};

// Formula Bottle
var drawFormulaBottle = function(ctx, x, y) {
    ctx.save();
    ctx.translate(x - 8, y - 8);

    // Path generated from SVG w/ Inkscape
	ctx.lineWidth = 1;
	ctx.lineJoin = 'round';

    // #rect2
	ctx.fillStyle = 'rgb(190, 215, 255)';
	ctx.beginPath();
	ctx.rect(3, 2, 9, 14);
	ctx.fill();
	
    // #rect3
	ctx.fillStyle = 'rgb(226, 237, 255)';
	ctx.beginPath();
	ctx.moveTo(5, 4);
	ctx.lineTo(5, 5);
	ctx.lineTo(5, 6);
	ctx.lineTo(4, 6);
	ctx.lineTo(4, 7);
	ctx.lineTo(3, 7);
	ctx.lineTo(3, 11);
	ctx.lineTo(4, 11);
	ctx.lineTo(4, 12);
	ctx.lineTo(5, 12);
	ctx.lineTo(5, 13);
	ctx.lineTo(10, 13);
	ctx.lineTo(10, 12);
	ctx.lineTo(11, 12);
	ctx.lineTo(11, 11);
	ctx.lineTo(12, 11);
	ctx.lineTo(12, 7);
	ctx.lineTo(11, 7);
	ctx.lineTo(11, 6);
	ctx.lineTo(10, 6);
	ctx.lineTo(10, 5);
	ctx.lineTo(10, 4);
	ctx.lineTo(5, 4);
	ctx.closePath();
	ctx.fill();
	
    // #rect12
	ctx.fillStyle = 'rgb(226, 237, 255)';
	ctx.beginPath();
	ctx.rect(5, 13, 5, 1);
	ctx.fill();

    // #rect13
	ctx.fillStyle = 'rgb(85, 85, 255)';
	ctx.beginPath();
	ctx.rect(7, 12, 1, 1);
	ctx.fill();

    // #rect14
	ctx.fillStyle = 'rgb(243, 159, 55)';
	ctx.beginPath();
	ctx.rect(9, 3, 2, 2);
	ctx.fill();
	
    // #rect15
	ctx.fillStyle = 'rgb(170, 0, 0)';
	ctx.beginPath();
	ctx.rect(4, 4, 2, 1);
	ctx.fill();
	
    // #rect16
	ctx.fillStyle = 'rgb(255, 42, 42)';
	ctx.beginPath();
	ctx.rect(10, 12, 2, 2);
	ctx.fill();
	
    // #rect17
	ctx.fillStyle = 'rgb(85, 153, 255)';
	ctx.beginPath();
	ctx.rect(5, 8, 5, 1);
	ctx.fill();
	
	ctx.fillStyle = 'rgb(44, 90, 160)';

    // #rect6
    ctx.beginPath();
	ctx.rect(6, 6, 3, 1);
	ctx.fill();

    // #rect18
	ctx.beginPath();
	ctx.rect(6, 9, 3, 1);
	ctx.fill();
	
    // #rect19
	ctx.beginPath();
	ctx.rect(6, 13, 3, 1);
	ctx.fill();
	
    // #rect20
	ctx.fillStyle = 'rgb(255, 153, 85)';
	ctx.beginPath();
	ctx.rect(4, 12, 1, 1);
	ctx.fill();
	
    // #rect1
	ctx.fillStyle = 'rgb(255, 255, 255)';
	ctx.beginPath();
	ctx.moveTo(5, 0);
	ctx.lineTo(5, 2);
	ctx.lineTo(6, 2);
	ctx.lineTo(6, 3);
	ctx.lineTo(9, 3);
	ctx.lineTo(9, 2);
	ctx.lineTo(10, 2);
	ctx.lineTo(10, 0);
	ctx.lineTo(5, 0);
	ctx.closePath();
	ctx.fill();

    ctx.restore();
};

// Y-Port Extension
var drawExtension = function(ctx, x, y) {
    ctx.save();
    ctx.translate(x - 10, y - 10);

    const s = 0.6;
    ctx.scale(s, s);

    // Path generated from SVG w/ Inkscape
    // #rect2
	ctx.beginPath();
	ctx.fillStyle = 'rgb(200, 190, 183)';
	ctx.moveTo(6, 5);
	ctx.lineTo(6, 6);
	ctx.lineTo(12, 6);
	ctx.lineTo(12, 5);
	ctx.lineTo(6, 5);
	ctx.closePath();
	ctx.moveTo(12, 6);
	ctx.lineTo(12, 7);
	ctx.lineTo(14, 7);
	ctx.lineTo(14, 6);
	ctx.lineTo(12, 6);
	ctx.closePath();
	ctx.moveTo(14, 7);
	ctx.lineTo(14, 8);
	ctx.lineTo(15, 8);
	ctx.lineTo(15, 7);
	ctx.lineTo(14, 7);
	ctx.closePath();
	ctx.moveTo(15, 8);
	ctx.lineTo(15, 18);
	ctx.lineTo(16, 18);
	ctx.lineTo(16, 8);
	ctx.lineTo(15, 8);
	ctx.closePath();
	ctx.moveTo(15, 18);
	ctx.lineTo(14, 18);
	ctx.lineTo(14, 19);
	ctx.lineTo(15, 19);
	ctx.lineTo(15, 18);
	ctx.closePath();
	ctx.moveTo(14, 19);
	ctx.lineTo(12, 19);
	ctx.lineTo(12, 20);
	ctx.lineTo(7, 20);
	ctx.lineTo(7, 21);
	ctx.lineTo(13, 21);
	ctx.lineTo(13, 20);
	ctx.lineTo(14, 20);
	ctx.lineTo(14, 19);
	ctx.closePath();
	ctx.moveTo(5, 6);
	ctx.lineTo(5, 7);
	ctx.lineTo(6, 7);
	ctx.lineTo(6, 6);
	ctx.lineTo(5, 6);
	ctx.closePath();
	ctx.moveTo(5, 7);
	ctx.lineTo(3, 7);
	ctx.lineTo(3, 8);
	ctx.lineTo(5, 8);
	ctx.lineTo(5, 7);
	ctx.closePath();
	ctx.moveTo(3, 8);
	ctx.lineTo(2, 8);
	ctx.lineTo(2, 24);
	ctx.lineTo(3, 24);
	ctx.lineTo(3, 24);
	ctx.lineTo(3, 25);
	ctx.lineTo(5, 25);
	ctx.lineTo(5, 24);
	ctx.lineTo(4, 24);
	ctx.lineTo(4, 23);
	ctx.lineTo(3, 23);
	ctx.lineTo(3, 8);
	ctx.closePath();
	ctx.moveTo(5, 25);
	ctx.lineTo(5, 26);
	ctx.lineTo(7, 26);
	ctx.lineTo(7, 27);
	ctx.lineTo(25, 27);
	ctx.lineTo(25, 26);
	ctx.lineTo(8, 26);
	ctx.lineTo(8, 25);
	ctx.lineTo(5, 25);
	ctx.closePath();
	ctx.moveTo(25, 26);
	ctx.lineTo(27, 26);
	ctx.lineTo(27, 25);
	ctx.lineTo(25, 25);
	ctx.lineTo(25, 26);
	ctx.closePath();
	ctx.moveTo(27, 25);
	ctx.lineTo(28, 25);
	ctx.lineTo(28, 24);
	ctx.lineTo(27, 24);
	ctx.lineTo(27, 25);
	ctx.closePath();
	ctx.moveTo(28, 24);
	ctx.lineTo(29, 24);
	ctx.lineTo(29, 19);
	ctx.lineTo(30, 19);
	ctx.lineTo(30, 18);
	ctx.lineTo(31, 18);
	ctx.lineTo(31, 17);
	ctx.lineTo(31, 16);
	ctx.lineTo(31, 14);
	ctx.lineTo(31, 12);
	ctx.lineTo(31, 8);
	ctx.lineTo(26, 8);
	ctx.lineTo(26, 10);
	ctx.lineTo(25, 10);
	ctx.lineTo(25, 9);
	ctx.lineTo(24, 9);
	ctx.lineTo(24, 8);
	ctx.lineTo(20, 8);
	ctx.lineTo(20, 10);
	ctx.lineTo(21, 10);
	ctx.lineTo(21, 11);
	ctx.lineTo(20, 11);
	ctx.lineTo(20, 12);
	ctx.lineTo(21, 12);
	ctx.lineTo(21, 13);
	ctx.lineTo(22, 13);
	ctx.lineTo(22, 14);
	ctx.lineTo(23, 14);
	ctx.lineTo(23, 15);
	ctx.lineTo(24, 15);
	ctx.lineTo(24, 16);
	ctx.lineTo(25, 16);
	ctx.lineTo(25, 17);
	ctx.lineTo(26, 17);
	ctx.lineTo(26, 18);
	ctx.lineTo(27, 18);
	ctx.lineTo(27, 19);
	ctx.lineTo(28, 19);
	ctx.lineTo(28, 24);
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = 'rgb(128, 0, 128)';
	ctx.lineWidth = 1;
	ctx.lineJoin = 'round';

    // #rect1
	ctx.beginPath();
	ctx.rect(26, 5, 5, 3);
	ctx.fill();

    // #rect8
	ctx.beginPath();
	ctx.moveTo(21, 5);
	ctx.lineTo(21, 6);
	ctx.lineTo(20, 6);
	ctx.lineTo(20, 7);
	ctx.lineTo(19, 7);
	ctx.lineTo(19, 8);
	ctx.lineTo(18, 8);
	ctx.lineTo(18, 10);
	ctx.lineTo(19, 10);
	ctx.lineTo(19, 11);
	ctx.lineTo(21, 11);
	ctx.lineTo(21, 10);
	ctx.lineTo(22, 10);
	ctx.lineTo(22, 9);
	ctx.lineTo(23, 9);
	ctx.lineTo(23, 8);
	ctx.lineTo(24, 8);
	ctx.lineTo(24, 7);
	ctx.lineTo(23, 7);
	ctx.lineTo(23, 6);
	ctx.lineTo(22, 6);
	ctx.lineTo(22, 5);
	ctx.closePath();
	ctx.fill();
	
	
    // #rect21-7-7
	ctx.beginPath();
	ctx.fillStyle = 'rgb(255, 255, 255)';
	ctx.moveTo(7, 21);
	ctx.lineTo(7, 22);
	ctx.lineTo(7, 23);
	ctx.lineTo(8, 23);
	ctx.lineTo(8, 22);
	ctx.lineTo(10, 22);
	ctx.lineTo(10, 21);
	ctx.lineTo(7, 21);
	ctx.closePath();
	ctx.fill();

    ctx.restore();
};

// EnFIT Wrench
var drawEnFitWrench = function(ctx, x, y) {
    ctx.save();
    ctx.translate(x - 0, y - 15);

    const s = 0.65;
    ctx.scale(s, s);
    
    ctx.rotate(45 * Math.PI / 180);

    // Path generated from SVG w/ Inkscape    
	ctx.fillStyle = 'rgb(44, 150, 213)';
	ctx.lineWidth = 1;
	ctx.lineJoin = 'round';

    ctx.beginPath();
	ctx.moveTo(3, 10);
	ctx.lineTo(3, 11);
	ctx.lineTo(2, 11);
	ctx.lineTo(2, 12);
	ctx.lineTo(1, 12);
	ctx.lineTo(1, 13);
	ctx.lineTo(0, 13);
	ctx.lineTo(0, 18);
	ctx.lineTo(1, 18);
	ctx.lineTo(1, 19);
	ctx.lineTo(2, 19);
	ctx.lineTo(2, 20);
	ctx.lineTo(3, 20);
	ctx.lineTo(3, 21);
	ctx.lineTo(5, 21);
	ctx.lineTo(5, 17);
	ctx.lineTo(4, 17);
	ctx.lineTo(4, 16);
	ctx.lineTo(2, 16);
	ctx.lineTo(2, 15);
	ctx.lineTo(4, 15);
	ctx.lineTo(4, 13);
	ctx.lineTo(9, 13);
	ctx.lineTo(9, 15);
	ctx.lineTo(11, 15);
	ctx.lineTo(11, 16);
	ctx.lineTo(9, 16);
	ctx.lineTo(9, 17);
	ctx.lineTo(8, 17);
	ctx.lineTo(8, 21);
	ctx.lineTo(10, 21);
	ctx.lineTo(10, 20);
	ctx.lineTo(11, 20);
	ctx.lineTo(11, 19);
	ctx.lineTo(13, 19);
	ctx.lineTo(13, 18);
	ctx.lineTo(24, 18);
	ctx.lineTo(24, 19);
	ctx.lineTo(26, 19);
	ctx.lineTo(26, 20);
	ctx.lineTo(31, 20);
	ctx.lineTo(31, 19);
	ctx.lineTo(32, 19);
	ctx.lineTo(32, 14);
	ctx.lineTo(32, 13);
	ctx.lineTo(32, 12);
	ctx.lineTo(31, 12);
	ctx.lineTo(31, 11);
	ctx.lineTo(26, 11);
	ctx.lineTo(26, 12);
	ctx.lineTo(24, 12);
	ctx.lineTo(24, 13);
	ctx.lineTo(13, 13);
	ctx.lineTo(13, 12);
	ctx.lineTo(11, 12);
	ctx.lineTo(11, 11);
	ctx.lineTo(10, 11);
	ctx.lineTo(10, 10);
	ctx.lineTo(3, 10);
	ctx.closePath();
	ctx.moveTo(27, 14);
	ctx.lineTo(30, 14);
	ctx.lineTo(30, 17);
	ctx.lineTo(27, 17);
	ctx.lineTo(27, 14);
	ctx.closePath();
	ctx.fill();
    
    ctx.restore();
};

// Flying Squirrel
var drawFlyingSquirrel = function(ctx, x, y) {
    ctx.save();
    ctx.translate(x - 8, y - 8);

    // Path generated from SVG w/ Inkscape
	ctx.lineWidth = 1;
	ctx.lineJoin = 'round';
    
    // #rect2
	ctx.fillStyle = 'rgb(95, 141, 211)';
	ctx.beginPath();
	ctx.rect(3, 3, 3, 4);
	ctx.fill();
	
    // #rect3
	ctx.fillStyle = 'rgb(55, 113, 200)';
	ctx.beginPath();
	ctx.moveTo(5, 1);
	ctx.lineTo(5, 2);
	ctx.lineTo(4, 2);
	ctx.lineTo(4, 3);
	ctx.lineTo(7, 3);
	ctx.lineTo(7, 2);
	ctx.lineTo(10, 2);
	ctx.lineTo(10, 3);
	ctx.lineTo(11, 3);
	ctx.lineTo(11, 4);
	ctx.lineTo(13, 4);
	ctx.lineTo(13, 3);
	ctx.lineTo(13, 2);
	ctx.lineTo(12, 2);
	ctx.lineTo(12, 1);
	ctx.lineTo(5, 1);
	ctx.closePath();
	ctx.fill();
	
    // #rect5
	ctx.fillStyle = 'rgb(44, 90, 160)';
	ctx.beginPath();
	ctx.rect(6, 0, 5, 1);
	ctx.fill();
	
    // #rect14
	ctx.fillStyle = 'rgb(85, 153, 255)';
	ctx.beginPath();
	ctx.moveTo(4, 4);
	ctx.lineTo(4, 5);
	ctx.lineTo(3, 5);
	ctx.lineTo(3, 7);
	ctx.lineTo(6, 7);
	ctx.lineTo(6, 5);
	ctx.lineTo(5, 5);
	ctx.lineTo(5, 4);
	ctx.lineTo(4, 4);
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = 'rgb(0, 170, 212)';

// #rect15
	ctx.beginPath();
	ctx.rect(3, 7, 4, 2);
	ctx.fill();
	
// #rect16
	ctx.beginPath();
	ctx.rect(10, 7, 3, 2);
	ctx.fill();
	
// #rect17
	ctx.fillStyle = 'rgb(95, 188, 211)';
	ctx.beginPath();
	ctx.moveTo(4, 8);
	ctx.lineTo(4, 9);
	ctx.lineTo(3, 9);
	ctx.lineTo(3, 11);
	ctx.lineTo(8, 11);
	ctx.lineTo(9, 11);
	ctx.lineTo(13, 11);
	ctx.lineTo(13, 9);
	ctx.lineTo(13, 8);
	ctx.lineTo(12, 8);
	ctx.lineTo(12, 9);
	ctx.lineTo(9, 9);
	ctx.lineTo(9, 10);
	ctx.lineTo(8, 10);
	ctx.lineTo(8, 9);
	ctx.lineTo(6, 9);
	ctx.lineTo(6, 8);
	ctx.lineTo(4, 8);
	ctx.closePath();
	ctx.fill();
	
// #rect20
	ctx.fillStyle = 'rgb(135, 205, 222)';
	ctx.beginPath();
	ctx.moveTo(7, 10);
	ctx.lineTo(7, 11);
	ctx.lineTo(3, 11);
	ctx.lineTo(3, 13);
	ctx.lineTo(8, 13);
	ctx.lineTo(8, 12);
	ctx.lineTo(9, 12);
	ctx.lineTo(9, 13);
	ctx.lineTo(13, 13);
	ctx.lineTo(13, 11);
	ctx.lineTo(13, 10);
	ctx.lineTo(11, 10);
	ctx.lineTo(11, 11);
	ctx.lineTo(9, 11);
	ctx.lineTo(8, 11);
	ctx.lineTo(8, 10);
	ctx.lineTo(7, 10);
	ctx.closePath();
	ctx.fill();
	
// #rect23
	ctx.fillStyle = 'rgb(170, 238, 255)';
	ctx.beginPath();
	ctx.moveTo(4, 12);
	ctx.lineTo(4, 13);
	ctx.lineTo(3, 13);
	ctx.lineTo(3, 15);
	ctx.lineTo(13, 15);
	ctx.lineTo(13, 13);
	ctx.lineTo(6, 13);
	ctx.lineTo(6, 12);
	ctx.lineTo(4, 12);
	ctx.closePath();
	ctx.fill();

    ctx.restore();
};

// Straighten Pump
var drawStraightenPump =  function(ctx, x, y) {
    ctx.save();
    ctx.translate(x - 8, y - 9);

    const s = 1.1;
    ctx.scale(s, s);

    // Path generated from SVG w/ Inkscape
	ctx.lineWidth = 1.170032;
	ctx.lineJoin = 'round';

    // Draw pump
	ctx.beginPath();
	ctx.fillStyle = 'rgb(200, 190, 183)';
	ctx.moveTo(1, 1);
	ctx.lineTo(1, 15);
	ctx.lineTo(12, 15);
	ctx.lineTo(12, 7);
	ctx.lineTo(13, 7);
	ctx.lineTo(13, 6);
	ctx.lineTo(14, 6);
	ctx.lineTo(14, 1);
	ctx.lineTo(12, 1);
	ctx.lineTo(1, 1);
	ctx.closePath();
	ctx.fill();
	
    // Draw Screen
	ctx.beginPath();
	ctx.fillStyle = 'rgb(153, 153, 153)';
	ctx.rect(2, 2, 11, 3);
	ctx.fill();
	
    // Sraw Keypad
	ctx.beginPath();
	ctx.fillStyle = 'rgb(204, 204, 204)';
	ctx.rect(2, 6, 9, 8);
	ctx.fill();
	
    // Draw colored buttons
	ctx.fillStyle = 'rgb(255, 102, 0)';

    // Orange #1
	ctx.beginPath();
	ctx.rect(3, 7, 1, 1);
	ctx.fill();
	
    // Orange #2
	ctx.beginPath();
	ctx.rect(5, 9, 1, 1);
	ctx.fill();
	
    // Red
	ctx.beginPath();
	ctx.fillStyle = 'rgb(255, 0, 0)';
	ctx.rect(9, 7, 1, 1);
	ctx.fill();
	
    // Light Oraneg
	ctx.beginPath();
	ctx.fillStyle = 'rgb(255, 204, 0)';
	ctx.rect(7, 13, 1, 1);
	ctx.fill();
	
    // Pink
	ctx.beginPath();
	ctx.fillStyle = 'rgb(255, 170, 238)';
	ctx.rect(7, 7, 1, 1);
	ctx.fill();
	
    // Light Green
	ctx.beginPath();
	ctx.fillStyle = 'rgb(0, 128, 0)';
	ctx.rect(9, 13, 1, 1);
	ctx.fill();
	
    // Green
	ctx.beginPath();
	ctx.fillStyle = 'rgb(55, 200, 55)';
	ctx.rect(7, 9, 1, 1);
	ctx.fill();
    
    // Draw blue/purple buttons
	ctx.fillStyle = 'rgb(102, 0, 255)';

    // #rect11
	ctx.beginPath();
	ctx.rect(3, 9, 1, 1);
	ctx.fill();
	
    // #rect12
	ctx.beginPath();
	ctx.rect(3, 11, 1, 1);
	ctx.fill();
	
    // #rect13
	ctx.beginPath();
	ctx.rect(3, 13, 1, 1);
	ctx.fill();
	
    // #rect14
	ctx.beginPath();
	ctx.rect(5, 13, 1, 1);
	ctx.fill();
	
    // #rect15
	ctx.beginPath();
	ctx.rect(5, 11, 1, 1);
	ctx.fill();
	
    // #rect16
	ctx.beginPath();
	ctx.rect(7, 11, 1, 1);
	ctx.fill();
	
    // #rect17
	ctx.beginPath();
	ctx.rect(9, 11, 1, 1);
	ctx.fill();
	
    // #rect18
	ctx.beginPath();
	ctx.rect(9, 9, 1, 1);
	ctx.fill();

    ctx.restore();
};

// Bandaid
const drawBandaid = function(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x - (angle < 0 ? 14.3 : 1), y - (angle < 0 ? -1.8 : 14));
    
    const s = 0.7;
    ctx.scale(s, s);
    ctx.rotate(angle * Math.PI / 180);

    // Path generated from SVG w/ Inkscape
    // Background
	ctx.beginPath();
	ctx.fillStyle = 'rgb(250, 181, 137)';
	ctx.moveTo(3, 9);
	ctx.lineTo(3, 10);
	ctx.lineTo(2, 10);
	ctx.lineTo(2, 11);
	ctx.lineTo(1, 11);
	ctx.lineTo(1, 16);
	ctx.lineTo(2, 16);
	ctx.lineTo(2, 17);
	ctx.lineTo(3, 17);
	ctx.lineTo(3, 18);
	ctx.lineTo(29, 18);
	ctx.lineTo(29, 17);
	ctx.lineTo(30, 17);
	ctx.lineTo(30, 16);
	ctx.lineTo(31, 16);
	ctx.lineTo(31, 11);
	ctx.lineTo(30, 11);
	ctx.lineTo(30, 10);
	ctx.lineTo(29, 10);
	ctx.lineTo(29, 9);
	ctx.lineTo(3, 9);
	ctx.closePath();
	ctx.fill();
	
    // Left Spots
	ctx.beginPath();
	ctx.fillStyle = 'rgb(211, 143, 110)';
	ctx.moveTo(4, 10);
	ctx.lineTo(4, 11);
	ctx.lineTo(5, 11);
	ctx.lineTo(5, 10);
	ctx.lineTo(4, 10);
	ctx.closePath();
	ctx.moveTo(8, 10);
	ctx.lineTo(8, 11);
	ctx.lineTo(9, 11);
	ctx.lineTo(9, 10);
	ctx.lineTo(8, 10);
	ctx.closePath();
	ctx.moveTo(6, 11);
	ctx.lineTo(6, 12);
	ctx.lineTo(7, 12);
	ctx.lineTo(7, 11);
	ctx.lineTo(6, 11);
	ctx.closePath();
	ctx.moveTo(4, 12);
	ctx.lineTo(4, 13);
	ctx.lineTo(5, 13);
	ctx.lineTo(5, 12);
	ctx.lineTo(4, 12);
	ctx.closePath();
	ctx.moveTo(8, 12);
	ctx.lineTo(8, 13);
	ctx.lineTo(9, 13);
	ctx.lineTo(9, 12);
	ctx.lineTo(8, 12);
	ctx.closePath();
	ctx.moveTo(6, 13);
	ctx.lineTo(6, 14);
	ctx.lineTo(7, 14);
	ctx.lineTo(7, 13);
	ctx.lineTo(6, 13);
	ctx.closePath();
	ctx.moveTo(4, 14);
	ctx.lineTo(4, 15);
	ctx.lineTo(5, 15);
	ctx.lineTo(5, 14);
	ctx.lineTo(4, 14);
	ctx.closePath();
	ctx.moveTo(8, 14);
	ctx.lineTo(8, 15);
	ctx.lineTo(9, 15);
	ctx.lineTo(9, 14);
	ctx.lineTo(8, 14);
	ctx.closePath();
	ctx.moveTo(6, 15);
	ctx.lineTo(6, 16);
	ctx.lineTo(7, 16);
	ctx.lineTo(7, 15);
	ctx.lineTo(6, 15);
	ctx.closePath();
	ctx.moveTo(4, 16);
	ctx.lineTo(4, 17);
	ctx.lineTo(5, 17);
	ctx.lineTo(5, 16);
	ctx.lineTo(4, 16);
	ctx.closePath();
	ctx.moveTo(8, 16);
	ctx.lineTo(8, 17);
	ctx.lineTo(9, 17);
	ctx.lineTo(9, 16);
	ctx.lineTo(8, 16);
	ctx.closePath();
	ctx.fill();
	
    // Right Spots
	ctx.beginPath();
	ctx.fillStyle = 'rgb(211, 143, 110)';
	ctx.moveTo(23, 10);
	ctx.lineTo(23, 11);
	ctx.lineTo(24, 11);
	ctx.lineTo(24, 10);
	ctx.lineTo(23, 10);
	ctx.closePath();
	ctx.moveTo(27, 10);
	ctx.lineTo(27, 11);
	ctx.lineTo(28, 11);
	ctx.lineTo(28, 10);
	ctx.lineTo(27, 10);
	ctx.closePath();
	ctx.moveTo(25, 11);
	ctx.lineTo(25, 12);
	ctx.lineTo(26, 12);
	ctx.lineTo(26, 11);
	ctx.lineTo(25, 11);
	ctx.closePath();
	ctx.moveTo(23, 12);
	ctx.lineTo(23, 13);
	ctx.lineTo(24, 13);
	ctx.lineTo(24, 12);
	ctx.lineTo(23, 12);
	ctx.closePath();
	ctx.moveTo(27, 12);
	ctx.lineTo(27, 13);
	ctx.lineTo(28, 13);
	ctx.lineTo(28, 12);
	ctx.lineTo(27, 12);
	ctx.closePath();
	ctx.moveTo(25, 13);
	ctx.lineTo(25, 14);
	ctx.lineTo(26, 14);
	ctx.lineTo(26, 13);
	ctx.lineTo(25, 13);
	ctx.closePath();
	ctx.moveTo(23, 14);
	ctx.lineTo(23, 15);
	ctx.lineTo(24, 15);
	ctx.lineTo(24, 14);
	ctx.lineTo(23, 14);
	ctx.closePath();
	ctx.moveTo(27, 14);
	ctx.lineTo(27, 15);
	ctx.lineTo(28, 15);
	ctx.lineTo(28, 14);
	ctx.lineTo(27, 14);
	ctx.closePath();
	ctx.moveTo(25, 15);
	ctx.lineTo(25, 16);
	ctx.lineTo(26, 16);
	ctx.lineTo(26, 15);
	ctx.lineTo(25, 15);
	ctx.closePath();
	ctx.moveTo(23, 16);
	ctx.lineTo(23, 17);
	ctx.lineTo(24, 17);
	ctx.lineTo(24, 16);
	ctx.lineTo(23, 16);
	ctx.closePath();
	ctx.moveTo(27, 16);
	ctx.lineTo(27, 17);
	ctx.lineTo(28, 17);
	ctx.lineTo(28, 16);
	ctx.lineTo(27, 16);
	ctx.closePath();
	ctx.fill();
	
    // Center
	ctx.beginPath();
	ctx.fillStyle = 'rgb(211, 143, 110)';
	ctx.moveTo(11, 11);
	ctx.lineTo(11, 10);
	ctx.lineTo(21, 10);
	ctx.lineTo(21, 11);
	ctx.lineTo(22, 11);
	ctx.lineTo(22, 16);
	ctx.lineTo(21, 16);
	ctx.lineTo(21, 17);
	ctx.lineTo(11, 17);
	ctx.lineTo(11, 16);
	ctx.lineTo(10, 16);
	ctx.lineTo(10, 11);
	ctx.closePath();
	ctx.fill();

    ctx.restore();
}

// New Energizer Pellet Design
const drawCrossedBandaids = (ctx, x, y) =>  {
    drawBandaid(ctx, x, y, 45);
    drawBandaid(ctx, x, y, -45);
}

var drawCookie = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);

    // body
    ctx.beginPath();
    ctx.arc(0,0,6,0,Math.PI*2);
    ctx.fillStyle = "#f9bd6d";
    //ctx.fillStyle = "#dfab68";
    ctx.fill();

    // chocolate chips
    var spots = [
        0,-3,
        -4,-1,
        0,2,
        3,0,
        3,3,
         ];

    ctx.fillStyle = "#000";
    var i,len;
    for (i=0, len=spots.length; i<len; i+=2) {
        var x = spots[i];
        var y = spots[i+1];
        ctx.beginPath();
        ctx.arc(x,y,0.75,0,2*Math.PI);
        ctx.fill();
    }

    ctx.restore();
};

var drawCookieFlash = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);

    // body
    ctx.beginPath();
    ctx.arc(0,0,6,0,Math.PI*2);
    ctx.fillStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#f9bd6d";
    ctx.fill();
    ctx.stroke();

    // chocolate chips
    var spots = [
        0,-3,
        -4,-1,
        0,2,
        3,0,
        3,3,
         ];

    ctx.fillStyle = "#f9bd6d";
    var i,len;
    for (i=0, len=spots.length; i<len; i+=2) {
        var x = spots[i];
        var y = spots[i+1];
        ctx.beginPath();
        ctx.arc(x,y,0.75,0,2*Math.PI);
        ctx.fill();
    }

    ctx.restore();
};

var getSpriteFuncFromBonusName = function(name) {
    var funcs = {
        'gtube': drawGTube,
        'endless_pump': drawEndlessPump,
        'marsupial_pump': drawMarsupialPump,
        'jamie_pump': drawJamiePump,
        'usb_charger': drawUsbCharger,
        'feeding_bag': drawFeedingBag,
        'formula_bottle': drawFormulaBottle,
        'y_extension': drawExtension,
        'enfit_wrench': drawEnFitWrench,
        'flying_squirrel': drawFlyingSquirrel,
        'straighten_pump': drawStraightenPump,
        'cookie': drawCookie,
    };

    return funcs[name];
};

var drawHeartSprite = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.fillStyle = "#ffb8ff";

    ctx.beginPath();
    ctx.moveTo(0,-3);
    ctx.bezierCurveTo(-1,-4,-2,-6,-3.5,-6);
    ctx.quadraticCurveTo(-7,-6,-7,-0.5);
    ctx.bezierCurveTo(-7,2,-2,5,0,7);
    ctx.bezierCurveTo(2,5,7,2,7,-0.5);
    ctx.quadraticCurveTo(7,-6,3.5,-6);
    ctx.bezierCurveTo(2,-6,1,-4,0,-3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
};

var drawExclamationPoint = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = ctx.fillStyle = "#ff0";
    ctx.beginPath();
    ctx.moveTo(-1,1);
    ctx.bezierCurveTo(-1,0,-1,-3,0,-3);
    ctx.lineTo(2,-3);
    ctx.bezierCurveTo(2,-2,0,0,-1,1);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-2,3,0.5,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
};
//@line 1 "src/Actor.js"
//////////////////////////////////////////////////////////////////////////////////////
// The actor class defines common data functions for the ghosts and player
// It provides everything for updating position and direction.

// "Enemy" and "Player" inherit from this "Actor"

// Actor constructor
var Actor = function() {

    this.dir = {};          // facing direction vector
    this.pixel = {};        // pixel position
    this.tile = {};         // tile position
    this.tilePixel = {};    // pixel location inside tile
    this.distToMid = {};    // pixel distance to mid-tile

    this.targetTile = {};   // tile position used for targeting

    this.frames = 0;        // frame count
    this.steps = 0;         // step count

    this.isDrawTarget = false;
    this.isDrawPath = false;

    this.savedSteps = {};
    this.savedFrames = {};
    this.savedDirEnum = {};
    this.savedPixel = {};
    this.savedTargetting = {};
    this.savedTargetTile = {};
};

// save state at time t
Actor.prototype.save = function(t) {
    this.savedSteps[t] = this.steps;
    this.savedFrames[t] = this.frames;
    this.savedDirEnum[t] = this.dirEnum;
    this.savedPixel[t] = { x:this.pixel.x, y:this.pixel.y };
    this.savedTargetting[t] = this.targetting;
    this.savedTargetTile[t] = { x: this.targetTile.x, y: this.targetTile.y };
};

// load state at time t
Actor.prototype.load = function(t) {
    this.steps = this.savedSteps[t];
    this.frames = this.savedFrames[t];
    this.setDir(this.savedDirEnum[t]);
    this.setPos(this.savedPixel[t].x, this.savedPixel[t].y);
    this.targetting = this.savedTargetting[t];
    this.targetTile.x = this.savedTargetTile[t].x;
    this.targetTile.y = this.savedTargetTile[t].y;
};


// reset to initial position and direction
Actor.prototype.reset = function() {
    this.setDir(this.startDirEnum);
    this.setPos(this.startPixel.x, this.startPixel.y);
    this.frames = 0;
    this.steps = 0;
    this.targetting = false;
};

// sets the position and updates its dependent variables
Actor.prototype.setPos = function(px,py) {
    this.pixel.x = px;
    this.pixel.y = py;
    this.commitPos();
};

// returns the relative pixel inside a tile given a map pixel
Actor.prototype.getTilePixel = function(pixel,tilePixel) {
    if (pixel == undefined) {
        pixel = this.pixel;
    }
    if (tilePixel == undefined) {
        tilePixel = {};
    }
    tilePixel.x = pixel.x % tileSize;
    tilePixel.y = pixel.y % tileSize;
    if (tilePixel.x < 0) {
        tilePixel.x += tileSize;
    }
    if (tilePixel.y < 0) {
        tilePixel.y += tileSize;
    }
    return tilePixel;
};

// updates the position's dependent variables
Actor.prototype.commitPos = function() {

    // use map-specific tunnel teleport
    if (map) {
        map.teleport(this);
    }

    this.tile.x = Math.floor(this.pixel.x / tileSize);
    this.tile.y = Math.floor(this.pixel.y / tileSize);
    this.getTilePixel(this.pixel,this.tilePixel);
    this.distToMid.x = midTile.x - this.tilePixel.x;
    this.distToMid.y = midTile.y - this.tilePixel.y;
};

// sets the direction and updates its dependent variables
Actor.prototype.setDir = function(dirEnum) {
    setDirFromEnum(this.dir, dirEnum);
    this.dirEnum = dirEnum;
};

// used as "pattern" parameter in getStepSizeFromTable()
var STEP_PACMAN = 0;
var STEP_GHOST = 1;
var STEP_PACMAN_FRIGHT = 2;
var STEP_GHOST_FRIGHT = 3;
var STEP_GHOST_TUNNEL = 4;
var STEP_ELROY1 = 5;
var STEP_ELROY2 = 6;

// getter function to extract a step size from speed control table
Actor.prototype.getStepSizeFromTable = (function(){

    // Actor speed is controlled by a list of 16 values.
    // Each value is the number of steps to take in a specific frame.
    // Once the end of the list is reached, we cycle to the beginning.
    // This method allows us to represent different speeds in a low-resolution space.

    // speed control table (from Jamey Pittman)
    var stepSizes = (
                         // LEVEL 1
    "1111111111111111" + // pac-man (normal)
    "0111111111111111" + // ghosts (normal)
    "1111211111112111" + // pac-man (fright)
    "0110110101101101" + // ghosts (fright)
    "0101010101010101" + // ghosts (tunnel)
    "1111111111111111" + // elroy 1
    "1111111121111111" + // elroy 2

                         // LEVELS 2-4
    "1111211111112111" + // pac-man (normal)
    "1111111121111111" + // ghosts (normal)
    "1111211112111121" + // pac-man (fright)
    "0110110110110111" + // ghosts (fright)
    "0110101011010101" + // ghosts (tunnel)
    "1111211111112111" + // elroy 1
    "1111211112111121" + // elroy 2

                         // LEVELS 5-20
    "1121112111211121" + // pac-man (normal)
    "1111211112111121" + // ghosts (normal)
    "1121112111211121" + // pac-man (fright) (N/A for levels 17, 19 & 20)
    "0111011101110111" + // ghosts (fright)  (N/A for levels 17, 19 & 20)
    "0110110101101101" + // ghosts (tunnel)
    "1121112111211121" + // elroy 1
    "1121121121121121" + // elroy 2

                         // LEVELS 21+
    "1111211111112111" + // pac-man (normal)
    "1111211112111121" + // ghosts (normal)
    "0000000000000000" + // pac-man (fright) N/A
    "0000000000000000" + // ghosts (fright)  N/A
    "0110110101101101" + // ghosts (tunnel)
    "1121112111211121" + // elroy 1
    "1121121121121121"); // elroy 2

    return function(level, pattern) {
        var entry;
        if (level < 1) return;
        else if (level==1)                  entry = 0;
        else if (level >= 2 && level <= 4)  entry = 1;
        else if (level >= 5 && level <= 20) entry = 2;
        else if (level >= 21)               entry = 3;
        return stepSizes[entry*7*16 + pattern*16 + this.frames%16];
    };
})();

// updates the actor state
Actor.prototype.update = function(j) {

    // get number of steps to advance in this frame
    var numSteps = this.getNumSteps();
    if (j >= numSteps) 
        return;

    // request to advance one step, and increment count if step taken
    this.steps += this.step();

    // update head direction
    this.steer();
};
//@line 1 "src/Enemy.js"
//////////////////////////////////////////////////////////////////////////////////////
// Enemy class

// modes representing the ghost's current state
var GHOST_OUTSIDE = 0;
var GHOST_EATEN = 1;
var GHOST_GOING_HOME = 2;
var GHOST_ENTERING_HOME = 3;
var GHOST_PACING_HOME = 4;
var GHOST_LEAVING_HOME = 5;

// Enemy constructor
var Enemy = function() {
    // inherit data from Actor
    Actor.apply(this);

    this.randomScatter = false;
    this.faceDirEnum = this.dirEnum;
};

// inherit functions from Actor class
Enemy.prototype = newChildObject(Actor.prototype);

// displacements for ghost bouncing
Enemy.prototype.getBounceY = (function(){

    // NOTE: The bounce animation assumes an actor is moving in straight
    // horizontal or vertical lines between the centers of each tile.
    //
    // When moving horizontal, bounce height is a function of x.
    // When moving vertical, bounce height is a function of y.

    var bounceY = {};

    // map y tile pixel to new y tile pixel
    bounceY[DIR_UP] =    [-4,-2,0,2,4,3,2,3];
    bounceY[DIR_DOWN] =  [3,5,7,5,4,5,7,8];

    // map x tile pixel to y tile pixel
    bounceY[DIR_LEFT] =  [2,3,3,4,3,2,2,2];
    bounceY[DIR_RIGHT] = [2,2,3,4,3,3,2,2];

    return function(px,py,dirEnum) {
        if (px == undefined) {
            px = this.pixel.x;
        }
        if (py == undefined) {
            py = this.pixel.y;
        }
        if (dirEnum == undefined) {
            dirEnum = this.dirEnum;
        }

        if (this.mode != GHOST_OUTSIDE || !this.scared) {
            return py;
        }

        var tilePixel = this.getTilePixel({x:px,y:py});
        var tileY = Math.floor(py / tileSize);
        var y = tileY*tileSize;

        if (dirEnum == DIR_UP || dirEnum == DIR_DOWN) {
            y += bounceY[dirEnum][tilePixel.y];
        }
        else {
            y += bounceY[dirEnum][tilePixel.x];
        }

        return y;
    };
})();

Enemy.prototype.getAnimFrame = function(frames) {
    if (frames == undefined)
        frames = this.frames;

    return Math.floor(frames / 8) % 2; // toggle frame every 8 ticks
};

// reset the state of the ghost on new level or level restart
Enemy.prototype.reset = function() {

    // signals
    this.sigReverse = false;
    this.sigLeaveHome = false;

    // modes
    this.mode = this.startMode;
    this.scared = false;
    audio.ghostReset();

    this.savedSigReverse = {};
    this.savedSigLeaveHome = {};
    this.savedMode = {};
    this.savedScared = {};
    this.savedElroy = {};
    this.savedFaceDirEnum = {};

    // call Actor's reset function to reset position and direction
    Actor.prototype.reset.apply(this);

    // faceDirEnum  = direction the ghost is facing
    // dirEnum      = direction the ghost is moving
    // (faceDirEnum represents what dirEnum will be once the ghost reaches the middle of the tile)
    this.faceDirEnum = this.dirEnum;
};

Enemy.prototype.save = function(t) {
    this.savedSigReverse[t] = this.sigReverse;
    this.savedSigLeaveHome[t] = this.sigLeaveHome;
    this.savedMode[t] = this.mode;
    this.savedScared[t] = this.scared;
    if (this == enemy1) {
        this.savedElroy[t] = this.elroy;
    }
    this.savedFaceDirEnum[t] = this.faceDirEnum;
    Actor.prototype.save.call(this,t);
};

Enemy.prototype.load = function(t) {
    this.sigReverse = this.savedSigReverse[t];
    this.sigLeaveHome = this.savedSigLeaveHome[t];
    this.mode = this.savedMode[t];
    this.scared = this.savedScared[t];
    if (this == enemy1) {
        this.elroy = this.savedElroy[t];
    }
    this.faceDirEnum = this.savedFaceDirEnum[t];
    Actor.prototype.load.call(this,t);
};

// Slow down in the tunnel for first 3 levels
Enemy.prototype.isSlowInTunnel = function() {
    return level <= 3;
};

// gets the number of steps to move in this frame
Enemy.prototype.getNumSteps = function() {

    var pattern = STEP_GHOST;

    if (this.mode == GHOST_GOING_HOME || this.mode == GHOST_ENTERING_HOME)
        return 2;
    else if (this.mode == GHOST_LEAVING_HOME || this.mode == GHOST_PACING_HOME)
        return this.getStepSizeFromTable(1, STEP_GHOST_TUNNEL);
    else if (map.isTunnelTile(this.tile.x, this.tile.y) && this.isSlowInTunnel())
        pattern = STEP_GHOST_TUNNEL;
    else if (this.scared)
        pattern = STEP_GHOST_FRIGHT;
    else if (this.elroy == 1)
        pattern = STEP_ELROY1;
    else if (this.elroy == 2)
        pattern = STEP_ELROY2;

    return this.getStepSizeFromTable(level ? level : 1, pattern);
};

// signal ghost to reverse direction after leaving current tile
Enemy.prototype.reverse = function() {
    this.sigReverse = true;
};

// signal ghost to go home
// It is useful to have this because as soon as the ghost gets eaten,
// we have to freeze all the actors for 3 seconds, except for the
// ones who are already traveling to the ghost home to be revived.
// We use this signal to change mode to GHOST_GOING_HOME, which will be
// set after the update() function is called so that we are still frozen
// for 3 seconds before traveling home uninterrupted.
Enemy.prototype.goHome = function() {
    audio.silence();
    audio.eatingEnemy.play();
    this.mode = GHOST_EATEN;
};

// Following the pattern that state changes be made via signaling (e.g. reversing, going home)
// the ghost is commanded to leave home similarly.
// (not sure if this is correct yet)
Enemy.prototype.leaveHome = function() {
    this.playSounds();
    this.sigLeaveHome = true;
};

Enemy.prototype.playSounds = function() {
    var ghostsOutside = 0;
    var ghostsGoingHome = 0;
    for (var i=0; i<4; i++) {
        if (ghosts[i].mode == GHOST_OUTSIDE)    ghostsOutside++;
        if (ghosts[i].mode == GHOST_GOING_HOME) ghostsGoingHome++;
    }
    if (ghostsGoingHome > 0) {
        audio.enemyMove.stopLoop();
        audio.ghostReturnToHome.startLoop(true);
        return;
    }
    else {
        audio.ghostReturnToHome.stopLoop();
    }
    if (ghostsOutside > 0 ) {
        if (! this.scared)
            audio.enemyMove.startLoop(true);
    }
    else {
        audio.enemyMove.stopLoop();
    }
}

// function called when player eats an energizer
Enemy.prototype.onEnergized = function() {

    this.reverse();

    // only scare me if not already going home
    if (this.mode != GHOST_GOING_HOME && this.mode != GHOST_ENTERING_HOME) {
        this.scared = true;
        this.targetting = undefined;
    }
};

// function called when this ghost gets eaten
Enemy.prototype.onEaten = function() {
    this.goHome();       // go home
    this.scared = false; // turn off scared
};

// move forward one step
Enemy.prototype.step = function() {
    this.setPos(this.pixel.x+this.dir.x, this.pixel.y+this.dir.y);
    return 1;
};

// ghost home-specific path steering
Enemy.prototype.homeSteer = (function(){

    // steering functions to execute for each mode
    var steerFuncs = {};

    steerFuncs[GHOST_GOING_HOME] = function() {
        // at the doormat
        if (this.tile.x == map.doorTile.x && this.tile.y == map.doorTile.y) {
            this.faceDirEnum = DIR_DOWN;
            this.targetting = false;
            // walk to the door, or go through if already there
            if (this.pixel.x == map.doorPixel.x) {
                this.mode = GHOST_ENTERING_HOME;
                this.playSounds();
                this.setDir(DIR_DOWN);
                this.faceDirEnum = this.dirEnum;
            }
            else {
                this.setDir(DIR_RIGHT);
                this.faceDirEnum = this.dirEnum;
            }
        }
    };

    steerFuncs[GHOST_ENTERING_HOME] = function() {
        if (this.pixel.y == map.homeBottomPixel) {
            // revive if reached its seat
            if (this.pixel.x == this.startPixel.x) {
                this.setDir(DIR_UP);
                this.mode = this.arriveHomeMode;
            }
            // sidestep to its seat
            else {
                this.setDir(this.startPixel.x < this.pixel.x ? DIR_LEFT : DIR_RIGHT);
            }
            this.faceDirEnum = this.dirEnum;
        }
    };

    steerFuncs[GHOST_PACING_HOME] = function() {
        // head for the door
        if (this.sigLeaveHome) {
            this.sigLeaveHome = false;
            this.mode = GHOST_LEAVING_HOME;
            if (this.pixel.x == map.doorPixel.x)
                this.setDir(DIR_UP);
            else
                this.setDir(this.pixel.x < map.doorPixel.x ? DIR_RIGHT : DIR_LEFT);
        }
        // pace back and forth
        else {
            if (this.pixel.y == map.homeTopPixel)
                this.setDir(DIR_DOWN);
            else if (this.pixel.y == map.homeBottomPixel)
                this.setDir(DIR_UP);
        }
        this.faceDirEnum = this.dirEnum;
    };

    steerFuncs[GHOST_LEAVING_HOME] = function() {
        if (this.pixel.x == map.doorPixel.x) {
            // reached door
            if (this.pixel.y == map.doorPixel.y) {
                this.mode = GHOST_OUTSIDE;
                this.setDir(DIR_LEFT); // always turn left at door?
            }
            // keep walking up to the door
            else {
                this.setDir(DIR_UP);
            }
            this.faceDirEnum = this.dirEnum;
        }
    };

    // return a function to execute appropriate steering function for a given ghost
    return function() { 
        var f = steerFuncs[this.mode];
        if (f)
            f.apply(this);
    };

})();

// special case for Ms. Pac-Man game that randomly chooses a corner for blinky and pinky when scattering
Enemy.prototype.isScatterBrain = function() {
    var scatter = false;
    if (ghostCommander.getCommand() == GHOST_CMD_SCATTER) {
        scatter = (this == enemy1 || this == enemy2);
    }
    return scatter;
};

// determine direction
Enemy.prototype.steer = function() {

    var dirEnum;                         // final direction to update to
    var openTiles;                       // list of four booleans indicating which surrounding tiles are open
    var oppDirEnum = rotateAboutFace(this.dirEnum); // current opposite direction enum
    var actor;                           // actor whose corner we will target

    // special map-specific steering when going to, entering, pacing inside, or leaving home
    this.homeSteer();

    // current opposite direction enum
    oppDirEnum = rotateAboutFace(this.dirEnum); 

    // only execute rest of the steering logic if we're pursuing a target tile
    if (this.mode != GHOST_OUTSIDE && this.mode != GHOST_GOING_HOME) {
        this.targetting = false;
        return;
    }

    // AT MID-TILE (update movement direction)
    if (this.distToMid.x == 0 && this.distToMid.y == 0) {

        // trigger reversal
        if (this.sigReverse) {
            this.faceDirEnum = oppDirEnum;
            this.sigReverse = false;
        }

        // commit previous direction
        this.setDir(this.faceDirEnum);
    }
    // JUST PASSED MID-TILE (update face direction)
    else if (
            this.dirEnum == DIR_RIGHT && this.tilePixel.x == midTile.x+1 ||
            this.dirEnum == DIR_LEFT  && this.tilePixel.x == midTile.x-1 ||
            this.dirEnum == DIR_UP    && this.tilePixel.y == midTile.y-1 ||
            this.dirEnum == DIR_DOWN  && this.tilePixel.y == midTile.y+1) {

        // get next tile
        var nextTile = {
            x: this.tile.x + this.dir.x,
            y: this.tile.y + this.dir.y,
        };

        // get tiles surrounding next tile and their open indication
        openTiles = getOpenTiles(nextTile, this.dirEnum);

        if (this.scared) {
            // choose a random turn
            dirEnum = Math.floor(Math.random()*4);
            while (!openTiles[dirEnum])
                dirEnum = (dirEnum+1)%4; // look at likelihood of random turns
            this.targetting = false;
        }
        else {

            /* SET TARGET */

            // target ghost door
            if (this.mode == GHOST_GOING_HOME) {
                this.targetTile.x = map.doorTile.x;
                this.targetTile.y = map.doorTile.y;
            }
            // target corner when scattering
            else if (!this.elroy && ghostCommander.getCommand() == GHOST_CMD_SCATTER) {

                actor = this.isScatterBrain() ? actors[Math.floor(Math.random()*4)] : this;

                this.targetTile.x = actor.cornerTile.x;
                this.targetTile.y = actor.cornerTile.y;
                this.targetting = 'corner';
            }
            // use custom function for each ghost when in attack mode
            else {
                this.setTarget();
            }

            /* CHOOSE TURN */

            var dirDecided = false;
            if (this.mode == GHOST_GOING_HOME && map.getExitDir) {
                // If the map has a 'getExitDir' function, then we are using
                // a custom algorithm to choose the next direction.
                // Currently, procedurally-generated maps use this function
                // to ensure that ghosts can return home without looping forever.
                var exitDir = map.getExitDir(nextTile.x,nextTile.y);
                if (exitDir != undefined && exitDir != oppDirEnum) {
                    dirDecided = true;
                    dirEnum = exitDir;
                }
            }

            if (!dirDecided) {
                // Do not constrain turns for ghosts going home. (thanks bitwave)
                if (this.mode != GHOST_GOING_HOME) {
                    if (map.constrainEnemyTurns) {
                        // edit openTiles to reflect the current map's special contraints
                        map.constrainEnemyTurns(nextTile, openTiles, this.dirEnum);
                    }
                }

                // choose direction that minimizes distance to target
                dirEnum = getTurnClosestToTarget(nextTile, this.targetTile, openTiles);
            }
        }

        // Point eyeballs to the determined direction.
        this.faceDirEnum = dirEnum;
    }
};

Enemy.prototype.getPathDistLeft = function(fromPixel, dirEnum) {
    var distLeft = tileSize;
    var pixel = this.getTargetPixel();
    if (this.targetting == 'player') {
        if (dirEnum == DIR_UP || dirEnum == DIR_DOWN)
            distLeft = Math.abs(fromPixel.y - pixel.y);
        else {
            distLeft = Math.abs(fromPixel.x - pixel.x);
        }
    }
    return distLeft;
};

Enemy.prototype.setTarget = function() {
    // This sets the target tile when in chase mode.
    // The "target" is always Pac-Man when in this mode,
    // except for enemy4.  He runs away back home sometimes,
    // so the "targetting" parameter is set in getTargetTile
    // for Clyde only.

    this.targetTile = this.getTargetTile();

    if (this != enemy4) {
        this.targetting = 'pacman';
    }
};
//@line 1 "src/Player.js"
//////////////////////////////////////////////////////////////////////////////////////
// Player is the controllable character (Pac-Man)

// Player constructor
var Player = function() {

    // inherit data from Actor
    Actor.apply(this);
    if (gameMode == GAME_MSPACMAN || gameMode == GAME_TUBIE_MAN) {
        this.frames = 1; // start with mouth open
    }

    this.nextDir = {};
    this.lastMeal = { x:-1, y:-1 };

    // determines if this player should be AI controlled
    this.ai = false;
    this.invincible = false;

    this.savedNextDirEnum = {};
    this.savedStopped = {};
    this.savedEatPauseFramesLeft = {};
};

// inherit functions from Actor
Player.prototype = newChildObject(Actor.prototype);

Player.prototype.save = function(t) {
    this.savedEatPauseFramesLeft[t] = this.eatPauseFramesLeft;
    this.savedNextDirEnum[t] = this.nextDirEnum;
    this.savedStopped[t] = this.stopped;

    Actor.prototype.save.call(this,t);
};

Player.prototype.load = function(t) {
    this.eatPauseFramesLeft = this.savedEatPauseFramesLeft[t];
    this.setNextDir(this.savedNextDirEnum[t]);
    this.stopped = this.savedStopped[t];

    Actor.prototype.load.call(this,t);
};

// reset the state of the player on new level or level restart
Player.prototype.reset = function() {

    this.setNextDir(this.startDirEnum);
    this.stopped = false;
    this.inputDirEnum = undefined;

    this.eatPauseFramesLeft = 0;   // current # of frames left to pause after eating

    // call Actor's reset function to reset to initial position and direction
    Actor.prototype.reset.apply(this);

};

// sets the next direction and updates its dependent variables
Player.prototype.setNextDir = function(nextDirEnum) {
    setDirFromEnum(this.nextDir, nextDirEnum);
    this.nextDirEnum = nextDirEnum;
};

// gets the number of steps to move in this frame
Player.prototype.getNumSteps = function() {
    if (turboMode)
        return 2;

    var pattern = energizer.isActive() ? STEP_PACMAN_FRIGHT : STEP_PACMAN;
    return this.getStepSizeFromTable(level, pattern);
};

Player.prototype.getStepFrame = function(steps) {
    if (steps == undefined) {
        steps = this.steps;
    }
    return Math.floor(steps/2)%4;
};

Player.prototype.getAnimFrame = function(frame) {
    if (frame == undefined) {
        frame = this.getStepFrame();
    }
    
    frame = (frame+1)%4;
    if (state == deadState)
        frame = 1; // hack to force this frame when dead

    if (frame == 3) 
        frame = 1;

    return frame;
};

Player.prototype.setInputDir = function(dirEnum) {
    this.inputDirEnum = dirEnum;
};

Player.prototype.clearInputDir = function(dirEnum) {
    if (dirEnum == undefined || this.inputDirEnum == dirEnum) {
        this.inputDirEnum = undefined;
    }
};

// move forward one step
Player.prototype.step = (function(){

    // return sign of a number
    var sign = function(x) {
        if (x<0) return -1;
        if (x>0) return 1;
        return 0;
    };

    return function() {

        // just increment if we're not in a map
        if (!map) {
            this.setPos(this.pixel.x+this.dir.x, this.pixel.y+this.dir.y);
            return 1;
        }

        // identify the axes of motion
        var a = (this.dir.x != 0) ? 'x' : 'y'; // axis of motion
        var b = (this.dir.x != 0) ? 'y' : 'x'; // axis perpendicular to motion

        // Don't proceed past the middle of a tile if facing a wall
        this.stopped = this.stopped || (this.distToMid[a] == 0 && !isNextTileFloor(this.tile, this.dir));
        if (!this.stopped) {
            // Move in the direction of travel.
            this.pixel[a] += this.dir[a];

            // Drift toward the center of the track (a.k.a. cornering)
            this.pixel[b] += sign(this.distToMid[b]);
        }

        this.commitPos();
        return this.stopped ? 0 : 1;
    };
})();

// determine direction
Player.prototype.steer = function() {

    // if AI-controlled, only turn at mid-tile
    if (this.ai) {
        if (this.distToMid.x != 0 || this.distToMid.y != 0)
            return;

        // make turn that is closest to target
        var openTiles = getOpenTiles(this.tile, this.dirEnum);
        this.setTarget();
        this.setNextDir(getTurnClosestToTarget(this.tile, this.targetTile, openTiles));
    }
    else {
        this.targetting = undefined;
    }

    if (this.inputDirEnum == undefined) {
        if (this.stopped) {
            this.setDir(this.nextDirEnum);
        }
    }
    else {
        // Determine if input direction is open.
        var inputDir = {};
        setDirFromEnum(inputDir, this.inputDirEnum);
        var inputDirOpen = isNextTileFloor(this.tile, inputDir);

        if (inputDirOpen) {
            this.setDir(this.inputDirEnum);
            this.setNextDir(this.inputDirEnum);
            this.stopped = false;
        }
        else {
            if (!this.stopped) {
                this.setNextDir(this.inputDirEnum);
            }
        }
    }
    if (this.stopped) {
        audio.eating.stopLoop(true);
    }
};


// update this frame
Player.prototype.update = function(j) {

    var numSteps = this.getNumSteps();
    if (j >= numSteps)
        return;

    // skip frames
    if (this.eatPauseFramesLeft > 0) {
        if (j == numSteps-1)
            this.eatPauseFramesLeft--;
        return;
    }

    // call super function to update position and direction
    Actor.prototype.update.call(this,j);

    // eat something
    if (map) {
        var t = map.getTile(this.tile.x, this.tile.y);
        if (t == '.' || t == 'o') {
            this.lastMeal.x = this.tile.x;
            this.lastMeal.y = this.tile.y
            // apply eating drag (unless in turbo mode)
            if (!turboMode) {
                this.eatPauseFramesLeft = (t=='.') ? 1 : 3;
            }
            audio.eating.startLoop(true);
            map.onDotEat(this.tile.x, this.tile.y);
            ghostReleaser.onDotEat();
            fruit.onDotEat();
            addScore((t=='.') ? 10 : 50);

            if (t=='o')
                energizer.activate();
        }
        if (t == ' ' && ! (this.lastMeal.x == this.tile.x && this.lastMeal.y == this.tile.y)) {
            audio.eating.stopLoop(true);
        }
    }
};
//@line 1 "src/actors.js"
//////////////////////////////////////////////////////////////////////////////////////
// create all the actors

// Previously Named blinky
var enemy1 = new Enemy();
enemy1.name = "STICKY";
enemy1.color = "#DE373A";
enemy1.pathColor = "#DE373A";
enemy1.isVisible = true;

// Previously Named pinky
var enemy2 = new Enemy();
enemy2.name = "PRICKY";
enemy2.color = "#55D400";
enemy2.pathColor = "#55D400";
enemy2.isVisible = true;

// Previously Named inky
var enemy3 = new Enemy();
enemy3.name = "ICKY";
enemy3.color = "#099EDE";
enemy3.pathColor = "#099EDE";
enemy3.isVisible = true;

// Previously Named clyde
var enemy4 = new Enemy();
enemy4.name = "ASHER";
enemy4.color = "#FFB851";
enemy4.pathColor = "#FFB851";
enemy4.isVisible = true;

// Previously Named pacman
var player = new Player();
player.name = "TUBIE-MAN";
player.color = "#FF6E31";
player.pathColor = "@FF6E31";

// order at which they appear in original arcade memory
// (suggests drawing/update order)
var actors = [enemy1, enemy2, enemy3, enemy4, player];
var ghosts = [enemy1, enemy2, enemy3, enemy4];//@line 1 "src/targets.js"
/////////////////////////////////////////////////////////////////
// Targetting
// (a definition for each actor's targetting algorithm and a draw function to visualize it)
// (getPathDistLeft is used to obtain a smoothly interpolated path endpoint)

// the tile length of the path drawn toward the target
var actorPathLength = 16;

(function() {

// the size of the square rendered over a target tile (just half a tile)
var targetSize = midTile.y;

// when drawing paths, use these offsets so they don't completely overlap each other
player.pathCenter = { x:0, y:0};
enemy1.pathCenter = { x:-2, y:-2 };
enemy2.pathCenter = { x:-1, y:-1 };
enemy3.pathCenter = { x:1, y:1 };
enemy4.pathCenter = { x:2, y:2 };

/////////////////////////////////////////////////////////////////
// blinky directly targets player

enemy1.getTargetTile = function() {
    return { x: player.tile.x, y: player.tile.y };
};
enemy1.getTargetPixel = function() {
    return { x: player.pixel.x, y: player.pixel.y };
};
enemy1.drawTarget = function(ctx) {
    if (!this.targetting) return;
    ctx.fillStyle = this.color;
    if (this.targetting == 'player')
        renderer.drawCenterPixelSq(ctx, player.pixel.x, player.pixel.y, targetSize);
    else
        renderer.drawCenterTileSq(ctx, this.targetTile.x, this.targetTile.y, targetSize);
};

/////////////////////////////////////////////////////////////////
// enemy2 targets four tiles ahead of player
enemy2.getTargetTile = function() {
    var px = player.tile.x + 4*player.dir.x;
    var py = player.tile.y + 4*player.dir.y;
    if (player.dirEnum == DIR_UP) {
        px -= 4;
    }
    return { x : px, y : py };
};
enemy2.getTargetPixel = function() {
    var px = player.pixel.x + 4*player.dir.x*tileSize;
    var py = player.pixel.y + 4*player.dir.y*tileSize;
    if (player.dirEnum == DIR_UP) {
        px -= 4*tileSize;
    }
    return { x : px, y : py };
};
enemy2.drawTarget = function(ctx) {
    if (!this.targetting) return;
    ctx.fillStyle = this.color;

    var pixel = this.getTargetPixel();

    if (this.targetting == 'player') {
        ctx.beginPath();
        ctx.moveTo(player.pixel.x, player.pixel.y);
        if (player.dirEnum == DIR_UP) {
            ctx.lineTo(player.pixel.x, pixel.y);
        }
        ctx.lineTo(pixel.x, pixel.y);
        ctx.stroke();
        renderer.drawCenterPixelSq(ctx, pixel.x, pixel.y, targetSize);
    }
    else
        renderer.drawCenterTileSq(ctx, this.targetTile.x, this.targetTile.y, targetSize);
};

/////////////////////////////////////////////////////////////////
// inky targets twice the distance from blinky to two tiles ahead of player
enemy3.getTargetTile = function() {
    var px = player.tile.x + 2*player.dir.x;
    var py = player.tile.y + 2*player.dir.y;
    if (player.dirEnum == DIR_UP) {
        px -= 2;
    }
    return {
        x : enemy1.tile.x + 2*(px - enemy1.tile.x),
        y : enemy1.tile.y + 2*(py - enemy1.tile.y),
    };
};
enemy3.getJointPixel = function() {
    var px = player.pixel.x + 2*player.dir.x*tileSize;
    var py = player.pixel.y + 2*player.dir.y*tileSize;
    if (player.dirEnum == DIR_UP) {
        px -= 2*tileSize;
    }
    return { x: px, y: py };
};
enemy3.getTargetPixel = function() {
    var px = player.pixel.x + 2*player.dir.x*tileSize;
    var py = player.pixel.y + 2*player.dir.y*tileSize;
    if (player.dirEnum == DIR_UP) {
        px -= 2*tileSize;
    }
    return {
        x : enemy1.pixel.x + 2*(px-enemy1.pixel.x),
        y : enemy1.pixel.y + 2*(py-enemy1.pixel.y),
    };
};
enemy3.drawTarget = function(ctx) {
    if (!this.targetting) return;
    var pixel;

    var joint = this.getJointPixel();

    if (this.targetting == 'player') {
        pixel = this.getTargetPixel();
        ctx.beginPath();
        ctx.moveTo(player.pixel.x, player.pixel.y);
        if (player.dirEnum == DIR_UP) {
            ctx.lineTo(player.pixel.x, joint.y);
        }
        ctx.lineTo(joint.x, joint.y);
        ctx.moveTo(enemy1.pixel.x, enemy1.pixel.y);
        ctx.lineTo(pixel.x, pixel.y);
        ctx.closePath();
        ctx.stroke();

        // draw seesaw joint
        ctx.beginPath();
        ctx.arc(joint.x, joint.y, 2,0,Math.PI*2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();

        ctx.fillStyle = this.color;
        renderer.drawCenterPixelSq(ctx, pixel.x, pixel.y, targetSize);
    }
    else {
        ctx.fillStyle = this.color;
        renderer.drawCenterTileSq(ctx, this.targetTile.x, this.targetTile.y, targetSize);
    }
};

/////////////////////////////////////////////////////////////////
// clyde targets player if >=8 tiles away, otherwise targets home

enemy4.getTargetTile = function() {
    var dx = player.tile.x - (this.tile.x + this.dir.x);
    var dy = player.tile.y - (this.tile.y + this.dir.y);
    var dist = dx*dx+dy*dy;
    if (dist >= 64) {
        this.targetting = 'player';
        return { x: player.tile.x, y: player.tile.y };
    }
    else {
        this.targetting = 'corner';
        return { x: this.cornerTile.x, y: this.cornerTile.y };
    }
};
enemy4.getTargetPixel = function() {
    // NOTE: won't ever need this function for corner tile because it is always outside
    return { x: player.pixel.x, y: player.pixel.y };
};
enemy4.drawTarget = function(ctx) {
    if (!this.targetting) return;
    ctx.fillStyle = this.color;

    if (this.targetting == 'player') {
        ctx.beginPath();
        if (true) {
            // draw a radius
            ctx.arc(player.pixel.x, player.pixel.y, tileSize*8,0, 2*Math.PI);
            ctx.closePath();
        }
        else {
            // draw a distance stick
            ctx.moveTo(player.pixel.x, player.pixel.y);
            var dx = enemy4.pixel.x - player.pixel.x;
            var dy = enemy4.pixel.y - player.pixel.y;
            var dist = Math.sqrt(dx*dx+dy*dy);
            dx = dx/dist*tileSize*8;
            dy = dy/dist*tileSize*8;
            ctx.lineTo(player.pixel.x + dx, player.pixel.y + dy);
        }
        ctx.stroke();
        renderer.drawCenterPixelSq(ctx, player.pixel.x, player.pixel.y, targetSize);
    }
    else {
        // draw a radius
        if (ghostCommander.getCommand() == GHOST_CMD_CHASE) {
            ctx.beginPath();
            ctx.arc(player.pixel.x, player.pixel.y, tileSize*8,0, 2*Math.PI);
            ctx.strokeStyle = "rgba(255,255,255,0.25)";
            ctx.stroke();
        }
        renderer.drawCenterTileSq(ctx, this.targetTile.x, this.targetTile.y, targetSize);
    }
};


/////////////////////////////////////////////////////////////////
// player targets twice the distance from enemy2 to player or target enemy2

player.setTarget = function() {
    if (enemy1.mode == GHOST_GOING_HOME || enemy1.scared) {
        this.targetTile.x = enemy2.tile.x;
        this.targetTile.y = enemy2.tile.y;
        this.targetting = 'enemy2';
    }
    else {
        this.targetTile.x = enemy2.tile.x + 2*(player.tile.x-enemy2.tile.x);
        this.targetTile.y = enemy2.tile.y + 2*(player.tile.y-enemy2.tile.y);
        this.targetting = 'flee';
    }
};
player.drawTarget = function(ctx) {
    if (!this.ai) return;
    ctx.fillStyle = this.color;
    var px,py;

    if (this.targetting == 'flee') {
        px = player.pixel.x - enemy2.pixel.x;
        py = player.pixel.y - enemy2.pixel.y;
        px = enemy2.pixel.x + 2*px;
        py = enemy2.pixel.y + 2*py;
        ctx.beginPath();
        ctx.moveTo(enemy2.pixel.x, enemy2.pixel.y);
        ctx.lineTo(px,py);
        ctx.closePath();
        ctx.stroke();
        renderer.drawCenterPixelSq(ctx, px, py, targetSize);
    }
    else {
        renderer.drawCenterPixelSq(ctx, enemy2.pixel.x, enemy2.pixel.y, targetSize);
    };

};
player.getPathDistLeft = function(fromPixel, dirEnum) {
    var distLeft = tileSize;
    var px,py;
    if (this.targetting == 'enemy2') {
        if (dirEnum == DIR_UP || dirEnum == DIR_DOWN)
            distLeft = Math.abs(fromPixel.y - enemy2.pixel.y);
        else
            distLeft = Math.abs(fromPixel.x - enemy2.pixel.x);
    }
    else { // 'flee'
        px = player.pixel.x - enemy2.pixel.x;
        py = player.pixel.y - enemy2.pixel.y;
        px = enemy2.pixel.x + 2*px;
        py = enemy2.pixel.y + 2*py;
        if (dirEnum == DIR_UP || dirEnum == DIR_DOWN)
            distLeft = Math.abs(py - fromPixel.y);
        else
            distLeft = Math.abs(px - fromPixel.x);
    }
    return distLeft;
};

})();
//@line 1 "src/ghostCommander.js"
//////////////////////////////////////////////////////////////////////////////////////
// Ghost Commander
// Determines when a ghost should be chasing a target

// modes representing the ghosts' current command
var GHOST_CMD_CHASE = 0;
var GHOST_CMD_SCATTER = 1;

var ghostCommander = (function() {

    // determine if there is to be a new command issued at the given time
    var getNewCommand = (function(){
        var t;
        var times = [{},{},{}];
        // level 1
        times[0][t=7*60] = GHOST_CMD_CHASE;
        times[0][t+=20*60] = GHOST_CMD_SCATTER;
        times[0][t+=7*60] = GHOST_CMD_CHASE;
        times[0][t+=20*60] = GHOST_CMD_SCATTER;
        times[0][t+=5*60] = GHOST_CMD_CHASE;
        times[0][t+=20*60] = GHOST_CMD_SCATTER;
        times[0][t+=5*60] = GHOST_CMD_CHASE;
        // level 2-4
        times[1][t=7*60] = GHOST_CMD_CHASE;
        times[1][t+=20*60] = GHOST_CMD_SCATTER;
        times[1][t+=7*60] = GHOST_CMD_CHASE;
        times[1][t+=20*60] = GHOST_CMD_SCATTER;
        times[1][t+=5*60] = GHOST_CMD_CHASE;
        times[1][t+=1033*60] = GHOST_CMD_SCATTER;
        times[1][t+=1] = GHOST_CMD_CHASE;
        // level 5+
        times[2][t=5*60] = GHOST_CMD_CHASE;
        times[2][t+=20*60] = GHOST_CMD_SCATTER;
        times[2][t+=5*60] = GHOST_CMD_CHASE;
        times[2][t+=20*60] = GHOST_CMD_SCATTER;
        times[2][t+=5*60] = GHOST_CMD_CHASE;
        times[2][t+=1037*60] = GHOST_CMD_SCATTER;
        times[2][t+=1] = GHOST_CMD_CHASE;

        return function(frame) {
            var i;
            if (level == 1)
                i = 0;
            else if (level >= 2 && level <= 4)
                i = 1;
            else
                i = 2;
            var newCmd = times[i][frame];

            if (frame <= 27*60) { // only revearse twice in Ms. Pac-Man (two happen in first 27 seconds)
                if (newCmd != undefined) {
                    return GHOST_CMD_CHASE; // always chase
                }
            }
        };
    })();

    var frame;   // current frame
    var command; // last command given to ghosts

    var savedFrame = {};
    var savedCommand = {};

    // save state at time t
    var save = function(t) {
        savedFrame[t] = frame;
        savedCommand[t] = command;
    };

    // load state at time t
    var load = function(t) {
        frame = savedFrame[t];
        command = savedCommand[t];
    };

    return {
        save: save,
        load: load,
        reset: function() { 
            command = GHOST_CMD_SCATTER;
            frame = 0;
        },
        update: function() {
            var newCmd;
            if (!energizer.isActive()) {
                newCmd = getNewCommand(frame);
                if (newCmd != undefined) {
                    command = newCmd;
                    for (i=0; i<4; i++)
                        ghosts[i].reverse();
                }
                frame++;
            }
        },
        getCommand: function() {
            return command; 
        },
        setCommand: function(cmd) {
            command = cmd;
        },
    };
})();
//@line 1 "src/ghostReleaser.js"
//////////////////////////////////////////////////////////////////////////////////////
// Ghost Releaser

// Determines when to release ghosts from home

var ghostReleaser = (function(){
    // two separate counter modes for releasing the ghosts from home
    var MODE_PERSONAL = 0;
    var MODE_GLOBAL = 1;

    // enemy enumerations
    var ENEMY_2 = 1;
    var ENEMY_3 = 2;
    var ENEMY_4 = 3;

    // this is how many frames it will take to release a ghost after player stops eating
    var getTimeoutLimit = function() { return (level < 5) ? 4*60 : 3*60; };

    // dot limits used in personal mode to release ghost after # of dots have been eaten
    var personalDotLimit = {};
    personalDotLimit[ENEMY_2] = function() { return 0; };
    personalDotLimit[ENEMY_3] = function() { return (level==1) ? 30 : 0; };
    personalDotLimit[ENEMY_4] = function() {
        if (level == 1) return 60;
        if (level == 2) return 50;
        return 0;
    };

    // dot limits used in global mode to release ghost after # of dots have been eaten
    var globalDotLimit = {};
    globalDotLimit[ENEMY_2] = 7;
    globalDotLimit[ENEMY_3] = 17;
    globalDotLimit[ENEMY_4] = 32;

    var framesSinceLastDot; // frames elapsed since last dot was eaten
    var mode;               // personal or global dot counter mode
    var ghostCounts = {};   // personal dot counts for each ghost
    var globalCount;        // global dot count

    var savedGlobalCount = {};
    var savedFramesSinceLastDot = {};
    var savedGhostCounts = {};

    // save state at time t
    var save = function(t) {
        savedFramesSinceLastDot[t] = framesSinceLastDot;
        if (mode == MODE_GLOBAL) {
            savedGlobalCount[t] = globalCount;
        }
        else if (mode == MODE_PERSONAL) {
            savedGhostCounts[t] = {};
            savedGhostCounts[t][ENEMY_2] = ghostCounts[ENEMY_2];
            savedGhostCounts[t][ENEMY_3] = ghostCounts[ENEMY_3];
            savedGhostCounts[t][ENEMY_4] = ghostCounts[ENEMY_4];
        }
    };

    // load state at time t
    var load = function(t) {
        framesSinceLastDot = savedFramesSinceLastDot[t];
        if (mode == MODE_GLOBAL) {
            globalCount = savedGlobalCount[t];
        }
        else if (mode == MODE_PERSONAL) {
            ghostCounts[ENEMY_2] = savedGhostCounts[t][ENEMY_2];
            ghostCounts[ENEMY_3] = savedGhostCounts[t][ENEMY_3];
            ghostCounts[ENEMY_4] = savedGhostCounts[t][ENEMY_4];
        }
    };

    return {
        save: save,
        load: load,
        onNewLevel: function() {
            mode = MODE_PERSONAL;
            framesSinceLastDot = 0;
            ghostCounts[ENEMY_2] = 0;
            ghostCounts[ENEMY_3] = 0;
            ghostCounts[ENEMY_4] = 0;
        },
        onRestartLevel: function() {
            mode = MODE_GLOBAL;
            framesSinceLastDot = 0;
            globalCount = 0;
        },
        onDotEat: function() {
            var i;

            framesSinceLastDot = 0;

            if (mode == MODE_GLOBAL) {
                globalCount++;
            }
            else {
                for (i=1;i<4;i++) {
                    if (ghosts[i].mode == GHOST_PACING_HOME) {
                        ghostCounts[i]++;
                        break;
                    }
                }
            }

        },
        update: function() {
            var g;

            // use personal dot counter
            if (mode == MODE_PERSONAL) {
                for (i=1;i<4;i++) {
                    g = ghosts[i];
                    if (g.mode == GHOST_PACING_HOME) {
                        if (ghostCounts[i] >= personalDotLimit[i]()) {
                            g.leaveHome();
                            return;
                        }
                        break;
                    }
                }
            }
            // use global dot counter
            else if (mode == MODE_GLOBAL) {
                if (globalCount == globalDotLimit[ENEMY_2] && enemy2.mode == GHOST_PACING_HOME) {
                    enemy2.leaveHome();
                    return;
                }
                else if (globalCount == globalDotLimit[ENEMY_3] && enemy3.mode == GHOST_PACING_HOME) {
                    enemy3.leaveHome();
                    return;
                }
                else if (globalCount == globalDotLimit[ENEMY_4] && enemy4.mode == GHOST_PACING_HOME) {
                    globalCount = 0;
                    mode = MODE_PERSONAL;
                    enemy4.leaveHome();
                    return;
                }
            }

            // also use time since last dot was eaten
            if (framesSinceLastDot > getTimeoutLimit()) {
                framesSinceLastDot = 0;
                for (i=1;i<4;i++) {
                    g = ghosts[i];
                    if (g.mode == GHOST_PACING_HOME) {
                        g.leaveHome();
                        break;
                    }
                }
            }
            else
                framesSinceLastDot++;
        },
    };
})();
//@line 1 "src/elroyTimer.js"
//////////////////////////////////////////////////////////////////////////////////////
// Elroy Timer

// Determines when to put blinky into faster elroy modes

var elroyTimer = (function(){

    // get the number of dots left that should trigger elroy stage #1 or #2
    var getDotsEatenLimit = (function(){
        var dotsLeft = [
            [20,30,40,40,40,50,50,50,60,60,60,70,70,70,100,100,100,100,120,120,120], // elroy1
            [10,15,20,20,20,25,25,25,30,30,30,40,40,40, 50, 50, 50, 50, 60, 60, 60]]; // elroy2
        return function(stage) {
            var i = level;
            if (i>21) i = 21;
            var player_max_pellets = 244;
            return player_max_pellets - dotsLeft[stage-1][i-1];
        };
    })();

    // when level restarts, blinky must wait for clyde to leave home before resuming elroy mode
    var waitForClyde;

    var savedWaitForClyde = {};

    // save state at time t
    var save = function(t) {
        savedWaitForClyde[t] = waitForClyde;
    };

    // load state at time t
    var load = function(t) {
        waitForClyde = savedWaitForClyde[t];
    };

    return {
        onNewLevel: function() {
            waitForClyde = false;
        },
        onRestartLevel: function() {
            waitForClyde = true;
        },
        update: function() {

            // stop waiting for clyde when clyde leaves home
            if (waitForClyde && enemy4.mode != GHOST_PACING_HOME)
                waitForClyde = false;

            if (waitForClyde) {
                enemy1.elroy = 0;
            }
            else {
                if (map.dotsEaten >= getDotsEatenLimit(2)) {
                    enemy1.elroy = 2;
                }
                else if (map.dotsEaten >= getDotsEatenLimit(1)) {
                    enemy1.elroy = 1;
                }
                else {
                    enemy1.elroy = 0;
                }
            }
        },
        save: save,
        load: load,
    };
})();
//@line 1 "src/energizer.js"
//////////////////////////////////////////////////////////////////////////////////////
// Energizer

// This handles how long the energizer lasts as well as how long the
// points will display after eating a ghost.

var energizer = (function() {

    // how many seconds to display points when ghost is eaten
    var pointsDuration = 1;

    // how long to stay energized based on current level
    var getDuration = (function(){
        var seconds = [6,5,4,3,2,5,2,2,1,5,2,1,1,3,1,1,0,1];
        return function() {
            var i = level;
            return (i > 18) ? 0 : 60*seconds[i-1];
        };
    })();

    // how many ghost flashes happen near the end of frightened mode based on current level
    var getFlashes = (function(){
        var flashes = [5,5,5,5,5,5,5,5,3,5,5,3,3,5,3,3,0,3];
        return function() {
            var i = level;
            return (i > 18) ? 0 : flashes[i-1];
        };
    })();

    // "The ghosts change colors every 14 game cycles when they start 'flashing'" -Jamey Pittman
    var flashInterval = 14;

    var count;  // how long in frames energizer has been active
    var active; // indicates if energizer is currently active
    var points; // points that the last eaten ghost was worth
    var pointsFramesLeft; // number of frames left to display points earned from eating ghost

    var savedCount = {};
    var savedActive = {};
    var savedPoints = {};
    var savedPointsFramesLeft = {};

    // save state at time t
    var save = function(t) {
        savedCount[t] = count;
        savedActive[t] = active;
        savedPoints[t] = points;
        savedPointsFramesLeft[t] = pointsFramesLeft;
    };

    // load state at time t
    var load = function(t) {
        count = savedCount[t];
        active = savedActive[t];
        points = savedPoints[t];
        pointsFramesLeft = savedPointsFramesLeft[t];
    };

    return {
        save: save,
        load: load,
        reset: function() {
            audio.ghostTurnToBlue.stopLoop();
            count = 0;
            active = false;
            points = 100;
            pointsFramesLeft = 0;
            for (i=0; i<4; i++)
                ghosts[i].scared = false;
        },
        update: function() {
            var i;
            if (active) {
                if (count == getDuration())
                    this.reset();
                else
                    count++;
            }
        },
        activate: function() { 
            audio.enemyMove.stopLoop();
            audio.ghostTurnToBlue.startLoop();
            active = true;
            count = 0;
            points = 100;
            for (i=0; i<4; i++) {
                ghosts[i].onEnergized();
            }
            if (getDuration() == 0) { // if no duration, then immediately reset
                this.reset();
            }
        },
        isActive: function() { return active; },
        isFlash: function() { 
            var i = Math.floor((getDuration()-count)/flashInterval);
            return (i<=2*getFlashes()-1) ? (i%2==0) : false;
        },

        getPoints: function() {
            return points;
        },
        addPoints: function() {
            addScore(points*=2);
            pointsFramesLeft = pointsDuration*60;
        },
        showingPoints: function() { return pointsFramesLeft > 0; },
        updatePointsTimer: function() { if (pointsFramesLeft > 0) pointsFramesLeft--; },
    };
})();
//@line 1 "src/fruit.js"
//////////////////////////////////////////////////////////////////////////////////////
// Fruit

var BaseFruit = function() {
    // pixel
    this.pixel = {x:0, y:0};

    this.fruitHistory = {};

    this.scoreDuration = 2; // number of seconds that the fruit score is on the screen
    this.scoreFramesLeft; // frames left until the picked-up fruit score is off the screen
    this.savedScoreFramesLeft = {};
};

BaseFruit.prototype = {
    isScorePresent: function() {
        return this.scoreFramesLeft > 0;
    },
    onNewLevel: function() {
        this.buildFruitHistory();
    },
    setCurrentFruit: function(i) {
        this.currentFruitIndex = i;
    },
    onDotEat: function() {
        if (!this.isPresent() && (map.dotsEaten == this.dotLimit1 || map.dotsEaten == this.dotLimit2)) {
            this.initiate();
        }
    },
    save: function(t) {
        this.savedScoreFramesLeft[t] = this.scoreFramesLeft;
    },
    load: function(t) {
        this.scoreFramesLeft = this.savedScoreFramesLeft[t];
    },
    reset: function() {
        this.scoreFramesLeft = 0;
    },
    getCurrentFruit: function() {
        return this.fruits[this.currentFruitIndex];
    },
    getPoints: function() {
        return this.getCurrentFruit().points;
    },
    update: function() {
        if (this.scoreFramesLeft > 0)
            this.scoreFramesLeft--;
    },
    isCollide: function() {
        return Math.abs(player.pixel.y - this.pixel.y) <= midTile.y && Math.abs(player.pixel.x - this.pixel.x) <= midTile.x;
    },
    testCollide: function() {
        if (this.isPresent() && this.isCollide()) {
            addScore(this.getPoints());
            audio.silence(true);
            audio.eatingBonus.play();
            setTimeout(ghosts[0].playSounds, 500);
            this.reset();
            this.scoreFramesLeft = this.scoreDuration*60;
        }
    },
};

// Tubie-Man Fruits

var PATH_ENTER = 0;
var PATH_PEN = 1;
var PATH_EXIT = 2;

var TMFruit = function() {
    BaseFruit.call(this);
    this.fruits = [
        {name: 'gtube',     points: 100},
        {name: 'endless_pump', points: 200},
        {name: 'marsupial_pump',     points: 300},
        {name: 'jamie_pump',    points: 500},
        {name: 'usb_charger',      points: 700},
        {name: 'feeding_bag',       points: 800},
        {name: 'formula_bottle',     points: 1000},
        {name: 'y_extension',      points: 1600},
        {name: 'enfit_wrench',       points: 2000},
        {name: 'flying_squirrel',     points: 3000},
        {name: 'straighten_pump',      points: 5000}
    ];

    this.dotLimit1 = 64;
    this.dotLimit2 = 176;

    this.pen_path = "<<<<<<^^^^^^>>>>>>>>>vvvvvv<<";

    this.savedIsPresent = {};
    this.savedPixel = {};
    this.savedPathMode = {};
    this.savedFrame = {};
    this.savedNumFrames = {};
    this.savedPath = {};
};

TMFruit.prototype = newChildObject(BaseFruit.prototype, {

    getNumFruit: function() {
        return this.fruits.length + 1; // Offset by 1 b/c levels don't start at 0
    },

    shouldRandomizeFruit: function() {
        // return level > 11;
        return level > this.getNumFruit();
    },

    getFruitFromLevel: function(i) {
        if (i <= this.getNumFruit()) {
            return this.fruits[i-1];
        }
        else {
            return undefined;
        }
    },

    onNewLevel: function() {
        if (!this.shouldRandomizeFruit()) {
            this.setCurrentFruit(level-1);
        }
        else {
            this.setCurrentFruit(0);
        }
        BaseFruit.prototype.onNewLevel.call(this);
    },

    buildFruitHistory: function() {
        this.fruitHistory = {};
        var i;
        for (i=1; i<= Math.max(level, this.getNumFruit()); i++) {
            this.fruitHistory[i] = this.fruits[i-1];
        }
    },

    reset: function() {
        BaseFruit.prototype.reset.call(this);

        this.frame = 0;
        this.numFrames = 0;
        this.path = undefined;
    },

    initiatePath: function(p) {
        this.frame = 0;
        this.numFrames = p.length*16;
        this.path = p;
    },

    initiate: function() {
        if (this.shouldRandomizeFruit()) {
            this.setCurrentFruit(getRandomInt(0, this.getNumFruit() - 1));
        }

        var entrances = map.fruitPaths.entrances;
        var e = entrances[getRandomInt(0,entrances.length-1)];
        this.initiatePath(e.path);
        this.pathMode = PATH_ENTER;
        this.pixel.x = e.start.x;
        this.pixel.y = e.start.y;
    },

    isPresent: function() {
        return this.frame < this.numFrames;
    },

    bounceFrames: (function(){
        var U = { dx:0, dy:-1 };
        var D = { dx:0, dy:1 };
        var L = { dx:-1, dy:0 };
        var R = { dx:1, dy:0 };
        var UL = { dx:-1, dy:-1 };
        var UR = { dx:1, dy:-1 };
        var DL = { dx:-1, dy:1 };
        var DR = { dx:1, dy:1 };
        var Z = { dx:0, dy:0 };

        // A 16-frame animation for moving 8 pixels either up, down, left, or right.
        return {
            '^': [U, U, U, U, U, U, U, U, U, Z, U, Z, Z, D, Z, D],
            '>': [Z, UR,Z, R, Z, UR,Z, R, Z, R, Z, R, Z, DR,DR,Z],
            '<': [Z, Z, UL,Z, L, Z, UL,Z, L, Z, L, Z, L, Z, DL,DL],
            'v': [Z, D, D, D, D, D, D, D, D, D, D, D, U, U, Z, U],
        };
    })(),

    move: function() {
        var p = this.path[Math.floor(this.frame/16)]; // get current path frame
        var b = this.bounceFrames[p][this.frame%16]; // get current bounce animation frame
        this.pixel.x += b.dx;
        this.pixel.y += b.dy;
        this.frame++;
    },

    setNextPath: function() {
        if (this.pathMode == PATH_ENTER) {
            this.pathMode = PATH_PEN;
            this.initiatePath(this.pen_path);
        }
        else if (this.pathMode == PATH_PEN) {
            this.pathMode = PATH_EXIT;
            var exits = map.fruitPaths.exits;
            var e = exits[getRandomInt(0,exits.length-1)];
            this.initiatePath(e.path);
        }
        else if (this.pathMode == PATH_EXIT) {
            this.reset();
        }
    },

    update: function() {
        BaseFruit.prototype.update.call(this);

        if (this.isPresent()) {
            this.move();
            if (this.frame == this.numFrames) {
                this.setNextPath();
            }
        }
    },

    save: function(t) {
        BaseFruit.prototype.save.call(this,t);

        this.savedPixel[t] =        this.isPresent() ? {x:this.pixel.x, y:this.pixel.y} : undefined;
        this.savedPathMode[t] =     this.pathMode;
        this.savedFrame[t] =        this.frame;
        this.savedNumFrames[t] =    this.numFrames;
        this.savedPath[t] =         this.path;
    },

    load: function(t) {
        BaseFruit.prototype.load.call(this,t);

        if (this.savedPixel[t]) {
            this.pixel.x =      this.savedPixel[t].x;
            this.pixel.y =      this.savedPixel[t].y;
        }
        this.pathMode =     this.savedPathMode[t];
        this.frame =        this.savedFrame[t];
        this.numFrames =    this.savedNumFrames[t]; 
        this.path =         this.savedPath[t];
    },
});

var fruit = new TMFruit();
//@line 1 "src/executive.js"
var executive = (function(){

    var framePeriod = 1000/60; // length of each frame at 60Hz (updates per second)
    var gameTime; // virtual time of the last game update

    var paused = false; // flag for pausing the state updates, while still drawing
    var running = false; // flag for truly stopping everything

    /**********/
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

    // requestAnimationFrame polyfill by Erik Möller
    // fixes from Paul Irish and Tino Zijdel

    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                       || window[vendors[x]+'CancelRequestAnimationFrame'];
        }
     
        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
     
        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());
    /**********/

    var fps;
    var updateFps = (function(){
        // TODO: fix this to reflect the average rate of the last n frames, where 0 < n < 60
        var length = 60;
        var times = [];
        var startIndex = 0;
        var endIndex = -1;
        var filled = false;

        return function(now) {
            if (filled) {
                startIndex = (startIndex+1) % length;
            }
            endIndex = (endIndex+1) % length;
            if (endIndex == length-1) {
                filled = true;
            }

            times[endIndex] = now;

            var seconds = (now - times[startIndex]) / 1000;
            var frames = endIndex - startIndex;
            if (frames < 0) {
                frames += length;
            }
            fps = frames / seconds;
        };
    })();
        

    var reqFrame; // id of requestAnimationFrame object
    var tick = function(now) {
        if (gameTime == undefined) {
            gameTime = now;
        }

        // Update fps counter.
        updateFps(now);

        // Control frame-skipping by only allowing gameTime to lag behind the current time by some amount.
        var maxFrameSkip = 3;
        gameTime = Math.max(gameTime, now-maxFrameSkip*framePeriod);

        // Prevent any updates from being called when paused.
        if (paused || inGameMenu.isOpen()) {
            gameTime = now;
        }

        hud.update();

        // Update the game until the gameTime surpasses the current time.
        while (gameTime < now) {
            state.update();
            gameTime += framePeriod;
        }

        // Draw.
        renderer.beginFrame();
        state.draw();
        if (hud.isValidState()) {
            renderer.renderFunc(hud.draw);
        }
        renderer.endFrame();

        // Schedule the next tick.
        reqFrame = requestAnimationFrame(tick);
    };

    return {

        getFramePeriod: function() {
            return framePeriod;
        },
        setUpdatesPerSecond: function(ups) {
            framePeriod = 1000/ups;
            //gameTime = undefined;
            vcr.onFramePeriodChange();
        },
        init: function() {
            var that = this;
            window.addEventListener('focus', function() {that.start();});
            window.addEventListener('blur', function() {that.stop();});
            this.start();
        },
        start: function() {
            if (!running) {
                reqFrame = requestAnimationFrame(tick);
                running = true;
            }
        },
        stop: function() {
            if (running) {
                cancelAnimationFrame(reqFrame);
                running = false;
            }
        },
        togglePause: function() { paused = !paused; },
        isPaused: function() { return paused; },
        getFps: function() { return fps; },
    };
})();
//@line 1 "src/states.js"
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

//@line 1 "src/input.js"
// Accept input from Keyboard, Touch and Game Controller and combine into a unified list of inputs

// The input handling seems over-complicated (and probably is a bit), but the goal of this implementation
// was to de-couple the way that an 'Action' is generated from the underlying representation of the
// Action and it's execution.

// Each entry in the map 'Actions' represents a single 'Action' that can be taken. Actions are
// usually context specific (e.g. the UP action is used for player movement, whereas the MENU_UP action
// is used for menu navigation)
// An action should be named based on what happens, not what the input method was.

// Values in InputSources describe/are linked to the physical method that was used to generate the input.
// The same Action may be tied to different 'Input Sources', and may be handled the same or different.

// An Input is the combination of an 'Action', InputSource and other attributes that provide context
// To the input. (See the class for an in-depth description of each attribute).

// The InputQueue class should have 1 global instance typically. This class serves 2 purposes.
// 1. To 'queue' up non-instantaneous inputs. This is usefull as it allows for multiple
// Inputs occur at the same time, and then when one falls off the other takes the formers place
// as the active inpupt. This queue was implemented because of an issue using 8-way controllers
// with just the 'keydown' action.

// An 8-way joystick allows for 2 directions to be active by the same time (e.g. if you picture the 
// joystick as a compass with UP being North and LEFT being West, the direction NW is a combination of
// bot the UP and LEFT keys/inputs being triggered at the same time)

// The issues was when moving the joystick from the N to NW directions, the 'UP' action would be lost
// when the 'LEFT' action was issued. If the player then moved the stick from NW to N without re-centering,
// no additonal keydown event would be triggered as N/UP was down the entire time. This would cause the
// Player sprite to continue to move to the LEFT/W until the joystick was re-centered.
// 
// Another benefit of the input-queue system is that it allows for 'sticky' inputs, which is an input
// that occurs 1 time and stops, but the action associated with the input continues to occurr until a
// clear command is issued, or another input is created.

const InputSources = Object.freeze({
    _typeName: "InputSources", // Used to identify the object 'type' at runtime. Used for typechecking params
    KEYBOARD: "keyboard",
    SWIPE: "swipe",
    GAMEPAD: "controller"
});

const Actions = Object.freeze({
    _typeName: "Actions", // Used to identify the object 'type' at runtime. Used for typechecking params
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
    ENTER : "enter",
    EXIT: "exit",
    MENU_UP: "menuUp",
    MENU_DOWN: "menuDown",
    MENU_LEFT: "menuLeft",
    MENU_RIGHT: "menuRight",
    MENU_OPEN: "menuOpen",
    PAUSE: "pause",
    CHEAT: "cheat",
    UNUSED: "unused",
    TOGGLE_MUTE: "toggleMute",
    VOLUME_UP: "volumeUp",
    VOLUME_DOWN: "volumeDown"
});

const Keys = Object.freeze({
    _typeName: "Keys", // Used to identify the object 'type' at runtime. Used for typechecking params
    ENTER: "Enter",
    ESC: "Escape",
    END: "End",

    LEFT: "ArrowLeft",
    RIGHT: "ArrowRight",
    UP: "ArrowUp",
    DOWN: "ArrowDown",

    SHIFT: "ShiftLeft",
    CTRL: "ControlLeft",
    ALT: "AltLeft",
    SPACE: "Space",

    W:  "KeyW",
    A:  "KeyA",
    S:  "KeyS",
    D:  "KeyD",

    // A: "KeyA",
    B: "KeyB",
    C: "KeyC",
    // D: "KeyD",
    E: "KeyE",
    F: "KeyF",
    G: "KeyG",
    H: "KeyH",
    I: "KeyI",
    J: "KeyJ",
    K: "KeyK",
    L: "KeyL",
    M: "KeyM",
    N: "KeyN",
    O: "KeyO",
    P: "KeyP",
    Q: "KeyQ",
    R: "KeyR",
    //S: "KeyS",
    T: "KeyT",
    U: "KeyU",
    V: "KeyV",
    //W: "KeyW",
    X: "KeyX",
    Y: "KeyY",
    Z: "KeyZ",

    0: "Digit0",
    1: "Digit1",
    2: "Digit2",
    3: "Digit3",
    4: "Digit4",
    5: "Digit5",
    6: "Digit6",
    7: "Digit7",
    8: "Digit8",
    9: "Digit9",

    NUM_0: "Numpad0",
    NUM_1: "Numpad1",
    NUM_2: "Numpad2",
    NUM_3: "Numpad3", 
    NUM_4: "Numpad4",
    NUM_5: "Numpad5",
    NUM_6: "Numpad6",
    NUM_7: "Numpad7",
    NUM_8: "Numpad8",
    NUM_9: "Numpad9",
    NUM_ENTER: "NumpadEnter",
    NUM_ADD: "NumpadAdd",
    NUM_SUBTRACT: "NumpadSubtract",

    //Gamepad 'Left' Joystick
    JOYSTICK_RIGHT: "JoystickRight",
    JOYSTICK_LEFT: "JoystickLeft",
    JOYSTICK_UP: "JoystickUp",
    JOYSTICK_DOWN: "JoystickDown",

    // Gamepad Buttons
    GAMEPAD_0: "GamepadButton0",
    GAMEPAD_1: "GamepadButton1",
    GAMEPAD_2: "GamepadButton2",
    GAMEPAD_3: "GamepadButton3",
    GAMEPAD_4: "GamepadButton4",
    GAMEPAD_5: "GamepadButton5",
    GAMEPAD_6: "GamepadButton6",
    GAMEPAD_7: "GamepadButton7",
    GAMEPAD_8: "GamepadButton8",
    GAMEPAD_9: "GamepadButton9",
    GAMEPAD_10: "GamepadButton10",
    GAMEPAD_11: "GamepadButton11",
    GAMEPAD_12: "GamepadButton12",
});

// Maps Keys to Input Types
const KeyInputMap = {};

// Map of Active Gamepads. Maps their ID to the GamePad object
const gamepads = {};

// Immutable representation of an input
class Input {
    #source;  // Source of the input. Must be one of InputSources
    #action; // Action to be taken
    #isVolatile; // Volatility means that an Input will be removed from the queue whenever a new Input is added. The input will continue to move up the queue if previous inputs are dequeued. Volatility can be used to handle InputSources that do not have an exit or cancel event (like swipes, as opposed to 'keyreleased' or 'buttonUp' events for keyboards and controllers respectivley)
    #isInstantaneous; // If an Input is instantaneous, then it will not be added to the input queue, and only used to process the instant it occurrs. Instantaneous events will still be saved to the recent history of the queue.
    #conditionFunc; // This is a function that when called evaluates to a boolean, which determines if the input handler should be run.

    constructor(action, source, isVolatile, isInstantaneous, conditionFunc) {
        // validate params
        !Input.#isValidInstanceOfType(Actions, action)
        !Input.#isValidInstanceOfType(InputSources, source)
        if(typeof isVolatile !== "boolean")
            throw new Error(`Value ${isVolatile} of parameter 'isVolatile must be a boolean`);
        if(typeof isInstantaneous !== "boolean")
            throw new Error(`Value ${isInstantaneous} of parameter 'isInstantaneous must be a boolean`);
        if(!(conditionFunc === null || conditionFunc === undefined) && typeof conditionFunc !== "function")
            throw new Error("If a value is provided for conditionFunc, it myst be of type 'function'");

        this.#action = action;
        this.#source = source;
        this.#isVolatile = isVolatile;
        this.#isInstantaneous = isInstantaneous;
        this.#conditionFunc = conditionFunc;
    }

    static #isValidInstanceOfType (type, instance) {
        if (!Object.values(type).includes(instance))
            throw new Error(`Value ${instance} does not exist in type ${type._typeName}`);
    }

    getSoruce() {
        return this.#source;
    }

    getAction() {
        return this.#action;
    }

    evaluateCondition() {
        // Always execute if no condition was provied
        return typeof this.#conditionFunc === "function" ? this.#conditionFunc() : true;
    }

    isVolatile() {
        return this.#isVolatile;
    }

    isInstantaneous() {
        return this.#isInstantaneous;
    }

    getHash() {
        const input = `${this.#source}|${this.#isVolatile}|${this.#action}|${this.#isInstantaneous}`;

        // Simple, non-cryptographic
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          hash = (hash << 5) - hash + input.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }

        return hash;
    }

    isEqual(input) {
        return this.getHash() === input.getHash();
    }

    serialize(toString) {
        if(!(toString === null || toString === undefined) && typeof toString !== "boolean")
            throw new Error("toString must be a boolean when provided to the method Input.serialize");

        const json = {
            "hash": this.getHash(),
            "action": this.#action,
            "source": this.#source,
            "isVolatile": this.#isVolatile,
            "isInstantaneous": this.#isInstantaneous,
            "hasConditionFunc": typeof this.#conditionFunc === "function",
        };

        return toString ? JSON.stringify(json, null, 2) : json;
    }
}

class InputQueue {
    #queue = [];
    #recentHistory = [];
    #instantaneousInputHandlers = {};

    historyRetentionSize = 10;

    constructor(){}

    set historyRetentionSize(size) {
        if(typeof size != "number" || size < 0)
            throw new Error("A number must be used when setting the historyRetentionSize of an InputQueue");

        this.historyRetentionSize = size;

        if(this.#recentHistory.length > this.historyRetentionSize)
            this.#trimHistory();
    }

    #trimHistory() {
        this.#recentHistory = this.#recentHistory.slice(this.#recentHistory.length - this.historyRetentionSize)
    }

    #updateHistory(input) {
        this.#recentHistory.push(input);
        this.#trimHistory();
    }

    #removeExistingInputInstances(input) {
        this.#queue = this.#queue.filter((element) => !input.isEqual(element))
    }

    #removeVolatileInputs() {
        this.#queue = this.#queue.filter((input) => !input.isVolatile());
    }

    #checkParamIsInput(name, param) {
        if(! (param instanceof Input))
            throw new Error(`Parameter ${name} is not an instance the class Input`);
    }

    addInstantaneousInputHandler(input, handler) {
        this.#checkParamIsInput("input", input);

        if(typeof handler !== "function")
            throw new Error("handler must be a function");

        this.#instantaneousInputHandlers[input.getHash()] = handler;
    }

    handleInstaneousInput(input, handlerParams) {
        this.#checkParamIsInput("input", input);

        if(input.isInstantaneous() === false)
            throw new Error("Only instaneous inputs may be passed to this function");

        const res = input.evaluateCondition();
        if(res) {
            const inputHash = input.getHash();
        
            if(this.#instantaneousInputHandlers.hasOwnProperty(inputHash))
                this.#instantaneousInputHandlers[inputHash](handlerParams);
            else
                console.log(`A handler does not exist for the input ${input.getValue()} with hash ${inputHash}`);            
        }
        return res !== undefined && res !== false && res !== null;
    }

    removeInstantaneousInputHandler(input) {
        this.#checkParamIsInput("input", input);

        delete this.#instantaneousInputHandlers[input.getHash()];
    }

    enqueue(input) {
        this.#checkParamIsInput("input", input);
    
        // TODO: Test functionality of removing volatile inputs when enquing instantaneous ones. We may want to only remove volatile for non-instantaneous inptus
        this.#removeVolatileInputs();
        this.#removeExistingInputInstances(input);

        let wasHandled = false;
        if(input.isInstantaneous())
            wasHandled = this.handleInstaneousInput(input);
        else
            this.#queue.push(input);

        this.#updateHistory(input);   
        return wasHandled;     
    }

    dequeue(input) {
        this.#removeExistingInputInstances(input);
    }

    size() {
        return this.#queue.length
    }

    empty() {
        this.#queue.length = 0;
    }

    getQueueLength() {
        return this.#queue.length;
    }

    isEmpty() {
        return this.getQueueLength() <= 0;
    }

    getActiveInput() {
        return this.isEmpty() ? null : this.#queue[this.size() - 1];
    }

    // Returns a string representation of Inputs in the queue
    viewInputQueue(miniversion) {
        if(!(miniversion === null || miniversion === undefined) && typeof miniversion !== "boolean")
            throw new Error("When providing the miniversion param to InputQueue.viewInputQueue, it must be a boolean");

        if(typeof miniversion === "boolean" && miniversion) {
            return this.#queue.map((input) => {
                const inputJson = input.serialize();
                return `${inputJson.hash},${inputJson.action},${inputJson.source}`
        }).reduce((prev, current) => (prev === "" ? "" : "|") + current, "");
        } else {
            const result = this.#queue.map((input) => input.serialize()).reduce((acc, current) => {
                acc.push(current);
                return acc;
            }, []);
            return result;
        }
    }
}

// Queue of inputs. All entries must be an instance of the Input class
const inputQueue = new InputQueue();

// Follows the structure 
// {
// "KEY": [INPUT1, INPUT2 ]
// }
const keyInputMap = {};

const addKeyInputMapentry = (key, input) => {
    if(!keyInputMap.hasOwnProperty(key))
        keyInputMap[key] = [];
    keyInputMap[key].push(input);
}

(function(){
    var addKeyDownHandler = (key, inputType, isGamepadInput, isInstantaneous, handler, conditionFunc) => {
        if(!Object.values(Keys).includes(key))
            throw new Error(`Unable to add Keyhandler for the Key ${key}, as it does not exist in the Keys type`);
        if(!Object.values(Actions).includes(inputType))
            throw new Error(`Unable to add Keyhandler for the Key ${key}, as the inputType ${inputType} it does not exist in the Inputs type`);
        if(!(conditionFunc === null || conditionFunc === undefined) && !(typeof conditionFunc === "function"))
            throw new Error("If a condidionFunc is provided, it must be of type 'function'");

        const input = new Input(inputType, isGamepadInput ? InputSources.GAMEPAD : InputSources.KEYBOARD, false, isInstantaneous, conditionFunc);

        if(isInstantaneous && typeof handler === "function")
            inputQueue.addInstantaneousInputHandler(input, handler);

        addKeyInputMapentry(key, input);
    }

    // Add keypress listeners and connect to the inputQueue
    window.addEventListener("keydown", function(e) {        
        const keyCode = e.code;
        
        if(keyInputMap.hasOwnProperty(keyCode)) {
            const inputs = keyInputMap[keyCode];
            for(let inpt of inputs) {
                const res = inputQueue.enqueue(inpt);
                if(res === true)
                    break;
            };
        } else {
            console.log(`No input is mapped to the key ${keyCode}`);
        }
    });

    window.addEventListener("keyup",function(e) {
        var keyCode = e.code;
        if(keyInputMap.hasOwnProperty(keyCode)) {
            const inputs = keyInputMap[keyCode];
            inputs.forEach((input) => inputQueue.dequeue(input));
        }
    });

    // Menu Navigation Keys
    var _INPUT_menu;
    var _INPUT_state;
    
    var isInMenu = function() {
        _INPUT_menu = (state.getMenu && state.getMenu());
        if (!_INPUT_menu && inGameMenu.isOpen()) {
            _INPUT_menu = inGameMenu.getMenu();
        }
        
        return _INPUT_menu;
    };

    var isMenuKeysAllowed = function() {
        var menu = isInMenu();
        return menu && !menu.noArrowKeys;
    };

    var isInGameMenuButtonClickable = function() {
        return hud.isValidState() && !inGameMenu.isOpen();
    };

    //addKeyDownHandler(KEY, INPUT_TYPE, IS_INSTANTANEOUS, HANDLER, ?CONDITION_FUNC);

    // Global Keys
    addKeyDownHandler(Keys.M, Actions.TOGGLE_MUTE, false, true, function(){if(audio.isPlaying()) audio.toggleMute()}, () => true);
    addKeyDownHandler(Keys.NUM_ADD, Actions.VOLUME_UP, false, true, function(){if(audio.isPlaying()) audio.volumeUp()}, () => true);
    addKeyDownHandler(Keys.NUM_SUBTRACT, Actions.VOLUME_DOWN, false, true, function(){if(audio.isPlaying()) audio.volumeDown()}, () => true);
    
    addKeyDownHandler(Keys.GAMEPAD_3, Actions.TOGGLE_MUTE, true, true, function(){if(audio.isPlaying()) audio.toggleMute()}, () => true);
    addKeyDownHandler(Keys.GAMEPAD_7, Actions.VOLUME_UP, true, true, function(){if(audio.isPlaying()) audio.volumeUp()}, () => true);
    addKeyDownHandler(Keys.GAMEPAD_6, Actions.VOLUME_DOWN, true, true, function(){if(audio.isPlaying()) audio.volumeDown()}, () => true);

    // Menu Navigation & Interaction Keys
    addKeyDownHandler(Keys.ESC, Actions.EXIT, false, true, function(){_INPUT_menu.backButton ? _INPUT_menu.backButton.onclick():0; return true}, isInMenu);
    addKeyDownHandler(Keys.GAMEPAD_2, Actions.EXIT, true, true, function(){_INPUT_menu.backButton ? _INPUT_menu.backButton.onclick():0; return true}, isInMenu);
    
    addKeyDownHandler(Keys.ENTER, Actions.ENTER, false, true, function(){_INPUT_menu.clickCurrentOption()}, isInMenu);
    addKeyDownHandler(Keys.NUM_ENTER, Actions.ENTER, false, true, function(){_INPUT_menu.clickCurrentOption()}, isInMenu);
    addKeyDownHandler(Keys.GAMEPAD_5, Actions.ENTER, true, true, function(){_INPUT_menu.clickCurrentOption()}, isInMenu);
   
    addKeyDownHandler(Keys.UP, Actions.MENU_UP, false, true, function(){_INPUT_menu.selectPrevOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.DOWN, Actions.MENU_DOWN, false, true, function(){_INPUT_menu.selectNextOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.RIGHT, Actions.MENU_RIGHT, false, true, function(){_INPUT_menu.selectNextTitleOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.LEFT, Actions.MENU_LEFT, false, true, function(){_INPUT_menu.selectPrevTitleOption()}, isMenuKeysAllowed);
   
    addKeyDownHandler(Keys.W, Actions.MENU_UP, false, true, function(){_INPUT_menu.selectPrevOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.A, Actions.MENU_LEFT, false, true, function(){_INPUT_menu.selectPrevTitleOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.S, Actions.MENU_DOWN, false, true, function(){_INPUT_menu.selectNextOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.D, Actions.MENU_RIGHT, false, true, function(){_INPUT_menu.selectNextTitleOption()}, isMenuKeysAllowed);

    addKeyDownHandler(Keys.JOYSTICK_UP, Actions.MENU_UP, true, true, function(){_INPUT_menu.selectPrevOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.JOYSTICK_LEFT, Actions.MENU_LEFT, true, true, function(){_INPUT_menu.selectPrevTitleOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.JOYSTICK_DOWN, Actions.MENU_DOWN, true, true, function(){_INPUT_menu.selectNextOption()}, isMenuKeysAllowed);
    addKeyDownHandler(Keys.JOYSTICK_RIGHT, Actions.MENU_RIGHT, true, true, function(){_INPUT_menu.selectNextTitleOption()}, isMenuKeysAllowed);

    // Open In-Game Menu
    addKeyDownHandler(Keys.ESC, Actions.MENU_OPEN, false, true, function(){inGameMenu.getMenuButton().onclick(); return true}, isInGameMenuButtonClickable);
    addKeyDownHandler(Keys.SPACE, Actions.MENU_OPEN, false, true, function(){inGameMenu.getMenuButton().onclick(); return true}, isInGameMenuButtonClickable);
    addKeyDownHandler(Keys.GAMEPAD_2, Actions.MENU_OPEN, true, true, function(){inGameMenu.getMenuButton().onclick(); return true}, isInGameMenuButtonClickable);

    // Move Player
    var isPlayState = function() { return state == learnState || state == newGameState || state == playState || state == readyNewState || state == readyRestartState; };
   
    // Arrow Key Movement
    addKeyDownHandler(Keys.LEFT, Actions.LEFT,false, false, function(){player.setInputDir(DIR_LEFT)}, isPlayState);
    addKeyDownHandler(Keys.RIGHT, Actions.RIGHT, false, false, function(){player.setInputDir(DIR_RIGHT)}, isPlayState);
    addKeyDownHandler(Keys.UP, Actions.UP, false, false, function(){player.setInputDir(DIR_UP)}, isPlayState);
    addKeyDownHandler(Keys.DOWN, Actions.DOWN, false, false, function(){player.setInputDir(DIR_DOWN)}, isPlayState);

    // WASD Movement
    addKeyDownHandler(Keys.W, Actions.UP, false, false, function(){player.setInputDir(DIR_UP)}, isPlayState);
    addKeyDownHandler(Keys.A, Actions.LEFT, false, false, function(){player.setInputDir(DIR_LEFT)}, isPlayState);
    addKeyDownHandler(Keys.S, Actions.DOWN, false, false, function(){player.setInputDir(DIR_DOWN)}, isPlayState);
    addKeyDownHandler(Keys.D, Actions.RIGHT, false, false, function(){player.setInputDir(DIR_RIGHT)}, isPlayState);

    // Joystick Player Movement
    addKeyDownHandler(Keys.JOYSTICK_UP, Actions.UP, true, false, function(){player.setInputDir(DIR_UP)}, isPlayState);
    addKeyDownHandler(Keys.JOYSTICK_LEFT, Actions.LEFT, true, false, function(){player.setInputDir(DIR_LEFT)}, isPlayState);
    addKeyDownHandler(Keys.JOYSTICK_DOWN, Actions.DOWN, true, false, function(){player.setInputDir(DIR_DOWN)}, isPlayState);
    addKeyDownHandler(Keys.JOYSTICK_RIGHT, Actions.RIGHT, true, false, function(){player.setInputDir(DIR_RIGHT)}, isPlayState);
})();

var initSwipe = function() {

    // position of anchor
    var x = 0;
    var y = 0;

    // current distance from anchor
    var dx = 0;
    var dy = 0;

    // minimum distance from anchor before direction is registered
    var r = 4;
    
    var touchStart = function(event) {
        event.preventDefault();
        var fingerCount = event.touches.length;
        if (fingerCount == 1) {

            // commit new anchor
            x = event.touches[0].pageX;
            y = event.touches[0].pageY;

        }
        else {
            touchCancel(event);
        }
    };

    var touchMove = function(event) {
        event.preventDefault();
        var fingerCount = event.touches.length;
        if (fingerCount == 1) {

            // get current distance from anchor
            dx = event.touches[0].pageX - x;
            dy = event.touches[0].pageY - y;

            // if minimum move distance is reached
            if (dx*dx+dy*dy >= r*r) {

                // commit new anchor
                x += dx;
                y += dy;

                // register direction
                if (Math.abs(dx) >= Math.abs(dy)) {
                    const rightInput = new Input(Actions.RIGHT, InputSources.SWIPE, true, false);
                    const leftInput = new Input(Actions.LEFT, InputSources.SWIPE, true, false);

                    inputQueue.enqueue(dx > 0 ? rightInput : leftInput);
                }
                else {
                    const upInput = new Input(Actions.UP, InputSources.SWIPE, true, false);
                    const downInput = new Input(Actions.DOWN, InputSources.SWIPE, true, false);

                    inputQueue.enqueue(dy > 0 ? downInput : upInput);
                }
            }
        }
        else {
            touchCancel(event);
        }
    };

    var touchEnd = function(event) {
        event.preventDefault();
    };

    var touchCancel = function(event) {
        event.preventDefault();
        x=y=dx=dy=0;
    };

    var touchTap = function(event) {
        // tap to clear input directions
        player.clearInputDir(undefined);
    };
    
    // register touch events
    document.onclick = touchTap;
    document.ontouchstart = touchStart;
    document.ontouchend = touchEnd;
    document.ontouchmove = touchMove;
    document.ontouchcancel = touchCancel;
};

const gamepadConnectionHandler = (event, connected) => {
    // Code from MDN: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
    const gamepad = event.gamepad;

    if (connected) {
        gamepads[gamepad.index] = gamepad;
        console.log("Gamepad connected from index %d: %s", gamepad.index, gamepad.id);
    } else {
      delete gamepads[gamepad.index];
        console.log("Gamepad disconnnected from index %d: %s", gamepad.index, gamepad.id);
    }
}

const initGamepad = () => {
    window.addEventListener("gamepadconnected", (e) => gamepadConnectionHandler(e, true), false);
    window.addEventListener("gamepaddisconnected", (e) => gamepadConnectionHandler(e, false), false); 
}

// Defines the 'size' of a deadzone for analog axis. If the absolute value of the axis
// is less than the deadzone, the input is ignored
const AXIS_DEADZONE = 0.75;

// If an axis is above this, it will be ignored.
const AXIS_MAX = 1;


// Buttons
/// (top console)
/// 0, 1, 2
/// 3, 4, 5
/// (front panel)
/// 6, 7, 8, 9 (inside case)

// Axis
// Up : axes[1] = -1
// Down: axes[1] = 1
// Left: axes[0] = -1
// Right: axes[0] = 1

// Tracks previous state of controller axis and buttons, allowing for 'keyup' and 'keydown' like functionality 
const currentGamepadInputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false
}

const debounceControllerInput = (key, input) => {
    if(currentGamepadInputState[key] !== input) {
        currentGamepadInputState[key] = input;
        return true;
    }
    return false;
}

const checkGamepad = (gamepad) => {
    if(typeof gamepad === "object" && Array.isArray(gamepad.buttons)) {
        gamepad.buttons.forEach((button, index) => { 
            if(debounceControllerInput(index, button.pressed)) {
                window.dispatchEvent(new KeyboardEvent(button.pressed ?  "keydown" : "keyup", {
                        key: `gamepad_${index}`,
                        code: `GamepadButton${index}`,
                        keyCode: `gamepad_${index}`
                    }
                ));
            }
        });
        
        gamepad.axes.forEach((axis, index) => {
        let up,down,left,right;
            if(index === 0) {
                // X
                if(axis >= AXIS_DEADZONE && axis <= AXIS_MAX) {
                    right = true;
                    left = false;
                } else if(axis <= -AXIS_DEADZONE && axis >= -AXIS_MAX) {
                    left = true;
                    right = false;
                } else {
                    left = false;
                    right = false;
                }

                if(debounceControllerInput("right", right))
                    window.dispatchEvent(new KeyboardEvent(right ?  "keydown" : "keyup", {
                        key: "right",
                        code: Keys.JOYSTICK_RIGHT,
                        keyCode: "right"
                    }
                ));

                if(debounceControllerInput("left", left))
                    window.dispatchEvent(new KeyboardEvent(left ?  "keydown" : "keyup", {
                    key: "left",
                    code: Keys.JOYSTICK_LEFT,
                    keyCode: "left"
                    }
                ));
            } 
            else if(index === 1) {
                // Y
                if(axis >= AXIS_DEADZONE && axis <= AXIS_MAX) {
                    down = true;
                    up = false;
                } else if(axis <= -AXIS_DEADZONE && axis >= -AXIS_MAX) {
                    up = true;
                    down = false;
                } else {
                    up = false;
                    down = false;
                }

                if(debounceControllerInput("down", down))
                    window.dispatchEvent(new KeyboardEvent(down ?  "keydown" : "keyup", {
                    key: "down",
                    code: Keys.JOYSTICK_DOWN,
                    keyCode: "down"
                    }
                ));

                if(debounceControllerInput("up", up))
                    window.dispatchEvent(new KeyboardEvent(up ?  "keydown" : "keyup", {
                    key: "up",
                    code: Keys.JOYSTICK_UP,
                    keyCode: "up"
                    }
                ));
            }
        })
    }
}

const checkGamepads = () => {
    if(gamepads && Object.keys(gamepads).length > 0) {
        Object.values(gamepads).forEach((gamepad) => checkGamepad(gamepad));
    }
}
//@line 1 "src/cutscenes.js"
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
                renderer.drawEnemy(enemy1);
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
                    renderer.drawEnemy(enemy1);
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
    var pac = new Enemy();
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
        renderer.drawEnemy(enemy3);
        renderer.drawEnemy(enemy2);
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
                            renderer.drawEnemy(enemy3);
                        }
                        if (enemy2BounceFrame < enemy2BounceFrameLen) {
                            renderer.drawEnemy(enemy2);
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

//@line 1 "src/maps.js"
//////////////////////////////////////////////////////////////////////////////////////
// Maps

// Definitions of playable maps

// current map
var map;

// actor starting states

enemy1.startDirEnum = DIR_LEFT;
enemy1.startPixel = {
    x: 14*tileSize-1,
    y: 14*tileSize+midTile.y
};
enemy1.cornerTile = {
    x: 28-1-2,
    y: 0
};
enemy1.startMode = GHOST_OUTSIDE;
enemy1.arriveHomeMode = GHOST_LEAVING_HOME;

enemy2.startDirEnum = DIR_DOWN;
enemy2.startPixel = {
    x: 14*tileSize-1,
    y: 17*tileSize+midTile.y,
};
enemy2.cornerTile = {
    x: 2,
    y: 0
};
enemy2.startMode = GHOST_PACING_HOME;
enemy2.arriveHomeMode = GHOST_PACING_HOME;

enemy3.startDirEnum = DIR_UP;
enemy3.startPixel = {
    x: 12*tileSize-1,
    y: 17*tileSize + midTile.y,
};
enemy3.cornerTile = {
    x: 28-1,
    y: 36 - 2,
};
enemy3.startMode = GHOST_PACING_HOME;
enemy3.arriveHomeMode = GHOST_PACING_HOME;

enemy4.startDirEnum = DIR_UP;
enemy4.startPixel = {
    x: 16*tileSize-1,
    y: 17*tileSize + midTile.y,
};
enemy4.cornerTile = {
    x: 0,
    y: 36-2,
};
enemy4.startMode = GHOST_PACING_HOME;
enemy4.arriveHomeMode = GHOST_PACING_HOME;

player.startDirEnum = DIR_LEFT;
player.startPixel = {
    x: 14*tileSize-1,
    y: 26*tileSize + midTile.y,
};

// Levels are grouped into "acts."
// In Ms. Pac-Man (and Cookie-Man) a map only changes after the end of an act.
// The levels within an act progress in difficulty.
// But the beginning of an act is generally easier than the end of the previous act to stave frustration.
// Completing an act results in a cutscene.
var getLevelAct = function(level) {
    // Act 1: (levels 1,2)
    // Act 2: (levels 3,4,5)
    // Act 3: (levels 6,7,8,9)
    // Act 4: (levels 10,11,12,13)
    // Act 5: (levels 14,15,16,17)
    // ...
    if (level <= 2) {
        return 1;
    }
    else if (level <= 5) {
        return 2;
    }
    else {
        return 3 + Math.floor((level - 6)/4);
    }
};

var getActColor = function(act) {
    return getCookieActColor(act);
};

var getActRange = function(act) {
    if (act == 1) {
        return [1,2];
    }
    else if (act == 2) {
        return [3,5];
    }
    else {
        var start = act*4-6;
        return [start, start+3];
    }
};

var getCookieActColor = function(act) {
    var colors = [
        "#359C9C", "#71D6D6", // turqoise
        "#FFBC38", "#FFEECE", // orange
        "#9529C6", "#B591C6", // purple
        "#48CE57", "#A7E8AE", // green
        "#F407B5", "#F473D2", // magenta
        "#DAD600", "#E9FF70", // yellow
        "#2FC2EF", "#AEE2F2", // light blue
        "#404040", "#C0C0C0", // gray
        "#911712", "#CE8E8C", // sad red
    ];
    var i = ((act-1)*2) % colors.length;
    return {
        wallFillColor: colors[i],
        wallStrokeColor: colors[i+1],
        pelletColor: "#FFB800",
    };
};

var setNextTubieManMap = function() {
    // cycle the colors
    var i;
    var act = getLevelAct(level);
    if (!map || level == 1 || act != getLevelAct(level-1)) {
        map = mapgen();
        var colors = getCookieActColor(act);
        map.wallFillColor = colors.wallFillColor;
        map.wallStrokeColor = colors.wallStrokeColor;
        map.pelletColor = colors.pelletColor;
    }
};//@line 1 "src/vcr.js"
//////////////////////////////////////////////////////////////////////////////////////
// VCR
// This coordinates the recording, rewinding, and replaying of the game state.
// Inspired by Braid.

var VCR_NONE = -1;
var VCR_RECORD = 0;
var VCR_REWIND = 1;
var VCR_FORWARD = 2;
var VCR_PAUSE = 3;

var vcr = (function() {

    var mode;

    // controls whether to increment the frame before recording.
    var initialized;

    // current time
    var time;

    // tracking speed
    var speedIndex;
    var speeds = [-8,-4,-2,-1,0,1,2,4,8];
    var speedCount = speeds.length;
    var speedColors = [
        "rgba(255,255,0,0.25)",
        "rgba(255,255,0,0.20)",
        "rgba(255,255,0,0.15)",
        "rgba(255,255,0,0.10)",
        "rgba(0,0,0,0)",
        "rgba(0,0,255,0.10)",
        "rgba(0,0,255,0.15)",
        "rgba(0,0,255,0.20)",
        "rgba(0,0,255,0.25)",
    ];

    // This is the number of "footprint" frames to display along the seek direction around a player
    // to create the rewind/forward blurring.  
    // This is also inversely used to determine the number of footprint frames to display OPPOSITE the seek direction
    // around a player.
    //
    // For example: 
    //   nextFrames = speedPrints[speedIndex];
    //   prevFrames = speedPrints[speedCount-1-speedIndex];
    var speedPrints = [
        18,// -8x
        13,// -4x
        8, // -2x
        3, // -1x
        3, //  0x
        10,//  1x
        15,//  2x
        20,//  4x
        25,//  8x
    ];

    // The distance between each footprint used in the rewind/forward blurring.
    // Step size grows when seeking speed increases to show emphasize time dilation.
    var speedPrintStep = [
        6,  // -8x
        5,  // -4x
        4,  // -2x
        3,  // -1x
        3,  //  0x
        3,  //  1x
        4,  //  2x
        5,  //  4x
        6,  //  8x
    ];

    // current frame associated with current time
    // (frame == time % maxFrames)
    var frame;

    // maximum number of frames to record
    var maxFrames = 15*60;

    // rolling bounds of the recorded frames
    var startFrame; // can't rewind past this
    var stopFrame; // can't replay past this

    // reset the VCR
    var reset = function() {
        time = 0;
        frame = 0;
        startFrame = 0;
        stopFrame = 0;
        states = {};
        startRecording();
    };

    // load the state of the current time
    var load = function() {
        var i;
        for (i=0; i<5; i++) {
            actors[i].load(frame);
        }
        elroyTimer.load(frame);
        energizer.load(frame);
        fruit.load(frame);
        ghostCommander.load(frame);
        ghostReleaser.load(frame);
        map.load(frame,time);
        loadGame(frame);
        if (state == deadState) {
            deadState.load(frame);
        }
        else if (state == finishState) {
            finishState.load(frame);
        }
    };

    // save the state of the current time
    var save = function() {
        var i;
        for (i=0; i<5; i++) {
            actors[i].save(frame);
        }
        elroyTimer.save(frame);
        energizer.save(frame);
        fruit.save(frame);
        ghostCommander.save(frame);
        ghostReleaser.save(frame);
        map.save(frame);
        saveGame(frame);
        if (state == deadState) {
            deadState.save(frame);
        }
        else if (state == finishState) {
            finishState.save(frame);
        }
    };

    // erase any states after the current time
    // (only necessary for saves that do interpolation)
    var eraseFuture = function() {
        map.eraseFuture(time);
        stopFrame = frame;
    };

    // increment or decrement the time
    var addTime = function(dt) {
        time += dt;
        frame = (frame+dt)%maxFrames;
        if (frame < 0) {
            frame += maxFrames;
        }
    };

    // measures the modular distance if increasing from x0 to x1 on our circular frame buffer.
    var getForwardDist = function(x0,x1) {
        return (x0 <= x1) ? x1-x0 : x1+maxFrames-x0;
    };

    // caps the time increment or decrement to prevent going over our rolling bounds.
    var capSeekTime = function(dt) {
        if (!initialized || dt == 0) {
            return 0;
        }
        var maxForward = getForwardDist(frame,stopFrame);
        var maxReverse = getForwardDist(startFrame,frame);
        return (dt > 0) ? Math.min(maxForward,dt) : Math.max(-maxReverse,dt);
    };

    var init = function() {
        mode = VCR_NONE;
    };

    // seek to the state at the given relative time difference.
    var seek = function(dt) {
        if (dt == undefined) {
            dt = speeds[speedIndex];
        }
        if (initialized) {
            addTime(capSeekTime(dt));
            load();
        }
    };

    // record a new state.
    var record = function() {
        if (initialized) {
            addTime(1);
            if (frame == startFrame) {
                startFrame = (startFrame+1)%maxFrames;
            }
            stopFrame = frame;
        }
        else {
            initialized = true;
        }
        save();
    };

    var startRecording = function() {
        mode = VCR_RECORD;
        initialized = false;
        eraseFuture();
        seekUpBtn.disable();
        seekDownBtn.disable();
        seekToggleBtn.setIcon(function(ctx,x,y,frame) {
            drawStraightenPump(ctx,x,y,"#FFF");
        });
        seekToggleBtn.setText();
    };

    var refreshSeekDisplay = function() {
        seekToggleBtn.setText(speeds[speedIndex]+"x");
    };

    var startSeeking = function() {
        speedIndex = 3;
        updateMode();
        seekUpBtn.enable();
        seekDownBtn.enable();
        seekToggleBtn.setIcon(undefined);
        refreshSeekDisplay();
    };

    var nextSpeed = function(di) {
        if (speeds[speedIndex+di] != undefined) {
            speedIndex = speedIndex+di;
        }
        updateMode();
        refreshSeekDisplay();
    };

    var x,y,w,h;
    var pad = 5;
    x = mapWidth+1;
    h = 25;
    w = 25;
    y = mapHeight/2-h/2;
    var seekUpBtn = new Button(x,y-h-pad,w,h,
        function() {
            nextSpeed(1);
        });
    seekUpBtn.setIcon(function(ctx,x,y,frame) {
        drawStraightenPump(ctx,x,y,"#FFF");
    });
    var seekDownBtn = new Button(x,y+h+pad,w,h,
        function() {
            nextSpeed(-1);
        });
    seekDownBtn.setIcon(function(ctx,x,y,frame) {
        drawStraightenPumpmbol(ctx,x,y,"#FFF");
    });
    var seekToggleBtn = new ToggleButton(x,y,w,h,
        function() {
            return mode != VCR_RECORD;
        },
        function(on) {
            on ? startSeeking() : startRecording();
        });
    seekToggleBtn.setIcon(function(ctx,x,y,frame) {
        drawStraightenPump(ctx,x,y,"#FFF");
    });
    seekToggleBtn.setFont((tileSize-1)+"px 'Press Start 2P'", "#FFF");
    var slowBtn = new ToggleButton(-w-pad-1,y,w,h,
        function() {
            return executive.getFramePeriod() == 1000/15;
        },
        function(on) {
            executive.setUpdatesPerSecond(on ? 15 : 60);
        });
    slowBtn.setIcon(function(ctx,x,y) {
        atlas.drawSnail(ctx,x,y,1);
    });

    var onFramePeriodChange = function() {
        if (slowBtn.isOn()) {
            slowBtn.setIcon(function(ctx,x,y) {
                atlas.drawSnail(ctx,x,y,0);
            });
        }
        else {
            slowBtn.setIcon(function(ctx,x,y) {
                atlas.drawSnail(ctx,x,y,1);
            });
        }
    };

    var onHudEnable = function() {
        if (practiceMode) {
            if (mode == VCR_NONE || mode == VCR_RECORD) {
                seekUpBtn.disable();
                seekDownBtn.disable();
            }
            else {
                seekUpBtn.enable();
                seekDownBtn.enable();
            }
            seekToggleBtn.enable();
            slowBtn.enable();
        }
    };

    var onHudDisable = function() {
        if (practiceMode) {
            seekUpBtn.disable();
            seekDownBtn.disable();
            seekToggleBtn.disable();
            slowBtn.disable();
        }
    };

    var isValidState = function() {
        return (
            !inGameMenu.isOpen() && (
            state == playState ||
            state == finishState ||
            state == deadState));
    };

    var draw = function(ctx) {
        if (practiceMode) {
            if (isValidState() && vcr.getMode() != VCR_RECORD) {
                // change the hue to reflect speed
                renderer.setOverlayColor(speedColors[speedIndex]);
            }

            if (seekUpBtn.isEnabled) {
                seekUpBtn.draw(ctx);
            }
            if (seekDownBtn.isEnabled) {
                seekDownBtn.draw(ctx);
            }
            if (seekToggleBtn.isEnabled) {
                seekToggleBtn.draw(ctx);
            }
            if (slowBtn.isEnabled) {
                slowBtn.draw(ctx);
            }
        }
    };

    var updateMode = function() {
        var speed = speeds[speedIndex];
        if (speed == 0) {
            mode = VCR_PAUSE;
        }
        else if (speed < 0) {
            mode = VCR_REWIND;
        }
        else if (speed > 0) {
            mode = VCR_FORWARD;
        }
    };

    return {
        init: init,
        reset: reset,
        seek: seek,
        record: record,
        draw: draw,
        onFramePeriodChange: onFramePeriodChange,
        onHudEnable: onHudEnable,
        onHudDisable: onHudDisable,
        eraseFuture: eraseFuture,
        startRecording: startRecording,
        startSeeking: startSeeking,
        nextSpeed: nextSpeed,
        isSeeking: function() {
            return (
                mode == VCR_REWIND ||
                mode == VCR_FORWARD ||
                mode == VCR_PAUSE);
        },
        getTime: function() { return time; },
        getFrame: function() { return frame; },
        getMode: function() { return mode; },

        drawHistory: function(ctx,callback) {
            if (!this.isSeeking()) {
                return;
            }

            // determine start frame
            var maxReverse = getForwardDist(startFrame,frame);
            var start = (frame - Math.min(maxReverse,speedPrints[speedIndex])) % maxFrames;
            if (start < 0) {
                start += maxFrames;
            }

            // determine end frame
            var maxForward = getForwardDist(frame,stopFrame);
            var end = (frame + Math.min(maxForward,speedPrints[speedCount-1-speedIndex])) % maxFrames;

            var backupAlpha = ctx.globalAlpha;
            ctx.globalAlpha = 0.2;
            
            var t = start;
            var step = speedPrintStep[speedIndex];
            if (start > end) {
                for (; t<maxFrames; t+=step) {
                    callback(t);
                }
                t %= maxFrames;
            }
            for (; t<end; t+=step) {
                callback(t);
            }

            ctx.globalAlpha = backupAlpha;
        },
    };
})();
//@line 1 "src/main.js"
//////////////////////////////////////////////////////////////////////////////////////
// Entry Point

window.addEventListener("load", function() {
    loadHighScores();
    initRenderer();
    atlas.create();
    initSwipe();
	initGamepad();
	var anchor = window.location.hash.substring(1);
	switchState(preNewGameState)
    executive.init();
});
})();
