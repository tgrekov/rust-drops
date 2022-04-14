module.exports = async function claimItems(page) {
    return await page.evaluate(() => {
        const nodes = document.querySelectorAll('[data-test-selector="DropsCampaignInProgressRewardPresentation-claim-button"]');
        if (nodes.length) {
            Array.from(nodes).map(button => button.click());
        }
    });
}