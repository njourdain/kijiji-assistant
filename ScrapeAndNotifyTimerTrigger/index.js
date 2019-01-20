const kijiji = require("kijiji-scraper");
 
module.exports = async function (context, myTimer) {
    let options = {
        minResults: 20
    };
     
    let params = {
        locationId: kijiji.locations.QUEBEC.GREATER_MONTREAL.CITY_OF_MONTREAL,
        categoryId: kijiji.categories.REAL_ESTATE.APARTMENTS_AND_CONDOS_FOR_RENT,
        sortByName: "dateDesc",
        keywords: "villeray",
        minPrice: 1000
    };

    const ads = await kijiji.search(params, options);

    // Use the ads array
    for (let i = 0; i < ads.length; ++i) {
        context.log(ads[i].title);
    }
};
