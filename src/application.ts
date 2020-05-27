// ---------- ADD IMPORTS -------------
import {AuthenticationComponent} from '@loopback/authentication';
import {JWTAuthenticationComponent, SECURITY_SCHEME_SPEC, UserServiceBindings} from '@loopback/authentication-jwt';
import {AuthorizationComponent} from '@loopback/authorization';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication, RouterSpec} from '@loopback/rest';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MygodDataSource} from './datasources';
import {UserCredRepository, UserRepository} from './repositories';
import {MySequence} from './sequence';
import {CustomUserService} from './services/custom-user.service';
const legacyApp = require('./express-app').legacyApp;


export {ApplicationConfig};

export class CustomApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {

  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);



    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    const openApiSpecForLegacyApp: RouterSpec = {
      // insert your spec here, your 'paths', 'components', and 'tags' will be used
      paths: ['payments', 'api']
    };

    this.mountExpressRouter('/dogs', legacyApp, openApiSpecForLegacyApp);

    //...
    // ------ ADD SNIPPET AT THE BOTTOM ---------
    // Add security spec (Future work: refactor it to an enhancer)
    this.addSecuritySpec();
    // Mount authentication system
    this.component(AuthenticationComponent);

    //auth
    this.component(AuthorizationComponent)

    // Mount jwt component
    this.component(JWTAuthenticationComponent);

    // Bind datasource
    this.dataSource(MygodDataSource, UserServiceBindings.DATASOURCE_NAME);
    // ------------- END OF SNIPPET -------------

    // Bind user service
    this.bind(UserServiceBindings.USER_SERVICE).toClass(CustomUserService) // errpr on this line

    // Bind user and credentials repository
    this.bind(UserServiceBindings.USER_REPOSITORY).toClass(
      UserRepository,
    ),

      this.bind(UserServiceBindings.USER_CREDENTIALS_REPOSITORY).toClass(
        UserCredRepository,
      )
    /*
        let app = new Application()
        const data: AuthorizationOptions = {
          precedence: AuthorizationDecision.DENY,
          defaultDecision: AuthorizationDecision.DENY,
        };
    
        const binding = app.component(AuthorizationComponent);
        app.configure(binding.key).to(data);
    
        app
          .bind('authorizationProviders.my-authorizer-provider')
          .toProvider(MyAuthorizationProvider)
          .tag(AuthorizationTags.AUTHORIZER);
    
    */
  }


  addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'test application',
        version: '1.0.0',
      },
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      security: [
        {
          // secure all endpoints with 'jwt'
          jwt: [],
        },
      ],
      servers: [{url: '/'}],
    });
  }
  // -------------- END OF SNIPPET -----------
}
