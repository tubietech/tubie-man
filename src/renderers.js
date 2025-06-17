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
