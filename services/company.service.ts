import { Prisma } from "@/generated/prisma";
import { COMPANY_INCLUDE_COUNT, COMPANY_INCLUDE_FULL } from "@/lib/prisma-includes";
import { prisma } from "@/lib/prisma";
import type {
  AllCompanyResponse,
  CompanyListResponse,
  CompanyQueryType,
  CompanyResponse,
  CreateCompanyType,
  UpdateCompanyType,
} from "@/validators";

export class CompanyService {
  async getCompanyById(id: string): Promise<CompanyResponse> {
    try {
      const company = await prisma.company.findUnique({
        where: { id },
        include: COMPANY_INCLUDE_FULL,
      });

      if (!company) {
        return { success: false, message: "Company not found" };
      }

      return { success: true, message: "Company retrieved successfully", company };
    } catch (error) {
      console.error("Error in getCompanyById:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve company",
      };
    }
  }

  async getAllCompanies(params: CompanyQueryType): Promise<AllCompanyResponse> {
    try {
      const { type, search, cursor, limit } = params;

      const where: Prisma.CompanyWhereInput = {};
      if (type) where.type = type;
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ];
      }

      const companies = await prisma.company.findMany({
        where,
        take: limit + 1,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        include: COMPANY_INCLUDE_COUNT,
        orderBy: { createdAt: "desc" },
      });

      const hasMore = companies.length > limit;
      const results = hasMore ? companies.slice(0, -1) : companies;
      const nextCursor = hasMore ? results[results.length - 1].id : null;

      return {
        success: true,
        message: "Companies retrieved successfully",
        companies: results,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      console.error("Error in getAllCompanies:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve companies",
      };
    }
  }

  async getCompanyList(): Promise<CompanyListResponse> {
    try {
      const companies = await prisma.company.findMany({
        select: { id: true, name: true, type: true },
        orderBy: { name: "asc" },
      });

      return { success: true, message: "Company list retrieved successfully", companies };
    } catch (error) {
      console.error("Error in getCompanyList:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve company list",
      };
    }
  }

  async companyNameExists(name: string, excludeId?: string): Promise<boolean> {
    try {
      const company = await prisma.company.findFirst({
        where: {
          name: { equals: name },
          ...(excludeId && { id: { not: excludeId } }),
        },
      });
      return !!company;
    } catch (error) {
      console.error("Error in companyNameExists:", error);
      return false;
    }
  }

  async createCompany(data: CreateCompanyType): Promise<CompanyResponse> {
    try {
      const nameExists = await this.companyNameExists(data.name);
      if (nameExists) {
        return { success: false, message: "Company name already exists" };
      }

      const { employees, ...companyData } = data;

      const company = await prisma.company.create({
        data: {
          ...companyData,
          ...(employees?.length && {
            employees: { create: employees },
          }),
        },
        include: COMPANY_INCLUDE_FULL,
      });

      return { success: true, message: "Company created successfully", company };
    } catch (error) {
      console.error("Error in createCompany:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create company",
      };
    }
  }

  async updateCompany(id: string, data: UpdateCompanyType): Promise<CompanyResponse> {
    try {
      const existing = await this.getCompanyById(id);
      if (!existing.company) {
        return { success: false, message: "Company does not exist" };
      }

      if (data.name && data.name !== existing.company.name) {
        const nameTaken = await this.companyNameExists(data.name, id);
        if (nameTaken) {
          return { success: false, message: "Company name already exists" };
        }
      }

      const company = await prisma.company.update({
        where: { id },
        data,
        include: COMPANY_INCLUDE_FULL,
      });

      return { success: true, message: "Company updated successfully", company };
    } catch (error) {
      console.error("Error in updateCompany:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update company",
      };
    }
  }

  async deleteCompany(id: string): Promise<CompanyResponse> {
    try {
      const existing = await this.getCompanyById(id);
      if (!existing.company) {
        return { success: false, message: "Company does not exist" };
      }

      await prisma.company.delete({ where: { id } });

      return { success: true, message: "Company deleted successfully" };
    } catch (error) {
      console.error("Error in deleteCompany:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete company",
      };
    }
  }
}

export const companyService = new CompanyService();
