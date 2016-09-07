var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var EmailTemplates = require('swig-email-templates');
var nodemailer = require('nodemailer');
var mail_body = "", mail_subject = "", mail_to = "";



var CronJob = require('cron').CronJob;

/* cron job to clean data */



mongoose.connect('mongodb://localhost/labdata');
require('./models/Data');


var routes = require('./routes/index');
var users = require('./routes/users');


var Testbed = mongoose.model('Testbed');
var Device = mongoose.model('Device');

function removeTestbed (device_testbed) {
  Testbed.findOne({'_id': device_testbed}, function(err, testbed) {
      if (!err) {
        testbed.remove(function(err, testbed) {
          if (err) { console.log(err); }
          console.log("Deleted testbed");
        });
      }
  });
}

var job = new CronJob({
  cronTime: '00 00 5 * * 1-7',
  onTick: function() {
    console.log("Starting cron job");
    var day = new Date().getDay();
    var panda;
    Device.find(function(err, devices) {
      if (err) { console.log(err);}
      for (var i = 0; i < devices.length; i++) {
        if (devices[i].date == day && devices[i].permanent == 0) {
          var id = users.findIndex(x=> x.name == devices[i].user);
          if (devices[i].user != "") {
            mail_subject = "GLaDOS: Box validity expired";
            mail_body = "BOX DETAILS\n" +
                        "-----------------\n\n" +
                        "Rack: " + devices[i].rack +
                        "\nConsole Port: " + devices[i].port;
            mail_to = users[id].email;
            send_mail(mail_subject, mail_body, mail_to);
            devices[i].user = "";
            if (devices[i].testbed != "") {
                removeTestbed(devices[i].testbed);
                devices[i].testbed = "";
            } 
            devices[i].save(function(err, testbed) {
                if (err) { console.log(err); }
            });
          }
        }
      }
    });
    console.log("Cron job done");
  },
  start: false,
}); 

job.start();


function send_mail(mail_subject, mail_body, mail_to) {
  var transport = nodemailer.createTransport();

  var mailist = mail_to.toString();
  transport.sendMail({
    from: "glados@arubanetworks.com",
    to: mailist,
    subject: mail_subject,
    text: mail_body
  }, console.error);

} 

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

var rack = [{ title: 'Rack 2' , id: 'rack2', console: '10.16.78.43', gateway: "10.16.82.129", ip: "10.16.82.130"}, 
            { title: 'Rack 6' , id: 'rack6', console: '10.16.77.2', gateway: "10.16.77.1" , ip: "10.16.77.5"}, 
            { title: 'Rack 7' , id: 'rack7', console: '10.16.77.66', gateway: "10.16.77.65", ip: "10.16.77.69"}, 
            { title: 'Rack 8' , id: 'rack8', console: '10.16.77.194', gateway: "10.16.81.1", ip: "10.16.81.2"},
            { title: 'Rack 9' , id: 'rack9', console: '10.16.77.210', gateway: "10.16.81.65", ip: "10.16.81.68"}, 
            { title: 'Rack 10' , id: 'rack10', console: '10.16.77.226', gateway: "10.16.81.129", ip: "10.16.81.130"}, 
            { title: 'Testbed', id: 'testbed', console: null, gateway: null, ip: null }];
/*var users = [
        { name: "Abhinesh", 
          email: "abhinesh.mishra@arubanetwoks.com"},
        { name: "Abhisek",
          email: "abhisekkumar.shaw@arubanetwoks.com"},
        { name: "Amit",
          email: "amit.kanwar@arubanetwoks.com"},
        { name: "Arpit",  
          email: "arpit.gupta2@arubanetwoks.com"},
        { name: "Ashok",   
          email: "ashok.j.b@arubanetwoks.com"},
        { name: "Gopal",   
          email: "gopal.gupta@arubanetwoks.com"},
        { name: "Himanshu",   
          email: "himanshu.chauhan@arubanetwoks.com"},
        { name: "Kishore",
          email: "kishore.goud@arubanetwoks.com"},
        { name: "Muthiah",
          email: "muthiahramanathan.natarajan@arubanetwoks.com"},
        { name: "Nitin",
          email: "nitin.agrawal3@arubanetwoks.com"},
        { name: "Pradip",
          email: "pradip.gaikwad@arubanetwoks.com"},
        { name: "Ramas",
          email: "rangaswamy.ramaswamy@arubanetwoks.com"},
        { name: "Sadashiv",
          email: "sadashiv.madiwalar@arubanetwoks.com"},
        { name: "Unni",
          email: "unni.puthanveedu@arubanetwoks.com"} ];
*/
var users = [
        { name: "Abhinesh",
          email: "abhineshm@arubanetworks.com"},
        { name: "Abhisek",
          email: "ashaw@arubanetworks.com"},
        { name: "Amit",
          email: "akanwar@arubanetworks.com"},
        { name: "Arpit",
          email: "arpitg@arubanetworks.com"},
        { name: "Ashok",
          email: "ashokraj@arubanetworks.com"},
        { name: "Gopal",
          email: "gopalg@arubanetworks.com"},
        { name: "Himanshu",
          email: "hchauhan@arubanetworks.com"},
        { name: "Kishore",
          email: "kgoud@arubanetworks.com"},
        { name: "Muthiah",
          email: "mramanathan@arubanetworks.com"},
        { name: "Nisarga",
          email: "nmadhav@arubanetworks.com"},
        { name: "Nitin",
          email: "nagrawal@arubanetworks.com"},
        { name: "Pradip",
          email: "pgaikwad@arubanetworks.com"},
        { name: "Ramas",
          email: "rrangaswamy@arubanetworks.com"},
        { name: "Sadashiv",
          email: "smadiwalar@arubanetworks.com"},
        { name: "Unni",
          email: "unnikrishnankp@arubanetworks.com"}
   ];

var devices =  ['3200', '3400', '3600', '620', '650', '7005', 
                '7010', '7024', '7030', '7205', '7210', '7220',
                '7240', 'Extreme-X440-48T-10G', 'M3',
                'S1500-12P', 'S1500-24P', 'S1500-48P',
                'S2500-24P', 'S2500-48P',
                'S3500-24P', 'S3500-48P', 'S3500-48T', 'Tyrone'];

/* Generate a report */
var i = 0;
var report;
function send_user_report () {
  if (i < users.length) {
    Device.find({'user': users[i].name}, function(err, devices) {
      if (err) { console.log(err);}
        report += "\n" + users[i].name + ": " + devices.length;
        i++;
        send_user_report();
    });
  } else {
    console.log(report);
    report = "";
    i = 0;
    send_box_report();
  }
  
}

var avail = 0, unavail = 0;
function send_box_report () {
  var j = 0;
  
  if (i<devices.length) {
    Device.find({'device': devices[i]}, function(err, dev) {
      for (j = 0; j < dev.length; j++) {
        //console.log(dev[j].user);
        if (dev[j].user == "") {
          avail++;
        } else {
          unavail++;
        }
      }
      report += "\n\n" + devices[i] + ": " + "Available (" + avail + ")" + " + In Use (" + unavail + ")";
      i++;
      avail = 0; unavail = 0;
      send_box_report();
    });
  } else {
    console.log(report);
  }
}

//send_user_report();

/* queries to CRUD data*/

app.get('/get_data', function(req, res) {
  var tab = req.query.tab;
  var query = Device.find({'rack': tab}).sort('port');
  query.exec(function (err, devices){
    if (err) { return next(err); }
    Testbed
    .find()
    .populate('devices')
    .exec(function(err, testbed) {
      console.log(JSON.stringify(testbed));
      res.status(200).send({device: devices, testbed: testbed});
    });
    
  });
    
});

app.get('/get_testbed', function(req, res) {
    Testbed
    .find()
    .populate('devices')
    .exec(function(err, testbed) {
      console.log(JSON.stringify(testbed));
      res.status(200).send({testbed: testbed});
    });
    
});

app.get('/delete_data', function(req, res) {
  var id = req.query.id;
  var testbed = req.query.testbed;
  console.log("Removing id: " + id);
  
  Device.findOne({'_id': id}, function (err, devices) {
    if (err) {console.log(err);}
    if (devices != undefined && devices.user != "") {
                var idx = rack.findIndex(x=> x.title == devices.rack);
                var id = users.findIndex(x=> x.name == devices.user);
                mail_to = [users[id].email, 'akanwar@arubanetwoks.com'];
                mail_subject = "GLaDOS: Box Deleted";
                mail_body = "BOX DETAILS\n" +
                            "-----------------\n\n" +
                            "Rack: " + devices.rack + "\n" +
                            "Console: " + rack[idx].console + " " + devices.port + "\n";
                send_mail(mail_subject, mail_body, mail_to); 
    }
  });
  Device.findOneAndRemove({'_id': id}, function (err, device){
    console.log("Inside exec");
    if (err) { console.log("Error occured in removing id: " + id); }
    if (testbed != "") {
      Testbed.findOne({'_id': testbed}, function(err, testbed) {
        testbed.devices.splice(testbed.devices.indexOf(id), 1);
        testbed.save(function(err, testbed) {
          if (err) { console.log(err); }
        });
      });
    }
    //send_mail(1);
    Testbed
      .find()
      .populate('devices')
      .exec(function(err, testbed) {
        res.status(200).send({testbed: testbed});
      });
  });
});

app.get('/delete_fromTestbed', function(req, res) {
  var testbeds = req.query.testbed;
  var device = req.query.device;
  console.log("Removing id: " + device);
  var query = Testbed.findOne({'_id': testbeds});
  query.exec(function (err, testbed){
    console.log(testbed);
    mail_subject = "GLaDOS: Box Deleted from Testbed";
    mail_body = "TESTBED DETAILS\n" +
                "--------------------\n\n" +
                "Name: " + testbed._id + "\n" +
                "Owner: " + testbed.user + "\n"
                ;
    var id = users.findIndex(x=>x.name == testbed.user);
    mail_to = [users[id].email];
    send_mail(mail_subject, mail_body, mail_to);
    if (err) { console.log("Error occured in removing id: " + id); }
        testbed.devices.splice(testbed.devices.indexOf(device), 1);
        testbed.save(function(err, testbed) {
          if (err) { console.log(err); }
        });
        Device.findOne({'_id': device}, function(err, device) {
          device.user = "";
          device.testbed = "";
          device.save(function(err, device) {
            if (err) { console.log(err); }
          });
        });
    //send_mail(2);
    Testbed
      .find()
      .populate('devices')
      .exec(function(err, testbed) {
        res.status(200).send({testbed: testbed});
      });
  });
});

app.get('/delete_testbed', function(req, res) {
  var testbeds = req.query.testbed;
  var devices;
  console.log(testbeds);
  var query = Testbed.findOne({'_id': testbeds});
  query.exec(function (err, testbed){
    mail_subject = "GLaDOS: Testbed Deleted";
    mail_body = "TESTBED DETAILS\n" +
                "--------------------\n\n" +
                "Name: " + testbed._id + "\n" +
                "Owner: " + testbed.user + "\n"
                ;
    var id = users.findIndex(x=>x.name == testbed.user);
    mail_to = [users[id].email];
    send_mail(mail_subject, mail_body, mail_to);
    if (err) { console.log("Error occured in removing id: " + testbed); }
        devices = testbed.devices;
        testbed.remove(function(err, testbed) {
          if (err) { console.log(err); }
        });
        for (var i = 0; i < devices.length; i++) {
          Device.findOne({'_id': devices[i]}, function(err, device) {
          device.user = "";
          device.testbed = "";
          device.save(function(err, testbed) {
            if (err) { console.log(err); }
          });
        });
        }   
    Testbed
      .find()
      .populate('devices')
      .exec(function(err, testbed) {
        res.status(200).send({testbed: testbed});
      });
  });
});

app.post('/add_data', function(req, res) {
  var new_testbed = new Testbed();
  Device.find({'user': req.body.user}, function(err, devices) {
    if (devices.length >= 10 && req.body.user != '') {
      res.status(500).send('Maximum Device Limit exceeded for the user.');
    } else {
      var new_device = new Device(req.body);

      console.log(JSON.stringify(new_device));


      new_device.save(function(err, device){
        if (err) {
          console.log("Error in adding devices: " + err);
        }
        if (req.body.testbed != "") {
          Testbed.findOne({'_id': req.body.testbed}, function(err, testbed) {
            if (err) {
              console.log("Error finding testbed with id: " + testbed);
            }
            testbed.devices.push(device._id);
            testbed.save(function(err, testbed) {
              if (err) { console.log("Error in saving testbed data: " + err); }
            });
          });
        }
        Testbed
          .find()
          .populate('devices')
          .exec(function(err, testbed) {
            res.status(200).send({device: device, testbed: testbed});
          });
      });
    }
  });
  
});

app.post("/update_data", function(req, res) {
    req = req.body;
    Device.find({'user': req.user}, function(err, devices) {
      console.log("This is devices length " + devices.length);
      console.log("This is id " + req.user + req._id);
      if (devices.length >= 5 && req.user != '') {
        Device.findOne({"_id": req._id}, function(err, device) {
          res.status(500).send({user: device.user, line: 'Maximum Device Limit exceeded for the user.'});
        });
      } else {
          Device.findOne({'_id': req._id}, function(err, device) {
            if (err) {console.log(err);}
            console.log(JSON.stringify(device));
            var idx = rack.findIndex(x=> x.title == device.rack); 
            var id1, id2;
            if (device.testbed == "" && req.testbed != "") {
              id1 = users.findIndex(x=> x.name == req.user);
              if (device.user != "") {
                id2 = users.findIndex(x=> x.name == device.user);
                mail_to = [users[id1].email, users[id2].email];
              } else {
                mail_to = [users[id1].email];
              }
                mail_subject = "GLaDOS: Box added to testbed";
                mail_body = "BOX DETAILS\n" +
                            "-----------------\n\n" +
                            "Rack: " + device.rack + "\n" +
                            "Console: " + rack[idx].console + " " + device.port + "\n" +
                            "Testbed: " + req.testbed + "\n";
                send_mail(mail_subject, mail_body, mail_to); 
            } else {
              if (device.user != req.user) { 
                if (req.user != "") {
                  
                  id1 = users.findIndex(x=> x.name == req.user);
                  if (device.user != "") {
                    id2 = users.findIndex(x=> x.name == device.user);
                    mail_subject = "GLaDOS: Box Update Alert";
                    mail_body = "BOX DETAILS\n" +
                              "-----------------\n\n" +
                              "Rack: " + device.rack + "\n" +
                              "Console: " + rack[idx].console + " " + device.port + "\n" +
                              "Old User: " + device.user + "\n" +
                              "New User: " + req.user + "\n";
                    mail_to = [users[id1].email, users[id2].email];
                    send_mail(mail_subject, mail_body, mail_to);
                  } else {
                    mail_subject = "GLaDOS: Box Update Alert";
                    mail_body = "BOX DETAILS\n" +
                              "-----------------\n\n" +
                            "Rack: " + device.rack + "\n" +
                            "Console: " + rack[idx].console + " " + device.port + "\n";
                    mail_to = [users[id1].email];
                    send_mail(mail_subject, mail_body, mail_to);
                  }
                   
                } else {
                  if (device.user != "") {
                    id1 = users.findIndex(x=> x.name == device.user);
                    mail_subject = "GLaDOS: Box Release Alert";
                    mail_body = "BOX DETAILS\n" +
                              "-----------------\n\n" +
                              "Rack: " + device.rack + "\n" +
                              "Console: " + rack[idx].console + " " + device.port + "\n" +
                              "Old User: " + device.user + "\n";
                    mail_to = [users[id1].email];
                    send_mail(mail_subject, mail_body, mail_to);
                  }
                }
              }
            }
          });
          Device.findOneAndUpdate({'_id': req._id}, req, function(err, device) {
          if (err) { console.log(err);}
          Device.findOne({'_id': req._id}, function(err, device){
          if (req.testbed != "") {
            Testbed.findOne({'_id': req.testbed}, function(err, testbed) {
              if (err) {
                console.log("Error finding testbed with id: " + testbed);
              }
              testbed.devices.push(req._id);
              testbed.save(function(err, testbed) {
                if (err) { console.log("Error in saving testbed data: " + err); }
              });
            });
          } 
          Testbed
            .find()
            .populate('devices')
            .exec(function(err, testbed) {
              res.status(200).send({device: device, testbed: testbed});
          });
          });
        });
      }
    });
});

app.post("/add_testbed", function(req, res) {
  req = req.body;
  var testbed = new Testbed(req);
  console.log(JSON.stringify(testbed));
  
  testbed.save(function(err, testbed){
    if (err) {
      console.log("Error in adding devices: " + err);
    }
    res.status(200).send({testbed: testbed});
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




module.exports = app;

