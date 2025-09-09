FROM nodered/node-red

# Install node-red-contrib-modbus
RUN npm install node-red-contrib-modbus

# Create a config directory inside the image
RUN mkdir -p /usr/src/node-red/config

# Copy the PLC address map into the config directory within the image
COPY config/plc_address_map_example.json /usr/src/node-red/config/plc_address_map_example.json