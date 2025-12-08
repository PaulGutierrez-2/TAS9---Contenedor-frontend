import { Module } from '@nestjs/common';
import { ProductController } from './products/products.controller';
import { ProductService } from './products/products.service';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, PrismaService],
})
export class AppModule {}
