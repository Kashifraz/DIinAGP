import pygame
import sys
from .inputbox import InputBox
from .button import Button
import re

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def registration_form(screen, register_callback, back_callback):
    font = pygame.font.SysFont(None, 48)
    input_font = pygame.font.SysFont(None, 36)
    logo_font = pygame.font.SysFont(None, 72, bold=True)
    name_box = InputBox(0, 0, 320, 48, input_font)
    email_box = InputBox(0, 0, 320, 48, input_font)
    username_box = InputBox(0, 0, 320, 48, input_font)
    password_box = InputBox(0, 0, 320, 48, input_font, is_password=True)
    confirm_box = InputBox(0, 0, 320, 48, input_font, is_password=True)
    error_msg = ''
    success_msg = ''
    clock = pygame.time.Clock()
    while True:
        screen.fill((24, 28, 40))
        # Logo
        logo = logo_font.render('SNAKE', True, (0,255,128))
        screen.blit(logo, (screen.get_width()//2 - logo.get_width()//2, 40))
        # Panel
        panel_w, panel_h = 480, 700
        panel_x = screen.get_width()//2 - panel_w//2
        panel_y = 100
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
        title = font.render('Register', True, (0,120,80))
        screen.blit(title, (screen.get_width()//2 - title.get_width()//2, stack_y))
        stack_y += 60
        # Name
        nlabel = input_font.render('Full Name', True, (60,60,60))
        screen.blit(nlabel, (screen.get_width()//2 - 160, stack_y))
        stack_y += 32
        name_box.rect.topleft = (screen.get_width()//2 - 160, stack_y)
        name_box.draw(screen)
        stack_y += 56
        # Email
        elabel = input_font.render('Email', True, (60,60,60))
        screen.blit(elabel, (screen.get_width()//2 - 160, stack_y))
        stack_y += 32
        email_box.rect.topleft = (screen.get_width()//2 - 160, stack_y)
        email_box.draw(screen)
        stack_y += 56
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
        # Confirm Password
        clabel = input_font.render('Confirm Password', True, (60,60,60))
        screen.blit(clabel, (screen.get_width()//2 - 160, stack_y))
        stack_y += 32
        confirm_box.rect.topleft = (screen.get_width()//2 - 160, stack_y)
        confirm_box.draw(screen)
        stack_y += 56
        # Buttons
        btn_w, btn_h = 320, 48
        register_btn = Button((screen.get_width()//2 - 160, stack_y, btn_w, btn_h), 'Create Account', lambda: None, input_font)
        back_btn = Button((screen.get_width()//2 - 160, stack_y+btn_h+12, btn_w, btn_h), 'Back to Login', lambda: (pygame.quit(), sys.exit()), input_font, color=(80,80,120), hover_color=(120,120,180))
        register_btn.draw(screen)
        back_btn.draw(screen)
        # Error/success message
        msg_y = stack_y+2*(btn_h+12)+10
        if error_msg:
            err = input_font.render(error_msg, True, (200,40,40))
            screen.blit(err, (screen.get_width()//2 - err.get_width()//2, msg_y))
        if success_msg:
            succ = input_font.render(success_msg, True, (40,180,80))
            screen.blit(succ, (screen.get_width()//2 - succ.get_width()//2, msg_y))
        pygame.display.flip()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            name_box.handle_event(event)
            email_box.handle_event(event)
            username_box.handle_event(event)
            password_box.handle_event(event)
            confirm_box.handle_event(event)
            register_btn.handle_event(event)
            back_btn.handle_event(event)
            if event.type == pygame.MOUSEBUTTONUP:
                if register_btn.hovered:
                    # Validation
                    if not name_box.text.strip() or not email_box.text.strip() or not username_box.text.strip() or not password_box.text or not confirm_box.text:
                        error_msg = 'All fields are required.'
                        continue
                    if not is_valid_email(email_box.text.strip()):
                        error_msg = 'Invalid email address.'
                        continue
                    if password_box.text != confirm_box.text:
                        error_msg = 'Passwords do not match.'
                        continue
                    # Call register_callback
                    result, msg = register_callback(username_box.text.strip(), password_box.text, name_box.text.strip(), email_box.text.strip())
                    if result:
                        success_msg = 'Registration successful! Please log in.'
                        return username_box.text.strip(), password_box.text
                    else:
                        error_msg = msg
                if back_btn.hovered:
                    pygame.quit()
                    sys.exit()
        clock.tick(60) 