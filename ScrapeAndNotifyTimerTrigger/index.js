const kijiji = require('kijiji-scraper');
const https = require('https');

function getHashedProcessedAdUrls(hashedProcessedAdsUrl, apiKey) {
    return new Promise((resolve, reject) => {
        https.get(
            hashedProcessedAdsUrl,
            {
                headers: {
                    'x-apikey': apiKey
                }
            },
            (resp) => {
                let data = '';

                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    resolve(JSON.parse(data));
                });
            }
        ).on('error', (err) => {
            reject(err.message);
        });
    });
}
 
module.exports = async function (context, myTimer) {
    let options = {
        minResults: 20
    };
     
    let params = {
        locationId: kijiji.locations.QUEBEC.GREATER_MONTREAL.CITY_OF_MONTREAL,
        categoryId: kijiji.categories.REAL_ESTATE.APARTMENTS_AND_CONDOS_FOR_RENT,
        sortByName: 'dateDesc',
        keywords: 'villeray',
        minPrice: 1000
    };

    const ads = await kijiji.search(params, options);

    const hashedProcessedAdUrls = await getHashedProcessedAdUrls(
        process.env['HashedProcessedAdsUrl'],
        process.env['RestdbApiKey']
    );

    context.log(hashedProcessedAdUrls);

    // Use the ads array
    for (let i = 0; i < ads.length; ++i) {
        context.log(ads[i].title);
    }
};
