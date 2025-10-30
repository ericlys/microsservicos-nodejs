import * as awsx from '@pulumi/awsx'
import * as aws from '@pulumi/aws'
import * as docker from '@pulumi/docker-build'
import * as pulumi from '@pulumi/pulumi'

// Put only this file in order repository to build the image and push to ECR 

const ordersECRRepository = new awsx.ecr.Repository('orders-ecr', {
  forceDelete: true,
})

const ordersECRToken = aws.ecr.getAuthorizationTokenOutput({
  registryId: ordersECRRepository.repository.registryId,
})

export const ordersDockerImage = new docker.Image('orders-image', {
  tags: [
    pulumi.interpolate`${ordersECRRepository.repository.repositoryUrl}:latest`
  ],
  context: {
    location: '../app-orders',
  },
  push: true,
  platforms: [
    'linux/amd64'
  ],
  registries: [
    { 
      address: ordersECRRepository.repository.repositoryUrl,
      username: ordersECRToken.userName,
      password: ordersECRToken.password,
    }
  ]
})

// ECS + Fargate (recebe o container e sobe)
// 1/4 vCPU - 512RAM => $17  -  8.5$  - 5$
//    Spot instances (leilão de recursos da aws) - nunca para 100% (quando o app crescer)
//Instancia 01 - Spot
//Instancia 02 - Spot x
//Instancia 03 -

//others
// EC2
// EKS


//dicas de otimização docker:
//usar layers
//build:ecman-script e não commonjs
//alpine do docker