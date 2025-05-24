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
