# Capture the Flag '96 Online  
  
Hosted at https://flag96.winer.ly/.
  
### What is this?  
  
**Capture the Flag** is a turn-based strategy computer game from the 1990s, made by [Carr Software](http://www.carrsoft.com/).  
  
This version lets you play the original game online in your browser, either against the computer or multiplayer over the internet.  
  
### Why?  
  
1. My brother and I used to play this game on our family computer growing up. I'd like to play it with him again. But he lives   
far away now and neither of us have working mid-90s computers to play it on.  
2. It was a fun excuse to learn Next.js, Vercel, TypeScript, FaunaDB, newer React techniques (e.g. hooks), DOSBox, Emscripten, and more.  
  
### How?  
  
* The game is running in the [DOSBox](https://www.dosbox.com/) emulator compiled to JavaScript and wrapped by [JS-Dos](https://js-dos.com/). That's   doing most of the heavy lifting here.  
* In the background, the JS code is looking at the screen contents (the `<canvas>`)  in the DOSBox emulator and matching it to a few known/hardcoded bitmaps to detect what you're doing in the game:  
  * If it sees that you selected "Human vs Human" on the New Game screen, it generates a URL to identify this game.
  * If it sees that you're on the "Save Game" screen, it saves the game, then grabs the savefile out of your browser's IndexedDB and uplaods it to FaunaDB, so the other player can load it for their turn.
* There's no user registration system, but we generate a random "userid" in localstorage for each visitor and save that in the DB along with the game file.  When you load the game URL, we use that userid to guess whether it's your turn to play, or if you need to wait for your opponent to play their turn and upload an updated savefile.

### Next Steps

* Could use some UI polish, especially around errors, popup boxes, and fullscreen mode.
* Enter yours and your opponent's email address to send a game invite and notify when it's your turn.
* Use browser/push notifications to notify when it's your turn.
* Mobile support - though I'm not sure how that could work.
