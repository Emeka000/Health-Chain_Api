import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RadiologyController } from './radiology.controller';
import { RadiologyService } from './radiology.service';
import { ImagingStudy } from './entities/imaging-study.entity';
import { DicomImage } from './entities/dicom-image.entity';
import { RadiologyReport } from './entities/radiology-report.entity';
import { ImagingEquipment } from './entities/imaging-equipment.entity';
import { RadiationDose } from './entities/radiation-dose.entity';
import { TeleradiologySession } from './entities/teleradiology-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImagingStudy,
      DicomImage,
      RadiologyReport,
      ImagingEquipment,
      RadiationDose,
      TeleradiologySession,
    ]),
  ],
  controllers: [RadiologyController],
  providers: [RadiologyService],
  exports: [RadiologyService],
})
export class RadiologyModule {} 