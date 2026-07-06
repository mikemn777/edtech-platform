import { Module } from '@nestjs/common';
import { RelationshipController } from './relationship.controller';
import { RelationshipService } from './application/relationship.service';

@Module({
  controllers: [RelationshipController],
  providers: [RelationshipService],
  exports: [RelationshipService],
})
export class RelationshipModule {}
