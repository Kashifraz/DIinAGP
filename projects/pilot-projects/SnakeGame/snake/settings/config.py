import sqlite3
import json

def get_default_settings():
    return {
        'controls': {'up': 'UP', 'down': 'DOWN', 'left': 'LEFT', 'right': 'RIGHT', 'pause': 'P'},
        'sound': True,
        'font_size': 32
    }

def load_settings(username):
    conn = sqlite3.connect('snake.db')
    c = conn.cursor()
    c.execute('SELECT data FROM settings WHERE username = ?', (username,))
    row = c.fetchone()
    conn.close()
    if not row or not row[0]:
        return get_default_settings()
    return json.loads(row[0])

def save_settings(username, settings):
    conn = sqlite3.connect('snake.db')
    c = conn.cursor()
    c.execute('INSERT OR REPLACE INTO settings (username, data) VALUES (?, ?)', (username, json.dumps(settings)))
    conn.commit()
    conn.close() 