import bar, { getTheTime } from './utils/foo';

console.log(bar.x);
console.log(bar.y);

const bodyEl = document.querySelector("body");

if (bodyEl) {
    const pEl = document.createElement('p');
    pEl.insertAdjacentHTML("beforeend", `Hello world! It's ${getTheTime()}.`);
    bodyEl.appendChild(pEl);
}
