const kijiji = require('kijiji-scraper');
const request = require('request');

function getHashedProcessedAdUrls(hashedProcessedAdsUrl, apiKey) {
    return new Promise((resolve, reject) => {
        request(
            {
                url:hashedProcessedAdsUrl,
                headers: {
                    'x-apikey': apiKey
                }
            },
            (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body))
                } else {
                    reject(error || response.statusCode)
                }
            }
        );
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

    for (let i = 0; i < ads.length; ++i) {
        // if the first ad is not processed, send warning to slack

        // send ad to slack

        // update processed dictionary
        context.log(ads[i].title);
    }

    // save dictionary
};
