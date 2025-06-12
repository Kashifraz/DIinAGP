# Snake Game Project

A feature-rich Snake game with progressive levels, user accounts, achievements, leaderboards, replays, and more.

## Features
- 15 unique levels with increasing complexity, obstacles, and power-ups
- 3 difficulty modes: Casual, Normal, Expert
- User registration, login, and persistent progress
- Achievements and unlockable snake skins
- Global leaderboard (per difficulty)
- Replay system for top runs
- Automatic saving, backup, and multi-device sync
- **Graphical menus and animated UI**
- **Rich sound and music support**

## Project Structure
- `main.py` — Game entry point
- `game/` — Core game logic, levels, power-ups, skins
- `users/` — User authentication and data persistence
- `leaderboard/` — Global leaderboard logic
- `replays/` — Replay recording and playback
- `settings/` — Game settings and preferences
- `db/` — Database schema and initialization
- `utils/` — Helpers and conflict resolution
- `ui/` — Graphical menus and button classes
- `assets/` — Sprites, sounds, music, and themes

## Setup
1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
2. Add your sound and music files to the `assets/` folder:
   - `food.wav`, `powerup.wav`, `gameover.wav`, `music.mp3`, etc.
   - You can use your own or download free sounds/music.
3. Run the game:
   ```
   python main.py
   ```

## Packaging (Windows Installer)
1. Install PyInstaller:
   ```
   pip install pyinstaller
   ```
2. Build the executable:
   ```
   pyinstaller --onefile --add-data "assets;assets" --icon=assets/icon.ico main.py
   ```
   This will create a standalone `.exe` in the `dist/` folder.

## Development
- See each module for stubbed functions and classes to implement.
- Database: SQLite (`snake.db`), initialized via `db/schema.py`.
- Extend and fill in logic as needed for each feature. 