const axios = require('axios');
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const server = express();
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "k2pdcy98kpcsweia.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "w4n7jdy917qcm2a5",
    password: "djljfp9wxwmgmgq6",
    database: "d96h9x0hb8uzah21"
});

var dataArray = [];
var dataKeyArray = [];

server.use(express.static(__dirname + '/public'));
server.use(bodyParser.urlencoded({extended: true}));
server.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/template');
hbs.registerPartials(__dirname + '/views');

server.get('/', (req, res) => {
    res.render('index.hbs');
});

server.get('/history', (req, res) => {
    dataKeyArray = [];
        con.query("SELECT * FROM movie", function (err, result, fields) {
            if (err) throw err;
            for(var i = 0; i < result.length; i++){
                const title = result[i].m_title;
                const released = result[i].m_released;
                const rated = result[i].m_rated;
                const genre = result[i].m_genre;
                const rating = result[i].m_imdb_rating;
                const id = result[i].m_imdb_id;
                const image = result[i].m_image;

                dataKeyArray.push({'title': title, 'released': released, 'rated': rated, 'genre': genre, 'rating': rating, 'id': id, 'image': image});
            }
            setTimeout(function(){
                // insertDB(dataArray);
                getData = dataKeyArray;
                console.log(getData);
                res.render('history.hbs');
            }, 500)
        });
})

var getData;


hbs.registerHelper('list', (items, options) => {
    items = getData;
    var out ="";

    const length = items.length;

    for(var i=0; i<length; i++){
        out = out + options.fn(items[i]);
    }

    return out;
});

server.post('/result', (req, res) => {
    dataArray = [];
    dataKeyArray = [];
    const qName = req.body.movieName;
    const movieListReq =`https://api.nytimes.com/svc/movies/v2/reviews/search.json?query=${qName}&api-key=YX4pQxlX8sxUS3kdyVQptdSTHbrOnqaP`;

    axios.get(movieListReq).then((response) => {
        // console.log(response.data.results);

        for(var i = 0; i < response.data.results.length; i++){
            const movieName = response.data.results[i].display_title;
            imdbReq = `http://www.omdbapi.com/?t=${movieName}&apikey=16a73176`;
            axios.get(imdbReq).then((responses)=> {
                const title = responses.data.Title;
                const released = responses.data.Released;
                const rated = responses.data.Rated;
                const genre = responses.data.Genre;
                const rating = responses.data.imdbRating;
                const id = responses.data.imdbID;
                const image = responses.data.Poster;

                dataArray.push([title, released, rated, genre, rating, id, image]);
                dataKeyArray.push({'title': title, 'released': released, 'rated': rated, 'genre': genre, 'rating': rating, 'id': id, 'image': image});
                // console.log(dataArray);
                // if(i == response.data.results.length - 2){
                //     console.log(dataArray)
                // }
                // insertDB(title, released, rated, genre, rating, id);
            })
        }
        setTimeout(function(){
            insertDB(dataArray);
            getData = dataKeyArray;
            console.log(getData);
            res.render('result.hbs');
        }, 500)
        // insertDB(dataArray);
    });
});

server.listen(process.env.PORT || 4000, function(){
    console.log('Your node js server is running');
});

function selectAllFromDB() {
    con.query("SELECT * FROM movie", function (err, result, fields) {
        if (err) throw err;
        return result;
    });
}

function insertDB(data){
    var sql = `INSERT INTO movie (m_title, m_released, m_rated, m_genre, m_imdb_rating, m_imdb_id, m_image) VALUES ?`;
    con.query(sql, [data],function (err, result) {
        if (err) throw err;
        console.log("Multiple record inserted");
    });
}

server.post('/deleteAll', (req, res) => {
    var sql = `DELETE FROM movie`;
    con.query(sql,function (err, result) {
        if (err) throw err;
        console.log('All data discarded, redirecting to home page');
        res.render('index.hbs');
    });
});