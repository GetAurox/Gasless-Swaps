# Express Server

## npm scripts

- `dev`: run a dev server that automatically restarts on file changes
- `build`: build the TypeScript into JavaScript, this should usually only be called using the `turbo` cli so that dependencies are also built.
- `start`: run the built javascript from the build output

The `dev` and `start` scripts both load `.env` files in using the `dotenv` require method, see [here](https://github.com/motdotla/dotenv#preload) for details.

The `dev` script uses `tsconfig-paths` to enable support for the `paths` feature of `tsconfig` in `ts-node-dev`. See [here](https://medium.com/@fmoessle/typescript-paths-with-ts-node-ts-node-dev-and-jest-671deacf6428) for details.

## Dotenv

Use [dotenv sync]() to fetch the `.env` file with `dotenv-cli pull`. You will need to be added to the Dotenv Sync organisation.

When forking this repo delete the `.env.project` and intialise a new project with `TODO: find command`.

## Docker

Docker is a tool used to containerize/package applications so that they can easilly and predictably be run on cloud services. Docker uses the `Dockerfile` in the server package to structure the container, see [their docs](https://docs.docker.com/engine/reference/builder/) on how to use `Dockerfile`s. The steps below show how to build and run the Docker image locally, most of the time this is not required as it will be built in the CI/CD pipeline.

### Build

Make sure you have Docker installed, you can download it from [here](https://docs.docker.com/desktop/mac/install/).

1. Run the turborepo command to prune the repo to prepare the repo for Docker. This will copy the `server` package, as well as any packages it depends on into the `out` folder.

```bash
yarn turbo prune --scope=server --docker
```

2. Delete any `node_modules` folders that are in the `out` folder (this can cause weird errors if left in):

```bash
cd out/full && find . -name 'node_modules' -type d -prune -exec rm -rf '{}' + && cd ../..
```

3. Run the Docker build command:

```bash
docker build -t repo-template:latest -f apps/server/Dockerfile .
```

This builds the Docker image for the `server` package, and tags it with `repo-template:latest`.

### Run

To run the Docker image locally and port forward port `3000` (replace `repo-template` with whatever you have tagged your Docker image with):

```bash
docker run -p 3000:3000 repo-template
```

### Push

For most projects we use Google Cloud's Artifact Registry to store the Docker containers, see Google's guide on how to get started [here](https://cloud.google.com/artifact-registry/docs/docker/store-docker-container-images).

Push both `<image-name>:latest` and `<image-name>:latest-staging` so that we can use them for the Kubernetes deployment.

## Kubernetes

Kubernetes is a way of managing multiple containers. It is an abstraction layer on top of a number of VMs that helps to allocate resources, and replicate containers depending on auto-scaling rules.

The default Kubernetes config included in this repo will create three replicas of the Docker container, as well as provisioning a SSL certificate for the provided URL. Follow the [Terraform guide](https://www.notion.so/labrys/Terraform-95c0180441b442e38157d94b2656eb65) from the Notion to provision the Kubernetes clusters on GCP, and create DNS entries for the servers. Then follow the [Kubernetes guide](https://www.notion.so/labrys/Kubernetes-be2df39593b1458fad97271ea165a642) to deploy the Kubernetes config to the clusters.
