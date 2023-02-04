# Deployment

Filing Deadlines is deployed on a Digital Ocean droplet running Docker Swarm.

Docker images are built from the source code and uploaded to a Container Registry on Digital Ocean. This is automated by a GitHub action that runs on every commit to master.

The production Droplet pulls the images from the container registry and runs them.


## To do a deploy

1. Push changes to GitHub
2. Wait for images to be build by GitHub Action
3. Copy image hash from Container Registry
4. On prod machine, run `docker service update --image {image hash} filing-deadlines_server`
