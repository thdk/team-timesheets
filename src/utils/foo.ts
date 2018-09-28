const bar = {
    x: 1,
    y: 2,
    z: 3
};

export default bar;

const datetime = new Date();
export const getTheTime = () => {
    return `${datetime.getHours()}:${datetime.getMinutes()}:${datetime.getSeconds()}`;
}