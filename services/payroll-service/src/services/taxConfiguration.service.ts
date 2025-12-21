import { TaxConfiguration } from '../models/TaxConfiguration.model';
import { ConflictError, NotFoundError } from '@hrm/common';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

export class TaxConfigurationService {
  static async createTaxConfiguration(data: {
    companyId: string;
    country: string;
    state: string;
    province?: string;
    financialYear: string;
    incomeTaxEnabled?: boolean;
    incomeTaxSlabs?: any;
    socialSecurityEnabled?: boolean;
    socialSecurityEmployerRate?: number;
    socialSecurityEmployeeRate?: number;
    socialSecurityMaxSalary?: number;
    healthInsuranceEnabled?: boolean;
    healthInsuranceEmployerRate?: number;
    healthInsuranceEmployeeRate?: number;
    healthInsuranceMaxSalary?: number;
    localTaxEnabled?: boolean;
    localTaxSlabs?: any;
    professionalTaxEnabled?: boolean;
    professionalTaxSlabs?: any;
    housingAllowanceExemptionRules?: any;
    travelAllowanceExemptionRules?: any;
    standardDeduction?: number;
    taxExemptions?: any;
  }): Promise<TaxConfiguration> {
    const existing = await TaxConfiguration.findOne({
      where: {
        companyId: data.companyId,
        country: data.country,
        financialYear: data.financialYear,
      },
    });

    if (existing) {
      throw new ConflictError('Tax configuration already exists for this country and financial year');
    }

    const config = await TaxConfiguration.create({
      id: uuidv4(),
      incomeTaxEnabled: data.incomeTaxEnabled ?? true,
      incomeTaxSlabs: data.incomeTaxSlabs ?? null,
      socialSecurityEnabled: data.socialSecurityEnabled ?? false,
      socialSecurityEmployerRate: data.socialSecurityEmployerRate ?? 0,
      socialSecurityEmployeeRate: data.socialSecurityEmployeeRate ?? 0,
      socialSecurityMaxSalary: data.socialSecurityMaxSalary ?? 0,
      healthInsuranceEnabled: data.healthInsuranceEnabled ?? false,
      healthInsuranceEmployerRate: data.healthInsuranceEmployerRate ?? 0,
      healthInsuranceEmployeeRate: data.healthInsuranceEmployeeRate ?? 0,
      healthInsuranceMaxSalary: data.healthInsuranceMaxSalary ?? 0,
      localTaxEnabled: data.localTaxEnabled ?? false,
      localTaxSlabs: data.localTaxSlabs ?? null,
      professionalTaxEnabled: data.professionalTaxEnabled ?? false,
      professionalTaxSlabs: data.professionalTaxSlabs ?? null,
      housingAllowanceExemptionRules: data.housingAllowanceExemptionRules ?? null,
      travelAllowanceExemptionRules: data.travelAllowanceExemptionRules ?? null,
      standardDeduction: data.standardDeduction ?? 0,
      taxExemptions: data.taxExemptions ?? null,
      ...data,
    });

    return config;
  }

  static async getTaxConfigurationById(id: string): Promise<TaxConfiguration> {
    const config = await TaxConfiguration.findByPk(id);
    if (!config) {
      throw new NotFoundError('Tax configuration');
    }
    return config;
  }

  static async getTaxConfigurationByCompanyCountryAndYear(
    companyId: string,
    country: string,
    financialYear: string
  ): Promise<TaxConfiguration | null> {
    return await TaxConfiguration.findOne({
      where: {
        companyId,
        country,
        financialYear,
      },
    });
  }

  static async updateTaxConfiguration(
    id: string,
    data: Partial<TaxConfiguration>
  ): Promise<TaxConfiguration> {
    const config = await TaxConfiguration.findByPk(id);
    if (!config) {
      throw new NotFoundError('Tax configuration');
    }

    await config.update(data);
    return config;
  }

  static async getTaxConfigurationsByCompany(companyId: string): Promise<TaxConfiguration[]> {
    return await TaxConfiguration.findAll({
      where: { companyId },
      order: [['financialYear', 'DESC']],
    });
  }
}

