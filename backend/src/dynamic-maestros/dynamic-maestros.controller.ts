import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DynamicMaestrosService } from './dynamic-maestros.service';

export interface CrudOperation {
  action: 'create' | 'read' | 'update' | 'delete' | 'list';
  table: string;
  data?: Record<string, any>;
  id?: number | string;
  filters?: Record<string, any>;
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface CrudResponse<T = Record<string, any>> {
  success: boolean;
  data?: T | T[];
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Controller('dynamic-maestros')
@UseGuards(JwtAuthGuard)
export class DynamicMaestrosController {
  constructor(private readonly dynamicMaestrosService: DynamicMaestrosService) {}

  @Get(':table')
  async findAll(
    @Param('table') table: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('sortField') sortField?: string,
    @Query('sortDirection') sortDirection: 'asc' | 'desc' = 'asc',
    @Query() filters?: Record<string, any>,
  ): Promise<CrudResponse> {
    try {
      // Excluir parámetros especiales de los filtros
      const { page: _, limit: __, search: ___, sortField: ____, sortDirection: _____, ...cleanFilters } = filters || {};
      
      const operation: CrudOperation = {
        action: 'list',
        table,
        pagination: { page: Number(page), limit: Number(limit) },
        filters: { ...cleanFilters, search },
        sort: sortField ? { field: sortField, direction: sortDirection } : undefined,
      };

      const result = await this.dynamicMaestrosService.executeOperation(operation);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':table/:id')
  async findOne(
    @Param('table') table: string,
    @Param('id') id: string,
  ): Promise<CrudResponse> {
    try {
      const operation: CrudOperation = {
        action: 'read',
        table,
        id,
      };

      const result = await this.dynamicMaestrosService.executeOperation(operation);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post(':table')
  async create(
    @Param('table') table: string,
    @Body() data: Record<string, any>,
  ): Promise<CrudResponse> {
    try {
      const operation: CrudOperation = {
        action: 'create',
        table,
        data,
      };

      const result = await this.dynamicMaestrosService.executeOperation(operation);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':table/:id')
  async update(
    @Param('table') table: string,
    @Param('id') id: string,
    @Body() data: Record<string, any>,
  ): Promise<CrudResponse> {
    try {
      const operation: CrudOperation = {
        action: 'update',
        table,
        id,
        data,
      };

      const result = await this.dynamicMaestrosService.executeOperation(operation);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':table/:id')
  async remove(
    @Param('table') table: string,
    @Param('id') id: string,
  ): Promise<CrudResponse> {
    try {
      const operation: CrudOperation = {
        action: 'delete',
        table,
        id,
      };

      const result = await this.dynamicMaestrosService.executeOperation(operation);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':table/schema/fields')
  async getTableSchema(@Param('table') table: string): Promise<CrudResponse> {
    try {
      const schema = await this.dynamicMaestrosService.getTableSchema(table);
      return {
        success: true,
        data: schema,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}