import pygame
import sys
from .inputbox import InputBox
from .button import Button

def login_screen(screen, login_callback, quit_callback, success_msg=''):
    font = pygame.font.SysFont(None, 48)
    input_font = pygame.font.SysFont(None, 36)
    logo_font = pygame.font.SysFont(None, 72, bold=True)
    username_box = InputBox(0, 0, 320, 48, input_font)
    password_box = InputBox(0, 0, 320, 48, input_font, is_password=True)
    error_msg = ''
    clock = pygame.time.Clock()
    while True:
        screen.fill((24, 28, 40))
        # Draw logo/title
        logo = logo_font.render('SNAKE', True, (0,255,128))
        screen.blit(logo, (screen.get_width()//2 - logo.get_width()//2, 60))
        # Draw panel
        panel_w, panel_h = 420, 420
        panel_x = screen.get_width()//2 - panel_w//2
        panel_y = 180
        panel = pygame.Surface((panel_w, panel_h), pygame.SRCALPHA)
        panel.fill((255,255,255,235))
        pygame.draw.rect(panel, (0,200,128), (0,0,panel_w,panel_h), 4, border_radius=18)
        shadow = pygame.Surface((panel_w+12, panel_h+12), pygame.SRCALPHA)
        shadow.fill((0,0,0,60))
        screen.blit(shadow, (panel_x-6, panel_y-6))
        screen.blit(panel, (panel_x, panel_y))
        # Vertical stack layout
        stack_y = panel_y + 30
        spacing = 56
        # Title
        title = font.render('Login', True, (0,120,80))
        screen.blit(title, (screen.get_width()//2 - title.get_width()//2, stack_y))
        stack_y += 60
        # Username
        ulabel = input_font.render('Username', True, (60,60,60))
        screen.blit(ulabel, (screen.get_width()//2 - 160, stack_y))
        stack_y += 32
        username_box.rect.topleft = (screen.get_width()//2 - 160, stack_y)
        username_box.draw(screen)
        stack_y += 56
        # Password
        plabel = input_font.render('Password', True, (60,60,60))
        screen.blit(plabel, (screen.get_width()//2 - 160, stack_y))
        stack_y += 32
        password_box.rect.topleft = (screen.get_width()//2 - 160, stack_y)
        password_box.draw(screen)
        stack_y += 56
        # Buttons
        btn_w, btn_h = 320, 48
        login_btn = Button((screen.get_width()//2 - 160, stack_y, btn_w, btn_h), 'Login', lambda: None, input_font)
        register_btn = Button((screen.get_width()//2 - 160, stack_y+btn_h+12, btn_w, btn_h), 'Register', lambda: None, input_font, color=(80,80,120), hover_color=(120,120,180))
        guest_btn = Button((screen.get_width()//2 - 160, stack_y+2*(btn_h+12), btn_w, btn_h), 'Continue as Guest', lambda: None, input_font, color=(60,120,60), hover_color=(80,180,80))
        quit_btn = Button((screen.get_width()//2 - 160, stack_y+3*(btn_h+12), btn_w, btn_h), 'Quit', lambda: None, input_font, color=(120,60,60), hover_color=(180,80,80))
        login_btn.draw(screen)
        register_btn.draw(screen)
        guest_btn.draw(screen)
        quit_btn.draw(screen)
        # Error/success message
        msg_y = stack_y+4*(btn_h+12)+10
        if error_msg:
            err = input_font.render(error_msg, True, (200,40,40))
            screen.blit(err, (screen.get_width()//2 - err.get_width()//2, msg_y))
        if success_msg:
            succ = input_font.render(success_msg, True, (40,180,80))
            screen.blit(succ, (screen.get_width()//2 - succ.get_width()//2, msg_y))
        pygame.display.flip()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return ('quit', None)
            username_box.handle_event(event)
            password_box.handle_event(event)
            login_btn.handle_event(event)
            register_btn.handle_event(event)
            guest_btn.handle_event(event)
            quit_btn.handle_event(event)
            if event.type == pygame.MOUSEBUTTONUP:
                if login_btn.hovered:
                    if not username_box.text or not password_box.text:
                        error_msg = 'Enter username and password.'
                    else:
                        result, msg = login_callback(username_box.text, password_box.text)
                        if result:
                            return ('login', username_box.text, password_box.text)
                        else:
                            error_msg = msg
                if register_btn.hovered:
                    return ('register', None)
                if guest_btn.hovered:
                    return ('guest', None)
                if quit_btn.hovered:
                    return ('quit', None)
        clock.tick(60) 