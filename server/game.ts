interface Car {
  id: number;
  name: string;
  color: string;
}

class Game {
  private id = 0;
  private cars: Car[] = [];

  public add(): number {
    this.cars[this.id] = {
      id: this.id,
      name: "unnamed",
      color: "gray",
    } as Car;

    return this.id++;
  }
  public get(id: number): Car | undefined {
    return this.cars.find((car) => car?.id === id);
  }
  public remove(id: number) {
    this.cars = this.cars.filter((car) => car.id !== id);
  }

  public updateCar(id: number, car: Car) {
    this.cars[id] = { ...car, id } as Car;
  }

  public getCars(): Car[] {
    return this.cars;
  }
}

export default Game;
export type { Car };
