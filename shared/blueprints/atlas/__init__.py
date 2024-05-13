from flask import Blueprint, render_template, request, current_app, make_response

bp = Blueprint('atlas', __name__,static_folder='static',static_url_path='/atlas/static',template_folder='templates')
