const sha1 = require('sha1');
const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const positions = [
    { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }, { x: 300, y: 0 }, { x: 400, y: 0 },
    { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 300, y: 100 }, { x: 400, y: 100 },
    { x: 0, y: 200 }, { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 }, { x: 400, y: 200 },
    { x: 0, y: 300 }, { x: 100, y: 300 }, { x: 200, y: 300 }, { x: 300, y: 300 }, { x: 400, y: 300 },
    { x: 0, y: 400 }, { x: 100, y: 400 }, { x: 200, y: 400 }, { x: 300, y: 400 }, { x: 400, y: 400 },
]

const port = parseFloat(process.argv[2]) || 5000;

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/www/`));
app.use((req, res, next) => {
    const { headers: { cookie } } = req;
    if (cookie) {
        const values = cookie.split(';').reduce((res, item) => {
            const data = item.trim().split('=');
            return {...res, [data[0]]: data[1] };
        }, {})
        req.cookies = values;
    } else req.cookies = {}
    next();
});


app.get('/', (req, res) => {
    return res.sendFile(__dirname + '/www/index.html');
});

app.get('/:avatar', async(req, res) => {

    if (req.params.avatar == null || req.params.avatar == undefined) return;
    if (req.params.avatar.split('.')[req.params.avatar.split('.').length - 1] !== 'png') return res.status(404).send("404");
    let username = req.params.avatar.split('.');
    username.pop();
    username = username.join(".");

    let usernameHash = sha1(username).replace(/\D/g, "");


    const canvas = createCanvas(500, 500);
    const ctx = canvas.getContext('2d');
    if (req.query.bg_colour) {
        ctx.fillStyle = "#" + req.query.bg_colour;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (req.query.colour) {
        ctx.fillStyle = "#" + req.query.colour;
    } else {
        ctx.fillStyle = "#b00bie";
    }
    for (let i = 0; i < 25; i++) {
        if (parseInt(usernameHash.toString().split('')[i]) % 2 == 0) {
            ctx.fillRect(positions[i].x, positions[i].y, 100, 100);
        }
    }

    res.setHeader('Content-Type', 'image/png');
    canvas.pngStream().pipe(res);
});


app.listen(port, () => {
    console.log("Ready!");
    console.log("now running on port " + port);
})