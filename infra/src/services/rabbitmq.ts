import * as awsx from '@pulumi/awsx'
import { appLoadBalancer, networkLoadBalancer } from '../load-balancer'

import { cluster } from "../cluster";

// -> LB -> A, B, C (services)

//creating listener and target group for rabbitmq management ui
//target group is where the load balancer will forward the requests
const rabbitMQAdminTargetGroup = appLoadBalancer.createTargetGroup('rabbitmq-admin-target', {
  port: 15672,
  protocol: 'HTTP',
  healthCheck: {
    path: '/',
    protocol: 'HTTP',
  },
})

//listener for rabbitmq management ui
export const rabbitMQAdminHttpListener = appLoadBalancer.createListener('rabbitmq-admin-listener', {
  port: 15672, //port to access rabbitmq management ui
  protocol: 'HTTP',
  targetGroup: rabbitMQAdminTargetGroup,
})

//creating listener and target group for amqp protocol
const amqpTargetGroup = networkLoadBalancer.createTargetGroup('amqp-target', {
  protocol: 'TCP',
  port: 5672,
  targetType: 'ip',
  healthCheck: {
    protocol: 'TCP',
    port: '5672',
  },
})

//create listener for amqp protocol
export const amqpListener = networkLoadBalancer.createListener('amqp-listener', {
  port: 5672,
  protocol: 'TCP',
  targetGroup: amqpTargetGroup,
})

export const rabbitMQService = new awsx.classic.ecs.FargateService('fargate-rabbitmq', {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  taskDefinitionArgs: {
    container: {
      image: 'rabbitmq:3-management',
      cpu: 256,
      memory: 512,
      portMappings: [
        rabbitMQAdminHttpListener,
        amqpListener,
      ],
      environment: [
        { name: 'RABBITMQ_DEFAULT_USER', value: 'admin' },
        { name: 'RABBITMQ_DEFAULT_PASS', value: 'admin' }, //pulumi.secret('senah_do_rabbitmq' - pulumi cloud secret management
      ],
    },
  },
})