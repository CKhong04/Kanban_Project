 
from flask import (
    Flask,
    g,
    redirect,
    render_template,
    request,
    session,
    url_for
)
from abc import ABC
from flask_bcrypt import Bcrypt
import string
import random 
app = Flask(__name__)
app.secret_key = 'FIT2101G24'
bcrypt = Bcrypt(app)


class All_Users(ABC): 
    def __init__(self, id:int, username:str, password:Bcrypt=None): 
        self.id = id
        self.username = username
        if password is None: 
            password = self.create_password()
        
        self.password = bcrypt.generate_password_hash(password)

    def create_password(self) -> str : 
        characters = string.ascii_letters + string.digits + string.punctuation
        password = ''.join(random.choice(characters) for i in range(8))
        return password 
    
    def __repr__(self):
        return f'<User: {self.username}>'

class General_Users(All_Users):
    def __init__(self, id:int, username:str, password:Bcrypt=None):
        super().__init__(id, username, password)
    def __repr__(self):
        return f'<General User: {self.username}> , <Password : {self.password}>'
    
class Admin_Users(All_Users): 
    def __init__(self, id:int, username:str, password:Bcrypt=None):
        super().__init__(id, username, password)

    def __repr__(self):
        return f'<Admin User: {self.username}>'
    

users = []
users.append(General_Users(id=1, username='mabe0012@student.monash.edu', password='password'))
users.append(Admin_Users(id=2, username='milniabeysekara02@gmail.com', password=None)) 



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
            if users[i].username == username : 
                valid_user.append(users[i])
                user = valid_user[0] # takes that first user
        
        # if there is no valid user name inserted 
        if not valid_user: 
            error = 'Invalid username or password'
            return render_template('test_login.html', error=error)
        
        # checks if user and password is TRUE
        if user and bcrypt.check_password_hash(user.password, password): 
            if isinstance(user, General_Users): 
                session['user_id'] = user.id
                return redirect(url_for('index'))
            elif isinstance(user, Admin_Users) : 
                session['user_id'] = user.id 
                # need to add a general admin page here to redirect to first 
                return redirect(url_for('index_admin'))
        else : 
            error = 'Invalid username or password'
            return render_template('test_login.html', error=error)
            
    return render_template('test_login.html')

#Note: both index and index_admin share the same information, if edits are made to general users , 
# edits are made to admin as well. 
@app.route('/index')
def index():
    if not g.user:
        return redirect(url_for('login'))

    return render_template('index.html')

@app.route('/index_admin')
def index_admin():
    if not g.user:
        return redirect(url_for('login'))

    return render_template('index_admin.html')

if __name__ == "__main__": 
    app.run(debug=True) # when launching flask into production env, set it to false 