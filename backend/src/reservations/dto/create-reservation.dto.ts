import { IsDateString, IsUUID, Validate } from 'class-validator';
import {
  DatesNotEqualConstraint,
  EndDateAfterStartDateConstraint,
  NotInPastConstraint,
} from 'decorators/date-validator.decorator';
import { CreateReservation } from 'lib/types/api/Reservation';

export class CreateReservationDto implements CreateReservation {
  @IsUUID()
  parkingId!: string;

  @IsDateString()
  @Validate(NotInPastConstraint)
  @Validate(DatesNotEqualConstraint)
  startDate!: Date;

  @IsDateString()
  @Validate(EndDateAfterStartDateConstraint)
  @Validate(DatesNotEqualConstraint)
  endDate!: Date;
}
