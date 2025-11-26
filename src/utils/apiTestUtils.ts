import { settingsService } from '../services';
import { BusinessProfile, Branch, OpeningHours, Table } from '../types';

export interface ApiTestResult {
  service: string;
  method: string;
  success: boolean;
  error?: string;
  data?: any;
  duration: number;
}

export class ApiTestUtils {
  // Test all business profile APIs
  static async testBusinessProfileAPIs(): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];
    
    // Test get profile
    const startTime = Date.now();
    try {
      const profile = await settingsService.getAllSettings();
      results.push({
        service: 'BusinessProfile',
        method: 'getAllSettings',
        success: true,
        data: profile.businessProfile,
        duration: Date.now() - startTime
      });
    } catch (error) {
      results.push({
        service: 'BusinessProfile',
        method: 'getAllSettings',
        success: false,
        error: (error as Error).message,
        duration: Date.now() - startTime
      });
    }
    
    return results;
  }

  // Test all branch APIs
  static async testBranchAPIs(): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];
    
    // Test get timezones
    const timezoneStart = Date.now();
    try {
      const timezones = await settingsService.getTimezones();
      results.push({
        service: 'Branch',
        method: 'getTimezones',
        success: true,
        data: timezones,
        duration: Date.now() - timezoneStart
      });
    } catch (error) {
      results.push({
        service: 'Branch',
        method: 'getTimezones',
        success: false,
        error: (error as Error).message,
        duration: Date.now() - timezoneStart
      });
    }
    
    return results;
  }

  // Test all opening hours APIs
  static async testOpeningHoursAPIs(branchId: string): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];
    
    // Test get opening hours
    const startTime = Date.now();
    try {
      const hours = await settingsService.getAllSettings();
      const branchHours = hours.openingHours[branchId];
      if (branchHours) {
        results.push({
          service: 'OpeningHours',
          method: 'getOpeningHours',
          success: true,
          data: branchHours,
          duration: Date.now() - startTime
        });
      } else {
        results.push({
          service: 'OpeningHours',
          method: 'getOpeningHours',
          success: false,
          error: 'No opening hours found for branch',
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      results.push({
        service: 'OpeningHours',
        method: 'getOpeningHours',
        success: false,
        error: (error as Error).message,
        duration: Date.now() - startTime
      });
    }
    
    return results;
  }

  // Test all table APIs
  static async testTableAPIs(branchId: string): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];
    
    // Test get tables
    const startTime = Date.now();
    try {
      const settings = await settingsService.getAllSettings();
      const branchTables = settings.tables[branchId] || [];
      results.push({
        service: 'Table',
        method: 'getTables',
        success: true,
        data: branchTables,
        duration: Date.now() - startTime
      });
    } catch (error) {
      results.push({
        service: 'Table',
        method: 'getTables',
        success: false,
        error: (error as Error).message,
        duration: Date.now() - startTime
      });
    }
    
    return results;
  }

  // Test all settings APIs comprehensively
  static async testAllSettingsAPIs(): Promise<{
    results: ApiTestResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      successRate: number;
    };
  }> {
    const allResults: ApiTestResult[] = [];
    
    try {
      // Test business profile
      const profileResults = await this.testBusinessProfileAPIs();
      allResults.push(...profileResults);
      
      // Test branches
      const branchResults = await this.testBranchAPIs();
      allResults.push(...branchResults);
      
      // If we have branches, test their specific APIs
      const settings = await settingsService.getAllSettings();
      if (settings.branches.length > 0) {
        const firstBranch = settings.branches[0];
        
        // Test opening hours for first branch
        const hoursResults = await this.testOpeningHoursAPIs(firstBranch.id);
        allResults.push(...hoursResults);
        
        // Test tables for first branch
        const tableResults = await this.testTableAPIs(firstBranch.id);
        allResults.push(...tableResults);
      }
      
    } catch (error) {
      console.error('Error during API testing:', error);
    }
    
    // Calculate summary
    const total = allResults.length;
    const successful = allResults.filter(r => r.success).length;
    const failed = total - successful;
    const successRate = total > 0 ? (successful / total) * 100 : 0;
    
    return {
      results: allResults,
      summary: {
        total,
        successful,
        failed,
        successRate
      }
    };
  }

  // Generate a comprehensive test report
  static generateTestReport(testResults: {
    results: ApiTestResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      successRate: number;
    };
  }): string {
    const { results, summary } = testResults;
    
    let report = `# Settings API Test Report\n\n`;
    report += `## Summary\n`;
    report += `- Total API calls: ${summary.total}\n`;
    report += `- Successful: ${summary.successful}\n`;
    report += `- Failed: ${summary.failed}\n`;
    report += `- Success Rate: ${summary.successRate.toFixed(2)}%\n\n`;
    
    report += `## Detailed Results\n\n`;
    
    results.forEach((result, index) => {
      report += `### ${index + 1}. ${result.service} - ${result.method}\n`;
      report += `- **Status**: ${result.success ? '✅ Success' : '❌ Failed'}\n`;
      report += `- **Duration**: ${result.duration}ms\n`;
      
      if (result.error) {
        report += `- **Error**: ${result.error}\n`;
      }
      
      if (result.data) {
        report += `- **Data**: ${JSON.stringify(result.data, null, 2)}\n`;
      }
      
      report += `\n`;
    });
    
    return report;
  }

  // Validate API response structures
  static validateApiResponseStructure(data: any, expectedStructure: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    const validateObject = (obj: any, structure: any, path: string = '') => {
      if (typeof structure === 'object' && structure !== null) {
        if (typeof obj !== 'object' || obj === null) {
          errors.push(`${path}: Expected object, got ${typeof obj}`);
          return;
        }
        
        Object.keys(structure).forEach(key => {
          const fullPath = path ? `${path}.${key}` : key;
          if (!(key in obj)) {
            errors.push(`${fullPath}: Missing required field`);
          } else {
            validateObject(obj[key], structure[key], fullPath);
          }
        });
      } else if (typeof structure === 'string') {
        if (typeof obj !== structure) {
          errors.push(`${path}: Expected ${structure}, got ${typeof obj}`);
        }
      }
    };
    
    validateObject(data, expectedStructure);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Test specific API endpoints with validation
  static async testEndpointWithValidation<T>(
    endpoint: () => Promise<T>,
    expectedStructure: any,
    serviceName: string,
    methodName: string
  ): Promise<ApiTestResult> {
    const startTime = Date.now();
    
    try {
      const data = await endpoint();
      const validation = this.validateApiResponseStructure(data, expectedStructure);
      
      if (validation.isValid) {
        return {
          service: serviceName,
          method: methodName,
          success: true,
          data,
          duration: Date.now() - startTime
        };
      } else {
        return {
          service: serviceName,
          method: methodName,
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          duration: Date.now() - startTime
        };
      }
    } catch (error) {
      return {
        service: serviceName,
        method: methodName,
        success: false,
        error: (error as Error).message,
        duration: Date.now() - startTime
      };
    }
  }
}

export default ApiTestUtils;
