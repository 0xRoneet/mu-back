import fetch from 'node-fetch';

const testData = [
  {
    month: "2024 - 01",
    revenue: 342500,
    units_sold: 2850,
    avg_price: 120.18,
    cost_of_goods: 239750,
    profit_margin: 29.8,
    region: "North",
  },    
];

async function testServer() {
  try {
    // Test the analysis endpoint
    console.log('Testing analysis endpoint...');
    const analysisResponse = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const analysisResult = await analysisResponse.json();
    console.log('Analysis Response:', analysisResult);

    // Test the direct presentation generation endpoint
    console.log('\nTesting presentation generation endpoint...');
    const presentationResponse = await fetch('http://localhost:3000/api/generate-presentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const presentationResult = await presentationResponse.json();
    console.log('Presentation Response:', presentationResult);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testServer();