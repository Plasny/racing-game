interface Car {
  id: number;
}

class Game {
  id = 0;
  cars: Car[] = [];

  add(): number {
    this.cars[this.id] = {
      id: this.id,
    } as Car;

    return this.id++;
  }
  remove(id: number) {
    this.cars = this.cars.filter((car) => car.id !== id);
  }
}

export default Game;
export type { Car };
