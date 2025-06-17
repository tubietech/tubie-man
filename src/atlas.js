
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
