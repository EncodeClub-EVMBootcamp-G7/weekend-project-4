import { ApiProperty } from '@nestjs/swagger';

export class MintTokenDto {
  @ApiProperty({
    type: String,
    required: true,
    default: '0x93Bd787F60A9433f9f37B4a4CD6BD5f06A63eA60',
  })
  address: string;
  
  @ApiProperty({ type: Number, required: true, default: 1000 })
  amount: number;
}
