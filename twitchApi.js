const {get, post} = require('axios');
const express = require('express');

const CLIENT_ID = 'mg7q35avnbd00b4jdzaqh6fhhhw0bq';
const CLIENT_SECRET = 'k875s25t9ua3pkurinx1dswpdpde38';
const REDIRECT_URI = 'http://localhost';
const PORT = '80';

module.exports = class TwitchObserver {
    constructor() {
        this.access_token = null;
    }

    doAuth() {
        this.runServer();
        console.log(this.getAuthUrl());
    }

    getAuthUrl = () => {
        const scope = encodeURIComponent('openid');
        return `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`;
    }

    runServer() {
        const app = express();
        app.get('/', async (req, res) => {
            console.log('code:', req.query.code)
            res.send(await this.getToken(req.query.code));
        });
        app.listen(PORT);
    }

    async getToken(code) {
        const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${REDIRECT_URI}`;
        console.log(url)
        const {data} = await post(url);
        this.access_token = data.access_token;
        console.log('token:', this.access_token);
    }

    async getOnline(logins) {
        const param = logins.join(',');
        const {data: {data}} = await get(`https://api.twitch.tv/helix/streams?user_login=${params}`);
        return data.filter(({type}) => (type === 'live')).map(({user_login}) => user_login);
    }
}