from app import db

class Player(db.Model):
    id = db.Column(db.Integer)
    newid = db.Column(db.Integer, primary_key=True)
    team = db.Column(db.Integer)
    num = db.Column(db.String(10))
    name = db.Column(db.String(50))
    surname = db.Column(db.String(50))
    x = db.Column(db.Float)
    y = db.Column(db.Float)
    speed = db.Column(db.Float)
    dist = db.Column(db.Float)
    time = db.Column(db.Float)
    lastX = db.Column(db.Float)
    lastY = db.Column(db.Float)
    avatar = db.Column(db.LargeBinary)
    chip_id = db.Column(db.Integer)
    visibility = db.Column(db.Boolean, default=True)
    position = db.Column(db.String(50))  # Добавлено новое поле "позиция"
    grip = db.Column(db.String(50))  # Добавлено новое поле "хват"

    height = db.Column(db.Float)
    weight = db.Column(db.Float)
    age = db.Column(db.Integer)
    birth_date = db.Column(db.Date)


    trajectory = db.relationship('TrajectoryPoint', backref='player', lazy=True)

class TrajectoryPoint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.Float)
    x = db.Column(db.Float)
    y = db.Column(db.Float)
    player_id = db.Column(db.Integer, db.ForeignKey('player.newid'), nullable=False)
