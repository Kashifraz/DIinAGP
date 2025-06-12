import pygame

class Button:
    def __init__(self, rect, text, callback, font, icon=None, color=(60,60,60), hover_color=(100,100,100), text_color=(255,255,255)):
        self.rect = pygame.Rect(rect)
        self.text = text
        self.callback = callback
        self.font = font
        self.icon = icon
        self.color = color
        self.hover_color = hover_color
        self.text_color = text_color
        self.hovered = False
        self.animated = 0
        self.pressed = False

    def draw(self, surface):
        color = self.hover_color if self.hovered else self.color
        pygame.draw.rect(surface, color, self.rect, border_radius=8)
        if self.icon:
            surface.blit(self.icon, (self.rect.x+8, self.rect.y+8))
        text_surf = self.font.render(self.text, True, self.text_color)
        surface.blit(text_surf, (self.rect.centerx - text_surf.get_width()//2, self.rect.centery - text_surf.get_height()//2))
        if self.animated > 0:
            pygame.draw.rect(surface, (255,255,0), self.rect, 3, border_radius=8)
            self.animated -= 1

    def handle_event(self, event):
        if event.type == pygame.MOUSEMOTION:
            self.hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN and self.hovered:
            self.pressed = True
        elif event.type == pygame.MOUSEBUTTONUP:
            if self.hovered and self.pressed:
                self.animated = 5
                self.callback()
            self.pressed = False 