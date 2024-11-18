const grpc = require('@grpc/grpc-js');
const protoDescriptor = require('./config');  // Asegúrate de que este archivo cargue el archivo proto correctamente
const balancerProto = protoDescriptor.BalancerService;

// Función para calcular la carga de un PC
function calculateLoad(pc) {
  // Aquí el cálculo de carga puede ser ajustado según lo necesites
  const cpuLoad = pc.cpu * 0.4;  // Ejemplo de ponderación: 40% por el CPU
  const memoryStorageLoad = pc.memory_storage * 0.3;  // Ejemplo de ponderación: 30% por la memoria de almacenamiento
  const memoryVelocityLoad = pc.memory_velocity * 0.3;  // Ejemplo de ponderación: 30% por la velocidad de la memoria

  return cpuLoad + memoryStorageLoad + memoryVelocityLoad;
}

// Implementación de la función ChoosePC
function choosePC(call, callback) {
  const { cpu, memory_storage, memory_velocity } = call.request;

  // Especificaciones de los PCs
  const pc1 = { cpu: 7, memory_storage: 10, memory_velocity: 8, ip: "192.168.68.123:50051" };
  const pc2 = { cpu: 8, memory_storage: 9, memory_velocity: 8, ip: "192.168.68.126:50051" };
  const pc3 = { cpu: 5, memory_storage: 3, memory_velocity: 5, ip: "192.168.68.127:50051" };

  // Cálculo de la carga de cada PC
  const loadPC1 = calculateLoad(pc1);
  const loadPC2 = calculateLoad(pc2);
  const loadPC3 = calculateLoad(pc3);

  // Selección del PC con mayor carga
  let selectedPC = pc1;
  let maxLoad = loadPC1;

  if (loadPC2 > maxLoad) {
    selectedPC = pc2;
    maxLoad = loadPC2;
  }

  if (loadPC3 > maxLoad) {
    selectedPC = pc3;
  }

  // Retornar la IP del PC seleccionado
  callback(null, { selected_pc: selectedPC.ip });
}

// Configurar el servidor gRPC
const server = new grpc.Server();
server.addService(balancerProto.service, { ChoosePC: choosePC });

// Cambiar el puerto y enlazar el servidor
server.bindAsync('0.0.0.0:50053', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Servidor balanceador en http://localhost:50053');
  server.start();
});
