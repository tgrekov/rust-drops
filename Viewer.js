const puppeteer = require('puppeteer');

const BROWSER_URL = 'http://127.0.0.1:9222';

module.exports = class Viewer {
    constructor() {
        this.browser = null;
        this.page = null;
    }
    async connectToBrowser() {
        this.browser = await puppeteer.connect({browserURL: BROWSER_URL});
    }
    async start(url) {
        this.page = await this.browser.newPage();
        await this.page.bringToFront();
        await this.page.goto(url);
        await this.page.evaluate(() => {
            setTimeout(async () => {
                const button = document.querySelector('[data-a-target="player-overlay-mature-accept"]');
                button && button.click();
            }, 10000); //waiting 10s for page to load
        });
    }
    async stop() {
        await this.page.close();
        this.page = null;
    }
    //<button class="ScCoreButton-sc-1qn4ixc-0 ScCoreButtonPrimary-sc-1qn4ixc-1 fVEFfF qFnsi" data-test-selector="DropsCampaignInProgressRewardPresentation-claim-button">
    async claimItems() {
        const page = await this.browser.newPage();
        await page.goto('https://www.twitch.tv/drops/inventory');
        setTimeout(async () => {
            await page.evaluate(() => {
                const nodes = document.querySelectorAll('[data-test-selector="DropsCampaignInProgressRewardPresentation-claim-button"]');
                if (nodes.length) {
                    Array.from(nodes).map(button => button.click());
                }
            });
        }, 10000); //waiting 10s for page to load
    }
}