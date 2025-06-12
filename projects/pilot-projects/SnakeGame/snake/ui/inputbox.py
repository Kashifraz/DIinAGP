import pygame

class InputBox:
    def __init__(self, x, y, w, h, font, text='', is_password=False):
        self.rect = pygame.Rect(x, y, w, h)
        self.color_inactive = pygame.Color('lightskyblue3')
        self.color_active = pygame.Color('dodgerblue2')
        self.color = self.color_inactive
        self.text = text
        self.font = font
        self.txt_surface = font.render(text, True, self.color)
        self.active = False
        self.is_password = is_password
        self.vertical_offset = 0

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                self.active = True
            else:
                self.active = False
            self.color = self.color_active if self.active else self.color_inactive
        if event.type == pygame.KEYDOWN and self.active:
            if event.key == pygame.K_RETURN:
                return 'submit'
            elif event.key == pygame.K_BACKSPACE:
                self.text = self.text[:-1]
            else:
                if len(self.text) < 20 and event.unicode.isprintable():
                    self.text += event.unicode
            self.txt_surface = self.font.render(self.masked_text(), True, (0,0,0))
        return None

    def masked_text(self):
        return '*'*len(self.text) if self.is_password else self.text

    def draw(self, screen):
        self.txt_surface = self.font.render(self.masked_text(), True, (0,0,0))
        y = self.rect.y + self.vertical_offset
        screen.blit(self.txt_surface, (self.rect.x+5, y+5))
        pygame.draw.rect(screen, self.color, (self.rect.x, y, self.rect.width, self.rect.height), 2) 