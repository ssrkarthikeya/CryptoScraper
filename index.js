const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

async function getPriceFeed() {
    try {
        const siteUrl = 'https://coinmarketcap.com/';

        const { data } = await axios({
            method: 'GET',
            url: siteUrl
        });

        const $ = cheerio.load(data);
        const elmSelector = '#__next > div > div.main-content > div.sc-57oli2-0.dEqHl.cmc-body-wrapper > div > div > div.tableWrapper___3utdq.cmc-table-homepage-wrapper___22rL4 > table > tbody > tr';

        const keys = [
            'rank',
            'name',
            'price',
            '24H',
            '7D',
            'marketCap',
            'vol',
            'circulatingSupply'
        ];

        const coinArray = [];

        $(elmSelector).each((parentIdx, parentElm) => {
            let keyIndex = 0;
            const coinObj = {}

            if (parentIdx <= 9) {
                $(parentElm).children().each((childIdx, childElm) => {
                    let tdValue = $(childElm).text();

                    if (keyIndex == 1 || keyIndex == 6) {
                        tdValue = $('p:first-child', $(childElm).html()).text();
                    }

                    if (tdValue) {
                        coinObj[keys[keyIndex]] = tdValue;
                        keyIndex++;
                    }
                });
                coinArray.push(coinObj);
            }
        })
        return coinArray;
    }
    catch (err) {
        console.error(err);
    }
}

const app = express();

app.get('/api/price-feed', async (req, res) => {
    try {
        const priceFeed = await getPriceFeed();
        return res.status(200).json({
            esult: priceFeed
        })
    }
    catch (err) {
        return res.status(500).json({
            err: err.toString()
        })
    }
});

app.listen(3000, () => {
    console.log('Running server on prot 3000');
})