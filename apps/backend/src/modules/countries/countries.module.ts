import { Module } from '@nestjs/common';
import { CountriesController } from './countries.controller';
import { CountriesService } from './application/countries.service';

@Module({
  controllers: [CountriesController],
  providers: [CountriesService],
  exports: [CountriesService],
})
export class CountriesModule {}
