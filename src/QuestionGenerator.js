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

Generate exactly "10" questions in this specific JSON format, ensuring all property names and string values are in double quotes:
{
  "questions": [
    {
      "id": "1",
      "question": "What is the current market share and how has it evolved over the past year?",
      "category": "market",
      "importance": "5",
      "insight_goal": "Understand market position and growth trajectory"
    }
  ]
}

Categories must be one of these exact values: "strategy", "operations", "market", "customers", "growth", "finance", "competition"
Importance must be a string number from "1" to "5"
All text values must be in double quotes
Ensure proper JSON formatting with commas between objects

Return only the JSON with 10 questions and like the wxample i gave above and no additional text or formatting.`;

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

      // Clean the response
      let cleanedResponse = result.response
        .replace(/\n/g, '')
        .replace(/\s+/g, ' ')
        .replace(/([''])/g, '"')  // Replace single quotes with double quotes
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')  // Ensure property names are quoted
        .replace(/:\s*([0-9]+)([,}])/g, ':"$1"$2')  // Quote numeric values
        .trim();

      // Backup validation object in case parsing fails
      const fallbackResponse = {
        questions: [
          {
            id: "1",
            question: "What are the key drivers of the business's current performance?",
            category: "strategy",
            importance: "5",
            insight_goal: "Understand core business dynamics"
          }
        ]
      };

      try {
        const parsedData = JSON.parse(cleanedResponse);
        
        // Validate the structure
        if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
          console.warn("Invalid response structure, using fallback");
          return fallbackResponse;
        }

        // Ensure all questions have required fields and proper formatting
        parsedData.questions = parsedData.questions.map((q, index) => ({
          id: String(index + 1),
          question: String(q.question || ""),
          category: String(q.category || "strategy"),
          importance: String(q.importance || "3"),
          insight_goal: String(q.insight_goal || "")
        }));

        return parsedData;
      } catch (parseError) {
        console.error("Parse error:", parseError);
        console.log("Cleaned response that failed to parse:", cleanedResponse);
        
        // Try to extract JSON using regex as last resort
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch {
            console.warn("Regex extraction failed, using fallback");
            return fallbackResponse;
          }
        }
        
        console.warn("All parsing attempts failed, using fallback");
        return fallbackResponse;
      }
    } catch (error) {
      console.error("Error in question generation:", error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }
}

export default QuestionGenerator;