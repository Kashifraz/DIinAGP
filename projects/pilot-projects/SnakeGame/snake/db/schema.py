import sqlite3

def init_db():
    conn = sqlite3.connect('snake.db')
    c = conn.cursor()
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password BLOB NOT NULL,
        name TEXT,
        email TEXT,
        unlocked_levels INTEGER DEFAULT 1,
        achievements TEXT,
        total_playtime INTEGER DEFAULT 0
    )''')
    # Add columns if missing (migration)
    try:
        c.execute('ALTER TABLE users ADD COLUMN name TEXT')
    except Exception:
        pass
    try:
        c.execute('ALTER TABLE users ADD COLUMN email TEXT')
    except Exception:
        pass
    # Scores table
    c.execute('''CREATE TABLE IF NOT EXISTS scores (
        username TEXT,
        level INTEGER,
        difficulty TEXT,
        score INTEGER,
        PRIMARY KEY (username, level, difficulty)
    )''')
    # Settings table
    c.execute('''CREATE TABLE IF NOT EXISTS settings (
        username TEXT PRIMARY KEY,
        data TEXT
    )''')
    # Replays table
    c.execute('''CREATE TABLE IF NOT EXISTS replays (
        username TEXT,
        level INTEGER,
        difficulty TEXT,
        data BLOB,
        timestamp INTEGER
    )''')
    conn.commit()
    conn.close() 