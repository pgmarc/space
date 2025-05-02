import fs from 'fs';
import path from 'path';

import container from '../config/container.js';
import ServiceService from '../services/ServiceService';
import { ServiceQueryFilters } from '../repositories/mongoose/ServiceRepository.js';

class ServiceController {
  private serviceService: ServiceService;

  constructor() {
    this.serviceService = container.resolve('serviceService');
    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  async index(req: any, res: any) {
    try {
      const queryParams = this._transformIndexQueryParams(req.query);
      
      const services = await this.serviceService.index(queryParams);
      res.json(services);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async show(req: any, res: any) {
    try {
      res.json({message: "TODO: Implement method"});
    } catch (err: any) {
      if (err.message.toLowerCase().includes('not found')) {
        res.status(404).send({ error: err.message });
      } else {
        res.status(500).send({ error: err.message });
      }
    }
  }

  async create(req: any, res: any) {
    try {
      res.json({message: "TODO: Implement method"});
    } catch (err: any) {
      if (err.message.toLowerCase().includes('not found')) {
        res.status(404).send({ error: err.message });
      } else {
        res.status(500).send({ error: err.message });
      }
    }
  }

  async update(req: any, res: any) {
    try {
      res.json({message: "TODO: Implement method"});
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async destroy(req: any, res: any) {
    try{
      res.json({message: "TODO: Implement method"});
    }catch(err: any){
      res.status(500).send({ error: err.message });
    }
  }

  _transformIndexQueryParams(
    indexQueryParams: Record<string, string | number>
  ): ServiceQueryFilters {
    const transformedData: ServiceQueryFilters = {
      name: indexQueryParams.name as string,
      page: parseInt(indexQueryParams['page'] as string) || 1,
      offset: parseInt(indexQueryParams['offset'] as string) || 0,
      limit: parseInt(indexQueryParams['limit'] as string) || 20,
      order: indexQueryParams.order as 'asc' | 'desc' || 'asc',
    };

    const optionalFields = [
      'name',
      'page',
      'offset',
      'limit',
      'order',
    ] as const;

    optionalFields.forEach(field => {
      if (['name', 'order'].includes(field)) {
        if (!transformedData[field]) {
          delete transformedData[field];
        }
      } else {
        if (this._containsNaN(transformedData[field]!)) {
          delete transformedData[field];
        }
      }
    });

    return transformedData;
  }

  _containsNaN(attr: any): boolean {
    return Object.values(attr).every(value => Number.isNaN(value));
  }
}

export default ServiceController;
