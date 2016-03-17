import requests
import flask
from flask import Flask, request, render_template, jsonify, redirect, url_for
from flask.ext.sqlalchemy import SQLAlchemy
from logging import Formatter, FileHandler
from optparse import OptionParser
import models
import controller
from flask_webpack import Webpack
from os import path

here = path.abspath(path.dirname(__file__))


app = Flask(__name__)
app.config["WEBPACK_MANIFEST_PATH"] = path.join(here, "manifest.json")
webpack = Webpack()
webpack.init_app(app)
app.config.from_object('config')

# This is the format to retreive from config.py
# print app.config.get('CLIENT_ID')

PORT = 5000
API_SERVER = "api.23andme.com"
BASE_CLIENT_URL = 'http://localhost:%s/'% PORT
DEFAULT_REDIRECT_URI = '%sreceive_code/'  % BASE_CLIENT_URL
CLIENT_ID = app.config.get('CLIENT_ID')
CLIENT_SECRET = app.config.get('CLIENT_SECRET')
REDIRECT_URI = app.config.get('REDIRECT_URI')
SNPS = ["rs12913832"]
DEFAULT_SCOPE = "names basic email ancestry relatives %s" % (" ".join(SNPS))

parser = OptionParser(usage = "usage: %prog -i CLIENT_ID [options]")
parser.add_option("-i", "--client_id", dest="client_id",
        help="Your client_id [REQUIRED]", default ='')
parser.add_option("-s", "--scope", dest="scope",
        help="Your requested scope [%s]" % DEFAULT_SCOPE, default = DEFAULT_SCOPE)
parser.add_option("-r", "--redirect_uri", dest="redirect_uri",
        help="Your client's redirect_uri [%s]" % DEFAULT_REDIRECT_URI, default = DEFAULT_REDIRECT_URI)
parser.add_option("-a", "--api_server", dest="api_server",
        help="Almost always: [api.23andme.com]", default = API_SERVER)

(options, args) = parser.parse_args()
BASE_API_URL = "https://%s/" % options.api_server


@app.route('/')
def home():
    auth_url = "%sauthorize/?response_type=code&redirect_uri=%s&client_id=%s&scope=%s" % (BASE_API_URL, REDIRECT_URI, CLIENT_ID, DEFAULT_SCOPE)
    return render_template('index.html', auth_url=auth_url)

@app.route('/get_info/')
def getUser():
    return
   #  look into database, query for user information then return response with all of user's data

@app.route('/receive_code/')
def receive_code():
    print 'receive_code is being called'
    parameters = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': request.args.get('code'),
        'redirect_uri': REDIRECT_URI,
        'scope': DEFAULT_SCOPE
    }
    response = requests.post(
        "%s%s" % (BASE_API_URL, "token/"),
        data = parameters,
        verify=False
    )
    #get access token from 23andMe
    if response.status_code == 200:
        access_token = response.json()['access_token']
        headers = {'Authorization': 'Bearer %s' % access_token}
        #Begin API calls to 23andMe to get all scoped user data
        genotype_response = requests.get("%s%s" % (BASE_API_URL, "1/genotype/"),
                                         params = {'locations': ' '.join(SNPS)},
                                         headers=headers,
                                         verify=False)
        print 'GENOTYPE RESPONSE FROM CREATE NEW USER FN', genotype_response.json()
        user_response = requests.get("%s%s" % (BASE_API_URL, "1/user/?email=true"),
                                         headers=headers,
                                         verify=False)
        #if both API calls are successful, process user data
        if user_response.status_code == 200 and genotype_response.status_code == 200:
            user_profile_id = genotype_response.json().pop()['id']
            #if user already exists in database, render the html and do not re-add user to database
            if len(models.db_session.query(models.User).filter_by(profile_id=user_profile_id).all()) != 0:
                return flask.render_template('main.html', response_json = genotype_response.json())
            # otherwise, add new user to database if they have never logged in before
            else:
                #Begin API calls to 23andMe to get additional user data
                name_response = requests.get("%s%s" % (BASE_API_URL, "1/names/%s" % user_profile_id),
                                                 headers=headers,
                                                 verify=False)
                relatives_response = requests.get("%s%s" % (BASE_API_URL, "1/relatives/%s" % user_profile_id),
                                         params = {'limit': 20, 'offset': 1},
                                         headers=headers,
                                         verify=False)

                #call createNewUser from controller to add User and User relatives to the database
                controller.createNewUser(name_response, relatives_response, genotype_response, user_response)

                return flask.render_template('main.html', response_json = genotype_response.json())
        #error handling if api calls for additional user data to 23andMe fail
        else:
            reponse_text = genotype_response.text
            response.raise_for_status()
    #error handling if initial api calls to 23andMe fail
    else:
        response.raise_for_status()



if __name__ == '__main__':
  print 'Server has been initialized on port 5000'
  app.run(debug=True, port=5000)
