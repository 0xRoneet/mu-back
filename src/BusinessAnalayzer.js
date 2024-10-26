import fetch from "node-fetch";
import dotenv from "dotenv";

class BusinessAnalyzer {
  constructor(modelName = "llama3", endpoint = "http://localhost:11434/api/generate") {
    this.modelName = modelName;
    this.ollamaEndpoint = endpoint;
  }

  async analyzeBusinessData(data) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("No data provided for analysis");
    }

    const prompt = `Given this business data, provide a comprehensive analysis in JSON format:
        ${JSON.stringify(data)}

        Analyze the data and return JSON in this exact structure:
        {
            "summary": {
                "title": "Executive Summary",
                "highlights": [
                    "key point 1",
                    "key point 2"
                ]
            },
            "kpiAnalysis": {
                "metrics": [
                    {
                        "name": "metric name",
                        "value": "calculated value",
                        "trend": "up/down/stable",
                        "insight": "brief insight"
                    }
                ]
            },
            "trendAnalysis": {
                "revenueAnalysis": {
                    "labels": ["period1", "period2"],
                    "values": [number1, number2],
                    "growth": "percentage",
                    "insights": ["insight1", "insight2"]
                },
                "regionalPerformance": {
                    "regions": ["region1", "region2"],
                    "values": [number1, number2],
                    "topRegion": "region name",
                    "insights": ["insight1", "insight2"]
                },
                "profitability": {
                    "margins": [number1, number2],
                    "avgMargin": "percentage",
                    "insights": ["insight1", "insight2"]
                }
            },
            "recommendations": [
                {
                    "title": "recommendation title",
                    "description": "detailed description",
                    "impact": "expected impact"
                }
            ]
        }

        Focus on:
        1. Calculate and identify key trends
        2. Find meaningful patterns
        3. Highlight significant changes
        4. Provide actionable insights
        5. Make data-driven recommendations

        Return only the JSON with no additional text.`;

    try {
      const response = await fetch(this.ollamaEndpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          model: this.modelName,
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const aiResponse = await response.json();
      
      if (!aiResponse || !aiResponse.response) {
        throw new Error("Invalid response format from AI service");
      }

      console.log("Raw AI response:", aiResponse);

      return this.parseAIResponse(aiResponse.response);
    } catch (error) {
      console.error("Error in analyzeBusinessData:", error);
      throw new Error(`Business analysis failed: ${error.message}`);
    }
  }

  parseAIResponse(responseText) {
    try {
      // Extract JSON string from the response
      const jsonString = this.extractJsonString(responseText);
      if (!jsonString) {
        throw new Error("No JSON object found in response");
      }

      // Clean and parse the JSON
      const sanitizedJson = this.sanitizeJson(jsonString);
      console.log("Sanitized JSON:", sanitizedJson);
      
      return JSON.parse(sanitizedJson);
    } catch (parseError) {
      console.error("Parse error:", parseError);
      return this.getFallbackData();
    }
  }

  extractJsonString(text) {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    if (jsonStart === -1 || jsonEnd === -1) return null;
    return text.slice(jsonStart, jsonEnd);
  }

  sanitizeJson(jsonString) {
    return jsonString
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure property names are quoted
      .replace(/:\s*'([^']*?)'/g, ':"$1"')  // Replace single quotes with double quotes for values
      .replace(/:\s*"([^"]*?)"/g, ':"$1"')  // Normalize spacing around quoted values
      .replace(/:\s*([0-9.]+)\s*(,|})/g, ':"$1"$2') // Quote numeric values
      .replace(/:\s*([^",{\[\s][^,}\]]*[^",}\]\s])\s*(,|})/g, ':"$1"$2') // Quote unquoted string values
      .replace(/([0-9]+(?:\.[0-9]+)?)%/g, '"$1%"') // Handle percentage values
      .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
      .replace(/\n/g, ' ') // Remove newlines
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  getFallbackData() {
    return {
      summary: {
        title: "Executive Summary",
        highlights: [
          "Data analysis unavailable",
          "Please check the input data"
        ]
      },
      kpiAnalysis: {
        metrics: [
          {
            name: "Status",
            value: "Error in analysis",
            trend: "stable",
            insight: "Unable to process data"
          }
        ]
      },
      trendAnalysis: {
        revenueAnalysis: {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          values: [0, 0, 0, 0],
          growth: "0%",
          insights: ["Data unavailable"]
        },
        regionalPerformance: {
          regions: ["Region 1", "Region 2"],
          values: [0, 0],
          topRegion: "Unknown",
          insights: ["Data unavailable"]
        },
        profitability: {
          margins: [0, 0, 0],
          avgMargin: "0%",
          insights: ["Data unavailable"]
        }
      },
      recommendations: [
        {
          title: "System Error",
          description: "Unable to generate recommendations due to data processing error",
          impact: "Please try again"
        }
      ]
    };
  }
}

export default BusinessAnalyzer;