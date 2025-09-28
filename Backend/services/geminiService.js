const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      generationConfig: {
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    });
    
    this.isEnabled = !!process.env.GOOGLE_GEMINI_API_KEY;
    if (!this.isEnabled) {
      console.warn("⚠️ Gemini API key missing. AI analytics disabled.");
    }
  }

  async generateDataInsights(analysisResults, metadata = {}) {
    if (!this.isEnabled) throw new Error('Gemini API key not configured');

    try {
      const prompt = this.buildInsightsPrompt(analysisResults, metadata);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.parseInsightsResponse(response.text());
    } catch (error) {
      console.error('Gemini insights generation error:', error);
      throw error;
    }
  }

  async generateBusinessReport(analysisResults, metadata = {}, template = 'detailed') {
    if (!this.isEnabled) throw new Error('Gemini API key not configured');

    try {
      const prompt = this.buildReportPrompt(analysisResults, metadata, template);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.parseReportResponse(response.text(), template);
    } catch (error) {
      console.error('Gemini report generation error:', error);
      throw error;
    }
  }

  buildInsightsPrompt(analysisResults, metadata) {
    const { descriptiveStats, correlationMatrix, dataQuality, outliers, trends } = analysisResults;
    
    return `
You are a senior data scientist. Analyze this dataset and provide actionable insights.

DATASET OVERVIEW:
- Rows: ${metadata.rowCount || 'Unknown'}
- Columns: ${metadata.columnCount || 'Unknown'}
- Data Quality Score: ${dataQuality?.overall_score || 'Unknown'}%

STATS:
${this.formatDescriptiveStats(descriptiveStats)}

CORRELATIONS:
${this.formatCorrelationMatrix(correlationMatrix)}

DATA QUALITY:
- Completeness: ${dataQuality?.completeness || 'Unknown'}%
- Uniqueness: ${dataQuality?.uniqueness || 'Unknown'}%
- Validity: ${dataQuality?.validity || 'Unknown'}%
- Consistency: ${dataQuality?.consistency || 'Unknown'}%

OUTLIERS:
${this.formatOutliers(outliers)}

TRENDS:
${this.formatTrends(trends)}

Please provide:
1. Key Business Insights
2. Data Quality Assessment
3. Patterns & Correlations
4. Risks
5. Opportunities
6. Actionable Recommendations
`.trim();
  }

  buildReportPrompt(analysisResults, metadata, template) {
    const basePrompt = this.buildInsightsPrompt(analysisResults, metadata);
    return `${basePrompt}\n\nGenerate a ${template} report for business stakeholders.`;
  }

  parseInsightsResponse(responseText) {
    return {
      insights: [{
        category: 'general',
        finding: responseText,
        confidence: 0.8,
        priority: 'medium',
        impact: 'moderate'
      }],
      fullResponse: responseText,
      generatedAt: new Date(),
      model: 'gemini-pro'
    };
  }

  parseReportResponse(responseText, template) {
    return {
      title: `${template} Data Analysis Report`,
      template,
      sections: [{ title: 'Report', content: responseText }],
      fullContent: responseText,
      metadata: {
        wordCount: responseText.split(/\s+/).length,
        generatedAt: new Date(),
        model: 'gemini-pro'
      }
    };
  }

  formatDescriptiveStats(stats) {
    if (!stats || Object.keys(stats).length === 0) return 'No stats available';
    return Object.entries(stats).map(([col, values]) =>
      `- ${col}: mean=${values.mean}, median=${values.median}, stdDev=${values.stdDev}`
    ).join('\n');
  }

  formatCorrelationMatrix(matrix) {
    if (!matrix || Object.keys(matrix).length === 0) return 'No correlations available';
    const correlations = [];
    Object.keys(matrix).forEach(col1 => {
      Object.keys(matrix[col1]).forEach(col2 => {
        if (col1 !== col2 && Math.abs(matrix[col1][col2]) > 0.5) {
          correlations.push(`${col1} ↔ ${col2}: ${(matrix[col1][col2] * 100).toFixed(1)}%`);
        }
      });
    });
    return correlations.length > 0 ? correlations.join('\n') : 'No strong correlations found';
  }

  formatOutliers(outliers) {
    if (!outliers || Object.keys(outliers).length === 0) return 'No outliers detected';
    return Object.entries(outliers).map(([col, details]) =>
      `- ${col}: ${details.count} outliers (${details.percentage.toFixed(2)}%)`
    ).join('\n');
  }

  formatTrends(trends) {
    if (!trends || Object.keys(trends).length === 0) return 'No trends found';
    return Object.entries(trends).map(([col, details]) =>
      `- ${col}: ${details.direction} trend (R²=${details.rSquared})`
    ).join('\n');
  }

  async testConnection() {
    try {
      const result = await this.model.generateContent('Respond with "Connection successful".');
      const response = await result.response;
      return { success: true, message: response.text(), model: 'gemini-pro' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = GeminiService;
