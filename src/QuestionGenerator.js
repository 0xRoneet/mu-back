// src/QuestionGenerator.js
import fetch from "node-fetch";

class QuestionGenerator {
  constructor(modelName = "llama3") {
    this.modelName = modelName;
    this.ollamaEndpoint = "http://localhost:11434/api/generate";
  }

  async generateQuestions(businessData) {
    const prompt = `Given this business data, generate 10 strategic questions that would help understand the business better.

Business Data:
${JSON.stringify(businessData, null, 2)}

Generate exactly "10" questions like this and in this specific JSON format, ensuring all property names and string values
 {
    id: 1-10,
    question: "What is your primary business model?",
    description: "Choose your main revenue generation approach",
    options: ["B2B", "B2C", "SaaS", "Marketplace"],
    type:can be text
  },


Importance must be a string number from "1" to "5"
Ensure proper JSON formatting with commas between objects with md formatinside json 

Return only the JSON{.md inside} with 10 questions and like the wxample i gave above and no additional text or formatting.json only do not add any extra string`;

    try {
      const response = await fetch(this.ollamaEndpoint, {
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

      const result = await response.json();
      console.log("Raw AI response:", result.response); // For debugging
      
      return result.response;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
}

export default QuestionGenerator;