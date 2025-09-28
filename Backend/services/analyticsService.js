const GeminiService = require('./geminiService');

class AnalyticsService {
  constructor() {
    this.geminiService = new GeminiService();
  }

  /**
   * Perform comprehensive data analysis
   */
  async analyzeData(jsonData, metadata = {}) {
    if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error('Invalid or empty data provided for analysis');
    }

    const startTime = Date.now();

    try {
      const analysisResults = {
        descriptiveStats: this.calculateDescriptiveStats(jsonData),
        correlationMatrix: this.calculateCorrelationMatrix(jsonData),
        dataQuality: this.assessDataQuality(jsonData),
        outliers: this.detectOutliers(jsonData),
        trends: this.analyzeTrends(jsonData),
        metadata: {
          ...metadata,
          rowCount: jsonData.length,
          columnCount: Object.keys(jsonData[0] || {}).length,
          processingTime: Date.now() - startTime,
          analyzedAt: new Date()
        }
      };

      return analysisResults;
    } catch (error) {
      console.error('Analytics error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Calculate descriptive statistics for numerical columns
   */
  calculateDescriptiveStats(data) {
    const stats = {};
    const numericColumns = this.getNumericColumns(data);

    numericColumns.forEach(column => {
      const values = data
        .map(row => parseFloat(row[column]))
        .filter(val => !isNaN(val) && isFinite(val));

      if (values.length > 0) {
        values.sort((a, b) => a - b);
        
        const n = values.length;
        const sum = values.reduce((acc, val) => acc + val, 0);
        const mean = sum / n;
        
        // Calculate variance and standard deviation
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        
        // Calculate quartiles
        const q1Index = Math.floor(n * 0.25);
        const q2Index = Math.floor(n * 0.5);
        const q3Index = Math.floor(n * 0.75);

        stats[column] = {
          count: n,
          mean: this.roundToDecimal(mean, 4),
          median: values[q2Index],
          mode: this.calculateMode(values),
          min: values[0],
          max: values[n - 1],
          range: values[n - 1] - values[0],
          q1: values[q1Index],
          q3: values[q3Index],
          iqr: values[q3Index] - values[q1Index],
          variance: this.roundToDecimal(variance, 4),
          stdDev: this.roundToDecimal(stdDev, 4),
          skewness: this.calculateSkewness(values, mean, stdDev),
          kurtosis: this.calculateKurtosis(values, mean, stdDev)
        };
      }
    });

    return stats;
  }

  /**
   * Calculate correlation matrix for numerical columns
   */
  calculateCorrelationMatrix(data) {
    const numericColumns = this.getNumericColumns(data);
    const matrix = {};

    numericColumns.forEach(col1 => {
      matrix[col1] = {};
      numericColumns.forEach(col2 => {
        if (col1 === col2) {
          matrix[col1][col2] = 1;
        } else {
          const correlation = this.calculatePearsonCorrelation(data, col1, col2);
          matrix[col1][col2] = this.roundToDecimal(correlation, 4);
        }
      });
    });

    // Find strongest correlations
    const strongCorrelations = [];
    numericColumns.forEach(col1 => {
      numericColumns.forEach(col2 => {
        if (col1 < col2) { // Avoid duplicates
          const corr = matrix[col1][col2];
          if (Math.abs(corr) > 0.5) {
            strongCorrelations.push({
              column1: col1,
              column2: col2,
              correlation: corr,
              strength: this.getCorrelationStrength(corr)
            });
          }
        }
      });
    });

    return {
      matrix,
      strongCorrelations: strongCorrelations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
    };
  }

  /**
   * Assess data quality across multiple dimensions
   */
  assessDataQuality(data) {
    const totalCells = data.length * Object.keys(data[0] || {}).length;
    let nullCount = 0;
    let duplicateRows = 0;
    let inconsistentTypes = 0;

    const columnTypes = {};
    const uniqueRows = new Set();

    data.forEach((row, index) => {
      const rowString = JSON.stringify(row);
      if (uniqueRows.has(rowString)) {
        duplicateRows++;
      } else {
        uniqueRows.add(rowString);
      }

      Object.entries(row).forEach(([column, value]) => {
        // Count nulls/empty values
        if (value === null || value === undefined || value === '') {
          nullCount++;
        }

        // Track column types
        const type = typeof value;
        if (!columnTypes[column]) {
          columnTypes[column] = {};
        }
        columnTypes[column][type] = (columnTypes[column][type] || 0) + 1;
      });
    });

    // Calculate type consistency
    Object.values(columnTypes).forEach(types => {
      const typeCount = Object.keys(types).length;
      if (typeCount > 2) { // Allow for null/undefined + one other type
        inconsistentTypes++;
      }
    });

    const completeness = ((totalCells - nullCount) / totalCells) * 100;
    const uniqueness = ((data.length - duplicateRows) / data.length) * 100;
    const consistency = ((Object.keys(columnTypes).length - inconsistentTypes) / Object.keys(columnTypes).length) * 100;
    const validity = this.calculateValidityScore(data);

    const overallScore = (completeness + uniqueness + consistency + validity) / 4;

    return {
      overall_score: this.roundToDecimal(overallScore, 2),
      completeness: this.roundToDecimal(completeness, 2),
      uniqueness: this.roundToDecimal(uniqueness, 2),
      consistency: this.roundToDecimal(consistency, 2),
      validity: this.roundToDecimal(validity, 2),
      issues: {
        missing_values: nullCount,
        duplicate_rows: duplicateRows,
        inconsistent_types: inconsistentTypes
      },
      recommendations: this.generateDataQualityRecommendations(completeness, uniqueness, consistency, validity)
    };
  }

  /**
   * Detect outliers using IQR method
   */
  detectOutliers(data) {
    const outliers = {};
    const numericColumns = this.getNumericColumns(data);

    numericColumns.forEach(column => {
      const values = data
        .map(row => parseFloat(row[column]))
        .filter(val => !isNaN(val) && isFinite(val))
        .sort((a, b) => a - b);

      if (values.length > 4) {
        const q1 = values[Math.floor(values.length * 0.25)];
        const q3 = values[Math.floor(values.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        const columnOutliers = [];
        data.forEach((row, index) => {
          const value = parseFloat(row[column]);
          if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
            columnOutliers.push({
              rowIndex: index,
              value: value,
              severity: value < lowerBound ? 'low' : 'high'
            });
          }
        });

        if (columnOutliers.length > 0) {
          outliers[column] = {
            count: columnOutliers.length,
            percentage: (columnOutliers.length / data.length) * 100,
            bounds: { lower: lowerBound, upper: upperBound },
            outliers: columnOutliers.slice(0, 10) // Limit to top 10 for performance
          };
        }
      }
    });

    return outliers;
  }

  /**
   * Analyze trends in time-series or sequential data
   */
  analyzeTrends(data) {
    const trends = {};
    const numericColumns = this.getNumericColumns(data);

    numericColumns.forEach(column => {
      const values = data
        .map((row, index) => ({ index, value: parseFloat(row[column]) }))
        .filter(item => !isNaN(item.value) && isFinite(item.value));

      if (values.length > 2) {
        const trend = this.calculateLinearTrend(values);
        trends[column] = {
          direction: trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable',
          slope: this.roundToDecimal(trend.slope, 6),
          rSquared: this.roundToDecimal(trend.rSquared, 4),
          significance: this.getTrendSignificance(trend.rSquared),
          prediction: this.generateTrendPrediction(trend, values.length)
        };
      }
    });

    return trends;
  }

  /**
   * Helper methods
   */
  getNumericColumns(data) {
    if (!data || data.length === 0) return [];
    
    const columns = Object.keys(data[0]);
    return columns.filter(column => {
      const sampleValues = data.slice(0, Math.min(100, data.length))
        .map(row => row[column])
        .filter(val => val !== null && val !== undefined && val !== '');
      
      const numericCount = sampleValues.filter(val => 
        !isNaN(parseFloat(val)) && isFinite(parseFloat(val))
      ).length;
      
      return numericCount / sampleValues.length > 0.8; // 80% numeric threshold
    });
  }

  calculatePearsonCorrelation(data, col1, col2) {
    const pairs = data
      .map(row => ({
        x: parseFloat(row[col1]),
        y: parseFloat(row[col2])
      }))
      .filter(pair => !isNaN(pair.x) && !isNaN(pair.y));

    if (pairs.length < 2) return 0;

    const n = pairs.length;
    const sumX = pairs.reduce((sum, pair) => sum + pair.x, 0);
    const sumY = pairs.reduce((sum, pair) => sum + pair.y, 0);
    const sumXY = pairs.reduce((sum, pair) => sum + (pair.x * pair.y), 0);
    const sumX2 = pairs.reduce((sum, pair) => sum + (pair.x * pair.x), 0);
    const sumY2 = pairs.reduce((sum, pair) => sum + (pair.y * pair.y), 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  calculateMode(values) {
    const frequency = {};
    let maxFreq = 0;
    let mode = values[0];

    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
      if (frequency[value] > maxFreq) {
        maxFreq = frequency[value];
        mode = value;
      }
    });

    return mode;
  }

  calculateSkewness(values, mean, stdDev) {
    if (stdDev === 0) return 0;
    const n = values.length;
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
  }

  calculateKurtosis(values, mean, stdDev) {
    if (stdDev === 0) return 0;
    const n = values.length;
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum - (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
  }

  calculateLinearTrend(points) {
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.index, 0);
    const sumY = points.reduce((sum, p) => sum + p.value, 0);
    const sumXY = points.reduce((sum, p) => sum + p.index * p.value, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.index * p.index, 0);
    const sumY2 = points.reduce((sum, p) => sum + p.value * p.value, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const meanY = sumY / n;
    const totalSumSquares = points.reduce((sum, p) => sum + Math.pow(p.value - meanY, 2), 0);
    const residualSumSquares = points.reduce((sum, p) => {
      const predicted = slope * p.index + intercept;
      return sum + Math.pow(p.value - predicted, 2);
    }, 0);

    const rSquared = totalSumSquares === 0 ? 0 : 1 - residualSumSquares / totalSumSquares;
    return { slope, intercept, rSquared };
  }

  roundToDecimal(number, decimals) {
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  getCorrelationStrength(corr) {
    const abs = Math.abs(corr);
    if (abs >= 0.9) return 'very strong';
    if (abs >= 0.7) return 'strong';
    if (abs >= 0.5) return 'moderate';
    if (abs >= 0.3) return 'weak';
    return 'very weak';
  }

  getTrendSignificance(r2) {
    if (r2 >= 0.8) return 'very strong';
    if (r2 >= 0.6) return 'strong';
    if (r2 >= 0.4) return 'moderate';
    if (r2 >= 0.2) return 'weak';
    return 'very weak';
  }

  calculateValidityScore(data) {
    let validityScore = 100;
    const columns = Object.keys(data[0] || {});
    columns.forEach(column => {
      const values = data.map(row => row[column]);
      const uniqueTypes = [...new Set(values.map(val => typeof val))];
      if (uniqueTypes.length > 2) validityScore -= 10;
    });
    return Math.max(0, validityScore);
  }

  generateDataQualityRecommendations(completeness, uniqueness, consistency, validity) {
    const recommendations = [];
    if (completeness < 90) recommendations.push('Improve missing values handling');
    if (uniqueness < 95) recommendations.push('Remove duplicate records');
    if (consistency < 85) recommendations.push('Standardize data types and formats');
    if (validity < 90) recommendations.push('Apply data validation rules');
    return recommendations;
  }

  generateTrendPrediction(trend, length) {
    const next = trend.slope * (length + 1) + trend.intercept;
    return {
      nextPredictedValue: this.roundToDecimal(next, 4),
      confidence: trend.rSquared > 0.7 ? 'high' : trend.rSquared > 0.4 ? 'medium' : 'low'
    };
  }

  /**
   * Generate AI insights using Gemini
   */
  async generateInsights(analysisResults, metadata = {}) {
    try {
      return await this.geminiService.generateDataInsights(analysisResults, metadata);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return {
        insights: [{
          category: 'general',
          finding: 'Analysis completed. AI insights unavailable.',
          confidence: 0.8,
          priority: 'medium',
          impact: 'moderate'
        }],
        fullResponse: 'Fallback response.',
        generatedAt: new Date(),
        model: 'fallback'
      };
    }
  }
}

module.exports = new AnalyticsService();
