const alert = require('alert');
const express = require('express');
const app = express();
const request = require('request');
const sendMail = require('./js/email');
const port = process.env.PORT || 4000
const mongoose = require('mongoose');
var News = require('./model/newsmodel')
const session = require("express-session")
const filestore = require("session-file-store")(session)
const path = require("path")


var global_lon = "-121";
var global_lat = "38";

var currentuser = '';
const server = require("http").createServer(app)
const io = require('socket.io')(server)





app.use(session({
    username: "session-id",
    secret: "My Secret Code",
    saveUninitialized: false,
    resave: false,
    store: new filestore()
}))

// Middlewares
// app.use(auth)
app.use(express.static(path.join(__dirname, 'public')));







users = [];
connections = [];

server.listen(port);
console.log("running on " + port)


mongoose.connect('mongodb://localhost:27017/details');
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
    console.log("connection succeeded");
})

const Details = mongoose.model('details', {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    type: { type: String }
})

const api = "2eeab22581640da766229804ddc894e1";
app.use("/styles", express.static(__dirname + "/styles"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/images", express.static(__dirname + "/images"));
app.use("/js", express.static(__dirname + "/js"));
app.set('view engine', 'ejs')




var strTime;




/// weather api
var weatherUrl = "http://api.openweathermap.org/data/2.5/weather?lat=" + global_lat + "&lon=" + global_lon + "&appid=" + api + "&units=imperial";

var date = new Date();

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    strTime = hours + ':' + minutes + ' ' + ampm;

}

const bodyParser = require('body-parser');
const { ppid } = require('process');

var users = []
io.sockets.on('connection', function (socket) {
    connections.push(socket);


    console.log("connected: %s sockets connected", connections.length);
    socket.on('disconnect', function (data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log('disconnected: %s sockets connected', connections.length)
    });
    socket.on('new user', function (name) {

        users[socket.id] = name


    })
    socket.on('send message', function (data) {
        data = users[socket.id] + ": " + data
        console.log("chat data", data)
        io.sockets.emit('new message', { msg: data });
    })
});




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function getWeather(url) {
    // getLonLat();
    // Setting URL and headers for request
    var options = {
        url: weatherUrl,
        headers: {
            'User-Agent': 'request'
        }
    };
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job
        request.get(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        })
    })
}
function initializeWeatherUrl(long, lati) {
    if (long && lati) {
        global_lon = long;

        global_lat = lati;
        weatherUrl = "http://api.openweathermap.org/data/2.5/weather?lat=" + global_lat + "&lon=" + global_lon + "&appid=" + api + "&units=imperial";

    }

}


app.get("/home", function (req, res) {


    if (!req.session.loggedIn) {
        res.sendStatus(403)
    }
    currentuser = req.session.username


    initializeWeatherUrl(req.body.long, req.body.lat);

    var dataPromise = getWeather();
    // Get user details after that get followers from URL
    dataPromise.then(JSON.parse)
        .then(function (result) {
            var weather = result.weather[0].description;
            weather = weather.charAt(0).toUpperCase() + weather.slice(1);
            let icon = result.weather[0].icon;
            let feelsLike = result.main.feels_like;
            let temp = result.main.temp;
            let city = result.name;
            let windSpeed = result.wind.speed;
            let humidity = result.main.humidity;
            formatAMPM(date);
            News.find({}, {}, { sort: { published: -1 }, limit: 4 }, (err, data) => {
                if (data.length<4){
                    return res.send("page under maintanence")
                }
                if (err) {
                    news = []
                    if(req.session.type=="customer"){
                        res.render('index', { news, weather, feelsLike, city, icon, temp, windSpeed, humidity, strTime, currentuser })

                    }else{
                        res.sendStatus(403)
                    }
                }
                else {
                    news = data
                    //console.log(data)
                    if(req.session.type=="customer"){
                        res.render('index', { news, weather, feelsLike, city, icon, temp, windSpeed, humidity, strTime, currentuser })

                    }else{
                        res.sendStatus(403)
                    }
                }

            }
            )


            // res.render('index', { weather, feelsLike, city, icon, temp, windSpeed, humidity, strTime })
        })
})


app.post('/addnews', (req, res) => {
    console.log("Entered add news");
    
    if (req.session.type == "admin") {
        var date = new Date();
        formatAMPM(date);
        var currenttime = strTime;
        console.log("current time" + currenttime)
        const { title, description, id, edit } = req.body;
        if (edit == 0) {
            News.create({ title, description, published: currenttime }, (err, data) => {
                if (err) {
                    res.status(500).send(err);
                    res.redirect("/error");
                } else {

                    res.redirect('/editnews')
                }
            });

        }
        else {

            News.findOneAndUpdate({ _id: id }, { $set: { title: title, description: description } }, { new: true }, (err, doc) => {
                if (err) {
                    res.render('error')
                }
                else {
                    res.redirect('/editnews')
                }
            });
        }
    } else {
        console.log("Entered forbidden");
        res.sendStatus(403)
    }
    // if (!req.session.loggedIn) {
    //     res.sendStatus(403)
    // }

});

app.get("/addnews", (req, res) => {
    console.log("add news working");
    if (!req.session.loggedIn) {
        res.sendStatus(403)
    }
    if (req.session.type == "admin") {
        console.log("admin working")
        news = { title: '', description: '', id: "" }
        edit = 0;

        res.render('addnews', { news, edit })

    } 
    else{
        res.sendStatus(403)
    }
        
    

})
app.get('/news', async (req, res) => {
    const news = await News.find().limit(4);
    res.json(news);
})
app.get("/editnews", (req, res) => {
    if (!req.session.loggedIn) {
        res.sendStatus(403)
    }
    if (req.session.type == "admin") {

        News.find({}, {}, { sort: { published: -1 } }, (err, data) => {
            if (err) {
                news = []
                res.render('edit', { news })
            }
            else {
                news = data
                res.render('edit', { news })
            }

        }
        )
    } else {
        res.sendStatus(403)
    }


})
app.post("/changenews/:id", (req, res) => {

    News.find({ _id: req.params.id }, (err, data) => {
        if (err) {
            news = { title: '', description: '' }
            edit = 0;
            res.render('addnews', { news, edit })
        }
        else {
            news = data[0];
            edit = 1;
            res.render('addnews', { news, edit })
        }

    }
    )

})
app.post("/deletenews/:id", (req, res) => {

    id = req.params.id;
    News.findOneAndDelete({ _id: id }, (err, data) => {
        if (err) {
            res.redirect('/error')
        }
        else {
            res.redirect('/editnews')
        }

    });
})
app.get("/", (req, res) => {

    res.render('register')
    

})


app.post('/sign_up', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var pass = req.body.password;


    var data = {
        "name": name,
        "email": email,
        "password": pass,
        "type": "customer"
    }




    Details.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.log(err);
        }
        var message;
        if (user) {
            alert('user exists');
        } else {

            db.collection('details').insertOne(data, function (err, collection) {
                if (err) throw err;

            });

            alert("Thanks for Siging up! Please Sign in now");
            res.redirect("/");
        }

    });
})

let username = "";
app.post('/login', function (req, res) {
    if (req.session.loggedIn) {
        console.log("welcome to home", req.session.username)
    } else {
        console.log("usernot logged in")
    }
    var email = req.body.email;
    var pass = req.body.password;


    var data = {

        "email": email,
        "password": pass
    }




    Details.findOne({ email: data.email }, function (err, user) {
        if (err) {
            console.log(err);
        }
        var message;
        if (user) {
            console.log("User Found");
            console.log(user.type)
            if (user.password == data.password) {
                if (user.type == 'admin') {
                    req.session.loggedIn = true;
                    req.session.username = user.name;
                    req.session.type = "admin";

                    currentuser = user.name;
                    console.log("Current User",currentuser);
                    res.redirect("/addnews")

                }
                else {
                    req.session.loggedIn = true;
                    req.session.username = user.name;
                    req.session.type = "customer";

                    currentuser = user.name;
                    //console.log("Current User",currentuser);



                    if (user.name) {
                        username = user.name;
                    }
                    initializeWeatherUrl(req.body.long, req.body.lat);

                    console.log(username)
                    var dataPromise = getWeather();
                    // Get user details after that get followers from URL
                    dataPromise.then(JSON.parse)
                        .then(function (result) {
                            var weather = result.weather[0].description;
                            weather = weather.charAt(0).toUpperCase() + weather.slice(1);
                            let icon = result.weather[0].icon;
                            let feelsLike = result.main.feels_like;
                            let temp = result.main.temp;
                            let city = result.name;
                            let windSpeed = result.wind.speed;
                            let humidity = result.main.humidity;
                            formatAMPM(date);
                            News.find({}, {}, { sort: { published: -1 }, limit: 4 }, (err, data) => {
                                if (data.length<4){
                                    console.log("maintanence!!!!!")
                                    return res.send("page under maintanence")
                                }
                                if (err) {
                                    news = []
                                    res.render('index', { news, weather, feelsLike, city, icon, temp, windSpeed, humidity, strTime, currentuser })
                                }
                                else {
                                    news = data
                                    res.render('index', { news, weather, feelsLike, city, icon, temp, windSpeed, humidity, strTime, currentuser })
                                }

                            }
                            )
                            // res.render('index', { weather, feelsLike, city, icon, temp, windSpeed, humidity, strTime ,username})
                        })

                }

            }
            else {
                console.log("Password doesnt match")
                alert('Password doesnt match');
            }

        } else {
            alert('Email Id doesn\'t exist');


        }

    });
})



app.get("/sports", (req, res) => {

    if (!req.session.loggedIn) {
        res.sendStatus(403)
    }
    if(req.session.type=="customer"){
        res.render('sports', { 'username': req.session.username })

    }else{
        res.sendStatus(403);
    }

})



app.get("/about", (req, res) => {
    if (!req.session.loggedIn) {
        res.sendStatus(403)
    }
    if(req.session.type=="customer"){
    res.render('about', { 'currentuser': req.session.username })

    }else{
        res.sendStatus(403);
    }

})



app.get("/contactus", (req, res) => {
    // res.render('contact', { message })
    if (!req.session.loggedIn) {
        res.sendStatus(403)
    }
    if(req.session.type=="customer"){
        res.render('contact', { 'currentuser': req.session.username })
    
        }else{
            res.sendStatus(403);
        }

})



//sending email service
//data parsing
app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());

app.post('/email', (req, res) => {
    //send email, subject, text
    if (!req.session.loggedIn) {
        res.sendStatus(403)
    }
    console.log('Data:', req.body);
    const { email, subject, text } = req.body;
    sendMail(email, subject, text, function (err, data) {
        if (email && subject && text) {
            //if they are not empty
            if (err) {
                let message = 'Internal error';
                res.status(500).json({ message: message });
                console.log("error sending msg logged from app.js");
                alert(message);
                // res.render('contact')
            } else {
                let message = 'Email sent successfully, Thank you For your response';
                res.json({ message: 'Email sent' });
                alert(message);
                // res.render('contact')
            }
        }

    });
});
app.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        res.redirect('/'); //Inside a callback… bulletproof!
    });
})
app.get("*", (req, res) => {
    // res.render('contact', { message })
    res.sendStatus(404);

})