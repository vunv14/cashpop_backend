import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Matches, Max, Min} from "class-validator";

export class CreatePostDto {
    @ApiProperty({
        description: "Title of the article",
        example: "Cherry Blossom Festival",
        required: true
    })
    @IsString({message: "Title must be a string"})
    @IsNotEmpty({message: "Title is required"})
    title: string

    @ApiPropertyOptional({
        description: "Detailed content of the post.",
    })
    @IsOptional()
    @IsString({message: "Content must be a string"})
    content?: string;


    @IsOptional()
    @IsArray({message: "MediaUrls must be an array"})
    @IsString({each: true, message: "Each element in MediaUrls must be a string."})
    @IsUrl({}, {each: true, message: "Each element in MediaUrls must be a valid URL"})
    mediaUrls?: string[];

    @IsOptional()
    @ApiProperty({description: "Latitude of location", example: 40.7128})
    @IsString()
    @Matches(/^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:\.[0-9]{1,6})?)$/, {
        message: 'Latitude must be between -90 and 90',
    })
    latitude?: string;

    @IsOptional()
    @ApiProperty({description: "Longitude of location", example: -74.0060})
    @IsString()
    @Matches(/^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:\.[0-9]{1,6})?)$/, {
        message: 'Longitude must be between -180 and 180',
    })
    longitude?: string;

}