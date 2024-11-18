const grpc = require('@grpc/grpc-js');
const protoDescriptor = require('./config');  // Asegúrate de que este archivo cargue correctamente
const async = require('async');

const matrixProto = protoDescriptor.MatrixService;
const balancerProto = protoDescriptor.BalancerService;

// IP del balanceador de carga
const balancerIp = '192.168.68.123:50053';

// Crear el cliente del balanceador
const balancerClient = new balancerProto.BalancerService(balancerIp, grpc.credentials.createInsecure());

// Solicitar al balanceador la IP del servidor que se debe usar
balancerClient.ChoosePC({}, (error, response) => {
  if (error) {
    console.error('Error al obtener IP del servidor:', error.message);
    return;
  }

  // IP del servidor seleccionada por el balanceador
  const selectedServerIp = response.selected_pc;
  console.log(`IP seleccionada: ${selectedServerIp}`);

  // Ahora crear el cliente del servidor seleccionado
  const client = new matrixProto(selectedServerIp, grpc.credentials.createInsecure());

  // Definir la matriz aumentada
  const augmentedMatrix = [
    [1, 1, 6],
    [2, -2, 3],
  ];

  // Convertir la matriz a Row[]
  const matrixRequest = {
    values: augmentedMatrix.map(row => ({ elements: row })),
  };

  // Función para enviar la matriz al servidor y resolver el sistema
  function sendMatrixRequest(callback) {
    client.SolveSystem(matrixRequest, (error, response) => {
      if (!error) {
        const solution = response.solution.map(row => row.elements);
        console.table(solution);
        callback(null, solution);
      } else {
        console.error('Error:', error.message);
        callback(error);
      }
    });
  }

  // Simular 10 clientes en fila (o como necesites)
  console.time('TotalTime');
  async.timesSeries(10, (n, next) => {
    console.log(`Cliente ${n + 1} enviando solicitud...`);
    sendMatrixRequest(next);
  }, (err, results) => {
    if (err) {
      console.error('Ocurrió un error:', err);
    } else {
      console.log('Todos los clientes han terminado sus solicitudes.');
    }
    console.timeEnd('TotalTime');
  });
});
