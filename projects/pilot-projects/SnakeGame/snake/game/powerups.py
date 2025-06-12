import random

class PowerUp:
    def __init__(self, position, type_, duration):
        self.position = position
        self.type = type_  # e.g., 'slow', 'invincible', 'double_points', 'shrink'
        self.duration = duration  # in seconds
        self.active = False

    def activate(self, snake):
        self.active = True
        if self.type == 'slow':
            snake.speed_modifier = 0.5
        elif self.type == 'invincible':
            snake.invincible = True
        elif self.type == 'double_points':
            snake.double_points = True
        elif self.type == 'shrink':
            if len(snake.body) > 4:
                snake.body = snake.body[:-3]

    def deactivate(self, snake):
        self.active = False
        if self.type == 'slow':
            snake.speed_modifier = 1.0
        elif self.type == 'invincible':
            snake.invincible = False
        elif self.type == 'double_points':
            snake.double_points = False
        # 'shrink' is instant, no deactivate needed

def generate_powerup(snake_body, obstacles):
    types = ['slow', 'invincible', 'double_points', 'shrink']
    while True:
        pos = (random.randint(0, 39), random.randint(0, 29))
        if pos not in snake_body and pos not in obstacles:
            t = random.choice(types)
            return PowerUp(pos, t, 5 if t != 'shrink' else 0) 