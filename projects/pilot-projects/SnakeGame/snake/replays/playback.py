import sqlite3
import json

def play_replay(level, difficulty):
    conn = sqlite3.connect('snake.db')
    c = conn.cursor()
    c.execute('SELECT data FROM replays WHERE level = ? AND difficulty = ? ORDER BY timestamp DESC LIMIT 1', (level, difficulty))
    row = c.fetchone()
    conn.close()
    if not row:
        print('No replay found.')
        return
    moves = json.loads(row[0])
    print('Replay moves:')
    for t, d in moves:
        print(f'Time: {t:.2f}, Direction: {d}') 