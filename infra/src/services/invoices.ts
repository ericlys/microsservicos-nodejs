import * as pulumi from '@pulumi/pulumi'
import * as awsx from '@pulumi/awsx'

import { cluster } from "../cluster";
import { amqpListener } from "./rabbitmq";
import { invoicesDockerImage } from "../images/invoices";
import { appLoadBalancer } from '../load-balancer';

// Create Target Group for Invoices Service
const invoicesTargetGroup = appLoadBalancer.createTargetGroup('invoices-target', {
  port: 3334,
  protocol: 'HTTP',
  healthCheck: {
    path: '/health', // helath check endpoint
    protocol: 'HTTP',
  },
})

// Create HTTP Listener for Invoices Service
export const invoicesHttpListener = appLoadBalancer.createListener('invoices-listener', {
  port: 3334,
  protocol: 'HTTP',
  targetGroup: invoicesTargetGroup,
})

export const invoicesService = new awsx.classic.ecs.FargateService('fargate-invoices', {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  taskDefinitionArgs: {
    container: {
      image: invoicesDockerImage.ref,
      cpu: 256,
      memory: 512,
      portMappings: [invoicesHttpListener],
      environment: [
        {
          name: 'BROKER_URL',
          value: pulumi.interpolate`amqp://admin:admin@${amqpListener.endpoint.hostname}:${amqpListener.endpoint.port}`
        },
        { //TODO: Move to Secrets Manager
          name: 'DATABASE_URL',
          value: 'postgresql://neondb_owner:ndg_PsH1dKILyAW0@ep-frosty-wave-ahg0n6gj.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        },
        // OpenTelemetry configuration
        {
          name: "OTEL_TRACES_EXPORTER",
          value: "otlp"
        },
        {
          name: "OTEL_EXPORTER_OTLP_ENDPOINT",
          value: "https://otlp-gateway-prod-sa-east-1.grafana.net/otlp"
        },
        {
          name: "OTEL_EXPORTER_OTLP_HEADERS",
          value: "Authorization=Basic MTI4MDc4MDpnbGNfZXlKdklqb2lNVFExTURrMU9DSXNJbTRpT2lKemRHRmpheTB4TWpnd056Z3dMVzkwWld3dGIyNWliMkZ5WkdsdVp5MWxkbVZ1ZEc4dGJtOWtaV3B6SWl3aWF5STZJbWhVYVRWd1dVVXhiVkV5TVU5eE5qYzNaak0xTlZwa2FpSXNJbTBpT25zaWNpSTZJbkJ5YjJRdGMyRXRaV0Z6ZEMweEluMTk="
        },
        {
          name: "OTEL_SERVICE_NAME",
          value: "invoices"
        },
        {
          name: "OTEL_RESOURCE_ATTRIBUTES",
          value: "service.name=invoices,service.namespace=eventonodejs,deployment.environment=production"
        },
        {
          name: "OTEL_NODE_RESOURCE_DETECTORS",
          value: "env,host,os"
        },
        {
          name: 'OTEL_NODE_ENABLED_INSTRUMENTATIONS',
          value: 'http,fastify,pg,amqplib'
        }
      ],
    },
  },
})