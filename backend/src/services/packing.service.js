export class PackingService {
  /**
   * Generates dynamic packing items based on forecasted weather conditions for the destination
   */
  static generatePackingList(forecastData, destinationName) {
    const generatedItems = [];
    const daily = forecastData?.daily || {};

    const maxTemp = daily.temperature_2m_max ? Math.max(...daily.temperature_2m_max) : 30;
    const minTemp = daily.temperature_2m_min ? Math.min(...daily.temperature_2m_min) : 20;
    const maxRainProb = daily.precipitation_probability_max ? Math.max(...daily.precipitation_probability_max) : 10;
    const maxUv = daily.uv_index_max ? Math.max(...daily.uv_index_max) : 5;

    // Rain gear
    if (maxRainProb > 30) {
      generatedItems.push({ item: 'Compact Travel Umbrella', reason: `High rain chance (${maxRainProb}%)` });
      generatedItems.push({ item: 'Water-resistant Windbreaker / Raincoat', reason: 'Precipitation expected' });
      generatedItems.push({ item: 'Waterproof Footwear', reason: 'Wet streets & puddles' });
    }

    // Cold weather gear
    if (minTemp < 10) {
      generatedItems.push({ item: 'Heavy Winter Jacket', reason: `Freezing temperatures (${minTemp}°C)` });
      generatedItems.push({ item: 'Thermal Underwear & Woolen Socks', reason: 'Sub-10°C evenings' });
      generatedItems.push({ item: 'Beanie & Gloves', reason: 'Cold wind chills' });
    } else if (minTemp < 18) {
      generatedItems.push({ item: 'Light Jacket or Fleece Pullover', reason: `Chilly nights (${minTemp}°C)` });
      generatedItems.push({ item: 'Full-length Pants/Jeans', reason: 'Moderate evening dip' });
    }

    // Warm & Sunny gear
    if (maxTemp > 30) {
      generatedItems.push({ item: 'Breathable Cotton / Linen Apparel', reason: `Warm daytime weather (${maxTemp}°C)` });
      generatedItems.push({ item: 'Electrolyte Hydration Packets', reason: 'Heat exhaustion prevention' });
    }

    // Sun protection
    if (maxUv >= 6) {
      generatedItems.push({ item: 'Broad Spectrum Sunscreen (SPF 50+)', reason: `High UV index (${maxUv})` });
      generatedItems.push({ item: 'UV-blocking Sunglasses', reason: 'Intense sunlight' });
      generatedItems.push({ item: 'Wide-brimmed Hat / Cap', reason: 'Direct sun exposure' });
    }

    // Default travel essentials
    generatedItems.push({ item: 'Universal Power Adapter', reason: 'Travel essential' });
    generatedItems.push({ item: 'Personal Medications & First Aid Kit', reason: 'Safety' });

    return {
      destination: destinationName,
      weather_summary: {
        max_temp: maxTemp,
        min_temp: minTemp,
        max_rain_probability: maxRainProb,
        max_uv_index: maxUv,
      },
      items: generatedItems,
    };
  }
}

