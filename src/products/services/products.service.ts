import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';

import { Product } from './../entities/product.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  FilterProductsDto,
} from './../dtos/products.dtos';

import { UsersService } from '../../users/services/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private usersService: UsersService
  ) {}

  async findAll() {
    const resp = await this.productModel.find().populate('user').exec();   
    return resp
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  create(data: CreateProductDto, id: number) {
    const newProduct = new this.productModel({name: data.name, price: data.price, user: id});
    return newProduct.save();
  }

  async update(id: string, changes: UpdateProductDto, user_id: number) {
    const product = await this.productModel
      .findByIdAndUpdate(id, { $set: changes }, { new: true })
      .exec() as any;
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);                    
    }
    if(user_id !== product.user){
      throw new UnauthorizedException(`you are not authorized`);
    }
    return product;
  }

  async remove(id: string, user_id: number) {
    const product = await this.findOne(id) as any;
    if(user_id !== product.user){
      throw new UnauthorizedException(`you are not authorized`);
    }
    return this.productModel.findByIdAndDelete(id);
  }

  async productByuser(userId: string) {
    const user = await this.usersService.findOne(userId);
    return await this.productModel
      .find({ user: user._id.toString() }) 
      .populate('products') 
      .exec();
  }
  

}
