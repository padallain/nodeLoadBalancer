const grpc = require('@grpc/grpc-js');
const protoDescriptor = require('./config');  // Esto debe cargar el archivo proto correctamente
const matrixProto = protoDescriptor.MatrixService;

// Función Gauss-Jordan
function gaussJordan(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    // Verificar pivote y manejar cero en el pivote
    if (matrix[i][i] === 0) {
      let swapped = false;
      for (let k = i + 1; k < n; k++) {
        if (matrix[k][i] !== 0) {
          [matrix[i], matrix[k]] = [matrix[k], matrix[i]];
          swapped = true;
          break;
        }
      }
      if (!swapped) throw new Error('No tiene solución única.');
    }

    // Normalizar la fila del pivote
    const pivot = matrix[i][i];
    for (let j = 0; j < matrix[i].length; j++) {
      matrix[i][j] /= pivot;
    }

    // Hacer ceros en otras filas
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = matrix[k][i];
        for (let j = 0; j < matrix[k].length; j++) {
          matrix[k][j] -= factor * matrix[i][j];
        }
      }
    }
  }
  return matrix;
}

// Implementar la solicitud de resolver el sistema (Gauss-Jordan)
function solveSystem(call, callback) {
  try {
    // Convertir de Row[] a matriz bidimensional
    const inputMatrix = call.request.values.map(row => row.elements);

    // Resolver el sistema con Gauss-Jordan
    const resultMatrix = gaussJordan(inputMatrix);

    // Convertir de matriz bidimensional a Row[]
    const solution = resultMatrix.map(row => ({ elements: row }));

    callback(null, { solution });
  } catch (error) {
    callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: error.message,
    });
  }
}

// Iniciar el servidor
function main() {
  const server = new grpc.Server();
  server.addService(matrixProto.service, { SolveSystem: solveSystem });

  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Servidor con Gauss-Jordan escuchando en el puerto 50051');
    server.start();
  });
}

main();
