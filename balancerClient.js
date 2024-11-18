const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Cargar definición de servicios
const packageDefinition = protoLoader.loadSync('balancer.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const balancerProto = grpc.loadPackageDefinition(packageDefinition);

// Peso para cada atributo
const cpuPercent = 0.4;
const memoryPercent = 0.35;
const velocityPercent = 0.25;

// Función de balanceo de carga
function choosePC(call, callback) {
  const { cpu, memory_storage, memory_velocity } = call.request;

  // Especificaciones de los dos PCs
  const pc1 = { cpu: 7, memory_storage: 10, memory_velocity: 8 };
  const pc2 = { cpu: 8, memory_storage: 9, memory_velocity: 8 };
  

  function calculateLoad(pc) {
    return pc.cpu * cpuPercent + pc.memory_storage * memoryPercent + pc.memory_velocity * velocityPercent;
  }

  const loadPC1 = calculateLoad(pc1);
  const loadPC2 = calculateLoad(pc2);

  const selectedPC = loadPC1 < loadPC2 ? 'PC 1' : 'PC 2';
  callback(null, { selected_pc: selectedPC });
}

// Configurar el servidor del balanceador
const server = new grpc.Server();
server.addService(balancerProto.BalancerService.service, { ChoosePC: choosePC });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Servidor balanceador en http://localhost:50051');
  server.start();
});
