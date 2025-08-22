import {Type} from 'class-transformer';
import {IsInt, IsOptional, Min} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class PaginationDto {
    @ApiProperty({description: 'Current page number', example: 1, required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiProperty({description: 'Number of items per page', example: 10, required: false})
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize: number = 10;
}
