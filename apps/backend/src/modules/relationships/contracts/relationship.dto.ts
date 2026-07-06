import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * Parent–Student guardianship link contracts (Business Domain Model §2, §4).
 * This establishes the STRUCTURAL link only. The RULES of guardianship —
 * establishment authority, consent, oversight scope — are Pending Business/Legal
 * Decisions (BR-102); this module does not invent them.
 */
export class CreateGuardianshipDto {
  @ApiProperty({ description: 'Parent/guardian account id.' })
  @IsUUID()
  parentAccountId!: string;

  @ApiProperty({ description: 'Student account id (the linked minor/learner).' })
  @IsUUID()
  studentAccountId!: string;
}
