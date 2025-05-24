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
