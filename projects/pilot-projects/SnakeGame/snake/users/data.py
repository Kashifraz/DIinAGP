import sqlite3
import json

def load_user_data(username):
    conn = sqlite3.connect('snake.db')
    c = conn.cursor()
    c.execute('SELECT unlocked_levels, achievements, total_playtime FROM users WHERE username = ?', (username,))
    row = c.fetchone()
    c.execute('SELECT data FROM settings WHERE username = ?', (username,))
    settings_row = c.fetchone()
    conn.close()
    if not row:
        return None
    unlocked_levels, achievements, total_playtime = row
    settings = json.loads(settings_row[0]) if settings_row and settings_row[0] else {}
    return {
        'unlocked_levels': unlocked_levels,
        'achievements': json.loads(achievements) if achievements else [],
        'total_playtime': total_playtime,
        'selected_skin': settings.get('selected_skin', 'Classic Green')
    }

def save_user_data(username, data):
    conn = sqlite3.connect('snake.db')
    c = conn.cursor()
    c.execute('UPDATE users SET unlocked_levels = ?, achievements = ?, total_playtime = ? WHERE username = ?', (
        data['unlocked_levels'],
        json.dumps(data['achievements']),
        data['total_playtime'],
        username
    ))
    # Save selected_skin in settings
    c.execute('INSERT OR REPLACE INTO settings (username, data) VALUES (?, ?)', (
        username, json.dumps({'selected_skin': data.get('selected_skin', 'Classic Green')})
    ))
    conn.commit()
    conn.close() 