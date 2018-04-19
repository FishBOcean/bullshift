# BullShift

A HTML5 sokoban game. Currently this game is under construction. It is also a challenge to develop a game in less than 24 hours total time. To clarify, this means 24 hours of *development* time, not one calendar day.

## Progress
For now, I'll be keeping progress in a log format here. Eventually I will write up an article on this when the project is finished.

### Hour Breakdown
1. Project scaffolding, set up HTML/CSS and basic JS file. Inclusion of PIXI library and game loop setup.
2. Setup game "class" in JS, setup basic messaging.
3. Setup GameObjects and interfaces.
4. Setup Components and interfaces.
5. Setup basic level, begin support for configuration file loading.
6. Got tired of the headaches of implementing "classes" in Javascript. Converted entire project to TypeScript.
7. Finished converting to TypeScript. Added SpriteComponent. Created GitHub repo and checked in code for the first time.
8. Added BaseGameObject class, fixed messaging.
9. Began work on AnimatedSprites.
10. Finished AnimatedSprites.
11. Added AssetLoader and AssetManager to streamline asset loading process.
12. Began TileMap implementation. Created some "better" assets to test with.
13. Finished TileMap implementation. Added a *lot* of documentation comments. Added message broadcasting. Past halfway point now, starting to think about which features to cut.
14. Added ability to unsubscribe to messages. Also added spawn component (which listens for messages).
15. Tweaked/added assets. Updated tile map. Decided on cutting pickup items/powerups feature. Can add after project completion.
16. Multi-level loading working. Fixed bugs with object and component destruction. Tied a temporary UI control to switch levels.
17. Tweened player movement added. Sokoban Controller component added, which tracks game state. TileMap checks added for bounds.
18. Added crates. Player is now able to push them about and they collide correctly with walls and other crates.
19. Goals working. Began adding screen fade logic.