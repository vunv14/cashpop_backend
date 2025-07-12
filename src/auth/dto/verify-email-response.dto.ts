import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailInitiateResponseDto {
  @ApiProperty({
    description: 'Status message',
    example: 'Verification email sent',
  })
  message: string;
}

export class VerifyEmailOtpResponseDto {
  @ApiProperty({
    description: 'Status message',
    example: 'Email verified successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Whether the email was verified',
    example: true,
  })
  verified: boolean;

  @ApiProperty({
    description: 'JWT token for email verification',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;
}
