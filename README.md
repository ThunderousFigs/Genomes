# Genomie
Genetic visualization application

Please visit [**our deployed website**](http://genomie.herokuapp.com).

## Introduction 

Genomie is a web application that provides beautiful data visualizations of hereditary information based on the information received from 23AndMe.com. Providing the user with a varieties of different views, anyone can easily interpret and understand their unique genetic information in an interactive and elegant way. Genomie provides clear and vibrant perspectives in multiple viewing environments for an optimized user experience. 

<hr>
## Table of Contents

  - [Example](#example)
  - [Installation](#installation)
  - [Technologies](#technologies)
  - [Architecture](#architecture)
  - [API Endpoints](#api)
  - [Contributing](#contributing)
  - [Meet the Engineers](#meet-the-engineers)
  - [Questions and Issues](#questions-and-issues)

==========
## Example
![alt tag](http://i67.tinypic.com/2hewtn9.gif)

===============
## Installation
Please install Python/Flask dependencies within the root directory
```
$ virtualenv .
$ source bin/activate
$ pip install -r requirements.txt
```

Next, install the client-side dependencies
```
$ sudo npm install -g bower
$ bower install
```
**For testing**
```
$ npm install
```

You're good to go. Start the server with:
```
$ npm start
```

===============
## Technologies
Front-end
- AngularJS 
- Angular-Material
- D3.js

Back-end
- Python/Flask
- PostgreSQL
- SQLAlchemy

Testing/Automation
- Mocha/Chai
- Karma
- Jasmine
- Grunt

===============
## Architecture
### High Level Architecture
![](http://i64.tinypic.com/2zpp661.png)

### Database Schema
Database in Postgres, using SQLAlchemy
![](http://i68.tinypic.com/23i6plz.jpg)

======
## API
##### Public End Points
|Description|Endpoint|
|---|---|
|[Log-in OAuth](#get-receive_code)|GET /receive_code/|
|[Log-in Demo](#post-demo)|POST /demo/|
|[Log-out current user](#post-logout)|POST /logout|
|[Get User Info](#get-userbasicinfo)|GET /user/basicinfo/|
|[Get User Relatives](#post-userrelativesinfo)|POST /user/relativesinfo/|
|[Get User's SNP Data](#post-usersnpinfo)|POST /user/snpinfo/|

##### Admin Only
|Description|Endpoint|
|---|---|
|[Access to 23&Me Individual data](#get-1useruserid)|GET /1/user/:userID|
|[Access to 23&Me Genotype data](#get-1genotypeuserid)|GET /1/genotype/:userID|
|[Access to 23&Me Relative data](#get-1relativesuserid)|GET /1/relatives/:userID|



## `GET /receive_code/`

Redirects back to server after acquiring access token after User approves OAuth permissions

### Example Request
```bash
curl -H 'Accept: auth-url' -H 'Authorization: OAuth <access_token>' \
-X GET https://BASE_API_URL + 
{
  'client_id': CLIENT_ID,
  'client_secret': CLIENT_SECRET,
  'grant_type': 'authorization_code',
  'code': request.args.get('code'),
  'redirect_uri': REDIRECT_URI,
  'scope': DEFAULT_SCOPE
}
```


## `POST /demo/`

Allows visitors to access site as a demo user

### Example Request
```bash
{
	'demo_profile_id': 'demo_id',
	'demo_first_name': 'Foo',
	'demo_last_name': 'Bar'
	'demo_data': [
		'sex': 'm/f',
		'rs_id': 'demo_basepairs',
		...
	]
}
```


## `POST /logout/`

Logs out user from session and clears cookies/cache

### Example Request
```bash
{
	'user_profile_id': 'profile_id',
	'headers': {
		'cookie': {
			'token': 'asj238xlzhs_uw28hzbhslsm8es9'
		}
	}
}
```

## `GET /user/basicinfo/`

Fetches the basic information of the current authorized user

### Example Response
```json
{
  "user": {
  	"profile_id": 1738,
    "first_name": "Foo",
    "last_name": "Bar",
    "location": "United States",
    "picture_url": ""
    }
}
```

## `POST /user/relativesinfo/`

Gathers information about the current user's relatives

### Example Request
```bash
{
	'user_profile_id': 'profile_id',
	'headers': {
		'cookie': {
			'token': 'asj238xlzhs_uw28hzbhslsm8es9'
		}
	}
}
```

### Example Response
```json
{
	"user_profile_id": "profile_id",
	"relatives": [
		{"relative1": {
			"first_name": "Foo",
			"last_name": "Bar",
			"sex": "m/f",
			"residence": "California",
			"similarity": 0.25,
			"maternal_side": "False",
			"paternal_side": "True",
			"birth_year": 1992,
			"relationship": "Brother",
			"birthplace": "United States",
			"ancestry": "Northwestern Europe",
			"picture_url": ""
		}},
		{"relative2": {
			"first_name": "Foo2",
			"last_name": "Bar2",
			"sex": "m/f",
			"residence": "California",
			"similarity": 0.25,
			"maternal_side": "False",
			"paternal_side": "True",
			"birth_year": 1990,
			"relationship": "Sister",
			"birthplace": "United States",
			"ancestry": "Northwestern Europe",
			"picture_url": ""
		}},
		...
	]
}
```

## `POST /user/snpinfo/`

Gathers DNA information about the current user

### Example Request
```bash
{
	'user_profile_id': 'profile_id',
	'headers': {
		'cookie': {
			'token': 'asj238xlzhs_uw28hzbhslsm8es9'
		}
	}
}
```

### Example Response
```json
{
	"user_profile_id": "profile_id",
	"body": [
		{"rs270831": {
			"title": "Lactose Intolerance",
			"dna_pair": "AA",
			"outcome": "You have a high likelihood of being lactose intolerant",
			"video": "4UvzSuP_Tzd"
		}},
		{"rs812202": {
			"title": "Cilantro",
			"dna_pair": "GG",
			"outcome": "You are likely to experience a dislike for cilantro, may taste like soap",
			"video": "TZs309snmr"
		}},
		...
	]
}
```

## Admin Routing

## `GET /1/user/:userID`

Requests user's information upon login from 23andMe's designated endpoint

### Example Request
```bash
curl -H 'Accept: %s%sBASE_API_URL + '/1/user/' + 'user_id'' -H 'Authorization: 'Bearer %s' % access_token' \ -X GET https://auth-url/1/user?email=true
```

## `GET /1/genotype/:userID`

Requests user's unique genotype information upon login from 23andMe's designated endpoint

### Example Request
```bash
curl -H 'Accept: %s%sBASE_API_URL + '/1/genotype/' + 'user_id'' -H 'Authorization: 'Bearer %s' % access_token' \ -X GET https://auth-url/1/genotype/
```

## `GET /1/relatives/:userID`

Requests user's relatives' information upon login from 23andMe's designated endpoint

### Example Request
```bash
curl -H 'Accept: %s%sBASE_API_URL + '/1/user/' + 'user_id'' -H 'Authorization: 'Bearer %s' % access_token' \ -X GET https://auth-url/1/relatives
```

=====================
## Meet The Engineers
Product Owner 
- [**Gar Lee**](https://github.com/LeeGar)

Scrum Master 
- [**Alex Anthony**](https://github.com/alexanthony813)

Development Team 
- [**Chris Bassano**](https://github.com/christo4b)
- [**Peter Lollo**](https://github.com/Peterlollo)

===============
## Contributing
Genomie was built using waffle.io as the project organization tool.
Please visit [here](gitflow.md) for our workflow guidelines.

## Questions and Issues
For any issues, please refer to [**our issues page**](https://github.com/ThunderousFigs/Genomes/issues)
Please direct any questions regarding Genomie to [**our wiki page**](https://github.com/ThunderousFigs/Genomes/wiki)

Thank you!

