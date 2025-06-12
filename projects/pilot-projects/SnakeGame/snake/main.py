import pygame
import pygame.mixer
from game.core import Snake, Food, CELL_SIZE, GRID_WIDTH, GRID_HEIGHT
from db.schema import init_db
from users.auth import register_user, login_user
from users.data import load_user_data, save_user_data
from game.levels import get_level
from game.powerups import PowerUp, generate_powerup
from game.skins import get_available_skins, select_skin
import time
from leaderboard.global_board import submit_score, fetch_leaderboard
from replays.recorder import ReplayRecorder
from replays.playback import play_replay
import atexit
from settings.config import load_settings, save_settings, get_default_settings
import json
import os
import math
from ui.menu import Menu
from ui.button import Button
from ui.login import login_screen
from ui.register import registration_form
import sys

# Initialize Pygame
pygame.init()
pygame.mixer.init()

# Set up display
SCREEN_WIDTH, SCREEN_HEIGHT = 1280, 800  # Larger default for full registration form
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.FULLSCREEN)
pygame.display.set_caption('Snake Game')

# Main loop
running = True
clock = pygame.time.Clock()

snake = Snake()
food = Food(snake.body)

try:
    food_sound = pygame.mixer.Sound('assets/food.wav')
    powerup_sound = pygame.mixer.Sound('assets/powerup.wav')
    gameover_sound = pygame.mixer.Sound('assets/gameover.wav')
    pygame.mixer.music.load('assets/music.mp3')
    pygame.mixer.music.set_volume(0.5)
except:
    food_sound = powerup_sound = gameover_sound = None

def run_login():
    def login_cb(username, password):
        try:
            result, info = login_user(username, password)
            if result:
                return True, info['msg']
            else:
                return False, info
        except Exception as e:
            return False, str(e)
    def register_cb(username, password, name, email):
        try:
            return register_user(username, password, name, email)
        except Exception as e:
            return False, str(e)
    state = 'login'
    success_msg = ''
    while True:
        if state == 'login':
            result = login_screen(screen, login_cb, None, success_msg)
            if result[0] == 'login':
                username = result[1]
                pw = result[2]
                res, info = login_user(username, pw)
                if res:
                    return username, info
                else:
                    success_msg = info
            elif result[0] == 'register':
                state = 'register'
            elif result[0] == 'guest':
                guest_username = f'guest_{int(time.time())}'
                return guest_username, {'msg': 'Guest login', 'name': 'Guest', 'email': ''}
            elif result[0] == 'quit':
                pygame.quit()
                sys.exit()
        elif state == 'register':
            reg_result = registration_form(screen, register_cb, None)
            if reg_result:
                success_msg = 'Registration successful! Please log in.'
            else:
                success_msg = ''
            state = 'login'

def prompt_difficulty():
    print('Select difficulty:')
    print('1. Casual (easy)')
    print('2. Normal (default)')
    print('3. Expert (hard)')
    while True:
        choice = input('Enter 1, 2, or 3: ').strip()
        if choice == '1':
            return 'casual'
        elif choice == '2':
            return 'normal'
        elif choice == '3':
            return 'expert'
        else:
            print('Invalid choice.')

init_db()

username, login_info = run_login()
user_data = load_user_data(username)
if not user_data:
    user_data = {'unlocked_levels': 1, 'achievements': [], 'total_playtime': 0, 'name': login_info.get('name', ''), 'email': login_info.get('email', '')}
    save_user_data(username, user_data)

difficulty = prompt_difficulty()

skins = get_available_skins(user_data['achievements'])
print('Available snake skins:')
for i, skin in enumerate(skins):
    if skin.unlocked:
        print(f'{i+1}. {skin.name}')
selected = input('Select your snake skin (number): ').strip()
try:
    selected_idx = int(selected) - 1
    if 0 <= selected_idx < len(skins) and skins[selected_idx].unlocked:
        user_data['selected_skin'] = skins[selected_idx].name
    else:
        print('Invalid skin selection. Defaulting to Classic Green.')
        user_data['selected_skin'] = 'Classic Green'
except Exception as e:
    print('Invalid input. Defaulting to Classic Green.')
    user_data['selected_skin'] = 'Classic Green'
save_user_data(username, user_data)
selected_skin = select_skin(skins, user_data['selected_skin'])

settings = load_settings(username)

def draw_grid(surface):
    for x in range(0, SCREEN_WIDTH, CELL_SIZE):
        pygame.draw.line(surface, (40, 40, 40), (x, 0), (x, SCREEN_HEIGHT))
    for y in range(0, SCREEN_HEIGHT, CELL_SIZE):
        pygame.draw.line(surface, (40, 40, 40), (0, y), (SCREEN_WIDTH, y))

def draw_snake(surface, snake):
    for x, y in snake.body:
        pygame.draw.rect(surface, selected_skin.color, (x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE))

def draw_food(surface, food):
    pulse = 1.0 + 0.2 * math.sin(time.time()*4)
    fx, fy = food.position
    food_rect = pygame.Rect(fx*CELL_SIZE, fy*CELL_SIZE, CELL_SIZE, CELL_SIZE)
    scaled = int(CELL_SIZE * pulse)
    food_surf = pygame.Surface((scaled, scaled), pygame.SRCALPHA)
    pygame.draw.ellipse(food_surf, (255,0,0), (0,0,scaled,scaled))
    surface.blit(food_surf, (fx*CELL_SIZE + (CELL_SIZE-scaled)//2, fy*CELL_SIZE + (CELL_SIZE-scaled)//2))

def unlock_achievement(user_data, achv):
    if achv not in user_data['achievements']:
        user_data['achievements'].append(achv)
        print(f'Achievement unlocked: {achv}!')
        save_user_data(username, user_data)
        achievement_popups.append({'text': f'Achievement unlocked: {achv}!', 'time': time.time()})

def play_level(level_number, difficulty, user_data):
    level = get_level(level_number, difficulty)
    snake = Snake()
    food = Food(snake.body)
    move_event = pygame.USEREVENT + 1
    base_speed = level.speed
    pygame.time.set_timer(move_event, int(base_speed * snake.speed_modifier))
    running = True
    won = False
    score = 0
    powerup = None
    powerup_timer = 0
    powerup_active = None
    powerup_end_time = 0
    last_powerup_spawn = time.time()
    POWERUP_SPAWN_INTERVAL = 10  # seconds
    recorder = ReplayRecorder(username, level_number, difficulty)
    paused = False
    powerup_types_collected = set()
    while running:
        now = time.time()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
                save_user_data(username, user_data)
                pygame.quit()
                exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_p:
                    paused = not paused
                    if paused:
                        print('Game paused. Press P to resume.')
                        save_user_data(username, user_data)
                if paused:
                    continue
                if event.key == pygame.K_UP:
                    snake.change_direction((0, -1))
                    recorder.record_move((0, -1))
                elif event.key == pygame.K_DOWN:
                    snake.change_direction((0, 1))
                    recorder.record_move((0, 1))
                elif event.key == pygame.K_LEFT:
                    snake.change_direction((-1, 0))
                    recorder.record_move((-1, 0))
                elif event.key == pygame.K_RIGHT:
                    snake.change_direction((1, 0))
                    recorder.record_move((1, 0))
            elif event.type == move_event:
                snake.move()
                if snake.body[0] == food.position:
                    snake.grow = True
                    food = Food(snake.body)
                    points = 10 * (2 if snake.double_points else 1)
                    score += points
                    if settings['sound'] and food_sound:
                        food_sound.play()
                if powerup and snake.body[0] == powerup.position:
                    powerup_types_collected.add(powerup.type)
                    powerup_active = powerup
                    powerup_end_time = now + powerup.duration
                    powerup.activate(snake)
                    powerup = None
                    # Adjust move timer for slow effect
                    pygame.time.set_timer(move_event, int(base_speed * snake.speed_modifier))
                    if settings['sound'] and powerup_sound:
                        powerup_sound.play()
                if powerup_active and now > powerup_end_time:
                    powerup_active.deactivate(snake)
                    powerup_active = None
                    pygame.time.set_timer(move_event, int(base_speed * snake.speed_modifier))
                # Invincible: ignore self/wall/obstacle collision
                if not snake.invincible:
                    if snake.collides_with_self() or snake.collides_with_wall() or snake.body[0] in level.obstacles:
                        running = False
                if len(snake.body) > 10 + level_number * 2:
                    won = True
                    running = False
        # Power-up spawn logic
        if not powerup and (now - last_powerup_spawn > POWERUP_SPAWN_INTERVAL):
            powerup = generate_powerup(snake.body, level.obstacles)
            last_powerup_spawn = now
        if paused:
            screen.fill((30, 30, 30))
            font = pygame.font.SysFont(None, settings['font_size'])
            text = font.render('PAUSED', True, (255, 255, 0))
            screen.blit(text, (SCREEN_WIDTH//2-80, SCREEN_HEIGHT//2-24))
            pygame.display.flip()
            clock.tick(10)
            continue
        screen.fill(level.theme['bg_color'])
        draw_grid(screen)
        for ox, oy in level.obstacles:
            pygame.draw.rect(screen, (128, 128, 128), (ox*CELL_SIZE, oy*CELL_SIZE, CELL_SIZE, CELL_SIZE))
        draw_snake(screen, snake)
        draw_food(screen, food)
        if powerup:
            px, py = powerup.position
            color = (255, 255, 0) if powerup.type == 'slow' else (0, 255, 255) if powerup.type == 'invincible' else (255, 0, 255) if powerup.type == 'double_points' else (0,255,0)
            powerup_rect = pygame.Rect(px*CELL_SIZE, py*CELL_SIZE, CELL_SIZE, CELL_SIZE)
            scaled = int(CELL_SIZE * pulse)
            pu_surf = pygame.Surface((scaled, scaled), pygame.SRCALPHA)
            pygame.draw.ellipse(pu_surf, color, (0,0,scaled,scaled))
            screen.blit(pu_surf, (px*CELL_SIZE + (CELL_SIZE-scaled)//2, py*CELL_SIZE + (CELL_SIZE-scaled)//2))
        if powerup_active:
            # Show active power-up effect (e.g., border)
            pygame.draw.rect(screen, (255, 255, 0), (0, 0, SCREEN_WIDTH, SCREEN_HEIGHT), 5)
        pygame.display.flip()
        clock.tick(60)

        # Example: unlock achievements
        if won:
            if level_number == 5:
                unlock_achievement(user_data, 'blue_achv')
            if level_number == 10:
                unlock_achievement(user_data, 'red_achv')
            if level_number == 15:
                unlock_achievement(user_data, 'gold_achv')
            if len(powerup_types_collected) == 4:
                unlock_achievement(user_data, 'rainbow_achv')
            if user_data.get('selected_skin') == 'Colorblind':
                unlock_achievement(user_data, 'colorblind_achv')
            if settings.get('font_size', 32) >= 48:
                unlock_achievement(user_data, 'bigfont_achv')
        if powerup_active and powerup_active.type == 'invincible':
            unlock_achievement(user_data, 'shadow_achv')

        # Save replay if top score
        leaders = fetch_leaderboard(level_number, difficulty)
        is_top_score = not leaders or score > min([s for _, s in leaders]) or len(leaders) < 10
        recorder.save(is_top_score)

        # Add in-game overlays
        font = pygame.font.SysFont(None, settings['font_size'])
        score_text = font.render(f'Score: {score}', True, (255,255,255))
        level_text = font.render(f'Level: {level_number}', True, (255,255,255))
        screen.blit(score_text, (10, 10))
        screen.blit(level_text, (10, 40))
        if powerup_active:
            pu_text = font.render(f'Power-Up: {powerup_active.type}', True, (255,255,0))
            screen.blit(pu_text, (10, 70))
        if paused:
            pause_text = font.render('PAUSED', True, (255,255,0))
            screen.blit(pause_text, (SCREEN_WIDTH//2-60, 10))

    # Auto-save user data on pause/exit
    def auto_save():
        save_user_data(username, user_data)
    atexit.register(auto_save)

    if settings['sound'] and gameover_sound:
        gameover_sound.play()

    return won, score

def fade_in(surface, duration=0.5):
    overlay = pygame.Surface(surface.get_size())
    overlay.fill((0,0,0))
    for alpha in range(255, -1, -15):
        overlay.set_alpha(alpha)
        surface.blit(overlay, (0,0))
        pygame.display.flip()
        pygame.time.delay(int(duration*1000/17))

def fade_out(surface, duration=0.5):
    overlay = pygame.Surface(surface.get_size())
    overlay.fill((0,0,0))
    for alpha in range(0, 256, 15):
        overlay.set_alpha(alpha)
        surface.blit(overlay, (0,0))
        pygame.display.flip()
        pygame.time.delay(int(duration*1000/17))

def main_menu_graphical(screen, settings, start_callback, leaderboard_callback, settings_callback, backup_callback, restore_callback, quit_callback):
    font = pygame.font.SysFont(None, 40)
    buttons = [
        Button((300, 180, 200, 50), 'Start Game', start_callback, font),
        Button((300, 250, 200, 50), 'Leaderboards', leaderboard_callback, font),
        Button((300, 320, 200, 50), 'Settings', settings_callback, font),
        Button((300, 390, 200, 50), 'Backup Data', backup_callback, font),
        Button((300, 460, 200, 50), 'Restore Data', restore_callback, font),
        Button((300, 530, 200, 50), 'Quit', quit_callback, font)
    ]
    menu = Menu(screen, 'SNAKE', buttons)
    menu.show()

def main_menu():
    while True:
        print('\n--- SNAKE MAIN MENU ---')
        print('1. Start Game')
        print('2. Leaderboards')
        print('3. Settings')
        print('4. Backup Data')
        print('5. Restore Data')
        print('6. Quit')
        choice = input('Select an option: ').strip()
        if choice == '1':
            return 'start'
        elif choice == '2':
            return 'leaderboards'
        elif choice == '3':
            return 'settings'
        elif choice == '4':
            backup_user_data(username, user_data, settings)
        elif choice == '5':
            u, s = restore_user_data(username)
            if u and s:
                user_data.update(u)
                settings.update(s)
                save_user_data(username, user_data)
                save_settings(username, settings)
        elif choice == '6':
            exit()
        else:
            print('Invalid choice.')

    if settings.get('sound', True):
        try:
            pygame.mixer.music.play(-1)
        except:
            pass

def level_select(user_data):
    print('\n--- LEVEL SELECT ---')
    for i in range(1, user_data['unlocked_levels']+1):
        print(f'{i}. Level {i}')
    while True:
        sel = input('Select level to play: ').strip()
        try:
            sel = int(sel)
            if 1 <= sel <= user_data['unlocked_levels']:
                return sel
        except:
            pass
        print('Invalid level.')

def settings_menu():
    global settings
    while True:
        print('\n--- SETTINGS ---')
        print(f'1. Controls: {settings["controls"]}')
        print(f'2. Sound: {"On" if settings["sound"] else "Off"}')
        print(f'3. Font Size: {settings["font_size"]}')
        print('4. Reset to Default')
        print('5. Back')
        choice = input('Select option: ').strip()
        if choice == '1':
            for k in settings['controls']:
                new_key = input(f'Key for {k} (current: {settings["controls"][k]}): ').strip().upper()
                if new_key:
                    settings['controls'][k] = new_key
        elif choice == '2':
            settings['sound'] = not settings['sound']
            if not settings['sound']:
                pygame.mixer.music.stop()
            else:
                try:
                    pygame.mixer.music.play(-1)
                except:
                    pass
        elif choice == '3':
            try:
                sz = int(input('Font size (16-64): ').strip())
                if 16 <= sz <= 64:
                    settings['font_size'] = sz
            except:
                print('Invalid size.')
        elif choice == '4':
            settings = get_default_settings()
        elif choice == '5':
            break
        save_settings(username, settings)
        if user_data.get('selected_skin') == 'Colorblind':
            unlock_achievement(user_data, 'colorblind_achv')
        if settings.get('font_size', 32) >= 48:
            unlock_achievement(user_data, 'bigfont_achv')

def main_game_loop():
    while True:
        action = main_menu()
        if action == 'start':
            level_number = level_select(user_data)
            break
        elif action == 'leaderboards':
            print('--- LEADERBOARDS ---')
            for lvl in range(1, user_data['unlocked_levels']+1):
                print(f'Level {lvl}:')
                leaders = fetch_leaderboard(lvl, difficulty)
                for i, (user, s) in enumerate(leaders):
                    print(f'  {i+1}. {user}: {s}')
            input('Press Enter to return to menu.')
        elif action == 'settings':
            settings_menu()
            input('Press Enter to return to menu.')

    consecutive_wins = 0
    while level_number <= user_data['unlocked_levels']:
        print(f'Level {level_number}')
        won, score = play_level(level_number, difficulty, user_data)
        if won:
            print('Level complete!')
            level_number += 1
            consecutive_wins += 1
            if level_number > user_data['unlocked_levels']:
                user_data['unlocked_levels'] = level_number
                save_user_data(username, user_data)
            if consecutive_wins >= 3:
                print('Difficulty increased!')
                # TODO: Increase difficulty dynamically
                consecutive_wins = 0
        else:
            print('Game over!')
            consecutive_wins = 0
            again = input('Retry level? (y/n): ').strip().lower()
            if again != 'y':
                break
        submit_score(username, score, level_number, difficulty)
        print('Leaderboard:')
        leaders = fetch_leaderboard(level_number, difficulty)
        for i, (user, s) in enumerate(leaders):
            print(f'{i+1}. {user}: {s}')
        # Option to view replays
        view_replay = input('View top replay? (y/n): ').strip().lower()
        if view_replay == 'y':
            play_replay(level_number, difficulty)
    print('Thanks for playing!')

def play_replay(level, difficulty):
    import pygame
    import time
    from game.levels import get_level
    from game.core import Snake, CELL_SIZE
    from game.food import Food
    from game.skins import select_skin, get_available_skins
    from users.data import load_user_data
    import sqlite3, json
    conn = sqlite3.connect('snake.db')
    c = conn.cursor()
    c.execute('SELECT data FROM replays WHERE level = ? AND difficulty = ? ORDER BY timestamp DESC LIMIT 1', (level, difficulty))
    row = c.fetchone()
    conn.close()
    if not row:
        print('No replay found.')
        return
    moves = json.loads(row[0])
    # Setup replay window
    pygame.init()
    screen = pygame.display.set_mode((800, 600))
    pygame.display.set_caption('Snake Replay')
    clock = pygame.time.Clock()
    level_data = get_level(level, difficulty)
    snake = Snake()
    food = Food(snake.body)
    skin = select_skin(get_available_skins([]), 'Classic Green')
    idx = 0
    running = True
    last_time = time.time()
    while running and idx < len(moves):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
        now = time.time()
        if now - last_time >= 0.1:
            direction = moves[idx][1]
            snake.change_direction(direction)
            snake.move()
            idx += 1
            last_time = now
        screen.fill(level_data.theme['bg_color'])
        for ox, oy in level_data.obstacles:
            pygame.draw.rect(screen, (128, 128, 128), (ox*CELL_SIZE, oy*CELL_SIZE, CELL_SIZE, CELL_SIZE))
        for x, y in snake.body:
            pygame.draw.rect(screen, skin.color, (x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE, CELL_SIZE))
        pygame.display.flip()
        clock.tick(60)
    pygame.quit()

def backup_user_data(username, user_data, settings):
    data = {'user_data': user_data, 'settings': settings}
    with open(f'{username}_backup.json', 'w') as f:
        json.dump(data, f)
    print('Backup saved.')

def restore_user_data(username):
    fname = f'{username}_backup.json'
    if not os.path.exists(fname):
        print('No backup found.')
        return None, None
    with open(fname, 'r') as f:
        data = json.load(f)
    print('Backup restored.')
    return data['user_data'], data['settings']

def show_error_popup(screen, message):
    font = pygame.font.SysFont(None, 36)
    popup = pygame.Surface((400, 120))
    popup.fill((60, 0, 0))
    pygame.draw.rect(popup, (255,0,0), popup.get_rect(), 4)
    text = font.render('Error:', True, (255,255,255))
    msg = font.render(message, True, (255,200,200))
    popup.blit(text, (20, 20))
    popup.blit(msg, (20, 60))
    screen.blit(popup, (screen.get_width()//2-200, screen.get_height()//2-60))
    pygame.display.flip()
    pygame.time.delay(2000)

main_game_loop() 