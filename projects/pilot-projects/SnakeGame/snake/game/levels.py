class Level:
    def __init__(self, number, layout, theme, speed, obstacles, powerups):
        self.number = number
        self.layout = layout  # 2D array or list of obstacle positions
        self.theme = theme    # Dict with colors, background, etc.
        self.speed = speed
        self.obstacles = obstacles
        self.powerups = powerups

# Example layouts: list of (x, y) obstacle positions
LEVEL_LAYOUTS = [
    [],  # Level 1: no obstacles
    [(10, 10), (11, 10), (12, 10)],  # Level 2
    [(5, 5), (5, 6), (5, 7), (15, 15), (16, 15)],  # Level 3
    [(20, 10), (21, 10), (22, 10), (23, 10)],  # Level 4
    [(10, 20), (11, 20), (12, 20), (13, 20)],  # Level 5
    [(5, 25), (6, 25), (7, 25), (8, 25)],  # Level 6
    [(30, 10), (31, 10), (32, 10)],  # Level 7
    [(20, 20), (21, 20), (22, 20)],  # Level 8
    [(10, 15), (11, 15), (12, 15), (13, 15)],  # Level 9
    [(25, 5), (26, 5), (27, 5)],  # Level 10
    [(15, 25), (16, 25), (17, 25)],  # Level 11
    [(5, 10), (6, 10), (7, 10)],  # Level 12
    [(30, 20), (31, 20), (32, 20)],  # Level 13
    [(20, 5), (21, 5), (22, 5)],  # Level 14
    [(10, 25), (11, 25), (12, 25)],  # Level 15
]

LEVEL_THEMES = [
    {"bg_color": (0, 0, 0), "snake_color": (0, 255, 0)},
    {"bg_color": (10, 10, 30), "snake_color": (0, 200, 255)},
    {"bg_color": (30, 10, 10), "snake_color": (255, 0, 0)},
    {"bg_color": (0, 30, 10), "snake_color": (0, 255, 128)},
    {"bg_color": (30, 30, 0), "snake_color": (255, 255, 0)},
    {"bg_color": (20, 0, 30), "snake_color": (200, 0, 255)},
    {"bg_color": (0, 20, 30), "snake_color": (0, 128, 255)},
    {"bg_color": (30, 20, 0), "snake_color": (255, 128, 0)},
    {"bg_color": (10, 30, 20), "snake_color": (0, 255, 200)},
    {"bg_color": (20, 10, 30), "snake_color": (128, 0, 255)},
    {"bg_color": (30, 0, 20), "snake_color": (255, 0, 128)},
    {"bg_color": (0, 30, 20), "snake_color": (0, 255, 128)},
    {"bg_color": (20, 30, 0), "snake_color": (255, 255, 128)},
    {"bg_color": (0, 20, 30), "snake_color": (0, 128, 255)},
    {"bg_color": (30, 10, 20), "snake_color": (255, 128, 128)},
]

DIFFICULTY_SETTINGS = {
    'casual': {'speed': 140, 'obstacle_mult': 0.7, 'score_mult': 1},
    'normal': {'speed': 110, 'obstacle_mult': 1.0, 'score_mult': 2},
    'expert': {'speed': 80, 'obstacle_mult': 1.5, 'score_mult': 3},
}

def get_level(level_number, difficulty):
    idx = max(0, min(level_number - 1, 14))
    base_speed = DIFFICULTY_SETTINGS[difficulty]['speed'] - idx * 3
    base_layout = LEVEL_LAYOUTS[idx]
    # Adjust obstacle count by difficulty
    mult = DIFFICULTY_SETTINGS[difficulty]['obstacle_mult']
    obstacles = base_layout[:int(len(base_layout) * mult)]
    theme = LEVEL_THEMES[idx]
    return Level(
        number=level_number,
        layout=base_layout,
        theme=theme,
        speed=max(40, base_speed),
        obstacles=obstacles,
        powerups=[]
    )

def load_level(level_number):
    # Placeholder: return a simple level for now
    return Level(
        number=level_number,
        layout=[],
        theme={"bg_color": (0, 0, 0)},
        speed=120 - (level_number * 5),
        obstacles=[],
        powerups=[]
    ) 