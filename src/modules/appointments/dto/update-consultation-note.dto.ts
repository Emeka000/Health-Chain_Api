import { PartialType } from '@nestjs/swagger';
import { CreateConsultationNoteDto } from './create-consultation-note.dto';

export class UpdateConsultationNoteDto extends PartialType(
  CreateConsultationNoteDto,
) {}
