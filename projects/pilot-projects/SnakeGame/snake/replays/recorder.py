import sqlite3
import json
import time

class ReplayRecorder:
    def __init__(self, username, level, difficulty):
        self.username = username
        self.level = level
        self.difficulty = difficulty
        self.moves = []  # List of (timestamp, direction)
        self.start_time = time.time()

    def record_move(self, direction):
        self.moves.append((time.time() - self.start_time, direction))

    def save(self, is_top_score=False):
        if not is_top_score:
            return
        conn = sqlite3.connect('snake.db')
        c = conn.cursor()
        c.execute('INSERT INTO replays (username, level, difficulty, data, timestamp) VALUES (?, ?, ?, ?, ?)',
                  (self.username, self.level, self.difficulty, json.dumps(self.moves), int(time.time())))
        conn.commit()
        conn.close()

    def get_moves(self):
        return self.moves 