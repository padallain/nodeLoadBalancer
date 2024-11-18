const numeric = require('numeric');

function gaussJordan(matrix) {
  const n = matrix.length;

  for (let i = 0; i < n; i++) {
    // Hacer el pivote principal igual a 1
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

// Ejemplo de uso
const augmentedMatrix = [
  [1, 1, 6],
  [2, -1, 3],
];

const result = gaussJordan(augmentedMatrix);
console.log("Matriz reducida:");
console.table(result);
