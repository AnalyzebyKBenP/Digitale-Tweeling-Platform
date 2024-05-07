from flask import (
    Blueprint,
    current_app,
    Response,
    request,
    abort,
    render_template,
    make_response,
)
from datetime import datetime, timedelta
from azure.mgmt.storage import StorageManagementClient
from azure.storage.blob import (
    generate_account_sas,
    ResourceTypes,
    AccountSasPermissions,
)
from shared.blueprints.utility.utility import isApproved
import os

# from flask_login import login_required

bp = Blueprint("api", __name__)

try:
    # take environment variables from .env in order to use the DefaultAzureCredential when running locally
    from dotenv import load_dotenv

    load_dotenv()
except:
    # When deployed, uses a ManagedIdentityCredential
    pass

##########################################################
# Login to azure                                         #
##########################################################
# Login to azure using WebApp credentials
from azure.identity import DefaultAzureCredential

credential = DefaultAzureCredential()

##########################################################
# Helper functions                                       #
##########################################################


def generatesas(staccname, k):
    rt = ResourceTypes(object=True)
    p = AccountSasPermissions(read=True)
    e = datetime.utcnow() + timedelta(hours=8)
    s = generate_account_sas(
        account_name=staccname,
        account_key=k,
        resource_types=rt,
        permission=p,
        expiry=e,
        protocol="https",
    )
    sas[staccname] = s
    return s


keys = {}
sas = {}


def getsas(staccname, sub_id):
    # Testing parameters
    try:
        s = sas[staccname]
        # get expiry from sas
        result = [i for i in s.split("&") if i.startswith("se=")]
        exptime = datetime.strptime(
            result[0][3:].replace("%3A", ":"), "%Y-%m-%dT%H:%M:%SZ"
        )
        if exptime < (datetime.utcnow() + timedelta(hours=2)):
            return generatesas(staccname, keys[staccname])
        return s
    except KeyError:
        try:
            k = keys[staccname]
        except KeyError:
            # Key not yet known
            try:
                a = storage_client.storage_accounts.list()
            except:
                # make storage_client
                storage_client = StorageManagementClient(credential, sub_id)
                a = storage_client.storage_accounts.list()
            for b in list(a):
                if b.name == staccname.lower():
                    id = b.id.split("/")
                    rg = id[id.index("resourceGroups") + 1]
                    storage_keys = storage_client.storage_accounts.list_keys(
                        rg, staccname
                    )
                    storage_keys = {v.key_name: v.value for v in storage_keys.keys}
                    keys[staccname] = storage_keys["key1"]
                    k = keys[staccname]
        return generatesas(staccname, k)


##########################################################
# App pages/routes                                       #
##########################################################


# Get map token for anonymous login
@bp.route("/maptoken")
# @login_required
def generate_maptoken():
    host = request.host
    customer = current_app.config["customer"]
    if not isApproved(host, customer):
        # This check is needed as -depending on configuration- the WebApp might be public access
        print("URL of the current (web)app is not in approved_clients list: %s", host)
        abort(
            403,
            description=f"URL of the current (web)app is not in approved_clients list: {host}",
        )
    else:
        return Response(
            credential.get_token("https://atlas.microsoft.com/.default").token,
            status=200,
            mimetype="text/plain",
        )


@bp.route("/get_sas", methods=["GET", "POST"])
# @login_required
def get_sas():
    host = request.host
    customer = current_app.config["customer"]

    data = request.get_json(force=True)
    staccname = data["staccname"]
    try:
        sub_id = data["sub_id"]
    except:
        sub_id = current_app.config["subscription_id"]

    if not isApproved(host, customer):
        # This check is needed as -depending on configuration- the WebApp might be public access
        print("URL of the current (web)app is not in approved_clients list: %s", host)
        abort(
            403,
            description=f"URL of the current (web)app is not in approved_clients list: {host}",
        )
    else:
        return Response(getsas(staccname, sub_id), status=200, mimetype="text/plain")


@bp.route("/healthcheck")
def healthcheck():
    return "healthy"


@bp.route("/brewcoffeeplease")
def brewcoffee():
    return Response("I'm a teapot", status=418, mimetype="text/plain")
