import PptxGenJS from "pptxgenjs";
import fetch from "node-fetch";
import dotenv from "dotenv";

class PitchDeckGenerator {
  constructor(modelName = "llama3") {
    this.pptx = new PptxGenJS();
    this.modelName = "llama3";
    this.ollamaEndpoint = "http://localhost:11434/api/generate";
    // this.initializePresentation();
  }

  initializePresentation() {
    this.pptx.layout = "LAYOUT_WIDE";
    this.pptx.defineLayout({
      name: "CUSTOM",
      width: 13.33,
      height: 7.5,
    });

    this.pptx.theme = {
      headFontFace: "Calibri Light",
      bodyFontFace: "Calibri",
      colors: {
        accent1: "0078D4",
        accent2: "2B579A",
        accent3: "1E3264",
        background1: "FFFFFF",
        background2: "F5F5F5",
        text1: "2B2B2B",
        text2: "444444",
      },
    };
  }

  async getAIReadme(data) {}

  async getAIAnalysis(data) {
    const prompt = `Given this business data, provide a comprehensive analysis in very beautifull markdown code:
        ${JSON.stringify(data)}

        Analyze the data and return a very beautifull markdown code,
        give summary, highlights, KPI analysis, trend analysis, and recommendations.

        Focus on:
        1. Calculate and identify key trends
        2. Find meaningful patterns
        3. Highlight significant changes
        4. Provide actionable insights
        5. Make data-driven recommendations
        6. Most Importantly, Give solution based on the data to increase sales.

        Return only the markdown code.`;

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
      const aiResponse = await response.json();
      console.log("Raw AI response:", aiResponse);

      return aiResponse;
    } catch (error) {
      console.error("Error in getAIAnalysis:", error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  async createExecutiveSummarySlide(analysis) {
    const slide = this.pptx.addSlide();

    // Add title
    slide.addText("Executive Summary", {
      x: 0.5,
      y: 0.3,
      w: "95%",
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: this.pptx.theme.colors.accent1,
    });

    // Add highlights in modern cards
    analysis.summary.highlights.forEach((highlight, index) => {
      slide.addShape(this.pptx.ShapeType.rect, {
        x: 0.5,
        y: 1.2 + index * 1.2,
        w: "95%",
        h: 1,
        fill: { color: "F8F9FA" },
        line: { color: "E0E0E0", width: 1 },
        shadow: {
          type: "outer",
          blur: 3,
          offset: 2,
          angle: 45,
          color: "D6D6D6",
          opacity: 0.3,
        },
      });

      slide.addText(highlight, {
        x: 1,
        y: 1.4 + index * 1.2,
        w: "90%",
        fontSize: 16,
        color: this.pptx.theme.colors.text2,
      });
    });
  }

  async createKPISlide(analysis) {
    const slide = this.pptx.addSlide();

    slide.addText("Key Performance Indicators", {
      x: 0.5,
      y: 0.3,
      w: "95%",
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: this.pptx.theme.colors.accent1,
    });

    // Create KPI cards
    analysis.kpiAnalysis.metrics.forEach((metric, index) => {
      const x = 0.5 + (index % 3) * 4.2;
      const y = 1.2 + Math.floor(index / 3) * 2;

      // Card background
      slide.addShape(this.pptx.ShapeType.rect, {
        x: x,
        y: y,
        w: 4,
        h: 1.8,
        fill: { color: "F8F9FA" },
        line: { color: "E0E0E0", width: 1 },
        shadow: {
          type: "outer",
          blur: 3,
          offset: 2,
          angle: 45,
          color: "D6D6D6",
          opacity: 0.3,
        },
      });

      // Metric name
      slide.addText(metric.name, {
        x: x + 0.2,
        y: y + 0.2,
        w: 3.6,
        h: 0.3,
        fontSize: 16,
        bold: true,
        color: this.pptx.theme.colors.accent2,
      });

      // Metric value
      slide.addText(metric.value, {
        x: x + 0.2,
        y: y + 0.6,
        w: 3.6,
        h: 0.4,
        fontSize: 24,
        bold: true,
        color: this.pptx.theme.colors.accent1,
      });

      // Trend indicator
      const trendColor =
        metric.trend === "up"
          ? "00B294"
          : metric.trend === "down"
          ? "E74C3C"
          : "888888";

      slide.addText(metric.insight, {
        x: x + 0.2,
        y: y + 1.2,
        w: 3.6,
        h: 0.4,
        fontSize: 12,
        color: trendColor,
        italic: true,
      });
    });
  }
  async createTrendAnalysisSlide(analysis) {
    const slide = this.pptx.addSlide();

    // Add title
    slide.addText("Performance Trends", {
      x: 0.5,
      y: 0.3,
      w: "95%",
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: this.pptx.theme.colors.accent1,
    });

    // Instead of charts, create visually appealing data tables
    const revenueData = analysis.trendAnalysis.revenueAnalysis;

    // Revenue Trend Table
    slide.addText("Revenue Trend", {
      x: 0.5,
      y: 1.2,
      w: 6,
      fontSize: 18,
      bold: true,
      color: this.pptx.theme.colors.accent2,
    });

    // Create revenue data table
    const revenueRows = revenueData.labels.map((label, idx) => [
      label,
      `$${(revenueData.values[idx] / 1000).toFixed(1)}K`,
    ]);

    slide.addTable(
      [
        [
          { text: "Period", options: { bold: true } },
          { text: "Revenue", options: { bold: true } },
        ],
        ...revenueRows,
      ],
      {
        x: 0.5,
        y: 1.8,
        w: 6,
        fill: { color: "F5F5F5" },
        border: { type: "solid", color: "E0E0E0", pt: 1 },
        colW: [3, 3],
      }
    );

    // Regional Performance Table
    const regionalData = analysis.trendAnalysis.regionalPerformance;

    slide.addText("Regional Performance", {
      x: 7,
      y: 1.2,
      w: 6,
      fontSize: 18,
      bold: true,
      color: this.pptx.theme.colors.accent2,
    });

    const regionalRows = regionalData.regions.map((region, idx) => [
      region,
      `$${(regionalData.values[idx] / 1000).toFixed(1)}K`,
    ]);

    slide.addTable(
      [
        [
          { text: "Region", options: { bold: true } },
          { text: "Performance", options: { bold: true } },
        ],
        ...regionalRows,
      ],
      {
        x: 7,
        y: 1.8,
        w: 6,
        fill: { color: "F5F5F5" },
        border: { type: "solid", color: "E0E0E0", pt: 1 },
        colW: [3, 3],
      }
    );

    // Add growth indicator
    slide.addText(`Growth: ${revenueData.growth}`, {
      x: 0.5,
      y: 3.5,
      w: 6,
      fontSize: 16,
      bold: true,
      color: "00B294", // Green color for growth
    });

    // Add top region indicator
    slide.addText(`Top Region: ${regionalData.topRegion}`, {
      x: 7,
      y: 3.5,
      w: 6,
      fontSize: 16,
      bold: true,
      color: this.pptx.theme.colors.accent1,
    });

    // Add insights
    const insights = [...revenueData.insights, ...regionalData.insights].filter(
      Boolean
    );

    if (insights.length > 0) {
      slide.addText("Key Insights:", {
        x: 0.5,
        y: 4.5,
        w: "95%",
        fontSize: 16,
        bold: true,
        color: this.pptx.theme.colors.accent1,
      });

      insights.forEach((insight, index) => {
        slide.addText(`• ${insight}`, {
          x: 0.5,
          y: 5.0 + index * 0.4,
          w: "95%",
          fontSize: 14,
          color: this.pptx.theme.colors.text2,
        });
      });
    }
  }
  async createRecommendationsSlide(analysis) {
    const slide = this.pptx.addSlide();

    slide.addText("Recommendations", {
      x: 0.5,
      y: 0.3,
      w: "95%",
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: this.pptx.theme.colors.accent1,
    });

    analysis.recommendations.forEach((rec, index) => {
      // Create recommendation card
      slide.addShape(this.pptx.ShapeType.rect, {
        x: 0.5,
        y: 1.2 + index * 1.8,
        w: "95%",
        h: 1.6,
        fill: { color: "F8F9FA" },
        line: { color: "E0E0E0", width: 1 },
        shadow: {
          type: "outer",
          blur: 3,
          offset: 2,
          angle: 45,
          color: "D6D6D6",
          opacity: 0.3,
        },
      });

      // Add recommendation title
      slide.addText(rec.title, {
        x: 1,
        y: 1.3 + index * 1.8,
        w: "90%",
        fontSize: 16,
        bold: true,
        color: this.pptx.theme.colors.accent2,
      });

      // Add recommendation description
      slide.addText(rec.description, {
        x: 1,
        y: 1.7 + index * 1.8,
        w: "90%",
        fontSize: 14,
        color: this.pptx.theme.colors.text2,
      });

      // Add impact
      slide.addText(`Impact: ${rec.impact}`, {
        x: 1,
        y: 2.1 + index * 1.8,
        w: "90%",
        fontSize: 12,
        italic: true,
        color: this.pptx.theme.colors.accent1,
      });
    });
  }

  async generatePitchDeck(data) {
    try {
      // Get AI analysis
      console.log("Getting AI analysis...");
      const analysis = await this.getAIAnalysis(data);
      if (!analysis) throw new Error("Failed to get AI analysis");

      // Generate slides
      console.log("Generating slides...");
      await this.createExecutiveSummarySlide(analysis);
      await this.createKPISlide(analysis);
      await this.createTrendAnalysisSlide(analysis);
      await this.createRecommendationsSlide(analysis);

      // Save presentation
      const filename = `business_analysis_${Date.now()}.pptx`;
      await this.pptx.writeFile({ fileName: filename });
      return filename;
    } catch (error) {
      console.error("Error generating pitch deck:", error);
      throw error;
    }
  }
}

export default PitchDeckGenerator;
