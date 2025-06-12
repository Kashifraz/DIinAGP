import pygame
import random

CELL_SIZE = 20
GRID_WIDTH = 40
GRID_HEIGHT = 30

class Snake:
    def __init__(self):
        self.body = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        self.direction = (0, -1)
        self.grow = False
        self.speed_modifier = 1.0
        self.invincible = False
        self.double_points = False

    def move(self):
        head_x, head_y = self.body[0]
        dx, dy = self.direction
        new_head = (head_x + dx, head_y + dy)
        self.body.insert(0, new_head)
        if not self.grow:
            self.body.pop()
        else:
            self.grow = False

    def change_direction(self, new_dir):
        if (new_dir[0] != -self.direction[0] or new_dir[1] != -self.direction[1]):
            self.direction = new_dir

    def collides_with_self(self):
        return self.body[0] in self.body[1:]

    def collides_with_wall(self):
        x, y = self.body[0]
        return not (0 <= x < GRID_WIDTH and 0 <= y < GRID_HEIGHT)

class Food:
    def __init__(self, snake_body):
        self.position = self.random_position(snake_body)

    def random_position(self, snake_body):
        while True:
            pos = (random.randint(0, GRID_WIDTH-1), random.randint(0, GRID_HEIGHT-1))
            if pos not in snake_body:
                return pos 