const processScrapedData = (scrapedData) => {
    // Process the scraped data to extract relevant information
    const processedData = scrapedData.map(data => {
        return {
            title: data.title || 'No Title',
            description: data.description || 'No Description',
            images: data.images || [],
            links: data.links || [],
            // Add any other relevant fields you want to extract
        };
    });
    return processedData;
};

const prepareDataForAI = (processedData) => {
    // Prepare the processed data for sending to the AI API
    const aiPayload = {
        destinations: processedData,
        // Add any additional parameters required by the AI API
    };
    return aiPayload;
};

module.exports = {
    processScrapedData,
    prepareDataForAI,
};