// In the local __init__.py:

// 1 import the blueprints you wish to use //
from shared.blueprints.atlas import bp as atlas_blueprint
from shared.blueprints.base import bp as base_blueprint

// 2 Register the child blueprints to base //
base_blueprint.register_blueprint(atlas_blueprint)

// Register blueprint to app //
app.register_blueprint(base_blueprint)