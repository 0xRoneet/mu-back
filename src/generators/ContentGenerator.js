const fetch = require("node-fetch");

class ContentGenerator {
  constructor(modelName = "mistral") {
    this.modelName = modelName;
    this.endpoint = process.env.OLLAMA_API_ENDPOINT;
  }

  async generateContent(companyInfo) {
    const prompt = `Create content for a pitch deck with the following company information:
            ${JSON.stringify(companyInfo)}
            
            Generate a pitch deck with exactly 8 slides. The response should be in valid JSON format with the following structure:
            {
                "slides": [
                    {
                        "title": "slide title",
                        "content": ["point 1", "point 2"],
                        "type": "slide type",
                        "imagePrompt": "description for slide image"
                    }
                ]
            }
            
            Include these slide types in order:
            1. Title slide (with company logo prompt)
            2. Problem (with illustration of the problem)
            3. Solution (with product screenshot/mockup)
            4. Market Size (with market graph illustration)
            5. Product Features (with product interface)
            6. Business Model (with business flow diagram)
            7. Competition (with comparison chart)
            8. Team & Contact (with professional team illustration)
            
            For each slide, include an imagePrompt that describes a professional, corporate-style image.
            Keep points concise and impactful. Return only the JSON, no additional text.`;

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.modelName,
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  }
}

module.exports = ContentGenerator;
