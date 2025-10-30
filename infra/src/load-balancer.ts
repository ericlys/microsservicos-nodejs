import * as awsx from '@pulumi/awsx'
import { cluster } from './cluster'

export const appLoadBalancer = new awsx.classic.lb.ApplicationLoadBalancer('app-lb', { //only HTTP/HTTPS traffic
  securityGroups: cluster.securityGroups, //only see the services within the cluster
})

export const networkLoadBalancer = new awsx.classic.lb.NetworkLoadBalancer('net-lb', { //TCP,UDP... traffic - RabbitMQ AMQP
  subnets: cluster.vpc.publicSubnetIds,
})