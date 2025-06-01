MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

function main() {
    let partyStats = document.querySelectorAll(".party-stats__stat-value");
    let partyLevel = Number(partyStats[partyStats.length - 1].innerText);
    let charCount = Number(partyStats[partyStats.length - 2].innerText);
    let cr_table = [
        {level: 1, low: 50, moderate: 75, high: 100},
        {level: 2, low: 100, moderate: 150, high: 200},
        {level: 3, low: 150, moderate: 225, high: 400},
        {level: 4, low: 250, moderate: 375, high: 500},
        {level: 5, low: 500, moderate: 750, high: 1100},
        {level: 6, low: 600, moderate: 1000, high: 1400},
        {level: 7, low: 750, moderate: 1300, high: 1700},
        {level: 8, low: 1000, moderate: 1700, high: 2100},
        {level: 9, low: 1300, moderate: 2000, high: 2600},
        {level: 10, low: 1600, moderate: 2300, high: 3100},
        {level: 11, low: 1900, moderate: 2900, high: 4100},
        {level: 12, low: 2200, moderate: 3700, high: 4700},
        {level: 13, low: 2600, moderate: 4200, high: 5400},
        {level: 14, low: 2900, moderate: 4900, high: 6200},
        {level: 15, low: 3300, moderate: 5400, high: 7800},
        {level: 16, low: 3800, moderate: 6100, high: 9800},
        {level: 17, low: 4500, moderate: 7200, high: 11700},
        {level: 18, low: 5000, moderate: 8700, high: 14200},
        {level: 19, low: 5500, moderate: 10700, high: 17200},
        {level: 20, low: 6400, moderate: 13200, high: 22000}
    ];

    function getXpBudget() {
        if(Number.isInteger(partyLevel)) {
            let cr = {...cr_table.filter(f => f.level === partyLevel)[0]};
            cr.low += charCount;
            cr.moderate += charCount;
            cr.high += charCount;
            return cr;
        }
        let lowerPL = Number(Math.floor(partyLevel).toFixed(0)), higherPL = Number(Math.floor(partyLevel + 1).toFixed(0));
        let mult = partyLevel % 1;
        let lowerCR = cr_table.filter(f => f.level === lowerPL)[0], higherCR = cr_table.filter(f => f.level === higherPL)[0];
        return {
            level: partyLevel,
            low: Math.round((lowerCR.low + ((higherCR.low - lowerCR.low) * mult)) * charCount),
            moderate: Math.round((lowerCR.moderate + ((higherCR.moderate - lowerCR.moderate) * mult)) * charCount),
            high: Math.round((lowerCR.high + ((higherCR.high - lowerCR.high) * mult)) * charCount)
        }
    }

    let partyCR = getXpBudget();
    let origDisplay = document.querySelector(".encounter-builder-difficulty-summary__flex-wrapper");
    let origBar = document.querySelector(".difficulty-bar.encounter-builder-difficulty-summary__difficulty-bar");
    let container = document.querySelector(".encounter-builder-sidebar__summary.encounter-builder-difficulty-summary");
    origDisplay.style['display'] = 'none'
    origBar.style['display'] = 'none'
    function createElementFromHTML(htmlString) {
        var div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
    }
    function buildCrHtml(cr, xp) {
        let diff = "Low";
        if(xp > cr.moderate) diff = "Moderate";
        if(xp > cr.high) diff = "High";
        return createElementFromHTML("<div class='encounter-builder-difficulty-summary__flex-wrapper dndb-cr-calc'>" +
            "<div class='encounter-builder-difficulty-summary__stats'>" +
                "<div class='encounter-builder-difficulty-summary__stat-difficulty line-item line-item--vertical'>" +
                    "<div class='line-item__label'>Difficulty</div>" +
                    "<div class='line-item__value'>" +
                        "<span class='difficulty-text difficulty-text--'>" + diff + "</span> " +
                    "</div>" +
                "</div>" +
                "<div class='encounter-builder-difficulty-summary__stat-total-xp line-item line-item--vertical'>" +
                    "<div class='line-item__label' title='Total Experience Points'>Total XP</div>" +
                    "<div class='line-item__value'>" + xp + " XP</div>" +
                "</div>" +
            "</div>" +
            "<div class='encounter-builder-difficulty-summary__xp-legend'>" +
                "<div class='line-item line-item--horizontal'>" +
                    "<div class='line-item__label'>Low:</div>" +
                    "<div class='line-item__value'>" + cr.low + " XP</div>" +
                "</div>" +
                "<div class='line-item line-item--horizontal'>" +
                    "<div class='line-item__label'>Moderate:</div>" +
                    "<div class='line-item__value'>" + cr.moderate + " XP</div>" +
                "</div>" +
                "<div class='line-item line-item--horizontal'>" +
                    "<div class='line-item__label'>High:</div>" +
                    "<div class='line-item__value'>" + cr.high + " XP</div>" +
                "</div>" +
            "</div>" +
        "</div>" +
        "<div class='diff-bar'>" + 
            "<div>" + 
            "</div>" + 
        "</div>");
    }
    function buldDiffBar(cr, xp) {
        let bg = "#ccc";
        if (xp >= cr.low) {
            bg = "#0cc30c";
        }
        if (xp >= cr.moderate) {
            bg = "#ffca00";
        }
        if (xp >= cr.high) {
            bg = "#cd2a2a";
        }

        let width = ((xp / cr.high) * 100).toFixed(0);
        if(width > 100) width = 100;

        return createElementFromHTML(
            "<div class='diff-bar' style='height: 30px;background: #ddd; margin-top: 20px;'>" +
            "<div style='height: 30px;background: " + bg + ";width: " + width + "%;'>" +
                "</div>" +
            "</div>");
    }
    function getXp() {
        let xps = document.querySelectorAll(".encounter-builder-sidebar__tabs .difficulty__value");
        let counts = document.querySelectorAll(".encounter-monster__quantity-stepper.input-stepper.input-stepper--mini.input-stepper--vertical input");
        let budget = 0;
        for(let i = 0; i < counts.length; i++) {
            let count = Number(counts[i].value);
            let xp  = Number(xps[(i * 2) + 1].innerText);
            console.log(count, xp);
            budget += xp * count;
        }
        return budget;
    };

    container.appendChild(buildCrHtml(partyCR, 0));
    container.appendChild(buldDiffBar(partyCR, 0));

    var observer = new MutationObserver(function (mutations, observer) {
        setTimeout(() => {
            if (document.querySelector(".dndb-cr-calc")) document.querySelector(".dndb-cr-calc").remove();
            if (document.querySelector(".diff-bar")) document.querySelector(".diff-bar").remove();
            container.appendChild(buildCrHtml(partyCR, getXp()));
            container.appendChild(buldDiffBar(partyCR, getXp()));
        }, 250);
    });

    observer.observe(document.querySelector(".encounter-builder-sidebar__tabs"), {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true
    });

    
}; 

function wait() {
    let partyStats = document.querySelectorAll(".party-stats__stat-value");
    if(partyStats !== null && partyStats.length < 2) {
        setTimeout(wait, 50);
    }
    else main();
}
wait();