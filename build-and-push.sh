#/bin/bash

# builds and pushes all custom docker images

# build monitoring docker images
docker build -t registry.digitalocean.com/fdcr/filing-deadlines/loki monitoring/loki
docker build -t registry.digitalocean.com/fdcr/filing-deadlines/grafana monitoring/grafana
docker build -t registry.digitalocean.com/fdcr/filing-deadlines/metrics monitoring/prometheus

# build website docker images
docker build -t registry.digitalocean.com/fdcr/filing-deadlines/frontend -f Frontend.Dockerfile .
docker build -t registry.digitalocean.com/fdcr/filing-deadlines/backend -f Backend.Dockerfile .

# push docker images to container registry
docker push registry.digitalocean.com/fdcr/filing-deadlines/frontend
docker push registry.digitalocean.com/fdcr/filing-deadlines/backend
docker push registry.digitalocean.com/fdcr/filing-deadlines/loki
docker push registry.digitalocean.com/fdcr/filing-deadlines/grafana
docker push registry.digitalocean.com/fdcr/filing-deadlines/metrics
