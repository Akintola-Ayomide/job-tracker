import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  JobApplication,
  ApplicationStatus,
} from './entities/job-application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private applicationRepository: Repository<JobApplication>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto, user: User) {
    const application = this.applicationRepository.create({
      ...createApplicationDto,
      userId: user.id,
    });

    return this.applicationRepository.save(application);
  }

  async findAll(user: User) {
    return this.applicationRepository.find({
      where: { userId: user.id },
      order: { dateApplied: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Ensure user owns this application
    if (application.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have access to this application',
      );
    }

    return application;
  }

  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
    user: User,
  ) {
    const application = await this.findOne(id, user);

    Object.assign(application, updateApplicationDto);

    return this.applicationRepository.save(application);
  }

  async remove(id: string, user: User) {
    const application = await this.findOne(id, user);
    await this.applicationRepository.remove(application);
    return { message: 'Application deleted successfully' };
  }

  async getStatistics(user: User) {
    const applications = await this.findAll(user);

    const statistics = {
      total: applications.length,
      applied: applications.filter(
        (app) => app.status === ApplicationStatus.APPLIED,
      ).length,
      interview: applications.filter(
        (app) => app.status === ApplicationStatus.INTERVIEW,
      ).length,
      offer: applications.filter(
        (app) => app.status === ApplicationStatus.OFFER,
      ).length,
      rejected: applications.filter(
        (app) => app.status === ApplicationStatus.REJECTED,
      ).length,
      accepted: applications.filter(
        (app) => app.status === ApplicationStatus.ACCEPTED,
      ).length,
    };

    return statistics;
  }
}
