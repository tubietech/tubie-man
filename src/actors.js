//////////////////////////////////////////////////////////////////////////////////////
// create all the actors

// Previously Named blinky
var enemy1 = new Ghost();
enemy1.name = "sticky";
enemy1.color = "#DE373A";
enemy1.pathColor = "#DE373A";
enemy1.isVisible = true;

// Previously Named pinky
var enemy2 = new Ghost();
enemy2.name = "pricky";
enemy2.color = "#55D400";
enemy2.pathColor = "#55D400";
enemy2.isVisible = true;

// Previously Named inky
var enemy3 = new Ghost();
enemy3.name = "icky";
enemy3.color = "#099EDE";
enemy3.pathColor = "#099EDE";
enemy3.isVisible = true;

// Previously Named clyde
var enemy4 = new Ghost();
enemy4.name = "asher";
enemy4.color = "#FFB851";
enemy4.pathColor = "#FFB851";
enemy4.isVisible = true;

// Previously Named pacman
var player = new Player();
player.name = "tubie-man";
player.color = "#FF6E31";
player.pathColor = "@FF6E31";

// order at which they appear in original arcade memory
// (suggests drawing/update order)
var actors = [enemy1, enemy2, enemy3, enemy4, player];
var ghosts = [enemy1, enemy2, enemy3, enemy4];
