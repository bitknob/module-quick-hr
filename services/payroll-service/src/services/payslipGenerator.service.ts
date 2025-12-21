import { Payslip, PayslipTemplate } from '../models';
import { NotFoundError, ValidationError } from '@hrm/common';
import path from 'path';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';

export interface PayslipGenerationOptions {
  templateId?: string;
  format?: 'pdf' | 'html' | 'json';
  includeWatermark?: boolean;
  includeLogo?: boolean;
  language?: string;
  currency?: string;
  customStyles?: any;
}

export class PayslipGeneratorService {
  static async getDefaultTemplate(companyId: string): Promise<PayslipTemplate> {
    const template = await PayslipTemplate.findOne({
      where: {
        companyId,
        isDefault: true,
        status: 'active',
      },
    });

    if (!template) {
      throw new NotFoundError('Default payslip template');
    }

    return template;
  }

  static async getTemplateById(id: string, companyId: string): Promise<PayslipTemplate> {
    const template = await PayslipTemplate.findOne({
      where: {
        id,
        companyId,
      },
    });

    if (!template) {
      throw new NotFoundError('Payslip template');
    }

    return template;
  }

  static async generatePayslipPDF(
    payslip: Payslip,
    options: PayslipGenerationOptions = {}
  ): Promise<{ filePath: string; fileUrl: string }> {
    let template: PayslipTemplate;

    if (options.templateId) {
      template = await this.getTemplateById(options.templateId, payslip.companyId);
    } else {
      template = await this.getDefaultTemplate(payslip.companyId);
    }

    const htmlContent = await this.generatePayslipHTML(payslip, template, options);
    const pdfPath = await this.generatePDFFromHTML(htmlContent, payslip.id);

    const fileUrl = `/api/payroll/payslips/${payslip.id}/pdf`;

    await payslip.update({
      templateId: template.id,
      generatedPdfPath: pdfPath,
      generatedPdfUrl: fileUrl,
      pdfGeneratedAt: new Date(),
    });

    return { filePath: pdfPath, fileUrl };
  }

  private static async generatePayslipHTML(
    payslip: Payslip,
    template: PayslipTemplate,
    options: PayslipGenerationOptions
  ): Promise<string> {
    const headerConfig = template.headerConfiguration || {};
    const footerConfig = template.footerConfiguration || {};
    const bodyConfig = template.bodyConfiguration || {};
    const stylingConfig = template.stylingConfiguration || {};
    const sectionsConfig = template.sectionsConfiguration || {};
    const brandingConfig = template.brandingSettings || {};

    const payslipData = payslip.toJSON ? payslip.toJSON() : payslip;

    const headerHTML = this.generateHeader(headerConfig, brandingConfig, payslipData);
    const bodyHTML = this.generateBody(bodyConfig, sectionsConfig, payslipData);
    const footerHTML = this.generateFooter(footerConfig, payslipData);

    const styles = this.generateStyles(stylingConfig, options.customStyles);

    const html = `
<!DOCTYPE html>
<html lang="${options.language || 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payslip - ${payslipData.payslipNumber}</title>
    <style>${styles}</style>
</head>
<body>
    ${options.includeWatermark ? this.generateWatermark(template.watermarkSettings) : ''}
    <div class="payslip-container">
        ${headerHTML}
        ${bodyHTML}
        ${footerHTML}
    </div>
</body>
</html>`;

    return html;
  }

  private static generateHeader(headerConfig: any, brandingConfig: any, payslipData: any): string {
    const showCompanyLogo = headerConfig.showCompanyLogo !== false;
    const showCompanyName = headerConfig.showCompanyName !== false;
    const showEmployeeInfo = headerConfig.showEmployeeInfo !== false;
    const showPayslipNumber = headerConfig.showPayslipNumber !== false;
    const showPeriod = headerConfig.showPeriod !== false;

    return `
<div class="payslip-header">
    ${showCompanyLogo && brandingConfig.logoUrl ? `<img src="${brandingConfig.logoUrl}" class="company-logo" alt="Company Logo">` : ''}
    ${showCompanyName ? `<h1 class="company-name">${brandingConfig.companyName || 'Company Name'}</h1>` : ''}
    <h2 class="payslip-title">Salary Slip</h2>
    <div class="header-details">
        ${showPayslipNumber ? `<div class="detail-item"><strong>Payslip Number:</strong> ${payslipData.payslipNumber}</div>` : ''}
        ${showPeriod ? `<div class="detail-item"><strong>Period:</strong> ${this.getMonthName(payslipData.month)} ${payslipData.year}</div>` : ''}
    </div>
    ${showEmployeeInfo ? this.generateEmployeeInfoHeader(payslipData) : ''}
</div>`;
  }

  private static generateEmployeeInfoHeader(payslipData: any): string {
    return `
<div class="employee-info-header">
    <div class="info-row">
        <div class="info-item"><strong>Employee ID:</strong> ${payslipData.employeeId}</div>
        <div class="info-item"><strong>Designation:</strong> ${payslipData.designation || 'N/A'}</div>
    </div>
    <div class="info-row">
        <div class="info-item"><strong>Department:</strong> ${payslipData.department || 'N/A'}</div>
        <div class="info-item"><strong>Joining Date:</strong> ${payslipData.joiningDate || 'N/A'}</div>
    </div>
</div>`;
  }

  private static generateBody(bodyConfig: any, sectionsConfig: any, payslipData: any): string {
    const sections: string[] = [];

    if (sectionsConfig.showEarnings !== false) {
      sections.push(this.generateEarningsSection(payslipData));
    }

    if (sectionsConfig.showDeductions !== false) {
      sections.push(this.generateDeductionsSection(payslipData));
    }

    if (sectionsConfig.showTaxDetails !== false) {
      sections.push(this.generateTaxDetailsSection(payslipData));
    }

    if (sectionsConfig.showSummary !== false) {
      sections.push(this.generateSummarySection(payslipData));
    }

    if (sectionsConfig.showYTD !== false) {
      sections.push(this.generateYTDSection(payslipData));
    }

    if (sectionsConfig.showAttendance !== false) {
      sections.push(this.generateAttendanceSection(payslipData));
    }

    if (sectionsConfig.showVariablePay !== false && payslipData.variablePayTotal > 0) {
      sections.push(this.generateVariablePaySection(payslipData));
    }

    if (sectionsConfig.showArrears !== false && payslipData.arrearsTotal > 0) {
      sections.push(this.generateArrearsSection(payslipData));
    }

    if (sectionsConfig.showLoans !== false && payslipData.loanDeductionTotal > 0) {
      sections.push(this.generateLoanSection(payslipData));
    }

    return `<div class="payslip-body">${sections.join('')}</div>`;
  }

  private static generateEarningsSection(payslipData: any): string {
    const earnings = payslipData.earningsBreakdown || {};
    const rows = Object.entries(earnings)
      .map(([key, value]) => `<tr><td>${key}</td><td class="amount">${this.formatCurrency(value as number)}</td></tr>`)
      .join('');

    return `
<div class="section earnings-section">
    <h3>Earnings</h3>
    <table class="data-table">
        <thead>
            <tr>
                <th>Component</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
            <tr class="total-row">
                <td><strong>Total Earnings</strong></td>
                <td class="amount"><strong>${this.formatCurrency(payslipData.totalEarnings)}</strong></td>
            </tr>
        </tbody>
    </table>
</div>`;
  }

  private static generateDeductionsSection(payslipData: any): string {
    const deductions = payslipData.deductionsBreakdown || {};
    const rows = Object.entries(deductions)
      .map(([key, value]) => `<tr><td>${key}</td><td class="amount">${this.formatCurrency(value as number)}</td></tr>`)
      .join('');

    return `
<div class="section deductions-section">
    <h3>Deductions</h3>
    <table class="data-table">
        <thead>
            <tr>
                <th>Component</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
            <tr class="total-row">
                <td><strong>Total Deductions</strong></td>
                <td class="amount"><strong>${this.formatCurrency(payslipData.totalDeductions)}</strong></td>
            </tr>
        </tbody>
    </table>
</div>`;
  }

  private static generateTaxDetailsSection(payslipData: any): string {
    return `
<div class="section tax-section">
    <h3>Tax Details</h3>
    <table class="data-table">
        <tr><td>Income Tax (TDS)</td><td class="amount">${this.formatCurrency(payslipData.tdsAmount)}</td></tr>
        <tr><td>Local Tax</td><td class="amount">${this.formatCurrency(payslipData.professionalTaxAmount)}</td></tr>
        ${payslipData.epfEmployeeAmount > 0 ? `<tr><td>Social Security (Employee)</td><td class="amount">${this.formatCurrency(payslipData.epfEmployeeAmount)}</td></tr>` : ''}
        ${payslipData.esiEmployeeAmount > 0 ? `<tr><td>Health Insurance (Employee)</td><td class="amount">${this.formatCurrency(payslipData.esiEmployeeAmount)}</td></tr>` : ''}
        <tr><td>Taxable Income</td><td class="amount">${this.formatCurrency(payslipData.taxableIncome)}</td></tr>
    </table>
</div>`;
  }

  private static generateSummarySection(payslipData: any): string {
    return `
<div class="section summary-section">
    <h3>Summary</h3>
    <table class="summary-table">
        <tr>
            <td><strong>Gross Salary</strong></td>
            <td class="amount"><strong>${this.formatCurrency(payslipData.grossSalary)}</strong></td>
        </tr>
        <tr>
            <td><strong>Total Deductions</strong></td>
            <td class="amount"><strong>${this.formatCurrency(payslipData.totalDeductions)}</strong></td>
        </tr>
        <tr class="net-salary-row">
            <td><strong>Net Salary</strong></td>
            <td class="amount"><strong>${this.formatCurrency(payslipData.netSalary)}</strong></td>
        </tr>
    </table>
</div>`;
  }

  private static generateYTDSection(payslipData: any): string {
    return `
<div class="section ytd-section">
    <h3>Year to Date (YTD)</h3>
    <table class="data-table">
        <tr><td>YTD Gross Salary</td><td class="amount">${this.formatCurrency(payslipData.ytdGrossSalary)}</td></tr>
        <tr><td>YTD Deductions</td><td class="amount">${this.formatCurrency(payslipData.ytdDeductions)}</td></tr>
        <tr><td>YTD Net Salary</td><td class="amount">${this.formatCurrency(payslipData.ytdNetSalary)}</td></tr>
        <tr><td>YTD Tax Deducted</td><td class="amount">${this.formatCurrency(payslipData.ytdTaxDeducted)}</td></tr>
    </table>
</div>`;
  }

  private static generateAttendanceSection(payslipData: any): string {
    return `
<div class="section attendance-section">
    <h3>Attendance Details</h3>
    <table class="data-table">
        <tr><td>Working Days</td><td>${payslipData.workingDays}</td></tr>
        <tr><td>Present Days</td><td>${payslipData.presentDays}</td></tr>
        <tr><td>Absent Days</td><td>${payslipData.absentDays}</td></tr>
        <tr><td>Leave Days</td><td>${payslipData.leaveDays}</td></tr>
        ${payslipData.lossOfPayDays > 0 ? `<tr><td>Loss of Pay Days</td><td>${payslipData.lossOfPayDays}</td></tr>` : ''}
        ${payslipData.proRataFactor < 1 ? `<tr><td>Pro-Rata Factor</td><td>${(payslipData.proRataFactor * 100).toFixed(2)}%</td></tr>` : ''}
    </table>
</div>`;
  }

  private static generateVariablePaySection(payslipData: any): string {
    const breakdown = payslipData.variablePayBreakdown || {};
    const rows = Object.entries(breakdown)
      .map(([key, value]) => `<tr><td>${key}</td><td class="amount">${this.formatCurrency(value as number)}</td></tr>`)
      .join('');

    return `
<div class="section variable-pay-section">
    <h3>Variable Pay</h3>
    <table class="data-table">
        ${rows}
        <tr class="total-row">
            <td><strong>Total Variable Pay</strong></td>
            <td class="amount"><strong>${this.formatCurrency(payslipData.variablePayTotal)}</strong></td>
        </tr>
    </table>
</div>`;
  }

  private static generateArrearsSection(payslipData: any): string {
    const breakdown = payslipData.arrearsBreakdown || {};
    const rows = Object.entries(breakdown)
      .map(([key, value]) => `<tr><td>${key}</td><td class="amount">${this.formatCurrency(value as number)}</td></tr>`)
      .join('');

    return `
<div class="section arrears-section">
    <h3>Arrears</h3>
    <table class="data-table">
        ${rows}
        <tr class="total-row">
            <td><strong>Total Arrears</strong></td>
            <td class="amount"><strong>${this.formatCurrency(payslipData.arrearsTotal)}</strong></td>
        </tr>
    </table>
</div>`;
  }

  private static generateLoanSection(payslipData: any): string {
    const breakdown = payslipData.loanDeductionBreakdown || {};
    const rows = Object.entries(breakdown)
      .map(([key, value]) => `<tr><td>${key}</td><td class="amount">${this.formatCurrency(value as number)}</td></tr>`)
      .join('');

    return `
<div class="section loan-section">
    <h3>Loan Deductions</h3>
    <table class="data-table">
        ${rows}
        <tr class="total-row">
            <td><strong>Total Loan Deductions</strong></td>
            <td class="amount"><strong>${this.formatCurrency(payslipData.loanDeductionTotal)}</strong></td>
        </tr>
    </table>
</div>`;
  }

  private static generateFooter(footerConfig: any, payslipData: any): string {
    const showDisclaimer = footerConfig.showDisclaimer !== false;
    const disclaimerText = footerConfig.disclaimerText || 'This is a system-generated payslip.';
    const showSignature = footerConfig.showSignature !== false;

    return `
<div class="payslip-footer">
    ${showDisclaimer ? `<p class="disclaimer">${disclaimerText}</p>` : ''}
    ${showSignature ? `<div class="signature-section">
        <div class="signature-block">
            <div class="signature-line"></div>
            <p>Authorized Signatory</p>
        </div>
    </div>` : ''}
    <p class="generated-info">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
</div>`;
  }

  private static generateWatermark(watermarkSettings: any): string {
    if (!watermarkSettings || !watermarkSettings.enabled) {
      return '';
    }

    const text = watermarkSettings.text || 'CONFIDENTIAL';
    const opacity = watermarkSettings.opacity || 0.1;

    return `
<div class="watermark" style="opacity: ${opacity};">${text}</div>
<style>
.watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 80px;
    color: #000;
    z-index: -1;
    pointer-events: none;
}
</style>`;
  }

  private static generateStyles(stylingConfig: any, customStyles?: any): string {
    const primaryColor = stylingConfig.primaryColor || '#2563eb';
    const secondaryColor = stylingConfig.secondaryColor || '#1e40af';
    const fontFamily = stylingConfig.fontFamily || 'Arial, sans-serif';
    const fontSize = stylingConfig.fontSize || '12px';

    return `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${fontFamily};
    font-size: ${fontSize};
    color: #333;
    background-color: #fff;
    padding: 20px;
}

.payslip-container {
    max-width: 800px;
    margin: 0 auto;
    background: #fff;
    border: 1px solid #ddd;
    padding: 30px;
}

.payslip-header {
    text-align: center;
    border-bottom: 2px solid ${primaryColor};
    padding-bottom: 20px;
    margin-bottom: 30px;
}

.company-logo {
    max-width: 150px;
    margin-bottom: 10px;
}

.company-name {
    color: ${primaryColor};
    margin-bottom: 10px;
}

.payslip-title {
    color: ${secondaryColor};
    margin-bottom: 15px;
}

.header-details {
    display: flex;
    justify-content: space-around;
    margin-top: 15px;
}

.employee-info-header {
    margin-top: 20px;
    text-align: left;
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.section {
    margin-bottom: 30px;
}

.section h3 {
    color: ${primaryColor};
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
    margin-bottom: 15px;
}

.data-table, .summary-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
}

.data-table th, .data-table td, .summary-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.data-table th {
    background-color: ${primaryColor};
    color: #fff;
    font-weight: bold;
}

.total-row {
    font-weight: bold;
    background-color: #f5f5f5;
}

.amount {
    text-align: right;
}

.net-salary-row {
    font-weight: bold;
    font-size: 1.2em;
    background-color: ${primaryColor};
    color: #fff;
}

.payslip-footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 2px solid ${primaryColor};
    text-align: center;
}

.disclaimer {
    font-size: 0.9em;
    color: #666;
    margin-bottom: 20px;
}

.signature-section {
    margin: 30px 0;
}

.signature-block {
    display: inline-block;
    margin: 0 40px;
}

.signature-line {
    border-top: 1px solid #000;
    width: 200px;
    margin-bottom: 5px;
}

.generated-info {
    font-size: 0.85em;
    color: #999;
    margin-top: 20px;
}

${customStyles || ''}
`;
  }

  private static async generatePDFFromHTML(html: string, payslipId: string): Promise<string> {
    const pdfDir = path.join(process.cwd(), 'uploads', 'payslips');
    await fs.mkdir(pdfDir, { recursive: true });

    const fileName = `payslip-${payslipId}-${Date.now()}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });
      await browser.close();

      return filePath;
    } catch (error) {
      throw new ValidationError(`Failed to generate PDF: ${(error as Error).message}`);
    }
  }

  private static formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num);
  }

  private static getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[month - 1] || '';
  }
}

