export interface IPersonOptions {
  id: number;
  age: number;
  eyeColor: string;
  name: string;
  gender: string;
  group: number;
}

export class Person {
  [key: string]: string | number;

  id: number;
  age: number;
  eyeColor: string;
  name: string;
  gender: string;
  group: number;

  constructor(options: IPersonOptions) {
    this.id = options.id;
    this.age = options.age;
    this.eyeColor = options.eyeColor;
    this.name = options.name;
    this.gender = options.gender;
    this.group = options.group;
  }
}
