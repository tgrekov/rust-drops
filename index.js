const axios = require('axios');
const cheerio = require('cheerio');
const {readFile} = require('fs').promises;
const Viewer = require('./Viewer');


const LIST = 'https://twitch.facepunch.com/';
const DATA = './data.json';
const DELAY = 3*60*1000; // 3min
const DURATION = 3*60*60*1000; //3h //todo: custom duration

const viewer = new Viewer();
let currentStreamer = null;
let requiredStreamers = {};
let closingTimeoutId = null;


(async () => {
    console.log('start');
    await viewer.connectToBrowser();
    await loadRequiredStreamers();
    console.log('LOADED:', requiredStreamers);
    loop(); setInterval(loop, DELAY);
})();

async function loop() {
    const activeStreamers = await loadActiveStreamers();
    console.log({activeStreamers});
    if (!currentStreamer || !activeStreamers.includes(currentStreamer)) {
        currentStreamer && await stop();
        currentStreamer = activeStreamers.shift();

        if (!currentStreamer) {
            console.log('Nobody to watch.')
            return;
        }

        const timeToWatch = getDuration(currentStreamer);
        console.log(`Going to watch`, [currentStreamer], `for`, timeToWatch, `ms`);

        await viewer.start(currentStreamer);
        viewer.confirmAgeLoop();
        closingTimeoutId = setTimeout(async () => {
            await stop();
            loop();
        }, timeToWatch);
    } else {
        console.log('keep watching', currentStreamer)
    }
}

async function stop() {
    delete requiredStreamers[currentStreamer];
    await viewer.stop();
    currentStreamer = null;
    clearTimeout(closingTimeoutId);
    closingTimeoutId = null;

    if (Object.keys(requiredStreamers).length === 0) {
        process.exit();
    }
}

async function loadRequiredStreamers() {
    const data = await readFile(DATA, {encoding: 'utf8'});
    requiredStreamers = JSON.parse(data);
    Object.keys(requiredStreamers).forEach(streamer => {
        requiredStreamers[streamer] = parseInt(requiredStreamers[streamer]);
    });
}

async function loadActiveStreamers() {
    const {data} = await axios.get(LIST);
    const $ = cheerio.load(data);

    const allStreamers = [];
    $('a.drop-tile').map((i, el) => {
        allStreamers.push([
            el.attribs.href,
            el.attribs.class.split(' ').includes('is-live'),
        ]);
    });

    const requiredStreamersList = Object.keys(requiredStreamers);
    return (
        allStreamers
            .filter(([streamer, isOnline]) => isOnline && requiredStreamersList.includes(streamer))
            .map(([streamer]) => streamer)
            .sort((a,b) => (requiredStreamers[b] - requiredStreamers[a]))
    );
}

function getDuration(streamer) {
    const progress = requiredStreamers[streamer];
    return DURATION * ((100 - progress) / 100);
}