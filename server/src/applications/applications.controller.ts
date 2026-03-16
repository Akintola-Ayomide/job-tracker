import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface UserRequest extends Request {
  user: any;
}

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Req() req: UserRequest,
  ) {
    return this.applicationsService.create(createApplicationDto, req.user);
  }

  @Get()
  findAll(@Req() req: UserRequest) {
    return this.applicationsService.findAll(req.user);
  }

  @Get('statistics')
  getStatistics(@Req() req: UserRequest) {
    return this.applicationsService.getStatistics(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: UserRequest) {
    return this.applicationsService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @Req() req: UserRequest,
  ) {
    return this.applicationsService.update(id, updateApplicationDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: UserRequest) {
    return this.applicationsService.remove(id, req.user);
  }
}
