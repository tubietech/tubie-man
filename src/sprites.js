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
