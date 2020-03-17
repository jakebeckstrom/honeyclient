import fetch from 'node-fetch';

export default class SafeBrowsingManager {
  constructor() {
    // Get Google Safe Browsing key
    this.apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  }

  static checkApiKey() {
    const instance = new SafeBrowsingManager();

    if (!instance.apiKey) {
      console.error(
        `You need an environment variable for GOOGLE_SAFE_BROWSING_API_KEY. Please check slack for this key.
    Quiting honeyclient now.`
      );
      process.exit();
    }
  }

  async getMalwareMatches(URLs) {
    // Make request to Google safe browsing
    const safeBrowsingURL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${this.apiKey}`;
    const requestURLList = URLs.map(entry => {
      const container = {};
      container['url'] = entry;
      return container;
    });
    const request = {
      client: {
        clientId: '4950',
        clientVersion: '0.0.1',
      },
      threatInfo: {
        threatTypes: ['MALWARE'],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: requestURLList,
      },
    };

    try {
      console.log(`Getting Google Safe Browsing information...`);

      // Parse request
      const json = await fetch(safeBrowsingURL, {
        method: 'POST',
        body: JSON.stringify(request),
        responseType: 'application/json',
      }).then(res => res.json());

      if (!json.matches) {
        console.log('No Malware found');

        return [];
      } else {
        console.log('Malware found:');
        console.log(json.matches);

        return json.matches;
      }
    } catch (err) {
      console.error(err);

      throw Error(err.message);
    }
  }
}
