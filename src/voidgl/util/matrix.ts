export type Mat2 = [
  number, number,
  number, number
];

export type Mat3 = [
  number, number, number,
  number, number, number,
  number, number, number
];

export type Mat4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

export function determinant2(mat: Mat2) {
  return mat[3] * mat[0] - mat[1] * mat[2];
}

export function cofactor3(mat: Mat3, index: number): Mat2 {
  const row = Math.floor(index / 3);
  const col = index % 3;

  const result: Mat2 = [0, 0, 0, 0];
  let count = 0;
  for (let i = 0, endi = mat.length; i < endi; i++) {
    const rowi = Math.floor(i / 3);
    const coli = i % 3;
    if (rowi === row || col === coli) continue;
    result[count] = mat[i];
    count++;
  }

  return result;
}

export function determinant3(mat: Mat3): number {
  let result = 0;
  for (let i = 0; i < 3; i++) {
    const rowi = Math.floor(i / 3);
    const coli = i % 3;
    const sign = (rowi + coli) % 2 === 0 ? 1 : -1;
    const cofactor = determinant2(cofactor3(mat, i));
    result += sign * mat[i] * cofactor;
  }

  return result;
}

export function cofactor4(mat: Mat4, index: number): Mat3 {
  const row = Math.floor(index / 4);
  const col = index % 4;

  const result: Mat3 = [
    0, 0, 0,
    0, 0, 0,
    0, 0, 0
  ];

  let count = 0;
  for (let i = 0, endi = mat.length; i < endi; i++) {
    const rowi = Math.floor(i / 4);
    const coli = i % 4;
    if (rowi === row || col === coli) continue;
    result[count] = mat[i];
    count++;
  }

  return result;
}

export function determinant4(mat: Mat4): number {
  let result = 0;
  for (let i = 0; i < 4; i++) {
    const rowi = Math.floor(i / 4);
    const coli = i % 4;
    const sign = (rowi + coli) % 2 === 0 ? 1 : -1;
    const cofactor = determinant3(cofactor4(mat, i));
    result += sign * mat[i] * cofactor;
  }

  return result;
}

export function inverse(mat: Mat4): Mat4 | null {
  const r00 = mat[0] * determinant3(cofactor4(mat, 0));
  const r01 = -mat[1] * determinant3(cofactor4(mat, 1));
  const r02 = mat[2] * determinant3(cofactor4(mat, 2));
  const r03 = -mat[3] * determinant3(cofactor4(mat, 3));

  const r10 = -mat[4] * determinant3(cofactor4(mat, 4));
  const r11 = mat[5] * determinant3(cofactor4(mat, 5));
  const r12 = -mat[6] * determinant3(cofactor4(mat, 6));
  const r13 = mat[7] * determinant3(cofactor4(mat, 7));

  const r20 = mat[8] * determinant3(cofactor4(mat, 8));
  const r21 = -mat[9] * determinant3(cofactor4(mat, 9));
  const r22 = mat[10] * determinant3(cofactor4(mat, 10));
  const r23 = -mat[11] * determinant3(cofactor4(mat, 11));

  const r30 = -mat[12] * determinant3(cofactor4(mat, 12));
  const r31 = mat[13] * determinant3(cofactor4(mat, 13));
  const r32 = -mat[14] * determinant3(cofactor4(mat, 14));
  const r33 = mat[15] * determinant3(cofactor4(mat, 15));

  const determiant = determinant4(mat);
  if (determiant === 0) return null;
  const result: Mat4 = [
    r00, r01, r02, r03,
    r10, r11, r12, r13,
    r20, r21, r22, r23,
    r30, r31, r32, r33
  ];
  return scale(result, 1 / determiant);
}

export function scale(mat: Mat4, scale: number): Mat4 {
  return[
    mat[0] * scale, mat[1] * scale, mat[2] * scale, mat[3] * scale,
    mat[4] * scale, mat[5] * scale, mat[6] * scale, mat[7] * scale,
    mat[8] * scale, mat[9] * scale, mat[10] * scale, mat[11] * scale,
    mat[12] * scale, mat[13] * scale, mat[14] * scale, mat[15] * scale
  ];
}

export function multiply(left: Mat4, right: Mat4): Mat4 {
  const r0 = left[0] * right[0] + left[1] * right[4] + left[2] * right[8] + left[3] * right[12];
  const r1 = left[0] * right[1] + left[1] * right[5] + left[2] * right[9] + left[3] * right[13];
  const r2 = left[0] * right[2] + left[1] * right[6] + left[2] * right[10] + left[3] * right[14];
  const r3 = left[0] * right[3] + left[1] * right[7] + left[2] * right[11] + left[3] * right[15];

  const r4 = left[4] * right[0] + left[5] * right[4] + left[6] * right[8] + left[7] * right[12];
  const r5 = left[4] * right[1] + left[5] * right[5] + left[6] * right[9] + left[7] * right[13];
  const r6 = left[4] * right[2] + left[5] * right[6] + left[6] * right[10] + left[7] * right[14];
  const r7 = left[4] * right[3] + left[5] * right[7] + left[6] * right[11] + left[7] * right[15];

  const r8 = left[8] * right[0] + left[9] * right[4] + left[10] * right[8] + left[11] * right[12];
  const r9 = left[8] * right[1] + left[9] * right[5] + left[10] * right[9] + left[11] * right[13];
  const r10 = left[8] * right[2] + left[9] * right[6] + left[10] * right[10] + left[11] * right[14];
  const r11 = left[8] * right[3] + left[9] * right[7] + left[10] * right[11] + left[11] * right[15];

  const r12 = left[12] * right[0] + left[13] * right[4] + left[14] * right[8] + left[15] * right[12];
  const r13 = left[12] * right[1] + left[13] * right[5] + left[14] * right[9] + left[15] * right[13];
  const r14 = left[12] * right[2] + left[13] * right[6] + left[14] * right[10] + left[15] * right[14];
  const r15 = left[12] * right[3] + left[13] * right[7] + left[14] * right[11] + left[15] * right[15];

  return [
    r0, r1, r2, r3,
    r4, r5, r6, r7,
    r8, r9, r10, r11,
    r12, r13, r14, r15
  ];
}

export function add(left: Mat4, right: Mat4): Mat4 {
  const r0 = left[0] + right[0];
  const r1 = left[1] + right[1];
  const r2 = left[2] + right[2];
  const r3 = left[3] + right[3];
  const r4 = left[4] + right[4];
  const r5 = left[5] + right[5];
  const r6 = left[6] + right[6];
  const r7 = left[7] + right[7];
  const r8 = left[8] + right[8];
  const r9 = left[9] + right[9];
  const r10 = left[10] + right[10];
  const r11 = left[11] + right[11];
  const r12 = left[12] + right[12];
  const r13 = left[13] + right[13];
  const r14 = left[14] + right[14];
  const r15 = left[15] + right[15];

  return [
    r0, r1, r2, r3,
    r4, r5, r6, r7,
    r8, r9, r10, r11,
    r12, r13, r14, r15
  ];
}

export function subtract(left: Mat4, right: Mat4): Mat4 {
  const r0 = left[0] - right[0];
  const r1 = left[1] - right[1];
  const r2 = left[2] - right[2];
  const r3 = left[3] - right[3];
  const r4 = left[4] - right[4];
  const r5 = left[5] - right[5];
  const r6 = left[6] - right[6];
  const r7 = left[7] - right[7];
  const r8 = left[8] - right[8];
  const r9 = left[9] - right[9];
  const r10 = left[10] - right[10];
  const r11 = left[11] - right[11];
  const r12 = left[12] - right[12];
  const r13 = left[13] - right[13];
  const r14 = left[14] - right[14];
  const r15 = left[15] - right[15];

  return [
    r0, r1, r2, r3,
    r4, r5, r6, r7,
    r8, r9, r10, r11,
    r12, r13, r14, r15
  ];
}

export function dot(left: Mat4, right: Mat4): Mat4 {
  const r0 = left[0] * right[0];
  const r1 = left[1] * right[1];
  const r2 = left[2] * right[2];
  const r3 = left[3] * right[3];
  const r4 = left[4] * right[4];
  const r5 = left[5] * right[5];
  const r6 = left[6] * right[6];
  const r7 = left[7] * right[7];
  const r8 = left[8] * right[8];
  const r9 = left[9] * right[9];
  const r10 = left[10] * right[10];
  const r11 = left[11] * right[11];
  const r12 = left[12] * right[12];
  const r13 = left[13] * right[13];
  const r14 = left[14] * right[14];
  const r15 = left[15] * right[15];

  return [
    r0, r1, r2, r3,
    r4, r5, r6, r7,
    r8, r9, r10, r11,
    r12, r13, r14, r15
  ];
}
