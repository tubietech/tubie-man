Tubie-Man
=======

A tubie themed, Pac-Man inspired maze runner game with randomly generated maps

Inspired by [The Pac-Man Dossier](http://home.comcast.net/~jpittman2/pacman/pacmandossier.html) and
[pacman by masonicGIT](https://github.com/masonicGIT/pacman)

Want to play Tubie-Man online? Check it out at [tubieman.tubietech.com](https://tubieman.tubietech.com)

### Known Issues

- Cutscenes
- 2 Player switch-off
- Mute and volume display
- Menu to allow user mapping of inputs
- Fix highscore screen
- Rendering glitches when switching from portrait to landscape and back

Contact me at eric@tubietech.com

License
-------

This program is free software: you can redistribute it and/or modify
it under the terms of the **GNU General Public License Version 3** as 
published by the Free Software Foundation.

Play
----

You can play the game on all canvas-enabled browsers.  **Touch controls** are
enabled for mobile browsers.  The game is **resolution-independent** and smoothly scales to
fit the size of any screen.  **Performance** may increase by shrinking the window or zooming in with your browser. **Game Controllers** are supported using the JS gamepad API. In the current implementation,
the joystick and buttons are hard-coded to the setup of TubieTech's Tubie-Man arcade cabinet. 

### Main Controls

- **swipe**: steer pacman on mobile browsers
- **arrows**: steer pacman
- **end**: pause the game
- **escape**: open in-game menu

### Confirmed Desktop Browers

- Safari
- Firefox
- Chrome

### Confirmed Mobile Devices

- [iPad and iPhone (Mobile Safari)](http://www.atariage.com/forums/topic/202594-html5-pac-man/)
- Pixel 9

Games
-----

### High Scores

High scores for each game stored on your local machine by your browser. The 'new-highscore' menu/display
is currently not working

Procedurally-Generated Maps
---------------------------

Tthe mazes change as often as they do in Ms. Pac-Man, but are **procedurally generated**.  Each level has a pre-defined color palette, granting an element of consistency to the random structure of the mazes.

![Procedural][4]

### Algorithm Description

The mazes are built carefully to closely match design patterns deduced from the original maps found in Pac-Man and Ms. Pac-Man.

### Report/Fix Bugs

Feel free to report any inaccuracies that may detract or simply annoy.

Navigating the Repository
-------------------------
- all javascript source files are located in the "src/" directory
- "build.sh" file concatenates all the source files into "pacman.js" in the top directory
- "debug.htm" displays the game by using the "src/*.js" files
- "index.htm" displays the game by using the "pacman.js" file only
- the "fruit" directory contains notes and diagrams on Ms. Pac-Man fruit paths
- the "mapgen" directory contains notes, diagrams, and experiments on procedural Pac-Man maze generation
- the "sprites" directory contains references sprite sheets and an atlas viewer "atlas.htm" for viewing the scalable game sprites.
- the "font" directory contains font resources used in the game.

Credits
-------

### Reverse-Engineers

Thanks to **Jamey Pittman** for compiling [The Pac-Man Dossier](http://home.comcast.net/~jpittman2/pacman/pacmandossier.html) from his own research and those of other reverse-engineers, notably 'Dav' and 'JamieVegas' from [this Atari Age forum thread](http://www.atariage.com/forums/topic/68707-pac-man-ghost-ai-question/).  Further thanks to Jamey Pittman for replying to my arcade implementation-specific questions with some very elaborate details to meet the accuracy requirements of this project.

Thanks to **Bart Grantham** for sharing his expert knowledge on Ms. Pac-Man's internals, providing me with an annotated disassembly and notes on how fruit paths work in meticulous detail.

### Original Games

Thanks to the original Pac-Man team at Namco for creating such an enduring game.  And thanks to the MAME team for their arcade emulator and very helpful debugger.

Thanks to the Ms. Pac-Man team at GCC for improving Pac-Man with a variety of aesthetic maps that I based the map generator on.

Thanks to Jonathan Blow for creating the rewind mechanic in [Braid](http://braid-game.com) which inspired the same mechanic in my project.  Further thanks for presenting the implementation details in [this talk](https://store.cmpgame.com/product/5900/The-Implementation-of-Rewind-in-braid) which helped in my own implementation.

### Music and Sound Effects

Most of the music and effects in Tubie Man are from work by KevinMacLeod, and licensed under the [Creative Commons: By Attribution 4.0 License](http://creativecommons.org/licenses/by/4.0/). Check out his work on [incompetech.com](https://incompetech.com)

Tubie-Man uses the songs:
- Getting it Done
- Robobozo
- Spazzmatica
- Pixel Peeker Polka
- Bit Shift