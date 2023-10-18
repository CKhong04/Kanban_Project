from flask_sqlalchemy import SQLAlchemy

from flask import (
    Flask,
    g,
    redirect,
    render_template,
    request,
    session,
    flash,
    url_for
)
from abc import ABC
from flask_bcrypt import Bcrypt
import string
import random
import os
import datetime

app = Flask(__name__)
app.secret_key = 'FIT2101G24'
bcrypt = Bcrypt(app)
password_change_count = {}


class All_Users(ABC):
    def __init__(self, id: int, username: str, password: Bcrypt = None):
        self.id = id
        self.username = username
        if password is None:
            password = self.create_password()

        self.password = bcrypt.generate_password_hash(password)

    def create_password(self) -> str:
        characters = string.ascii_letters + string.digits + string.punctuation
        password = ''.join(random.choice(characters) for i in range(8))
        return password

    def __repr__(self):
        return f'<User: {self.username}>'


class General_Users(All_Users):
    def __init__(self, id: int, username: str, password: Bcrypt = None):
        super().__init__(id, username, password)

    def __repr__(self):
        return f'<General User: {self.username}> , <Password : {self.password}>'


class Admin_Users(All_Users):
    def __init__(self, id: int, username: str, password: Bcrypt = None):
        super().__init__(id, username, password)

    def __repr__(self):
        return f'<Admin User: {self.username}>'


users = []
users.append(General_Users(
    id=1, username='mabe0012@student.monash.edu', password='password'))
users.append(Admin_Users(
    id=2, username='milniabeysekara02@gmail.com', password=None))


app = Flask(__name__)
db_path = os.path.join(os.path.dirname(__file__), 'app.db')
db_uri = 'sqlite:///{}'.format(db_path)
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
db = SQLAlchemy(app)
app.secret_key = 'FIT2101G24'


class TaskDB(db.Model):
    __tablename__ = "task"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='To Do')
    sprint_id = db.Column(db.Integer, nullable=False)
    assignee = db.Column(db.String(20), nullable=False)


with app.app_context():
    db.create_all()


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

        valid_user = []

        # checks if the username inserted is valid
        for i in range(len(users)):
            if users[i].username == username:
                valid_user.append(users[i])
                user = valid_user[0]  # takes that first user

        # if there is no valid user name inserted
        if not valid_user:
            error = 'Invalid username or password'
            return render_template('test_login.html', error=error)

        # checks if user and password is TRUE
        if user and bcrypt.check_password_hash(user.password, password):
            if isinstance(user, General_Users):
                session['user_id'] = user.id
                return redirect(url_for('index'))
            elif isinstance(user, Admin_Users):
                session['user_id'] = user.id
                # need to add a general admin page here to redirect to first
                return redirect(url_for('index_admin'))
        else:
            error = 'Invalid username or password'
            return render_template('test_login.html', error=error)

    return render_template('test_login.html')

# Note: both index and index_admin share the same information, if edits are made to general users ,
# edits are made to admin as well.


@app.route('/update_password', methods=['GET', 'POST'])
def update_password():
    if request.method == 'POST':
        username = request.form['username']
        new_password = request.form['new_password']

        # Check if the provided username matches any user's username
        user = next((u for u in users if u.username == username), None)

        if user:
            if username in password_change_count and password_change_count[username] >= 3:
                flash('Password change limit exceeded. Try again later.', 'error')
            else:
                # Update the user's password
                user.password = bcrypt.generate_password_hash(new_password)

                if username in password_change_count:
                    password_change_count[username] += 1
                else:
                    password_change_count[username] = 1

                flash('Password changed successfully.', 'success')
                # Redirect to the login page after successful password update
                return redirect(url_for('login'))

        else:
            flash('Invalid username. Password not changed.', 'error')

    return render_template('update_password.html')


@app.route('/past_sprints')
def past_sprints():
    sprints = []  # list to store sprint data

    # get distinct sprint id
    sprint_ids_tuples = db.session.query(TaskDB.sprint_id).distinct().all()
    sprint_ids = [sprint_id[0] for sprint_id in sprint_ids_tuples]

    # this allows me to display the tasks by sprint id
    for sprint_id in sprint_ids:
        tasks_todo = TaskDB.query.filter_by(
            sprint_id=sprint_id, status='To Do').all()
        tasks_doing = TaskDB.query.filter_by(
            sprint_id=sprint_id, status='Doing').all()
        tasks_done = TaskDB.query.filter_by(
            sprint_id=sprint_id, status='Done').all()

    # using a dict so as an easy way to pass in the info to the html
        sprint_info = {
            'id': sprint_id,
            'tasks_todo': tasks_todo,
            'tasks_doing': tasks_doing,
            'tasks_done': tasks_done
        }

        sprints.append(sprint_info)

    return render_template('past_sprints.html', sprints=sprints)

# this is my special index to add tasks into the database, as i couldnt 
# find a way to do it within the html it was implemented

@app.route('/add_task', methods=['GET', 'POST'])
def add_task():
    if request.method == 'POST': # input each attribute of the database
        name = request.form['name']
        status = request.form['status']
        sprint_id = request.form['sprint_id']
        assignee = request.form['assignee']

        #create the task object
        new_task = TaskDB(name=name, status=status, sprint_id=sprint_id, assignee=assignee)

        # add to session
        db.session.add(new_task)

        # commit transaction
        db.session.commit()

    return render_template('add_task.html')


@app.route('/index')
def index():
    if not g.user:
        return redirect(url_for('login'))

    return render_template('index.html')


@app.route('/index_admin')
def index_admin():
    if not g.user:
        return redirect(url_for('login'))

    return render_template('index.html')


@app.route('/plot')
def user_burndowncharts():
    K = 14  # range of burndown chart
    start = datetime.date(2023, 9, 4)
    start2 = datetime.date(2023, 9, 18)
    start3 = datetime.date(2023, 10, 2)
    labels = []
    labels2 = []
    labels3 = []

    values = []
    values2 = []
    values3 = []

    val = 100
    val2 = 100
    val3 = 100

    for day in range(K):
        date = (start + datetime.timedelta(days=day)).isoformat()
        date2 = (start2 + datetime.timedelta(days=day)).isoformat()
        date3 = (start3 + datetime.timedelta(days=day)).isoformat()

        labels.append(date)
        labels2.append(date2)
        labels3.append(date3)

        val -= random.randint(0, 100//14)
        val2 -= random.randint(0, 100//14)
        val3 -= random.randint(0, 100//14)

        values.append(val)
        values2.append(val2)
        values3.append(val3)

    return render_template("graph.html", labels=labels, values=values, labels2=labels2, values2=values2, labels3=labels3, values3=values3)

@app.route('/instructions')
def user_instruction_page(): 
    return render_template("instructions.html")

if __name__ == "__main__":
    # when launching flask into production env, set it to false
    app.run(debug=True)
