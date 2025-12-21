import { TaxConfiguration } from '../models/TaxConfiguration.model';

export interface TaxCalculationResult {
  incomeTaxAmount: number;
  localTaxAmount: number;
  socialSecurityEmployeeAmount: number;
  socialSecurityEmployerAmount: number;
  healthInsuranceEmployeeAmount: number;
  healthInsuranceEmployerAmount: number;
  taxableIncome: number;
  taxExemptions: {
    housingAllowanceExemption: number;
    travelAllowanceExemption: number;
    standardDeduction: number;
    otherExemptions: any;
    totalExemptions: number;
  };
}

export class TaxCalculationService {
  static calculateIncomeTax(
    annualTaxableIncome: number,
    incomeTaxSlabs: any[]
  ): number {
    if (!incomeTaxSlabs || incomeTaxSlabs.length === 0) {
      return 0;
    }

    let remainingIncome = annualTaxableIncome;
    let totalTax = 0;

    for (const slab of incomeTaxSlabs) {
      if (remainingIncome <= 0) break;

      const slabStart = slab.from || 0;
      const slabEnd = slab.to || Infinity;
      const slabRate = slab.rate || 0;

      const taxableInSlab = Math.min(remainingIncome, slabEnd - slabStart);
      if (taxableInSlab > 0) {
        totalTax += (taxableInSlab * slabRate) / 100;
        remainingIncome -= taxableInSlab;
      }
    }

    return Math.round(totalTax / 12);
  }

  static calculateLocalTax(
    grossSalary: number,
    localTaxSlabs: any[],
    professionalTaxEnabled: boolean,
    professionalTaxSlabs: any[]
  ): number {
    if (professionalTaxEnabled && professionalTaxSlabs && professionalTaxSlabs.length > 0) {
      return this.calculateProfessionalTax(grossSalary, professionalTaxSlabs);
    }

    if (localTaxSlabs && localTaxSlabs.length > 0) {
      for (const slab of localTaxSlabs) {
        const from = slab.from || 0;
        const to = slab.to || Infinity;

        if (grossSalary >= from && grossSalary < to) {
          return slab.amount || 0;
        }
      }
    }

    return 0;
  }

  private static calculateProfessionalTax(
    grossSalary: number,
    professionalTaxSlabs: any[]
  ): number {
    if (!professionalTaxSlabs || professionalTaxSlabs.length === 0) {
      return 0;
    }

    for (const slab of professionalTaxSlabs) {
      const from = slab.from || 0;
      const to = slab.to || Infinity;

      if (grossSalary >= from && grossSalary < to) {
        return slab.amount || 0;
      }
    }

    return 0;
  }

  static calculateSocialSecurity(
    baseSalary: number,
    employerRate: number,
    employeeRate: number,
    maxSalary: number
  ): { employee: number; employer: number } {
    if (!employerRate && !employeeRate) {
      return { employee: 0, employer: 0 };
    }

    let calculationBase = baseSalary;

    if (maxSalary > 0) {
      calculationBase = Math.min(baseSalary, maxSalary);
    }

    const employeeAmount = (calculationBase * (employeeRate || 0)) / 100;
    const employerAmount = (calculationBase * (employerRate || 0)) / 100;

    return {
      employee: Math.round(employeeAmount),
      employer: Math.round(employerAmount),
    };
  }

  static calculateHealthInsurance(
    grossSalary: number,
    employerRate: number,
    employeeRate: number,
    maxSalary: number
  ): { employee: number; employer: number } {
    if (!employerRate && !employeeRate) {
      return { employee: 0, employer: 0 };
    }

    let calculationBase = grossSalary;

    if (maxSalary > 0 && grossSalary > maxSalary) {
      return { employee: 0, employer: 0 };
    }

    const employeeAmount = (calculationBase * (employeeRate || 0)) / 100;
    const employerAmount = (calculationBase * (employerRate || 0)) / 100;

    return {
      employee: Math.round(employeeAmount),
      employer: Math.round(employerAmount),
    };
  }

  static calculateHousingAllowanceExemption(
    housingAllowanceReceived: number,
    rentPaid: number,
    basicSalary: number,
    rules: any
  ): number {
    if (!rules || !rules.type) {
      return 0;
    }

    if (rules.type === 'percentage_of_basic') {
      const maxPercentage = rules.maxPercentage || 50;
      const minRentPercentage = rules.minRentPercentage || 10;
      const calculation1 = rentPaid - (basicSalary * minRentPercentage) / 100;
      const calculation2 = housingAllowanceReceived;
      const calculation3 = (basicSalary * maxPercentage) / 100;

      return Math.max(0, Math.min(calculation1, calculation2, calculation3));
    }

    if (rules.type === 'fixed_amount') {
      return Math.min(housingAllowanceReceived, rules.amount || 0);
    }

    if (rules.type === 'actual_rent') {
      return Math.min(housingAllowanceReceived, rentPaid);
    }

    return 0;
  }

  static calculateTravelAllowanceExemption(
    travelAllowanceReceived: number,
    actualTravelExpense: number,
    rules: any
  ): number {
    if (!rules || !rules.type) {
      return 0;
    }

    if (rules.type === 'actual_expense') {
      return Math.min(travelAllowanceReceived, actualTravelExpense);
    }

    if (rules.type === 'fixed_amount') {
      return Math.min(travelAllowanceReceived, rules.amount || 0);
    }

    if (rules.type === 'percentage_of_basic') {
      const percentage = rules.percentage || 0;
      const maxAmount = (actualTravelExpense * percentage) / 100;
      return Math.min(travelAllowanceReceived, maxAmount);
    }

    return 0;
  }

  static calculateTaxExemptions(
    basicSalary: number,
    housingAllowanceReceived: number,
    travelAllowanceReceived: number,
    taxConfig: TaxConfiguration,
    rentPaid: number = 0,
    actualTravelExpense: number = 0,
    otherExemptions: any = {},
    metroCity: boolean = false
  ): {
    housingAllowanceExemption: number;
    travelAllowanceExemption: number;
    standardDeduction: number;
    otherExemptions: any;
    totalExemptions: number;
  } {
    const housingExemption = this.calculateHousingAllowanceExemption(
      housingAllowanceReceived,
      rentPaid,
      basicSalary,
      taxConfig.housingAllowanceExemptionRules
    );

    const travelExemption = this.calculateTravelAllowanceExemption(
      travelAllowanceReceived,
      actualTravelExpense,
      taxConfig.travelAllowanceExemptionRules
    );

    const standardDeduction = taxConfig.standardDeduction || 0;

    let otherExemptionsTotal = 0;
    if (taxConfig.taxExemptions) {
      Object.values(taxConfig.taxExemptions).forEach((value: any) => {
        if (typeof value === 'number') {
          otherExemptionsTotal += value;
        }
      });
    }

    Object.values(otherExemptions).forEach((value: any) => {
      if (typeof value === 'number') {
        otherExemptionsTotal += value;
      }
    });

    return {
      housingAllowanceExemption: Math.max(0, housingExemption),
      travelAllowanceExemption: Math.max(0, travelExemption),
      standardDeduction,
      otherExemptions: otherExemptions,
      totalExemptions:
        housingExemption +
        travelExemption +
        standardDeduction +
        otherExemptionsTotal,
    };
  }

  static calculateAllTaxes(
    grossSalary: number,
    basicSalary: number,
    housingAllowanceReceived: number,
    travelAllowanceReceived: number,
    taxConfig: TaxConfiguration,
    monthlyTaxableIncome: number,
    annualTaxableIncome: number,
    rentPaid: number = 0,
    actualTravelExpense: number = 0,
    otherExemptions: any = {},
    metroCity: boolean = false
  ): TaxCalculationResult {
    const exemptions = this.calculateTaxExemptions(
      basicSalary,
      housingAllowanceReceived,
      travelAllowanceReceived,
      taxConfig,
      rentPaid,
      actualTravelExpense,
      otherExemptions,
      metroCity
    );

    const finalTaxableIncome = annualTaxableIncome - exemptions.totalExemptions;

    const incomeTaxAmount = taxConfig.incomeTaxEnabled
      ? this.calculateIncomeTax(
          finalTaxableIncome,
          taxConfig.incomeTaxSlabs as any[]
        )
      : 0;

    const localTaxAmount = taxConfig.localTaxEnabled || taxConfig.professionalTaxEnabled
      ? this.calculateLocalTax(
          grossSalary,
          taxConfig.localTaxSlabs as any[],
          taxConfig.professionalTaxEnabled,
          taxConfig.professionalTaxSlabs as any[]
        )
      : 0;

    const socialSecurity = taxConfig.socialSecurityEnabled
      ? this.calculateSocialSecurity(
          basicSalary,
          taxConfig.socialSecurityEmployerRate,
          taxConfig.socialSecurityEmployeeRate,
          taxConfig.socialSecurityMaxSalary
        )
      : { employee: 0, employer: 0 };

    const healthInsurance = taxConfig.healthInsuranceEnabled
      ? this.calculateHealthInsurance(
          grossSalary,
          taxConfig.healthInsuranceEmployerRate,
          taxConfig.healthInsuranceEmployeeRate,
          taxConfig.healthInsuranceMaxSalary
        )
      : { employee: 0, employer: 0 };

    return {
      incomeTaxAmount,
      localTaxAmount,
      socialSecurityEmployeeAmount: socialSecurity.employee,
      socialSecurityEmployerAmount: socialSecurity.employer,
      healthInsuranceEmployeeAmount: healthInsurance.employee,
      healthInsuranceEmployerAmount: healthInsurance.employer,
      taxableIncome: finalTaxableIncome,
      taxExemptions: exemptions,
    };
  }
}
