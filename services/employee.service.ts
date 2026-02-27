import { Prisma } from "@/generated/prisma";
import { EMPLOYEE_INCLUDE_COMPANY } from "@/lib/prisma-includes";
import { prisma } from "@/lib/prisma";
import type {
  AllEmployeeResponse,
  CreateEmployeeType,
  EmployeeQueryType,
  EmployeeResponse,
  UpdateEmployeeType,
} from "@/validators";

export class EmployeeService {
  async getEmployeeById(id: string): Promise<EmployeeResponse> {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id },
        include: EMPLOYEE_INCLUDE_COMPANY,
      });

      if (!employee) {
        return { success: false, message: "Employee not found" };
      }

      return { success: true, message: "Employee retrieved successfully", employee };
    } catch (error) {
      console.error("Error in getEmployeeById:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve employee",
      };
    }
  }

  async getAllEmployees(params: EmployeeQueryType): Promise<AllEmployeeResponse> {
    try {
      const { companyId, search, cursor, limit } = params;

      const where: Prisma.EmployeeWhereInput = {};
      if (companyId) where.companyId = companyId;
      if (search) {
        where.OR = [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
          { designation: { contains: search } },
        ];
      }

      const employees = await prisma.employee.findMany({
        where,
        take: limit + 1,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        include: EMPLOYEE_INCLUDE_COMPANY,
        orderBy: { createdAt: "desc" },
      });

      const hasMore = employees.length > limit;
      const results = hasMore ? employees.slice(0, -1) : employees;
      const nextCursor = hasMore ? results[results.length - 1].id : null;

      return {
        success: true,
        message: "Employees retrieved successfully",
        employees: results,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      console.error("Error in getAllEmployees:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve employees",
      };
    }
  }

  async createEmployee(data: CreateEmployeeType): Promise<EmployeeResponse> {
    try {
      if (data.companyId) {
        const company = await prisma.company.findUnique({
          where: { id: data.companyId },
        });
        if (!company) {
          return { success: false, message: "Company does not exist" };
        }
      }

      const employee = await prisma.employee.create({
        data,
        include: EMPLOYEE_INCLUDE_COMPANY,
      });

      return { success: true, message: "Employee created successfully", employee };
    } catch (error) {
      console.error("Error in createEmployee:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create employee",
      };
    }
  }

  async updateEmployee(id: string, data: UpdateEmployeeType): Promise<EmployeeResponse> {
    try {
      const existing = await this.getEmployeeById(id);
      if (!existing.employee) {
        return { success: false, message: "Employee does not exist" };
      }

      if (data.companyId) {
        const company = await prisma.company.findUnique({
          where: { id: data.companyId },
        });
        if (!company) {
          return { success: false, message: "Company does not exist" };
        }
      }

      const employee = await prisma.employee.update({
        where: { id },
        data,
        include: EMPLOYEE_INCLUDE_COMPANY,
      });

      return { success: true, message: "Employee updated successfully", employee };
    } catch (error) {
      console.error("Error in updateEmployee:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update employee",
      };
    }
  }

  async deleteEmployee(id: string): Promise<EmployeeResponse> {
    try {
      const existing = await this.getEmployeeById(id);
      if (!existing.employee) {
        return { success: false, message: "Employee does not exist" };
      }

      await prisma.employee.delete({ where: { id } });

      return { success: true, message: "Employee deleted successfully" };
    } catch (error) {
      console.error("Error in deleteEmployee:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete employee",
      };
    }
  }
}

export const employeeService = new EmployeeService();
