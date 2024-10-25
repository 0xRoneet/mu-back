class Helpers {
  static getDefaultColors() {
    return {
      accent1: "2D5597",
      accent2: "4472C4",
      accent3: "70AD47",
      accent4: "ED7D31",
      accent5: "FFC000",
      accent6: "5B9BD5",
      background1: "FFFFFF",
      background2: "F2F2F2",
      text1: "262626",
      text2: "666666",
    };
  }

  static validateCompanyInfo(companyInfo) {
    const requiredFields = [
      "companyName",
      "industry",
      "problem",
      "solution",
      "marketSize",
      "competitors",
      "businessModel",
      "teamMembers",
    ];

    const missing = requiredFields.filter((field) => !companyInfo[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    return true;
  }

  static async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = Helpers;
