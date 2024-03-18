# Required as we are running Flask from a folder, not root
import sys
sys.path.append("..")

from flask import Flask, render_template, current_app, request
from os import environ
from shared.blueprints.utility.utility import generateBuildString, getAppInsightsKey
from flask_compress import Compress
compress = Compress()

try:
    # take environment variables from .env.
    from dotenv import load_dotenv
    load_dotenv()  # take environment variables from .env.
except:
    pass

def create_app():
    app = Flask(__name__.split('.')[0])
    app.secret_key = 'syCkA5D37ky8xFNqFbTe'

    # Read .env vars
    AzureMapsClientId = environ.get('AzureMapsClientId')
    GeoserverAuth = environ.get('GeoserverAuth')
    CesiumDefaultAccessToken = ''
    buildstring = generateBuildString(environ.get('build_id'))
    app.config['subscription_id'] = environ.get('subscription_id')
    app.config['customer']='Example'

    # Bundle variables which should be passed to all routes/maps
    # These variables can be accessed by all blueprints
    app.config['vars_to_pages'] = {
        'Build': buildstring,
        'customer': app.config['customer'],
        'appInsightsKey': getAppInsightsKey(environ.get('APPLICATIONINSIGHTS_CONNECTION_STRING'))
    }
    app.config['vars_to_maps'] = {
        'AzureMapsClientId': AzureMapsClientId,
        'GeoserverAuth': GeoserverAuth,
        'CesiumDefaultAccessToken': CesiumDefaultAccessToken
    }

    # Blueprints
    from shared.blueprints.base import bp as base_blueprint
    app.register_blueprint(base_blueprint)
    from shared.blueprints.auth import bp as auth_blueprint
    app.register_blueprint(auth_blueprint,url_prefix='/auth')
    from shared.blueprints.api import bp as api_blueprint
    app.register_blueprint(api_blueprint,url_prefix='/api')
    from shared.blueprints.atlas import bp as atlas_blueprint
    app.register_blueprint(atlas_blueprint,url_prefix='/atlas')

    # Routes specific to this app
    @app.route('/twin')
    def twin_holder():
        return render_template('atlas_extended.html', **current_app.config['vars_to_pages'], mapURL='/twin_map')

    @app.route("/contact")
    def contact():
        return render_template('contact_extended.html', **current_app.config['vars_to_pages'], mapURL='/contact')
    
    @app.route("/veelgestelde-vragen")
    def faq():
        return render_template('faq_extended.html', **current_app.config['vars_to_pages'], mapURL='/veelgestelde-vragen')

    if __name__ == "__main__":
        from wsgi import app
        app.run()

    compress.init_app(app)

    return app