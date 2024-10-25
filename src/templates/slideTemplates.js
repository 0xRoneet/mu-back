class SlideTemplates {
  static getTitleSlide(slide, content, options) {
    slide.background = this.getGradientBackground();

    // Add company name
    slide.addText(content.title, {
      x: 0.5,
      y: 2,
      w: "95%",
      fontSize: 44,
      bold: true,
      color: options.colors.text1,
      align: "center",
    });

    // Add subtitle if exists
    if (content.content && content.content[0]) {
      slide.addText(content.content[0], {
        x: 0.5,
        y: 3,
        w: "95%",
        fontSize: 24,
        color: options.colors.text2,
        align: "center",
      });
    }
  }

  static getSplitSlide(slide, content, options) {
    slide.background = this.getGradientBackground();

    // Add title
    slide.addText(content.title, {
      x: 0.5,
      y: 0.3,
      w: "95%",
      fontSize: 28,
      bold: true,
      color: options.colors.text1,
    });

    // Add decorative line
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: 1.1,
      w: 1.5,
      h: 0.1,
      fill: { color: options.colors.accent1 },
    });

    // Add content points
    content.content.forEach((point, index) => {
      slide.addText(point, {
        x: 0.5,
        y: 1.5 + index * 0.6,
        w: "45%",
        fontSize: 16,
        bullet: true,
        color: options.colors.text2,
      });
    });
  }

  static getCompetitionSlide(slide, content, options) {
    slide.background = this.getGradientBackground();

    // Add title and decorative elements similar to split slide
    this.addHeader(slide, content.title, options);

    // Create competition matrix
    const table = [
      ["Feature", "Us", "Competitor 1", "Competitor 2"],
      ...content.content.map((text) => {
        const parts = text.split("|").map((part) => part.trim());
        return [parts[0], parts[1] || "", parts[2] || "", parts[3] || ""];
      }),
    ];

    slide.addTable(table, {
      x: 0.5,
      y: 1.5,
      w: "55%",
      color: options.colors.text2,
      fontSize: 14,
      border: { pt: 0.5, color: "E6E6E6" },
      rowsFill: [{ color: "F5F5F5" }],
    });
  }

  static getGradientBackground() {
    return {
      color: "FFFFFF",
      gradientColors: [
        { color: "FFFFFF", position: 0 },
        { color: "F8F9FA", position: 100 },
      ],
    };
  }

  static addHeader(slide, title, options) {
    slide.addText(title, {
      x: 0.5,
      y: 0.3,
      w: "95%",
      fontSize: 28,
      bold: true,
      color: options.colors.text1,
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: 1.1,
      w: 1.5,
      h: 0.1,
      fill: { color: options.colors.accent1 },
    });
  }
}

module.exports = SlideTemplates;
