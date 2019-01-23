const kijiji = require('kijiji-scraper');
const request = require('request');
const crypto = require('crypto');

function getHashedProcessedAdUrls(hashedProcessedAdsUrl, apiKey) {
    return new Promise((resolve, reject) => {
        request(
            {
                url: hashedProcessedAdsUrl,
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

function saveHashedProcessedAdUrls(hashedProcessedAdsUrl, apiKey, data) {
    return new Promise((resolve, reject) => {
        request.put(
            {
                url: hashedProcessedAdsUrl,
                headers: {
                    'x-apikey': apiKey
                },
                json: true,
                body: data
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

function sendWarningToSlack(webhook, warning) {
    return new Promise((resolve, reject) => {
        request.post(
            {
                url: webhook,
                json: true,
                body: {
                    text: warning
                }
            },
            (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(true)
                } else {
                    reject(error || response.statusCode)
                }
            }
        );
    });
}

function sendAdToSlack(webhook, ad) {
    return new Promise((resolve, reject) => {
        request.post(
            {
                url: webhook,
                json: true,
                body: {
                    attachments: [{
                        fallback: ad.title,
                        title: ad.title,
                        title_link: ad.url,
                        text: ad.description.substring(0, 50),
                        image_url: ad.image,
                        fields: [{
                            title: 'Price',
                            value: ad.attributes.price,
                            short: true
                        }]
                    }]
                }
            },
            (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(true)
                } else {
                    reject(error || response.statusCode)
                }
            }
        );
    });
}

function getHashFromString(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

async function scrapeAndNotify(searchTerm, slackWebhook, hashedProcessedAdUrls) {
    let options = {
        minResults: 20
    };
     
    let params = {
        locationId: kijiji.locations.QUEBEC.GREATER_MONTREAL.CITY_OF_MONTREAL,
        categoryId: kijiji.categories.REAL_ESTATE.APARTMENTS_AND_CONDOS_FOR_RENT,
        sortByName: 'dateDesc',
        keywords: searchTerm,
        minPrice: 1000
    };

    const ads = await kijiji.search(params, options);

    for (let i = 0; i < ads.length; ++i) {
        const ad = ads[i];
        const hash = getHashFromString(ad.url);

        if (hashedProcessedAdUrls[hash]) {
            continue;
        }

        if (i === (ads.length - 1) && !hashedProcessedAdUrls[hash]) {
            await sendWarningToSlack(
                slackWebhook,
                'The last retrieved message was new, older ads might be worth checking!'
            );
        }

        // send ad to slack
        await sendAdToSlack(slackWebhook, ad);

        // update processed dictionary
        hashedProcessedAdUrls[hash] = true;
    }
};
 
module.exports = async function (context, myTimer) {
    const hashedProcessedAdUrls = await getHashedProcessedAdUrls(
        process.env['HashedProcessedAdsUrl'],
        process.env['RestdbApiKey']
    );

    await scrapeAndNotify('villeray', proccess.env['SlackWebhookVilleray'], hashedProcessedAdUrls);
    await scrapeAndNotify('jean+talon', proccess.env['SlackWebhookJeanTalon'], hashedProcessedAdUrls);
    await scrapeAndNotify('beaubien', proccess.env['SlackWebhookBeaubien'], hashedProcessedAdUrls);

    await saveHashedProcessedAdUrls(
        process.env['HashedProcessedAdsUrl'],
        process.env['RestdbApiKey'],
        hashedProcessedAdUrls
    );
};
