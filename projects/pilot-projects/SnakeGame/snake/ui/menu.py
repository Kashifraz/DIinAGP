import pygame
from .button import Button

class Menu:
    def __init__(self, surface, title, buttons, bg_color=(30,30,30)):
        self.surface = surface
        self.title = title
        self.buttons = buttons
        self.bg_color = bg_color
        self.font = pygame.font.SysFont(None, 48)
        self.running = True

    def show(self):
        clock = pygame.time.Clock()
        self.fade_in()
        while self.running:
            self.surface.fill(self.bg_color)
            title_surf = self.font.render(self.title, True, (255,255,255))
            self.surface.blit(title_surf, (self.surface.get_width()//2 - title_surf.get_width()//2, 60))
            for btn in self.buttons:
                btn.draw(self.surface)
            pygame.display.flip()
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                    pygame.quit()
                    exit()
                for btn in self.buttons:
                    btn.handle_event(event)
            clock.tick(60)
        self.fade_out()

    def fade_in(self, duration=0.5):
        overlay = pygame.Surface(self.surface.get_size())
        overlay.fill((0,0,0))
        for alpha in range(255, -1, -15):
            overlay.set_alpha(alpha)
            self.surface.blit(overlay, (0,0))
            pygame.display.flip()
            pygame.time.delay(int(duration*1000/17))

    def fade_out(self, duration=0.5):
        overlay = pygame.Surface(self.surface.get_size())
        overlay.fill((0,0,0))
        for alpha in range(0, 256, 15):
            overlay.set_alpha(alpha)
            self.surface.blit(overlay, (0,0))
            pygame.display.flip()
            pygame.time.delay(int(duration*1000/17)) 