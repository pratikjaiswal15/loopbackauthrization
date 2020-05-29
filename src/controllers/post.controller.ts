/// Uncomment these imports to begin using these cool features!
/*
import {inject} from '@loopback/core';
import {get, post, requestBody, Response, RestBindings} from '@loopback/rest';
import Razorpay from 'razorpay';




export class PostController {
  constructor(@inject(RestBindings.Http.RESPONSE) protected response: Response,
  ) {
  }

  @post('/products', {
    responses: {
      '200': {
        description: 'Product model instance',
      },
    },
  })
  async create(
    @requestBody({}) product: any
  ): Promise<any> {

    console.log(product)
    return product

  }

  @get('products', {
    responses: {
      '200': {
        description: 'bro model count',
      },
    },
  })

  async find() {

    console.log("yes")
    return {success: 'true'}
  }


  @get('orders', {
    responses: {
      '200': {
        description: 'orders model count',
        content:
          'application/json'

      },
    },
  })

  async find_order(@inject(RestBindings.Http.RESPONSE) response: Response) {

    const x = await razor.orders.all()

    console.log(x)

    return x
    /*
        razor.orders.all({from: 10}).then((data: any) => {
          response.send(data)

        }).catch((err: Error) => {
          throw err
        });
    *

  }


}
*/
