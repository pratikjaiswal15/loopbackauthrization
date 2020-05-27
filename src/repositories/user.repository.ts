import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {MygodDataSource} from '../datasources';
import {User, UserCred, UserRelations} from '../models';
import {UserCredRepository} from './user-cred.repository';

export type Credentials = {
  email: string;
  password: string;
};



export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
  > {

  public readonly userCred: HasOneRepositoryFactory<UserCred, typeof User.prototype.id>;

  public readonly userCredentials: HasOneRepositoryFactory<UserCred, typeof User.prototype.id>;

  constructor(
    @inject('datasources.mygod') dataSource: MygodDataSource, @repository.getter('UserCredRepository') protected userCredRepositoryGetter: Getter<UserCredRepository>,
  ) {
    super(User, dataSource);
    this.userCredentials = this.createHasOneRepositoryFactoryFor('userCredentials', userCredRepositoryGetter);
    this.registerInclusionResolver('userCredentials', this.userCredentials.inclusionResolver);
  }


  async findCredentials(
    userId: typeof User.prototype.id,
  ): Promise<UserCred | undefined> {
    try {
      return await this.userCredentials(userId).get();
    } catch (err) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }
}
