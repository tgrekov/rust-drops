const {get, post} = require('axios');
const TwitchObserver = require('./twitchApi');

const xxx = new TwitchObserver();
xxx.doAuth();

// const token = '9va4zxeqs6mocgi8zcvhjxxr1hzp74';
// const CLIENT_ID = 'mg7q35avnbd00b4jdzaqh6fhhhw0bq';

// (async () => {
//     const {data} = await get(`https://api.twitch.tv/helix/streams?user_login=disguisedtoast&user_login=hjune&user_login=clairade`, {
//         headers: {
//             Authorization: `Bearer ${token}`,
//             'Client-Id': CLIENT_ID,
//         }
//     });
//     console.log(data)
//     // return data.filter(({type}) => (type === 'live')).map(({user_login}) => user_login);
// })()
