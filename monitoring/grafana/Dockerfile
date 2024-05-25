FROM grafana/grafana-oss:10.1.10


# Install plugins here or in your own config file
#ENV GF_INSTALL_PLUGINS="plugin1,plugin2"

# Add provisioning
ADD provisioning /etc/grafana/provisioning
# Add configuration file
ADD grafana.ini /etc/grafana/grafana.ini
# Add dashboard json files
ADD dashboards /etc/grafana/dashboards
