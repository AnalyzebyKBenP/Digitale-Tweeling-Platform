from flask import Blueprint, current_app, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user
from werkzeug.security import check_password_hash
from .models import User

bp = Blueprint('auth', __name__,template_folder='templates')

@bp.route('/login')
def login():
    return render_template("auth/login.html", **current_app.config['vars_to_pages'])

@bp.route('/login', methods=['POST'])
def login_post():

    email = request.form.get('email')
    password = request.form.get('password')
    remember = True if request.form.get('remember') else False

    user = User.query.filter_by(email=email).first()

    # check if the user actually exists
    # take the user-supplied password, hash it, and compare it to the hashed password in the database
    if not user or not check_password_hash(user.password, password):
        flash('Please check your login details and try again.')
        return redirect(url_for('auth.login')) # if the user doesn't exist or password is wrong, reload the page
    
    # if the above check passes, then we know the user has the right credentials
    login_user(user, remember=remember)
    # login code goes here
    return redirect(url_for('base.home'))

@bp.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('base.home'))

