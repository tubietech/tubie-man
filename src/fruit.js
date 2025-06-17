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
