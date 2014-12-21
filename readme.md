# p4

Project Four of dwa15

### URL

[p4.alexf.me](http://p4.alexf.me/)

### Project Desc

This is Project 4 (p4), which I've more-or-less named Tayak, after the jsBin I did most of my prototyping on. It is an online realtime multiplayer space combat game. Basically an arcade-style deathmatch in space for between 2 and 4 players. The realtime multiplayer component of the application is driven by a Node.js server which is running within my Laravel application. Laravel handles the management of user accounts, the lobby where you can create or join a game, and the histroical records of all games played.

I haven't yet added explanation about controls within the application itself, so here they are:

- Navigation using the arrow keys. Up and Down function as throttles (you only need to hold it until you've reached you desired speed and then can let go).
- Weapon fired using the Z key. Pretty self-explanatory.

There's too much going on behind the scenes to capture well here. A key highlight is the AJAX that runs the lobby, keeping the list of games and who is in one game up-to-date within 5 seconds. The results pages come from the Node.js server sending a POST request of data back to Laravel. And as much as possible, I've tried to make the application secure and tamper proof. The client side of the game is only able to render and send back inputs, but is given no way to directly change game data. The server is authoriative about the game state.

###Demo Info

I did a partial demo in section last week, and will submit a Jing demo later today. Link to be posted shortly. Update, here's the Jing demo:

[http://screencast.com/t/5u6Hr6iVHlm](http://screencast.com/t/5u6Hr6iVHlm)

### Additional Info

Outside of Laravel I used the following tools:

- jQuery, which powers all of the dynamic interface elements.
- Node.js, which is my realtime server that the actual games run on. The Node server receives game data from Laravel, then runs independently, and then when the game is over POSTs results back to Laravel.
- Socket.io, which lets me user websockets for sending data back and forth from the Node server. I haven't done much of a stress test but on a very small scale performance is pretty snappy.
- Forever, a command-line interface tool for keeping the Node.js server running even when I log out of the shell.

I think that's it. There's still a lot I want to do, and the interface isn't nearly as polished as I envision. The biggest thing I'd like to add is an explosion generation that will provide feedback when weapon projectiles hit enemy ships and when ships are destroyed. There's a fairly serious gameplay bug where a kill will sometimes provide two kills instead of one. I haven't had time to investigate yet but it seems pretty unpredictable. I'm sure there are other bugs and holes out there.