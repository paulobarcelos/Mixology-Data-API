# 31T API

## Creating new events

### Create new server instance
- Log in to Heroku.
- Create a new app, with the name following the pattern: `api-31t-YYMMDD`.
- Head to resources and add a "mLab Mongo DB - Sandbox".
- Edit the `.git/config` and add a new remote with the pattern:
	- ```
	[remote "YYMMDD"]
		url = https://git.heroku.com/api-31t-YYMMDD.git
		fetch = +refs/heads/*:refs/remotes/heroku/*
	```
- Login to Heroku on the terminal: `heroku login`
- Push the code to the new remote: `git checkout master && git push YYMMDD`

## Managing the database

### Figure out credentials
#### Database name, user & host
- Login to Heroku
- Open the app `api-31t-YYMMDD`
- Head to the "Resources" tab, and click on the "mLab Mongo DB" resource.
- The database name should be on the url, or just displayed on the screen. The
format should be `heroku_XXXXXXX`.
- Now you have the name of the database which is also the name of the user.
- Now click on the "Tools" tab. You should be presented with a info like this:
	- ```
	To connect using the mongo shell:
	mongo XXXXXXXX.mlab.com:XXXXXXXX/heroku_XXXXXXX -u <dbuser> -p <dbpassword>

	```
- The host is the: `XXXXXXXX.mlab.com:XXXXXXXX`
#### Password
- Get the `MONGODB_URI` env var that you can find in the app's "Settings"
tab Heroku. The password is part of that URI - the format should be like:
	- `mongodb://heroku_XXXXXXX:HERE_IS_THE_PASSWORD@XXXXXXXX.mlab.com:XXXXX/heroku_XXXXXXX`


### Uploading `flavors.json`
Replace the tokens bellow: `DB_HOST`, `DB_NAME`, `DB_PASSWORD`
- Get a hold on the `flavors.json` file. The file should contain something like:
	- ```
	{"name":"Blåbär pulver","label":"121","color":"#34377a","size":1,"width":5,"height":5}
	{"name":"Kallrökt ren","label":"122","color":"#471222","size":4,"width":3,"height":3}
	{"name":"Rödvinskokta päron","label":"123","color":"#912d4f","size":6,"width":4,"height":4}
	```
- On the folder that contains `flavors.json` run:
	- `mongoimport -h <DB_HOST> -d <DB_NAME> -c flavors -u <DB_NAME> -p <DB_PASSWORD> --file flavors.json`
- If you need to re-import the data, first delete all the documents  of the
collection in the mLab interface.

### Deleting combinations right before event
Delete the collection "combinations" from the  mLab interface.
