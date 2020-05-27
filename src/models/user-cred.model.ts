import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class UserCred extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'number',
  })
  userId: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserCred>) {
    super(data);
  }
}

export interface UserCredRelations {
  // describe navigational properties here
}

export type UserCredWithRelations = UserCred & UserCredRelations;
