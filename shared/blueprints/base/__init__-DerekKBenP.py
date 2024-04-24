from flask import Blueprint, render_template, request, current_app, send_file
from jinja2 import TemplateNotFound

import urllib.request
from urllib.parse import urlencode
from azure.communication.email import EmailClient
import json
import requests
from PIL import Image
from io import BytesIO

import os

bp = Blueprint('base', __name__,static_folder='static',static_url_path='/base/static',template_folder='templates')

@bp.route('/')
def home():
    return render_template("base/home.html", **current_app.config['vars_to_pages'])

@bp.route("/makelegend", methods=['POST'])
def makelegend():
    parsedData=request.get_json(force=True)

    # base_path = os.path.join("C:\\Git\\DigitaleTweelingPlatform\\shared\\blueprints\\atlas\\templates\\", 'base', 'components', 'legendentries')
    
    # Iterate through each group and entry to check file existence
    for group in parsedData:

        try:
            if parsedData[group] is not None:  # Check if the group is defined
                for entry in parsedData[group]['items']:
                    
                    # Check if the file exists
                    # TODO: this actually load the file, hence quite resource intensive, replace
                    exists = template_exists(f"atlas/components/legendentries/leg_{entry['layerName'].lower()}.html")

                    if exists:
                        # If the file does not exist, add a key to indicate this
                        entry['has_legend_html'] = True
                    else:
                        entry['has_legend_html'] = False
            return render_template('atlas/components/legend.html', parsedData=request.get_json(force=True))
        except:
            return ''

def template_exists(template_name):
    try:
        # Try to load the template
        current_app.jinja_env.get_template(template_name)
        return True
    except TemplateNotFound:
        return False
    
##################################### 
# Contact formulier verwerking
# Vereist een contact formulier pagina bij de klant zelf, bijvoorbeeld:
# @app.route("/contact")
# def contact():
#     return render_template('base/contact.html', **current_app.config['vars_to_pages'], mapURL='/contact')
#####################################

#TODO: handle additional form inputs (if present)
#TODO: handle contact_email containing multiple addresses

@bp.route('/contact', methods=['POST'])
def contact_post():
    try:
        captchaServerSecret=current_app.config['captchaServerSecret']
    except:
        captchaServerSecret=''
    try:
        AzureCommunicationServiceConnString=current_app.config['AzureCommunicationServiceConnString']
        AzureCommunicationServiceSenderAddress=current_app.config['AzureCommunicationServiceSenderAddress']
    except:
        AzureCommunicationServiceConnString=''
    try:
        contact_email=current_app.config['contact_email']
    except:
        contact_email='<eric.wessels@kbenp.nl>'

    # Captcha output
    token = request.form.get("g-recaptcha-response")
    
    # Captcha token to True/False value stored in variable 'valid'
    try:
        dictToSend = {'secret':captchaServerSecret, 'response':token}
        url_encoded_data = urlencode(dictToSend)
        post_data = url_encoded_data.encode("utf-8")
        res = urllib.request.urlopen('https://www.google.com/recaptcha/api/siteverify', data=post_data)
        string = res.read().decode('utf-8')
        resDict=json.loads(string)
        valid = resDict['success']
    except:
        valid = False
    
    if captchaServerSecret=='' or AzureCommunicationServiceConnString=='' or AzureCommunicationServiceSenderAddress=='':
        valid = False
        print('Contact settings not valid')

    naam = request.form.get("naam")
    email = request.form.get("email")
    bericht = request.data

    # Sending email, if captcha was okay
    # use multiple email
    # https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/email/send-email-advanced/send-email-to-multiple-recipients?tabs=connection-string&pivots=programming-language-csharp
    if valid:
        email_client = EmailClient.from_connection_string(AzureCommunicationServiceConnString)
        message = {
            "content": {
                "subject": "Bericht via het contactformulier van de Digitale Tweeling",
                "html": f"""<html>Beste,<br /><br />
                    Er is een nieuw bericht verstuurd vanuit de Digitale Tweeling:<br />
                    Afzender: {naam} <br />
                    Email: {email}<br />
                    Bericht:<br />{bericht}<br /><br />
                    *Einde bericht*</html>"""
            },
            "recipients": {
                "to": [
                    {"address": contact_email, "displayName": "contactform"}
                ]
            },
            "senderAddress": "<DoNotReply@b002e6f7-7e5f-4026-87cd-e9f785283e19.azurecomm.net>"
        }
        email_client.begin_send(message)
        return render_template("contact_success.html",message="Bedankt voor het invullen!")
    return render_template("contact_success.html",message="Uw reactie is niet opgeslagen vanwege een interne fout. Contacteer de beheerder (zie \"Contact\" in de footer).")


#####################################
# Image converter naar Webp
#####################################

@bp.route('/webp')
def webp():

    #####################################################
    # To generate webp
    # {{ url_for('base.webp', filename='/static/images/banners/home/LuchtfotoUitgeest-large.jpg') }}
    #####################################################

    cache_dir = os.path.join(current_app.root_path,'static\images\webp\\')

    os.makedirs(cache_dir, exist_ok=True) # Make cache dir if needed
    image = request.args.get('filename')
    filename = remove_directories_from_url(image)
    name = os.path.splitext(filename)[0]
    cached_file = cache_dir + name + '.webp'

    ## Check if wepb local image exists ##
    if os.path.exists(cached_file):
        return send_file(cached_file, mimetype='image/webp')

    ## Convert external image ##
    # if image.startswith('http://') or image.startswith('https://'):
    #     img = open_image_from_url(image)
    #     img.save(cached_file, 'WEBP', quality=60)

    #     return send_file(cached_file, mimetype='image/webp')
    
    ## Convert local image ##
    if not image.startswith('http://') or not image.startswith('https://'):
        if(request.is_secure):
            protocol = 'https://'
        else:
            protocol = 'http://'
            
        img = open_image_from_url(protocol + request.host + image)
        img.save(cached_file, 'WEBP', quality=60)
            
        return send_file(cached_file, mimetype='image/webp')

def remove_directories_from_url(url):
    # Extract the filename from the URL
    filename = os.path.basename(url)
    return filename

def open_image_from_url(url):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            image = Image.open(BytesIO(response.content))
            return image
        else:
            print("Failed to download image")
            return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None