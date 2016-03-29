import requests
import flask
from flask import Flask, request, render_template, jsonify, redirect, url_for, make_response
from flask.ext.sqlalchemy import SQLAlchemy
import jwt
from encoder import jwt_encode
from logging import Formatter, FileHandler
import controller
from os import path
import models
import os


#Initialize Flask application
app = Flask(__name__)
PORT = int(os.environ.get('PORT', 5000))
app.config.from_object('config')
is_prod = os.environ.get('IS_HEROKU', None)
app.config.from_object('config')

if is_prod:
    BASE_CLIENT_URL = 'https://genomie.herokuapp.com'
    CLIENT_ID = app.config.get('PROD_CLIENT_ID')
    CLIENT_SECRET = app.config.get('PROD_CLIENT_SECRET')
    REDIRECT_URI = app.config.get('PROD_REDIRECT_URI')
    #set debug to false
else:
    #Gather data from config.py
    BASE_CLIENT_URL = 'http://localhost:%s/'% PORT
    CLIENT_ID = app.config.get('CLIENT_ID')
    CLIENT_SECRET = app.config.get('CLIENT_SECRET')
    REDIRECT_URI = app.config.get('REDIRECT_URI')
    #set debug to true and add to app declaration at bottom of file

#Declaration of all necessary variables needed to perform 23AndMe API Call
DEFAULT_REDIRECT_URI = '%sreceive_code/'  % BASE_CLIENT_URL
SNPS = ['rs12913832', 'rs8177374', 'rs1799971', 'rs806380', 'rs1800955', 'rs53576', 'rs1815739', 'rs6152', 'rs1800497', 'rs9939609', 'rs662799', 'rs17822931', 'rs4680', 'rs4988235', 'rs6025', 'rs7574865', 'rs1695', 'rs72921001', 'rs1537415', 'rs2472297', 'rs909525']
DEFAULT_SCOPE = 'names basic email ancestry relatives genomes %s' % (' '.join(SNPS))
BASE_API_URL = 'https://api.23andme.com/'
SECRET_KEY = app.config.get('SECRET_KEY')


@app.route('/')
def home():
    auth_url = '%sauthorize/?response_type=code&redirect_uri=%s&client_id=%s&scope=%s' % (BASE_API_URL, REDIRECT_URI, CLIENT_ID, DEFAULT_SCOPE)
    return render_template('landing.html', auth_url=auth_url)


@app.route('/get_info/')
def getUser():
    response = make_response(render_template('index.html'))
    return response


@app.route('/demo/')
def makeDemoUser():
    #Add demo user to DB if they don't already exist
    controller.create_demo_user()
    demo_profile_id = 'demo_id'
    demo_user_name = 'Lilly Demo'

    response = make_response(render_template('index.html'))
    response.set_cookie('user_first_name', demo_user_name)
    response.set_cookie('token', jwt_encode(demo_profile_id, demo_user_name, SECRET_KEY))

    controller.createSnpsTable()
    return response


#Refactor this route to take a userProfileID after the trailing slash with some syntax like: '<%s UserID >''
#i.e. the equivalent of '/:userId' with node/express servers
@app.route('/api/relatives/')
#return all the relatives. Refactor to only return the relatives specific to the current User
def getRelatives():

    decoded = jwt.decode(request.cookies.get('token'), SECRET_KEY, algorithms=['HS256'])
    current_user_profile_id = decoded['user_profile_id']

    #Retrieve all relatives from database, not filtered by user
    #To Do: Filter this by user
    user_relatives = models.db_session.query(models.user_relatives).all()
    user_relatives_ids = []
    #Iterate through all relatives
    for user_relative in user_relatives:
        user = list(user_relative)
        #For each relative, grab only those that match on the current_user_profile_id
        if current_user_profile_id == str(user[0]):
            user_relatives_ids.append(int(user[1]))
    #Retrieve all relatives from DB
    #To Do: is this the same information in the user_relatives variable above?
    relatives = models.db_session.query(models.Relative).all()
    finalRelatives = []
    #Iterate through all relatives
    for relative in relatives:
        #Grab only relatives who match the relatives in the user_relatives_ids storage
        if relative.serialize()['id'] in user_relatives_ids:
            finalRelatives.append(relative.serialize())

    return jsonify({'relativeList' : finalRelatives})


@app.route('/api/getsnps', methods=['POST', 'GET'])
def getSnps():

    decoded = jwt.decode(request.cookies.get('token'), app.config.get('SECRET_KEY'), algorithms=['HS256'])
    current_user_profile_id = decoded['user_profile_id']

    user_snps = {}

    user_data = models.db_session.query(models.User).filter(models.User.profile_id == current_user_profile_id).first().serialize()
    for user_datum in user_data:
        if user_datum[:2:].lower()=='rs':
            user_snps[user_datum] = user_data[user_datum]

    user_outcomes = []
    for user_snp in user_snps:
        # loop through entire snp table, if any of snp base pairs match up to the base pair in user snps, put in an object with rsid and outcome
        current_snp = models.db_session.query(models.Snp).filter(models.Snp.rs_id == user_snp).filter(models.Snp.dnaPair == user_snps[user_snp]).first()

        if current_snp is not None:
            user_outcomes.append({"title": current_snp.serialize()["title"], "rsid": user_snp, "pair": user_snps[user_snp], "outcome": current_snp.serialize()['outcome']});

    return jsonify({'outcomes': user_outcomes})


@app.route('/receive_code/')
def receive_code():
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
        user_profile_id = genotype_response.json().pop()['id']
        user_response = requests.get("%s%s" % (BASE_API_URL, "1/user/?email=true"),
                                         headers=headers,
                                         verify=False)
        name_response = requests.get("%s%s" % (BASE_API_URL, "1/names/%s" % user_profile_id),
                                         headers=headers,
                                         verify=False)

        #if both API calls are successful, process user data
        if user_response.status_code == 200 and genotype_response.status_code == 200:
            user_first_name = name_response.json()['first_name']
            #if user already exists in database, render the html and do not re-add user to database
            if len(models.db_session.query(models.User).filter_by(profile_id=user_profile_id).all()) != 0:

                response = make_response(redirect(url_for('getUser')))
                response.set_cookie('user_first_name', user_first_name)
                response.set_cookie('token', jwt_encode(user_profile_id, user_first_name, SECRET_KEY))
                return response

            # otherwise, add new user to database if they have never logged in before
            else:
                #Begin API calls to 23andMe to get additional user data
                relatives_response = requests.get("%s%s" % (BASE_API_URL, "1/relatives/%s" % user_profile_id),
                                                   params = {'limit': 60, 'offset': 1},
                                                   headers=headers,
                                                   verify=False)
                #call createNewUser from controller to add User and User relatives to the database
                controller.createNewUser(name_response, relatives_response, genotype_response, user_response)
                #create snps table
                controller.createSnpsTable()

                response = make_response(redirect(url_for('getUser')))
                response.set_cookie('user_first_name', user_first_name)
                response.set_cookie('token', jwt_encode(user_profile_id, user_first_name, SECRET_KEY))
                return response
        #error handling if api calls for additional user data to 23andMe fail
        else:
            reponse_text = genotype_response.text
            response.raise_for_status()
    #error handling if initial api calls to 23andMe fail
    else:
        response = make_response(redirect(url_for('home')))
        return response

#Initialize python server on port
if __name__ == '__main__':
  print 'Server has been initialized'
  if is_prod:
      app.run(host='0.0.0.0', port=PORT)
  else:
      app.run(debug=True, port=PORT)
