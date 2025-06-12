import sqlite3

def submit_score(username, score, level, difficulty):
    conn = sqlite3.connect('snake.db')
    c = conn.cursor()
    c.execute('INSERT OR REPLACE INTO scores (username, level, difficulty, score) VALUES (?, ?, ?, ?)',
              (username, level, difficulty, score))
    conn.commit()
    conn.close()

def fetch_leaderboard(level, difficulty):
    conn = sqlite3.connect('snake.db')
    c = conn.cursor()
    c.execute('SELECT username, score FROM scores WHERE level = ? AND difficulty = ? ORDER BY score DESC LIMIT 10',
              (level, difficulty))
    results = c.fetchall()
    conn.close()
    return results 