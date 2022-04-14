# Preparations
1. Prepare new chrome shortcut with params:`--remote-debugging-port=9222 --user-data-dir="C:/chromeuser" --no-first-run --no-default-browser-check`
2. create `C:/chromeuser` dir
3. open this chrome, login into twitch and steam, enable drops
4. npm install

# Usage
1. Open newly created chrome
2. Make sure `data.json` file contains json with link to streamers as keys and 0 as values
3. Run `node index.json`