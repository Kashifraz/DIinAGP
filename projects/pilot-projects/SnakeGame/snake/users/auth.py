import bcrypt
import sqlite3
import re

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt())

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode(), hashed)

def register_user(username, password, name, email):
    if not is_valid_email(email):
        return False, 'Invalid email address.'
    try:
        conn = sqlite3.connect('snake.db')
        c = conn.cursor()
        c.execute('SELECT username FROM users WHERE username = ?', (username,))
        if c.fetchone():
            conn.close()
            return False, 'Username already exists.'
        c.execute('SELECT email FROM users WHERE email = ?', (email,))
        if c.fetchone():
            conn.close()
            return False, 'Email already registered.'
        hashed = hash_password(password)
        c.execute('INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)', (username, hashed, name, email))
        conn.commit()
        conn.close()
        return True, 'Registration successful.'
    except Exception as e:
        return False, f'Registration failed: {e}'

def login_user(username, password):
    try:
        conn = sqlite3.connect('snake.db')
        c = conn.cursor()
        c.execute('SELECT password, name, email FROM users WHERE username = ?', (username,))
        row = c.fetchone()
        if not row:
            conn.close()
            return False, 'User not found.'
        hashed, name, email = row
        if check_password(password, hashed):
            conn.close()
            return True, {'msg': 'Login successful.', 'name': name, 'email': email}
        else:
            conn.close()
            return False, 'Incorrect password.'
    except Exception as e:
        return False, f'Login failed: {e}' 