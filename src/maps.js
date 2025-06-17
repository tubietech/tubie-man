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
};