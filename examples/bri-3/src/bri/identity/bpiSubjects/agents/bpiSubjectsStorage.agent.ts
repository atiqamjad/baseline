import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { NOT_FOUND_ERR_MESSAGE } from '../api/err.messages';
import { BpiSubject } from '../models/bpiSubject';
import { getType, Type, PropertyInfo } from "tst-reflect";
import Mapper from 'src/bri/utils/mapper';

// Repositories are the only places that talk the Prisma language of models.
// They are always mapped to and from domain objects so that the business layer of the application
// does not have to care about the ORM.
@Injectable()
export class BpiSubjectStorageAgent extends PrismaService {

  async getBpiSubjectById(id: string): Promise<BpiSubject> {
    const bpiSubjectModel = await this.bpiSubject.findUnique({
      where: { id },
    });

    if (!bpiSubjectModel) {
      throw new NotFoundException(NOT_FOUND_ERR_MESSAGE);
    }
    return Mapper.map(bpiSubjectModel, getType<BpiSubject>()) as BpiSubject; 
  }

  async getAllBpiSubjects(): Promise<BpiSubject[]> {
    const bpiSubjectModels = await this.bpiSubject.findMany();
    return bpiSubjectModels.map((bpiSubjectModel) => {
      return Mapper.map(bpiSubjectModel, getType<BpiSubject>()) as BpiSubject; 
    });
  }

  async createNewBpiSubject(bpiSubject: BpiSubject): Promise<BpiSubject> {
    const newBpiSubjectModel = await this.bpiSubject.create({
      data : Mapper.map(bpiSubject, getType<BpiSubject>())
    });
    return Mapper.map(newBpiSubjectModel, getType<BpiSubject>()) as BpiSubject;   
  }

  async updateBpiSubject(bpiSubject: BpiSubject): Promise<BpiSubject> {
    const updatedBpiSubjectModel = await this.bpiSubject.update({
      where: { id: bpiSubject.id },
      data : Mapper.map(bpiSubject, getType<BpiSubject>())
    });
    return Mapper.map(updatedBpiSubjectModel, getType<BpiSubject>()) as BpiSubject;   
  }

  async deleteBpiSubject(bpiSubject: BpiSubject): Promise<void> {
    await this.bpiSubject.delete({
      where: { id: bpiSubject.id },
    });
  }
}
