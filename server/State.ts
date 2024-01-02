type Player = {
    id: number,
    x: number,
    y: number,
    direction: number,
    speed: number,
    color: string,
    name: string,
}

let Cid = 0;

export let CARS: Player[] = [];

export const NextCarId = () => ++Cid;

export function newCar(
    id: number,
    color: string,
    name: string,
) {
    if (CARS.find(car => car.id === id)) return;

    CARS.push({
        id: id,
        x: id % 2 * 10, 
        y: Math.floor(id / 2) * 10, 
        direction: 0,
        speed: 0,
        color,
        name,
    });
}

export function updateCar(id: number, angle: number, acceleration: number) {
    // TODO adjust with ui
    const turningSpeed = 0.1;
    const accelerationSpeed = 0.1;
    const car = CARS.filter(car => car.id === id)[0];

    if (car === undefined) return

    car.direction += turningSpeed * angle;
    car.speed += accelerationSpeed * acceleration;

    car.x += car.speed * Math.cos(car.direction);
    car.y += car.speed * Math.sin(car.direction);

    console.log(car);
}
