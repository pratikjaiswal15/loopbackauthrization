import {UserService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {compare} from 'bcryptjs';
// User --> MyUser
import {User} from '../models/user.model';
// UserRepository --> MyUserRepository
import {Credentials, UserRepository} from '../repositories/user.repository';


export class CustomUserService implements UserService<User, Credentials> {
  constructor(
    // UserRepository --> MyUserRepository
    @repository(UserRepository) public userRepository: UserRepository,
  ) {}

  // User --> MyUser
  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.userRepository.findOne({
      where: {email: credentials.email},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await compare(
      credentials.password,
      credentialsFound.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  // User --> MyUser
  convertToUserProfile(user: User): UserProfile {

    let address = ''
    if (user.address) {
      address = user.address
    }

    const profile = {
      [securityId]: user.id!.toString(),
      name: user.name,
      id: user.id,
      email: user.email,
      role: user.role
    }
    return profile


  }
}
