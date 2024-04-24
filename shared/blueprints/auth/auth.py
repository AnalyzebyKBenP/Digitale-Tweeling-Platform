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
    # response = '[{"access_token":"eyJ0eXAiOiJKV1QiLCJub25jZSI6InE4V0k5RkY3QXNsMHVtU1FKOExVYVA5aVFBa3NqcjZvX2pXM3cycWQxU0EiLCJhbGciOiJSUzI1NiIsIng1dCI6IlhSdmtvOFA3QTNVYVdTblU3Yk05blQwTWpoQSIsImtpZCI6IlhSdmtvOFA3QTNVYVdTblU3Yk05blQwTWpoQSJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9lMjA3YjViZi0xOGM4LTQ3ZWItOTFiYS05ZThiYTQxOTFhZDEvIiwiaWF0IjoxNzEwMzE5NzE3LCJuYmYiOjE3MTAzMTk3MTcsImV4cCI6MTcxMDMyMzg2OCwiYWNjdCI6MSwiYWNyIjoiMSIsImFpbyI6IkFXUUFtLzhXQUFBQWt6eDhtamxraGVZdU9LaW9SY0hCN3NJVlQ0cERBVnBQT0ZQd1RKcEJLcW8rNzVNZHhERmVmOWhkenN3OHRlWVBtVFVhOWlQWlkyaWtWYjY4bFZFU1NKVzdWU1AwaHhpYTlkVVdidllISXMzR3Z6WkJXSE1LcWpiLzdOSzE4T3VQIiwiYWx0c2VjaWQiOiI1OjoxMDAzMjAwMkRDQTZERDM1IiwiYW1yIjpbInB3ZCJdLCJhcHBfZGlzcGxheW5hbWUiOiJEVFAtYWxsLVNTTyIsImFwcGlkIjoiMDk4MTMwMGMtNjdhOS00MmZiLTkzYTgtYzI2ZWI0NTYxMWVlIiwiYXBwaWRhY3IiOiIxIiwiZW1haWwiOiJyaW56ZS50ZW5rYXRlQGtiZW5wLm5sIiwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNzA5NmIwYTgtN2U3Mi00YzMyLWJmOWQtNDUxZjcyYmZkNmJjLyIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjIxMy4xMjQuODIuMTg2IiwibmFtZSI6IlJpbnplIFRlbiBLYXRlIDogS0JlblAiLCJvaWQiOiI5MWM1MmY5NC04YjA0LTRkNjgtYTg0Ny1iMzEwMDc3NTczMWMiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzIwMDJFRkIzODlBNyIsInJoIjoiMC5BWG9BdjdVSDRzZ1k2MGVSdXA2THBCa2EwUU1BQUFBQUFBQUF3QUFBQUFBQUFBQjZBRFUuIiwic2NwIjoiZW1haWwgb3BlbmlkIHByb2ZpbGUiLCJzdWIiOiJxMmtvenBURGpEQm5NUklBQWd2VmNRM1Qzc0ZYNU00ZG5CbGl4ZlRjQW1RIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IkVVIiwidGlkIjoiZTIwN2I1YmYtMThjOC00N2ViLTkxYmEtOWU4YmE0MTkxYWQxIiwidW5pcXVlX25hbWUiOiJyaW56ZS50ZW5rYXRlQGtiZW5wLm5sIiwidXRpIjoiMjJyTzgzTGxrMENLSDhkeFhIWk1BQSIsInZlciI6IjEuMCIsIndpZHMiOlsiMTNiZDFjNzItNmY0YS00ZGNmLTk4NWYtMThkM2I4MGYyMDhhIl0sInhtc19zdCI6eyJzdWIiOiI2MFNzVGkwNW02WW1nel9VWjRGZUNRa2J2ekc0NE1DT0FVTVY4TVJjcFQ4In0sInhtc190Y2R0IjoxNjA4MzAzMjc3LCJ4bXNfdGRiciI6IkVVIn0.rpoz9rW44Cr4wfgW42LzA2vZlwi8m_FoN1-FydDNMilZopBE6xiJ5MRwKaqV6Tiw3cuoBQ02JZkDgWcPZh6qUloCmRrKGcT-eFm5QmzRNJgyjJUbhphSAp5bb1TofrP4yNZwSIS6YTxMeTotL_s4yPd3IHWhfAo5H1Ys5pyvRTITsy7Pb1FhegusuLvnMRaWfnEfgbt0ZVjk7PXtzJ-Y5feULswJ4oOLHSqL0C76cQEHxzmfDPliZmi2b9Yl4VpyZ_QaCbquYllWSz5oFa3vV1J8-oOV9QL9KeCK_V2Ocje3qNVy-0OJNRuqE9rZ0qFkNQhP3YJ8pHUge6rNEHjD8w","expires_on":"2024-03-13T09:57:48.1436188Z","id_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlhSdmtvOFA3QTNVYVdTblU3Yk05blQwTWpoQSJ9.eyJhdWQiOiIwOTgxMzAwYy02N2E5LTQyZmItOTNhOC1jMjZlYjQ1NjExZWUiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vZTIwN2I1YmYtMThjOC00N2ViLTkxYmEtOWU4YmE0MTkxYWQxL3YyLjAiLCJpYXQiOjE3MTAzMTk3MTcsIm5iZiI6MTcxMDMxOTcxNywiZXhwIjoxNzEwMzIzNjE3LCJhaW8iOiJBWFFBaS84V0FBQUE4OXRtMHhHTENzTUt6cFFxZUVyc2x4UmJGMFhwSG9xZGJVRnBRaHJ4UEEwa2MwUENZLzE0UnRNL21IM0RXOHNEV1FUWEZrUmRYeFllc0dvbGhYOGVydUVCZjRDektlM1RocnErcW56YVR2R1hlMlpwVXRXVjRqbGoyRmd5cW4rSUliL2FHRnRpT3A5YkUzbkU2ZXZhZXc9PSIsImVtYWlsIjoicmluemUudGVua2F0ZUBrYmVucC5ubCIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzcwOTZiMGE4LTdlNzItNGMzMi1iZjlkLTQ1MWY3MmJmZDZiYy8iLCJuYW1lIjoiUmluemUgVGVuIEthdGUgOiBLQmVuUCIsIm5vbmNlIjoiZTk4NzhiZDgwMjc0NDI5Y2FkMjFkYjQ3ZmQ2NDBmNTdfMjAyNDAzMTMwODU4MzYiLCJvaWQiOiI5MWM1MmY5NC04YjA0LTRkNjgtYTg0Ny1iMzEwMDc3NTczMWMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJSaW56ZS5UZW5LYXRlQGtiZW5wLm5sIiwicmgiOiIwLkFYb0F2N1VINHNnWTYwZVJ1cDZMcEJrYTBRd3dnUW1wWl90Q2s2akNiclJXRWU1NkFEVS4iLCJzdWIiOiI2MFNzVGkwNW02WW1nel9VWjRGZUNRa2J2ekc0NE1DT0FVTVY4TVJjcFQ4IiwidGlkIjoiZTIwN2I1YmYtMThjOC00N2ViLTkxYmEtOWU4YmE0MTkxYWQxIiwidXRpIjoiMjJyTzgzTGxrMENLSDhkeFhIWk1BQSIsInZlciI6IjIuMCJ9.aOeczUIStS7WRL6N-5isEwR599IlHt4oZtWCdDHPKz4iqmMy7dH_c-CnwD4u4ZnDiGyb0LFthX6yK9kUxdrVkoj0jdtkm9TEEQA5y1Jnke_S-S-9pKnLC_DpHcoGI2ARiIVEnrLb-XLlpAOKDXbB1KJnZodXJFztLekOBjPBN5WbDJ_SrAWUYgshNEd8TmPArIFzRUigE_j-IE6vmxTjm5MWYsGsYJjD2PDPSCjF98ctCRMaKbxyCvePsTLDzWmtaNHkPm42KSujCAIrT74ZcrCkheJRyMtxvl1L0flplttdqjOt18HJdJfjcYOM1E4Ek13HFuJpVC-Eu9_nr3VLsQ","provider_name":"aad","user_claims":[{"typ":"aud","val":"0981300c-67a9-42fb-93a8-c26eb45611ee"},{"typ":"iss","val":"https:\/\/login.microsoftonline.com\/e207b5bf-18c8-47eb-91ba-9e8ba4191ad1\/v2.0"},{"typ":"iat","val":"1710319717"},{"typ":"nbf","val":"1710319717"},{"typ":"exp","val":"1710323617"},{"typ":"aio","val":"AXQAi\/8WAAAAQz5ctetpWJG+uHiO4XnebHxdHLCpxnOSBMnPJC9dRaZAM0L8JJi2OPHJrVC7d++h5TRf3hqhJ3jRZM053k6oed+jbvhns13KM2kStrt+iKJCRUqoG7cwAjis2bGPHv9leIDrZK+3v+XJz1gjq1btcw=="},{"typ":"c_hash","val":"SJrYQ7FANUNtdOWgBgjZUg"},{"typ":"http:\/\/schemas.xmlsoap.org\/ws\/2005\/05\/identity\/claims\/emailaddress","val":"rinze.tenkate@kbenp.nl"},{"typ":"http:\/\/schemas.microsoft.com\/identity\/claims\/identityprovider","val":"https:\/\/sts.windows.net\/7096b0a8-7e72-4c32-bf9d-451f72bfd6bc\/"},{"typ":"name","val":"Rinze Ten Kate : KBenP"},{"typ":"nonce","val":"e9878bd80274429cad21db47fd640f57_20240313085836"},{"typ":"http:\/\/schemas.microsoft.com\/identity\/claims\/objectidentifier","val":"91c52f94-8b04-4d68-a847-b3100775731c"},{"typ":"preferred_username","val":"Rinze.TenKate@kbenp.nl"},{"typ":"rh","val":"0.AXoAv7UH4sgY60eRup6LpBka0QwwgQmpZ_tCk6jCbrRWEe56ADU."},{"typ":"http:\/\/schemas.xmlsoap.org\/ws\/2005\/05\/identity\/claims\/nameidentifier","val":"60SsTi05m6Ymgz_UZ4FeCQkbvzG44MCOAUMV8MRcpT8"},{"typ":"http:\/\/schemas.microsoft.com\/identity\/claims\/tenantid","val":"e207b5bf-18c8-47eb-91ba-9e8ba4191ad1"},{"typ":"uti","val":"mpURTrUONEm8KXZ7M-JnAA"},{"typ":"ver","val":"2.0"}],"user_id":"rinze.tenkate@kbenp.nl"}]'
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
