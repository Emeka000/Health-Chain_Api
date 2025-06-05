@Controller('patient-satisfaction')
export class PatientSatisfactionController {
  constructor(private readonly satisfactionService: PatientSatisfactionService) {}

  @Post()
  create(@Body() dto: CreatePatientSatisfactionDto) {
    return this.satisfactionService.create(dto);
  }

  @Get()
  findAll(@Query() filters: any) {
    return this.satisfactionService.findAll(filters);
  }

  @Get('report')
  getReport(@Query('departmentId') departmentId?: string) {
    return this.satisfactionService.getSatisfactionReport(departmentId);
  }
}
