from flask import request
from flask_login import UserMixin
import requests

# here, because relative import was giving errors
class OpenIDUser(UserMixin):
    def __init__(self,token):
        self.id = token['user_id']
        self.claims = token['user_claims']

    @property
    def name(self):
        return self.getClaimValue('name')
    
    @property
    def email(self):
        return self.getClaimValue('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress')
    
    @property
    def is_sso_user(self):
        return True
    
    def getClaimValue(self,claimname):
        for x in self.claims:
            if x['typ'] == claimname:
                return x['val']
        else:
            return None

class TestUser(UserMixin):
    def __init__(self):
        self.id = 'test'
        self.claims = []

    @property
    def name(self):
        return 'testuser'
    
    @property
    def email(self):
        return 'test@user.com'
    
    @property
    def is_sso_user(self):
        return False

def get_user_from_token():
    # get current user's session
    cookie=request.cookies.get('AppServiceAuthSession')
    if not cookie:
        return None #not logged in
    
    # get current user's token
    headers = dict()
    headers['Cookie']= f'AppServiceAuthSession={cookie}'
    response = requests.get('https://'+request.host+'/.auth/me',headers=headers)
    
    # reponse parsing
    r=response.json()
    if(len(r)==0):
        # if no token obtained => refresh token
        requests.get('https://'+request.host+'/.auth/refresh',headers=headers)
        response = requests.get('https://'+request.host+'/.auth/me',headers=headers)
        r=response.json()
    try:
        r=r[0]
    except:
        # Could not obtain user token
        # Behave like user isn't logged in
        return None

    # fill user class based on token info
    return OpenIDUser(r)
