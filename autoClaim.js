const Viewer = require('./Viewer');
const viewer = new Viewer();

(async () => {
    await viewer.connectToBrowser()
    await viewer.start('https://www.twitch.tv/drops/inventory');
    setInterval(loop, 20000);
})()

async function loop() {
    await viewer.reload();
    await viewer.claimItems();
}