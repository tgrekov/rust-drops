const puppeteer = require('puppeteer');
const claimItems = require('./twitchUtils/claimItems');
const confirmAge = require('./twitchUtils/confirmAge');

const BROWSER_URL = 'http://127.0.0.1:9222';

module.exports = class Viewer {
    constructor() {
        this.browser = null;
        this.page = null;
        this.ageLoop = null;
    }
    async connectToBrowser() {
        this.browser = await puppeteer.connect({browserURL: BROWSER_URL});
    }
    async start(url) {
        this.page = await this.browser.newPage();
        await this.page.bringToFront();
        await this.page.goto(url);

    }
    async stop() {
        await this.page.close();
        this.page = null;
        if (this.ageLoop) {
            clearInterval(this.ageLoop);
            this.ageLoop = null;
        }
    }

    async reload() {
        await this.page.reload();
        await this.wait(10000); //todo: find way to catch load event
    }

    async wait(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    //<button class="ScCoreButton-sc-1qn4ixc-0 ScCoreButtonPrimary-sc-1qn4ixc-1 fVEFfF qFnsi" data-test-selector="DropsCampaignInProgressRewardPresentation-claim-button">
    async claimItems() {
        return claimItems(this.page);
    }

    confirmAgeLoop() {
        this.ageLoop = setInterval(() => (this.page && confirmAge(this.page)), 3000);
    }
}