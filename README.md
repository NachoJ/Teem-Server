# TeemSailsjs

a [Sails](http://sailsjs.org) application

use teemweb
db.createUser(
   {
     user: "teemweb",
     pwd: "teem12345",
     roles: [ "readWrite", "dbAdmin" ]
   }
)


git init .
git remote add -t \* -f origin git@103.250.188.226:chintan/TeemLaravel.git
git checkout -f master

//------ Start server In Staging

NODE_ENV=staging node app.js

//------ For production 

node app.js --prod
pm2 start app.js -x -- --prod

//------- Normal Start
sails lift
or
node app.js
