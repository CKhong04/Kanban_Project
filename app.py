from flask_sqlalchemy import SQLAlchemy

from flask import (
    Flask,
    g,
    redirect,
    render_template,
    request,
    session,
    url_for
)

class User:
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password

    def __repr__(self):
        return f'<User: {self.username}>'

users = []
users.append(User(id=1, username='Milni', password='password'))
users.append(User(id=2, username='Chaitsee', password='password'))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/task.db'
db = SQLAlchemy(app)
app.secret_key = 'FIT2101G24'


class TaskDB(db.Model):
    __tablename__ = "task"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='To Do')

@app.before_request
def before_request():
    g.user = None

    if 'user_id' in session:
        user = [x for x in users if x.id == session['user_id']][0]
        g.user = user
        
@app.route('/')
def home(): 
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session.pop('user_id', None)

        username = request.form['username']
        password = request.form['password']
        
        user = [x for x in users if x.username == username][0]
        if user and user.password == password:
            session['user_id'] = user.id
            return redirect(url_for('index'))

        return redirect(url_for('login'))

    return render_template('test_login.html')

@app.route('/index')
def index():
    if not g.user:
        return redirect(url_for('login'))

    tasks_todo = TaskDB.query.filter_by(status='To Do').all()
    tasks_doing = TaskDB.query.filter_by(status='Doing').all()
    tasks_done = TaskDB.query.filter_by(status='Done').all()

    return render_template('index.html', tasks_todo=tasks_todo, tasks_doing=tasks_doing, tasks_done=tasks_done)

if __name__ == "__main__": 
    app.run(debug=True) # when launching flask into production env, set it to false 