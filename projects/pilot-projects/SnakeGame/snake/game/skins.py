class Skin:
    def __init__(self, name, color, unlocked=False):
        self.name = name
        self.color = color
        self.unlocked = unlocked

def get_available_skins(user_achievements):
    # Placeholder: unlock green by default, others by achievements
    skins = [
        Skin('Classic Green', (0, 255, 0), True),
        Skin('Blue Bolt', (0, 128, 255), 'blue_achv' in user_achievements),
        Skin('Red Racer', (255, 0, 0), 'red_achv' in user_achievements),
        Skin('Gold Snake', (255, 215, 0), 'gold_achv' in user_achievements),
        Skin('Shadow', (50, 50, 50), 'shadow_achv' in user_achievements),
        Skin('Rainbow', (255, 0, 255), 'rainbow_achv' in user_achievements),
        Skin('Colorblind', (200, 200, 0), 'colorblind_achv' in user_achievements),
        Skin('BigFont', (0, 255, 255), 'bigfont_achv' in user_achievements),
    ]
    return skins

def select_skin(skins, name):
    for skin in skins:
        if skin.name == name and skin.unlocked:
            return skin
    return skins[0]  # Default to Classic Green 