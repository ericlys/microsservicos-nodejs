import * as pulumi from '@pulumi/pulumi'

import { appLoadBalancer } from './src/load-balancer'
import { ordersService } from './src/services/orders'
import { invoicesService } from './src/services/invoices'
import { rabbitMQService } from './src/services/rabbitmq'
import { kongService } from './src/services/kong'

//fica como log de deploy dos serviços (stack outputs)
export const ordersId = ordersService.service.id
export const invoicesId = invoicesService.service.id
export const rabbitMQId = rabbitMQService.service.id
export const kongId = kongService.service.id
export const rabbitMQAdminUrl = pulumi.interpolate`http://${appLoadBalancer.listeners[0].endpoint.hostname}:15672`