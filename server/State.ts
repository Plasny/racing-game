type Player = {
    id: number,
    x: number,
    y: number,
    direction: number,
    speed: number,
    color: string,
    name: string,
}

const MAX_SPEED = 3;
let Cid = 0;

// seperate working cars from non working
// export let CARS_QUE: number[] = [];
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
        x: 0,
        y: 0,
        // x: id % 2 * 10, 
        // y: Math.floor(id / 2) * 10, 
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

    if (car.speed > MAX_SPEED) car.speed = MAX_SPEED;

    car.x += car.speed * Math.cos(car.direction * Math.PI / 180);
    car.y += car.speed * Math.sin(car.direction * Math.PI / 180);

    // console.log(car);
    return car;
}
