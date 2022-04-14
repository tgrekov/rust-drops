module.exports = async function confirmAge(page) {
    return page.evaluate(() => {
        const button = document.querySelector('[data-a-target="player-overlay-mature-accept"]');
        button && button.click();
    });
}