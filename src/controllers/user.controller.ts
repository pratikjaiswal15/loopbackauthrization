import {authenticate, TokenService, UserService} from '@loopback/authentication';
import {Credentials, OPERATION_SECURITY_SPEC, TokenServiceBindings, UserServiceBindings} from '@loopback/authentication-jwt';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {Count, CountSchema, Filter, FilterExcludingWhere, model, property, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {genSalt, hash} from 'bcryptjs';
import _ from 'lodash';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {basicAuthorization} from '../services/try';
import {validateCredentials} from '../services/validator';
import {CredentialsRequestBody, UserProfileSchema} from './specs/user-controller.specs';


@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}


export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @inject(SecurityBindings.USER, {optional: true})
    public users: UserProfile,

  ) {}

  @post('/users', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
    },
  })

  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })

    newUserRequest: Omit<NewUserRequest, 'id'>,
    //user: Omit<User, 'id'>,
  ): Promise<User> {

    validateCredentials(_.pick(newUserRequest, ['email', 'password']));

    const password = await hash(newUserRequest.password, await genSalt());

    try {
      const savedUser = await this.userRepository.create(
        _.omit(newUserRequest, 'password'),
      );

      await this.userRepository.userCredentials(savedUser.id).create({password});
      return savedUser;

    } catch (error) {

      // MongoError 11000 duplicate key
      if (error.code === 11000 && error.errmsg.includes('index: uniqueEmail')) {
        throw new HttpErrors.Conflict('Email value is already taken');
      } else {
        throw error;
      }
    }





  }


  @get('/users/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })

  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})

  async count(
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.count(where);
  }

  @authenticate('jwt')
  @authorize({allowedRoles: ['admin'], voters: [basicAuthorization]})

  @get('/users', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(User) filter?: Filter<User>,
  ): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @patch('/users', {
    responses: {
      '200': {
        description: 'User PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @patch('/users/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @put('/users/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  @del('/users/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{token: string}> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    return {token};
  }


  @get('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async printCurrentUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<User> {
    // (@jannyHou)FIXME: explore a way to generate OpenAPI schema
    // for symbol property

    const userId = currentUserProfile[securityId];
    return this.userRepository.findById(+userId);
  }


}
