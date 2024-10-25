import PitchDeckGenerator from "./src/PitchDeckGenerator.js";

async function main() {
  const generator = new PitchDeckGenerator("llama3");

  const data = [
    {
      month: "2024 - 01",
      revenue: 342500,
      units_sold: 2850,
      avg_price: 120.18,
      cost_of_goods: 239750,
      profit_margin: 29.8,
      region: "North",
    },
    {
      month: "2024 - 02",
      revenue: 368900,
      units_sold: 3100,
      avg_price: 119.0,
      cost_of_goods: 251200,
      profit_margin: 31.9,
      region: "North",
    },
    {
      month: "2024 - 03",
      revenue: 412600,
      units_sold: 3400,
      avg_price: 121.35,
      cost_of_goods: 278400,
      profit_margin: 32.5,
      region: "North",
    },
    {
      month: "2024 - 01",
      revenue: 289400,
      units_sold: 2400,
      avg_price: 120.58,
      cost_of_goods: 208800,
      profit_margin: 27.9,
      region: "South",
    },
    {
      month: "2024 - 02",
      revenue: 315200,
      units_sold: 2600,
      avg_price: 121.23,
      cost_of_goods: 221000,
      profit_margin: 29.9,
      region: "South",
    },
    {
      month: "2024 - 03",
      revenue: 342500,
      units_sold: 2850,
      avg_price: 120.18,
      cost_of_goods: 235150,
      profit_margin: 31.3,
      region: "South",
    },
  ];

  try {
    console.log("Starting presentation generation...");
    const filename = await generator.generatePitchDeck(data);
    console.log(`Presentation generated successfully: ${filename}`);
  } catch (error) {
    console.error("Failed to generate presentation:", error);
  }
}

main();
