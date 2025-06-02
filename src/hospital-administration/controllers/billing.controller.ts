import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BillingService } from '../services/billing.service';
import { FilterQuery, ApiResponse as CustomApiResponse } from '../interfaces/common.interface';

@ApiTags('Billing Management')
@Controller('api/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // Bill Management
  @Post('bills')
  @ApiOperation({ summary: 'Create new bill' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Bill created successfully' })
  async createBill(@Body() createBillDto: any): Promise<CustomApiResponse<any>> {
    const bill = await this.billingService.createBill(createBillDto);
    return {
      success: true,
      data: bill,
      message: 'Bill created successfully'
    };
  }

  @Get('bills')
  @ApiOperation({ summary: 'Get all bills' })
  @ApiQuery({ name: 'patientId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getAllBills(@Query() query: FilterQuery): Promise<CustomApiResponse<any[]>> {
    const result = await this.billingService.getAllBills(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }

  @Get('bills/:id')
  @ApiOperation({ summary: 'Get bill by ID' })
  async getBill(@Param('id') id: string): Promise<CustomApiResponse<any>> {
    const bill = await this.billingService.getBill(id);
    return {
      success: true,
      data: bill
    };
  }

  @Put('bills/:id')
  @ApiOperation({ summary: 'Update bill' })
  async updateBill(@Param('id') id: string, @Body() updateDto: any): Promise<CustomApiResponse<any>> {
    const bill = await this.billingService.updateBill(id, updateDto);
    return {
      success: true,
      data: bill,
      message: 'Bill updated successfully'
    };
  }

  @Delete('bills/:id')
  @ApiOperation({ summary: 'Delete bill' })
  async deleteBill(@Param('id') id: string): Promise<CustomApiResponse<null>> {
    await this.billingService.deleteBill(id);
    return {
      success: true,
      data: null,
      message: 'Bill deleted successfully'
    };
  }

  @Post('bills/:id/finalize')
  @ApiOperation({ summary: 'Finalize bill' })
  async finalizeBill(@Param('id') id: string): Promise<CustomApiResponse<any>> {
    const bill = await this.billingService.finalizeBill(id);
    return {
      success: true,
      data: bill,
      message: 'Bill finalized successfully'
    };
  }

  // Payment Management
  @Post('payments')
  @ApiOperation({ summary: 'Process payment' })
  async processPayment(@Body() paymentDto: any): Promise<CustomApiResponse<any>> {
    const payment = await this.billingService.processPayment(paymentDto);
    return {
      success: true,
      data: payment,
      message: 'Payment processed successfully'
    };
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get all payments' })
  async getAllPayments(@Query() query: FilterQuery): Promise<CustomApiResponse<any[]>> {
    const result = await this.billingService.getAllPayments(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async getPayment(@Param('id') id: string): Promise<CustomApiResponse<any>> {
    const payment = await this.billingService.getPayment(id);
    return {
      success: true,
      data: payment
    };
  }

  @Post('payments/:id/refund')
  @ApiOperation({ summary: 'Process payment refund' })
  async refundPayment(@Param('id') id: string, @Body() refundDto: any): Promise<CustomApiResponse<any>> {
    const refund = await this.billingService.refundPayment(id, refundDto);
    return {
      success: true,
      data: refund,
      message: 'Refund processed successfully'
    };
  }

  // Financial Reports
  @Get('reports/revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  async getRevenueReport(@Query() query: any): Promise<CustomApiResponse<any>> {
    const report = await this.billingService.getRevenueReport(query);
    return {
      success: true,
      data: report
    };
  }

  @Get('reports/outstanding')
  @ApiOperation({ summary: 'Get outstanding bills report' })
  async getOutstandingReport(@Query() query: any): Promise<CustomApiResponse<any>> {
    const report = await this.billingService.getOutstandingReport(query);
    return {
      success: true,
      data: report
    };
  }

  @Get('reports/payment-methods')
  @ApiOperation({ summary: 'Get payment methods report' })
  async getPaymentMethodsReport(@Query() query: any): Promise<CustomApiResponse<any>> {
    const report = await this.billingService.getPaymentMethodsReport(query);
    return {
      success: true,
      data: report
    };
  }
}
