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

var drawGhostSprite = (function(){
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
var drawMsPacPoints = (function(){
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

var drawColoredOttoSprite = function(color,eyeColor) {
    var ctx;

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

    var drawRightEye = function() {
        plotSolid([
            -4,-5,
            -3,-6,
            -2,-6,
            -2,-5,
            -3,-4,
            -4,-4,
        ],eyeColor);
    };

    var drawRight0 = function() {
        plotSolid([
            -5,-4,
            -3,-6,
            2,-6,
            3,-5,
            -1,-3,
            3,-1,
            1,1,
            1,3,
            3,6,
            5,4,
            6,4,
            6,5,
            4,7,
            2,7,
            -1,1,
            -4,4,
            -3,6,
            -3,7,
            -4,7,
            -6,5,
            -6,4,
            -3,1,
            -5,-1,
        ],color);
        drawRightEye();
    };
    var drawRight1 = function() {
        plotSolid([
            -5,-4,
            -3,-6,
            1,-6,
            3,-4,
            3,-1,
            1,1,
            1,6,
            4,6,
            4,7,
            0,7,
            0,1,
            -2,1,
            -4,3,
            -4,4,
            -3,5,
            -3,6,
            -4,6,
            -5,4,
            -5,3,
            -3,1,
            -5,-1,
        ],color);
        drawRightEye();
    };
    var drawRight2 = function() {
        plotSolid([
            -5,-4,
            -3,-6,
            2,-6,
            3,-5,
            -1,-3,
            3,-1,
            1,1,
            1,3,
            4,3,
            4,4,
            0,4,
            0,1,
            -2,1,
            -2,6,
            1,6,
            1,7,
            -3,7,
            -3,1,
            -5,-1,
        ],color);
        drawRightEye();
    };
    var drawRight3 = function() {
        plotSolid([
            -5,-4,
            -3,-6,
            2,-6,
            -2,-3,
            2,0,
            1,1,
            3,5,
            5,3,
            6,3,
            6,4,
            4,6,
            2,6,
            -1,1,
            -3,1,
            -3,6,
            0,6,
            0,7,
            -4,7,
            -4,2,
            -3,1,
            -5,-1,
        ],color);
        drawRightEye();
    };

    var drawUpDownEyes = function() {
        plotSolid([
            -5,-5,
            -4,-6,
            -3,-6,
            -3,-5,
            -4,-4,
            -5,-4,
        ],eyeColor);
        plotSolid([
            3,-6,
            4,-6,
            5,-5,
            5,-4,
            4,-4,
            3,-5,
        ],eyeColor);
    };

    var drawUpDownHead = function() {
        plotSolid([
            -4,-4,
            -2,-6,
            2,-6,
            4,-4,
            4,-1,
            2,1,
            -2,1,
            -4,-1,
        ],color);
    };

    var drawUpDownLeg0 = function(y,xs) {
        ctx.save();
        ctx.translate(0,y);
        ctx.scale(xs,1);

        plotSolid([
            1,0,
            2,0,
            2,6,
            4,6,
            4,7,
            1,7,
        ],color);

        ctx.restore();
    };

    var drawUpDownLeg1 = function(y,xs) {
        ctx.save();
        ctx.translate(0,y);
        ctx.scale(xs,1);

        plotSolid([
            1,0,
            2,0,
            2,4,
            3,5,
            4,4,
            5,4,
            5,5,
            3,7,
            2,7,
            1,6,
        ],color);

        ctx.restore();
    };
    var drawUpDownLegs0 = function() {
        drawUpDownLeg0(0,-1);
        drawUpDownLeg1(-2,1);
    };

    var drawUpDownLegs1 = function() {
        drawUpDownLeg0(-2,-1);
        drawUpDownLeg1(-2,1);
    };

    var drawUpDownLegs2 = function() {
        drawUpDownLeg1(-2,-1);
        drawUpDownLeg0(0,1);
    };

    var drawUpDownLegs3 = function() {
        drawUpDownLeg1(0,-1);
        drawUpDownLeg0(0,1);
    };

    var drawDown0 = function() {
        drawUpDownHead();
        drawUpDownEyes();
        drawUpDownLegs0();
        plotLine([-2,-3,2,-3],"#000");
    };
    var drawDown1 = function() {
        drawUpDownHead();
        drawUpDownEyes();
        drawUpDownLegs1();
    };
    var drawDown2 = function() {
        drawUpDownHead();
        drawUpDownEyes();
        drawUpDownLegs2();
        plotLine([-2,-3,2,-3],"#000");
    };
    var drawDown3 = function() {
        drawUpDownHead();
        drawUpDownEyes();
        drawUpDownLegs3();
        plotSolid([
            -2,-3,
            0,-5,
            2,-3,
            0,-1,
        ],"#000");
    };

    var drawUp0 = function() {
        drawUpDownEyes();
        drawUpDownHead();
        drawUpDownLegs0();
    };
    var drawUp1 = function() {
        drawUpDownEyes();
        drawUpDownHead();
        drawUpDownLegs1();
    };
    var drawUp2 = function() {
        drawUpDownEyes();
        drawUpDownHead();
        drawUpDownLegs2();
    };
    var drawUp3 = function() {
        drawUpDownEyes();
        drawUpDownHead();
        drawUpDownLegs3();
    };

    return function(_ctx,x,y,dirEnum,frame,rotate) {
        ctx = _ctx;

        ctx.save();
        ctx.translate(x+0.5,y+0.5);
        if (rotate) {
            ctx.rotate(rotate);
        }

        if (dirEnum == DIR_RIGHT) {
            ctx.translate(0,-1); // correct my coordinate system
            [drawRight0, drawRight1, drawRight2, drawRight3][frame]();
        }
        else if (dirEnum == DIR_LEFT) {
            ctx.translate(0,-1); // correct my coordinate system
            ctx.scale(-1,1);
            [drawRight0, drawRight1, drawRight2, drawRight3][frame]();
        }
        else if (dirEnum == DIR_DOWN) {
            ctx.translate(0,-1); // correct my coordinate system
            [drawDown0, drawDown1, drawDown2, drawDown3][frame]();
        }
        else if (dirEnum == DIR_UP) {
            ctx.translate(0,-1); // correct my coordinate system
            [drawUp0, drawUp1, drawUp2, drawUp3][frame]();
        }

        ctx.restore();
    };
};

var drawOttoSprite = drawColoredOttoSprite("#FF0","#00F");
var drawMsOttoSprite = drawColoredOttoSprite("#F00","#FFF");

var drawDeadOttoSprite = function(ctx,x,y) {
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
    ctx.save();
    ctx.translate(x+2,y);
    plotOutline([
        3,-5,
        -1,-5,
        -2,-6,
        -2,-7,
        -1,-8,
        3,-8,
        4,-7,
        4,-6,
    ],"#F00");
    ctx.restore();
    drawOttoSprite(ctx,x,y,DIR_LEFT,2,Math.PI/2);
};

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

var drawMsPacmanSprite = function(ctx,x,y,dirEnum,frame,rot_angle) {
    var angle = 0;

    // draw body
    if (frame == 0) {
        // closed
        drawPacmanSprite(ctx,x,y,dirEnum,0,undefined,undefined,undefined,undefined,undefined,rot_angle);
    }
    else if (frame == 1) {
        // open
        angle = Math.atan(4/5);
        drawPacmanSprite(ctx,x,y,dirEnum,angle,undefined,undefined,undefined,undefined,undefined,rot_angle);
        angle = Math.atan(4/8); // angle for drawing eye
    }
    else if (frame == 2) {
        // wide
        angle = Math.atan(6/3);
        drawPacmanSprite(ctx,x,y,dirEnum,angle,undefined,undefined,undefined,undefined,undefined,rot_angle);
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

    // bow
    var x=-7.5,y=-7.5;
    ctx.fillStyle = "#F00";
    ctx.beginPath(); ctx.arc(x+1,y+4,1.25,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x+2,y+5,1.25,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x+3,y+3,1.25,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+1,1.25,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x+5,y+2,1.25,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#0031FF";
    ctx.beginPath(); ctx.arc(x+2.5,y+3.5,0.5,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x+3.5,y+2.5,0.5,0,Math.PI*2); ctx.closePath(); ctx.fill();

    // lips
    ctx.strokeStyle = "#F00";
    ctx.lineWidth = 1.25;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (frame == 0) {
        ctx.moveTo(5,0);
        ctx.lineTo(6.5,0);
        ctx.moveTo(6.5,-1.5);
        ctx.lineTo(6.5,1.5);
    }
    else {
        var r1 = 7.5;
        var r2 = 8.5;
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        ctx.moveTo(-3+r1*c,r1*s);
        ctx.lineTo(-3+r2*c,r2*s);
        ctx.moveTo(-3+r1*c,-r1*s);
        ctx.lineTo(-3+r2*c,-r2*s);
    }
    ctx.stroke();

    // mole
    ctx.beginPath();
    ctx.arc(-3,2,0.5,0,Math.PI*2);
    ctx.fillStyle = "#000";
    ctx.fill();

    // eye
    ctx.strokeStyle = "#000";
    ctx.lineCap = "round";
    ctx.beginPath();
    if (frame == 0) {
        ctx.moveTo(-2.5,-2);
        ctx.lineTo(-0.5,-2);
    }
    else {
        var r1 = 0.5;
        var r2 = 2.5;
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        ctx.moveTo(-3+r1*c,-2-r1*s);
        ctx.lineTo(-3+r2*c,-2-r2*s);
    }
    ctx.stroke();

    ctx.restore();
};

var drawTubieManSprite = (function(){

    // TODO: draw pupils separately in atlas
    //      composite the body frame and a random pupil frame when drawing tubie-man

    var prevFrame = undefined;
    var sx1 = 0; // shift x for first pupil
    var sy1 = 0; // shift y for first pupil
    var sx2 = 0; // shift x for second pupil
    var sy2 = 0; // shift y for second pupil

    var er = 2.1; // eye radius
    var pr = 1; // pupil radius
    var tr = 0.7 // tube circle radius

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
        var angle = 0;

        // draw body
        var draw = function(angle) {
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

        var x = -4; // pivot point
        var y = -3.5;
        var tx = -4;
        var ty = 2;
        var r1 = 3; // distance from pivot of first eye
        var r2 = 6.5; // distance from pivot of second eye
        var r3 = 0; // distance from pivot of tube
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
        ctx.arc(x+r2*c, y-r2*s, er, 0, Math.PI*2);
        ctx.fillStyle = "#FFF";
        ctx.fill();
        // second pupil
        ctx.beginPath();
        ctx.arc(x+r2*c+sx2, y-r2*s+sy2, pr, 0, Math.PI*2);
        ctx.fillStyle = "#000";
        ctx.fill();

        // first eyeball
        ctx.beginPath();
        ctx.arc(x+r1*c, y-r1*1.8*s, er, 0, Math.PI*2);
        ctx.fillStyle = "#FFF";
        ctx.fill();
        // first pupil
        ctx.beginPath();
        ctx.arc(x+r1*c+sx1, y-r1*1.8*s+sy1, pr, 0, Math.PI*2);
        ctx.fillStyle = "#000";
        ctx.fill();

        var tubeColor = "#FFF";
        var tubeAccentColor = "#808080";
        var tubeLength = 2.2;
        var tubeThickness = 0.65

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

        ctx.restore();

    };
})();

////////////////////////////////////////////////////////////////////
// FRUIT SPRITES

// G-Tube
var drawGTube = function(ctx,x,y) {

    // cherry
    var cherry = function(x,y) {
        ctx.save();
        ctx.translate(x,y);

        // red fruit
        ctx.beginPath();
        ctx.arc(2.5,2.5,3,0,Math.PI*2);
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.fillStyle = "#ff0000";
        ctx.fill();

        // white shine
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(1,3);
        ctx.lineTo(2,4);
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.restore();
    };

    ctx.save();
    ctx.translate(x,y);

    // draw both cherries
    cherry(-6,-1);
    cherry(-1,1);

    // draw stems
    ctx.beginPath();
    ctx.moveTo(-3,0);
    ctx.bezierCurveTo(-1,-2, 2,-4, 5,-5);
    ctx.lineTo(5,-4);
    ctx.bezierCurveTo(3,-4, 1,0, 1,2);
    ctx.strokeStyle = "#ff9900";
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
};

// Infinity Pump
var drawInfinityPump = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);

    // red body
    ctx.beginPath();
    ctx.moveTo(-1,-4);
    ctx.bezierCurveTo(-3,-4,-5,-3, -5,-1);
    ctx.bezierCurveTo(-5,3,-2,5, 0,6);
    ctx.bezierCurveTo(3,5, 5,2, 5,0);
    ctx.bezierCurveTo(5,-3, 3,-4, 0,-4);
    ctx.fillStyle = "#f00";
    ctx.fill();
    ctx.strokeStyle = "#f00";
    ctx.stroke();

    // white spots
    var spots = [
        {x:-4,y:-1},
        {x:-3,y:2 },
        {x:-2,y:0 },
        {x:-1,y:4 },
        {x:0, y:2 },
        {x:0, y:0 },
        {x:2, y:4 },
        {x:2, y:-1 },
        {x:3, y:1 },
        {x:4, y:-2 } ];

    ctx.fillStyle = "#fff";
    var i,len;
    for (i=0, len=spots.length; i<len; i++) {
        var s = spots[i];
        ctx.beginPath();
        ctx.arc(s.x,s.y,0.75,0,2*Math.PI);
        ctx.fill();
    }

    // green leaf
    ctx.beginPath();
    ctx.moveTo(0,-4);
    ctx.lineTo(-3,-4);
    ctx.lineTo(0,-4);
    ctx.lineTo(-2,-3);
    ctx.lineTo(-1,-3);
    ctx.lineTo(0,-4);
    ctx.lineTo(0,-2);
    ctx.lineTo(0,-4);
    ctx.lineTo(1,-3);
    ctx.lineTo(2,-3);
    ctx.lineTo(0,-4);
    ctx.lineTo(3,-4);
    ctx.closePath();
    ctx.strokeStyle = "#00ff00";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // stem
    ctx.beginPath();
    ctx.moveTo(0,-4);
    ctx.lineTo(0,-5);
    ctx.lineCap = 'round';
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.restore();
};

// Omni Pump
var drawOmniPump = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);

    // orange body
    ctx.beginPath();
    ctx.moveTo(-2,-2);
    ctx.bezierCurveTo(-3,-2, -5,-1, -5,1);
    ctx.bezierCurveTo(-5,4, -3,6, 0,6);
    ctx.bezierCurveTo(3,6, 5,4, 5,1);
    ctx.bezierCurveTo(5,-1, 3,-2, 2,-2);
    ctx.closePath();
    ctx.fillStyle="#ffcc33";
    ctx.fill();
    ctx.strokeStyle = "#ffcc33";
    ctx.stroke();

    // stem
    ctx.beginPath();
    ctx.moveTo(-1,-1);
    ctx.quadraticCurveTo(-1,-2,-2,-2);
    ctx.quadraticCurveTo(-1,-2,-1,-4);
    ctx.quadraticCurveTo(-1,-2,0,-2);
    ctx.quadraticCurveTo(-1,-2,-1,-1);
    ctx.strokeStyle = "#ff9900";
    ctx.lineJoin = 'round';
    ctx.stroke();

    // green leaf
    ctx.beginPath();
    ctx.moveTo(-0.5,-4);
    ctx.quadraticCurveTo(0,-5,1,-5);
    ctx.bezierCurveTo(2,-5, 3,-4,4,-4);
    ctx.bezierCurveTo(3,-4, 3,-3, 2,-3);
    ctx.bezierCurveTo(1,-3,1,-4,-0.5,-4);
    ctx.strokeStyle = "#00ff00";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.fillStyle = "#00ff00";
    ctx.fill();

    ctx.restore();
};

// Joey Pump
var drawJoeyPump = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);

    // red fruit
    ctx.beginPath();
    ctx.moveTo(-2,-3);
    ctx.bezierCurveTo(-2,-4,-3,-4,-4,-4);
    ctx.bezierCurveTo(-5,-4,-6,-3,-6,0);
    ctx.bezierCurveTo(-6,3,-4,6,-2.5,6);
    ctx.quadraticCurveTo(-1,6,-1,5);
    ctx.bezierCurveTo(-1,6,0,6,1,6);
    ctx.bezierCurveTo(3,6, 5,3, 5,0);
    ctx.bezierCurveTo(5,-3, 3,-4, 2,-4);
    ctx.quadraticCurveTo(0,-4,0,-3);
    ctx.closePath();
    ctx.fillStyle = "#ff0000";
    ctx.fill();

    // stem
    ctx.beginPath();
    ctx.moveTo(-1,-3);
    ctx.quadraticCurveTo(-1,-5, 0,-5);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ff9900';
    ctx.stroke();

    // shine
    ctx.beginPath();
    ctx.moveTo(2,3);
    ctx.quadraticCurveTo(3,3, 3,1);
    ctx.lineCap = 'round';
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    ctx.restore();
};

// Infinity Charger
var drawInfinityCharger = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);

    // draw body
    ctx.beginPath();
    ctx.arc(0,2,5.5,0,Math.PI*2);
    ctx.fillStyle = "#7bf331";
    ctx.fill();

    // draw stem
    ctx.beginPath();
    ctx.moveTo(0,-4);
    ctx.lineTo(0,-5);
    ctx.moveTo(2,-5);
    ctx.quadraticCurveTo(-3,-5,-3,-6);
    ctx.strokeStyle="#69b4af";
    ctx.lineCap = "round";
    ctx.stroke();

    // dark lines
    /*
    ctx.beginPath();
    ctx.moveTo(0,-2);
    ctx.lineTo(-4,2);
    ctx.lineTo(-1,5);
    ctx.moveTo(-3,-1);
    ctx.lineTo(-2,0);
    ctx.moveTo(-2,6);
    ctx.lineTo(1,3);
    ctx.moveTo(1,7);
    ctx.lineTo(3,5);
    ctx.lineTo(0,2);
    ctx.lineTo(3,-1);
    ctx.moveTo(2,0);
    ctx.lineTo(4,2);
    ctx.strokeStyle="#69b4af";
    ctx.lineCap = "round";
    ctx.lineJoin = 'round';
    ctx.stroke();
    */
    // dark spots
    var spots = [
        0,-2,
        -1,-1,
        -2,0,
        -3,1,
        -4,2,
        -3,3,
        -2,4,
        -1,5,
        -2,6,
        -3,-1,
        1,7,
        2,6,
        3,5,
        2,4,
        1,3,
        0,2,
        1,1,
        2,0,
        3,-1,
        3,1,
        4,2,
         ];

    ctx.fillStyle="#69b4af";
    var i,len;
    for (i=0, len=spots.length; i<len; i+=2) {
        var x = spots[i];
        var y = spots[i+1];
        ctx.beginPath();
        ctx.arc(x,y,0.65,0,2*Math.PI);
        ctx.fill();
    }

    // white spots
    var spots = [
        {x: 0,y:-3},
        {x:-2,y:-1},
        {x:-4,y: 1},
        {x:-3,y: 3},
        {x: 1,y: 0},
        {x:-1,y: 2},
        {x:-1,y: 4},
        {x: 3,y: 2},
        {x: 1,y: 4},
         ];

    ctx.fillStyle = "#fff";
    var i,len;
    for (i=0, len=spots.length; i<len; i++) {
        var s = spots[i];
        ctx.beginPath();
        ctx.arc(s.x,s.y,0.65,0,2*Math.PI);
        ctx.fill();
    }

    ctx.restore();
};

// Infinity Bag
var drawInfinityBag = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);

    // draw yellow body
    ctx.beginPath();
    ctx.moveTo(-4,-2);
    ctx.lineTo(4,-2);
    ctx.lineTo(4,-1);
    ctx.lineTo(2,1);
    ctx.lineTo(1,0);
    ctx.lineTo(0,0);
    ctx.lineTo(0,5);
    ctx.lineTo(0,0);
    ctx.lineTo(-1,0);
    ctx.lineTo(-2,1);
    ctx.lineTo(-4,-1);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ctx.fillStyle = '#fffa36';
    ctx.fill();
    ctx.stroke();

    // draw red arrow head
    ctx.beginPath();
    ctx.moveTo(0,-5);
    ctx.lineTo(-3,-2);
    ctx.lineTo(-2,-2);
    ctx.lineTo(-1,-3);
    ctx.lineTo(0,-3);
    ctx.lineTo(0,-1);
    ctx.lineTo(0,-3);
    ctx.lineTo(1,-3);
    ctx.lineTo(2,-2);
    ctx.lineTo(3,-2);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ctx.fillStyle = "#f00";
    ctx.fill();
    ctx.stroke();

    // draw blue wings
    ctx.beginPath();
    ctx.moveTo(-5,-4);
    ctx.lineTo(-5,-1);
    ctx.lineTo(-2,2);
    ctx.moveTo(5,-4);
    ctx.lineTo(5,-1);
    ctx.lineTo(2,2);
    ctx.strokeStyle = "#00f";
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.restore();
};

// Formula Bottle
var drawFormulaBottle = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);

    // bell body
    ctx.beginPath();
    ctx.moveTo(-1,-5);
    ctx.bezierCurveTo(-4,-5,-6,1,-6,6);
    ctx.lineTo(5,6);
    ctx.bezierCurveTo(5,1,3,-5,0,-5);
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle = "#fffa37";
    ctx.stroke();
    ctx.fill();

    // marks
    ctx.beginPath();
    ctx.moveTo(-4,4);
    ctx.lineTo(-4,3);
    ctx.moveTo(-3,1);
    ctx.quadraticCurveTo(-3,-2,-2,-2);
    ctx.moveTo(-1,-4);
    ctx.lineTo(0,-4);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // bell bottom
    ctx.beginPath();
    ctx.rect(-5.5,6,10,2);
    ctx.fillStyle = "#68b9fc";
    ctx.fill();
    ctx.beginPath();
    ctx.rect(-0.5,6,2,2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.restore();
};

// Y-Port Extension
var drawExtension = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);

    // draw key metal
    ctx.beginPath();
    ctx.moveTo(-1,-2);
    ctx.lineTo(-1,5);
    ctx.moveTo(0,6);
    ctx.quadraticCurveTo(1,6,1,3);
    ctx.moveTo(1,4);
    ctx.lineTo(2,4);
    ctx.moveTo(1,1);
    ctx.lineTo(1,-2);
    ctx.moveTo(1,0);
    ctx.lineTo(2,0);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // draw key top
    ctx.beginPath();
    ctx.moveTo(0,-6);
    ctx.quadraticCurveTo(-3,-6,-3,-4);
    ctx.lineTo(-3,-2);
    ctx.lineTo(3,-2);
    ctx.lineTo(3,-4);
    ctx.quadraticCurveTo(3,-6, 0,-6);
    ctx.strokeStyle = ctx.fillStyle = "#68b9fc";
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1,-5);
    ctx.lineTo(-1,-5);
    ctx.lineCap = 'round';
    ctx.strokeStyle = "#000";
    ctx.stroke();

    ctx.restore();
};

// EnFIT Wrench
var drawEnFitWrench = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);

    // bread
    ctx.beginPath();
    ctx.moveTo(-2,-5);
    ctx.quadraticCurveTo(-4,-6,-6,-4);
    ctx.quadraticCurveTo(-7,-2,-5,1);
    ctx.quadraticCurveTo(-3,4,0,5);
    ctx.quadraticCurveTo(5,5,5,-1);
    ctx.quadraticCurveTo(6,-5,3,-5);
    ctx.quadraticCurveTo(1,-5,0,-2);
    ctx.quadraticCurveTo(-2,3,-5,5);
    ctx.moveTo(1,1);
    ctx.quadraticCurveTo(3,4,4,6);
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.strokeStyle = "#ffcc33";
    ctx.stroke();

    // salt
    var spots = [
        -5,-6,
        1,-6,
        4,-4,
        -5,0,
        -2,0,
        6,1,
        -4,6,
        5,5,
         ];

    ctx.fillStyle = "#fff";
    var i,len;
    for (i=0, len=spots.length; i<len; i+=2) {
        var x = spots[i];
        var y = spots[i+1];
        ctx.beginPath();
        ctx.arc(x,y,0.65,0,2*Math.PI);
        ctx.fill();
    }

    ctx.restore();
};

// Flying Squirrel
var drawFlyingSquirrel = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);

    // body
    ctx.beginPath();
    ctx.moveTo(0,-4);
    ctx.bezierCurveTo(-1,-4,-2,-3,-2,-1);
    ctx.bezierCurveTo(-2,1,-4,2,-4,4);
    ctx.bezierCurveTo(-4,6,-2,7,0,7);
    ctx.bezierCurveTo(2,7,4,6,4,4);
    ctx.bezierCurveTo(4,2,2,1,2,-1);
    ctx.bezierCurveTo(2,-3,1,-4,0,-4);
    ctx.fillStyle = ctx.strokeStyle = "#00ff00";
    ctx.stroke();
    ctx.fill();

    // blue shine
    ctx.beginPath();
    ctx.moveTo(-2,3);
    ctx.quadraticCurveTo(-2,5,-1,5);
    ctx.strokeStyle = "#0033ff";
    ctx.lineCap = 'round';
    ctx.stroke();

    // white stem
    ctx.beginPath();
    ctx.moveTo(0,-4);
    ctx.quadraticCurveTo(0,-6,2,-6);
    ctx.strokeStyle = "#fff";
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
};

// Curlin Pump
var drawCurlinPump = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);

    // body
    ctx.beginPath();
    ctx.moveTo(-5,5);
    ctx.quadraticCurveTo(-4,5,-2,6);
    ctx.bezierCurveTo(2,6,6,2,6,-4);
    ctx.lineTo(3,-3);
    ctx.lineTo(3,-2);
    ctx.lineTo(-4,5);
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle = "#ffff00";
    ctx.stroke();
    ctx.fill();

    // stem
    ctx.beginPath();
    ctx.moveTo(4,-5);
    ctx.lineTo(5,-6);
    ctx.strokeStyle="#ffff00";
    ctx.lineCap='round';
    ctx.stroke();

    // black mark
    ctx.beginPath();
    ctx.moveTo(3,-1);
    ctx.lineTo(-2,4);
    ctx.strokeStyle = "#000";
    ctx.lineCap='round';
    ctx.stroke();

    // shine
    ctx.beginPath();
    ctx.moveTo(2,3);
    ctx.lineTo(0,5);
    ctx.strokeStyle = "#fff";
    ctx.lineCap='round';
    ctx.stroke();

    ctx.restore();
};

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

var getSpriteFuncFromFruitName = function(name) {
    var funcs = {
        'cherry': drawGTube,
        'strawberry': drawInfinityPump,
        'orange': drawOmniPump,
        'apple': drawJoeyPump,
        'melon': drawInfinityCharger,
        'galaxian': drawInfinityBag,
        'bell': drawFormulaBottle,
        'key': drawExtension,
        'pretzel': drawEnFitWrench,
        'pear': drawFlyingSquirrel,
        'banana': drawCurlinPump,
        'cookie': drawCookie,
    };

    return funcs[name];
};

var drawRecordSymbol = function(ctx,x,y,color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(x,y);

    ctx.beginPath();
    ctx.arc(0,0,4,0,Math.PI*2);
    ctx.fill();

    ctx.restore();
};

var drawRewindSymbol = function(ctx,x,y,color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(x,y);

    var s = 3;
    var drawTriangle = function(x) {
        ctx.beginPath();
        ctx.moveTo(x,s);
        ctx.lineTo(x-2*s,0);
        ctx.lineTo(x,-s);
        ctx.closePath();
        ctx.fill();
    };
    drawTriangle(0);
    drawTriangle(2*s);

    ctx.restore();
};

var drawUpSymbol = function(ctx,x,y,color) {
    ctx.save();
    ctx.translate(x,y);
    var s = tileSize;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0,-s/2);
    ctx.lineTo(s/2,s/2);
    ctx.lineTo(-s/2,s/2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
};

var drawDownSymbol = function(ctx,x,y,color) {
    ctx.save();
    ctx.translate(x,y);
    var s = tileSize;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0,s/2);
    ctx.lineTo(s/2,-s/2);
    ctx.lineTo(-s/2,-s/2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
};

var drawSnail = (function(){
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
    return function(ctx,x,y,color) {
        ctx.save();
        ctx.translate(x,y);
        ctx.beginPath();
        ctx.moveTo(-7,3);
        ctx.lineTo(-5,3);
        ctx.bezierCurveTo(-6,0,-5,-3,-2,-3);
        ctx.bezierCurveTo(0,-3,2,-2,2,2);
        ctx.bezierCurveTo(3,-1,3,-2,5,-2);
        ctx.bezierCurveTo(6,-2,6,0,5,0);
        ctx.bezierCurveTo(4,1,4,3,2,3);
        ctx.closePath();

        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(4,-2);
        ctx.lineTo(3,-5);
        ctx.moveTo(5,-1);
        ctx.lineTo(7,-5);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(3,-5, 1, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(7,-5, 1, 0, Math.PI*2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-4,1);
        ctx.bezierCurveTo(-5,-1,-3,-3, -1,-2);
        ctx.bezierCurveTo(0,-1,0,0,-1,1);
        ctx.bezierCurveTo(-2,1,-3,0,-2,-0.5);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "#000";
        ctx.stroke();

        ctx.restore();
    };
})();

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
