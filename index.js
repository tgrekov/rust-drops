const axios = require('axios');
const cheerio = require('cheerio');
const {readFile} = require('fs').promises;
const Viewer = require('./Viewer');


const LIST = 'https://twitch.facepunch.com/';
const DATA = './data.json';
const DELAY = 1*60*1000; // 1min
const DURATION = 3*60*60*1000 + 5*60*1000; //3h + 5m //todo: custom duration

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
        requiredStreamers[streamer.toLowerCase()] = parseInt(requiredStreamers[streamer]); //!lower
    });
}

// async function loadActiveStreamers() {
//     const {data} = await axios.get(LIST);
//     const $ = cheerio.load(data);

//     const allStreamers = [];
//     $('a.drop-tile').map((i, el) => {
//         allStreamers.push([
//             el.attribs.href,
//             el.attribs.class.split(' ').includes('is-live'),
//         ]);
//     });

//     const requiredStreamersList = Object.keys(requiredStreamers);
//     return (
//         allStreamers
//             .filter(([streamer, isOnline]) => isOnline && requiredStreamersList.includes(streamer))
//             .map(([streamer]) => streamer)
//             .sort((a,b) => (requiredStreamers[b] - requiredStreamers[a]))
//     );
// }

async function loadActiveStreamers() {
    const token = '7d9evf8on3vocg02jm7a1fyq2phym2';
    const CLIENT_ID = 'mg7q35avnbd00b4jdzaqh6fhhhw0bq';

    const requiredStreamersList = Object
        .keys(requiredStreamers)
        .map(url => url.replace('https://www.twitch.tv/', ''))
        .map(login => `user_login=${login}`)
        .join('&');

    const {data} = await axios.get(`https://api.twitch.tv/helix/streams?${requiredStreamersList}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Client-Id': CLIENT_ID,
        }
    });

    console.log({TWITCH: data.data.map(item => [item.user_login, item.type])})

    return data.data
        .filter(({type}) => (type === 'live'))
        .map(({user_login}) => `https://www.twitch.tv/${user_login}`)
        .sort((a,b) => (requiredStreamers[b.toLowerCase()] - requiredStreamers[a.toLowerCase()]))
}

function getDuration(streamer) {
    const progress = requiredStreamers[streamer];
    return DURATION * ((100 - progress) / 100);
}