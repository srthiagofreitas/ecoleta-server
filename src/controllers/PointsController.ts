import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    // converter uma strig separada por virgula em um arrey
    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    return response.json(points);
  }
  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(400).json({ message: 'Point not found.' });
    }

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return response.json({ point,items });
  }
  async create (request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;
  
    // utilizando o transaction do knex para tratamento de erros no insert
    // neste caso se a primeira query falhar a segunda n executa e o mesmo ao contrario
    const trx = await knex.transaction();
    
    const point = {
      image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };
    
  // utilizando shortsintax quando a variavel do ambiente é a mesma do campo no bd
    const insertedIds = await trx('points').insert(point);
    
    const point_id = insertedIds[0];
    
    // obetendo os dados para inserir na tabela point_items
    const pointItems = items.map((item_id: number) => {
      return {
        item_id,
        point_id,
      };
    })
    
    await trx('point_items').insert(pointItems);
    
    await trx.commit();

    return response.json({ 
      id: point_id,
      ...point, 
    });
  }
}


export default PointsController;