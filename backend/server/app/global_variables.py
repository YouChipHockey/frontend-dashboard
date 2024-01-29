from apscheduler.schedulers.background import BackgroundScheduler
import copy

class GlobalVariables:
    field_width = 1280
    field_height = 768
    num_squares_x = 20
    num_squares_y = 9

    square_width = field_width // num_squares_x
    square_height = field_height // num_squares_y

    scheduler = BackgroundScheduler()  
    scheduler.start()

    match_running = False
    match_start_time = 0

    @classmethod
    def initialize(cls):
        cls.square_counts = [[[{"name": f"", "count": 0}]] * cls.num_squares_x for _ in range(cls.num_squares_y)]

    @classmethod
    def update_square_counts(cls, player):
        square_x = int(player.x // cls.square_width)
        square_y = int((cls.field_height - player.y) // cls.square_height)

        print(player)
        print(square_x, square_y)

        print([[sum(dictionary['count'] for dictionary in arr_dict) for arr_dict in row] for row in cls.square_counts])

        checker = True

        for slov in cls.square_counts[square_y][square_x]:
            print(slov)
            if slov['name'] == f"{player.name} {player.surname}":
                slov['count'] += 1
                checker = False
                break

        print([[sum(dictionary['count'] for dictionary in arr_dict) for arr_dict in row] for row in cls.square_counts])

        if checker:
            print('CHEEEEk')
            cls.square_counts[square_y][square_x].append({"name": f"{player.name} {player.surname}", "count": 1, "team": player.team})
