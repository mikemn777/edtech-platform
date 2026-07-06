import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalizationService } from './application/localization.service';
import { Public } from '../../shared/authz/authz.decorators';

@ApiTags('localization')
@Controller({ path: 'localization', version: '1' })
export class LocalizationController {
  constructor(private readonly localization: LocalizationService) {}

  @Public()
  @Get('languages')
  @ApiOperation({ summary: 'List supported languages (with text direction)' })
  async languages() {
    return this.localization.listLanguages();
  }
}
