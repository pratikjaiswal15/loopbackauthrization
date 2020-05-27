import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  User,
  UserCred,
} from '../models';
import {UserRepository} from '../repositories';

export class UserUserCredController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/user-cred', {
    responses: {
      '200': {
        description: 'User has one UserCred',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserCred),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<UserCred>,
  ): Promise<UserCred> {
    return this.userRepository.userCredentials(id).get(filter);
  }

  @post('/users/{id}/user-cred', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserCred)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserCred, {
            title: 'NewUserCredInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) userCred: Omit<UserCred, 'id'>,
  ): Promise<UserCred> {
    return this.userRepository.userCredentials(id).create(userCred);
  }

  @patch('/users/{id}/user-cred', {
    responses: {
      '200': {
        description: 'User.UserCred PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserCred, {partial: true}),
        },
      },
    })
    userCred: Partial<UserCred>,
    @param.query.object('where', getWhereSchemaFor(UserCred)) where?: Where<UserCred>,
  ): Promise<Count> {
    return this.userRepository.userCredentials(id).patch(userCred, where);
  }

  @del('/users/{id}/user-cred', {
    responses: {
      '200': {
        description: 'User.UserCred DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(UserCred)) where?: Where<UserCred>,
  ): Promise<Count> {
    return this.userRepository.userCredentials(id).delete(where);
  }
}
