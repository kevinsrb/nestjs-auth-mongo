import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  Put,
  Delete,
  HttpStatus,
  HttpCode,
  Req,
  UseGuards
  // ParseIntPipe,
} from '@nestjs/common';
import { Request  } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { MongoIdPipe } from './../../common/mongo-id.pipe';
import {
  CreateProductDto,
  UpdateProductDto,
  FilterProductsDto,
} from '../dtos/products.dtos';
import { ProductsService } from './../services/products.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../auth/decorators/public.decorator';
import { PayloadToken } from 'src/auth/models/token.model';

@UseGuards(JwtAuthGuard)
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List of products' })
  getProducts() {
    return this.productsService.findAll();
  }

  @Public()
  @Get(':productId')
  @HttpCode(HttpStatus.ACCEPTED)
  getOne(@Param('productId', MongoIdPipe) productId: string) {
    return this.productsService.findOne(productId);
  }

  @Post()
  create(@Body() payload: CreateProductDto, @Req() req: Request) {
    const user = req.user as PayloadToken;
    return this.productsService.create(payload, user.sub);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() payload: UpdateProductDto, @Req() req: Request) {
    const user = req.user as PayloadToken;
    return this.productsService.update(id, payload, user.sub);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as PayloadToken;
    return this.productsService.remove(id, user.sub);
  }
}
