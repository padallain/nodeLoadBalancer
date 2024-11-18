const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const packageDefinition = protoLoader.loadSync(path.join(__dirname, "balancer.proto"), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const matrixProto = protoDescriptor.MatrixService;

// Crear el cliente gRPC
const client = new matrixProto("localhost:50051", grpc.credentials.createInsecure());

// Definir la matriz aumentada
const augmentedMatrix = [
  [1, 1, 6],
  [2, -2, 3],
];

// Convertir la matriz a Row[]
const matrixRequest = {
  values: augmentedMatrix.map((row) => ({ elements: row })),
};

// Enviar la matriz al servidor
client.SolveSystem(matrixRequest, (error, response) => {
  if (!error) {
    console.log("Matriz reducida:");
    const solution = response.solution.map((row) => row.elements);
    console.table(solution);
  } else {
    console.error("Error:", error.message);
  }
});
