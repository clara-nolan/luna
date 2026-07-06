const scene = document.querySelector(".scene");
const canvas = document.getElementById("constellations");
const ctx = canvas.getContext("2d");

const STAR_COUNT = 60;

const stars = [];
const connections = [];

let firstStar = null;

/***********************
Rando Num Gen
************************/

function mulberry32(seed) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

const rand = mulberry32(42);

/***********************
 Canvas
************************/

function resizeCanvas() {

    canvas.width = scene.clientWidth;
    canvas.height = scene.clientHeight;

    redrawConnections();
}

window.addEventListener("resize", resizeCanvas);

/***********************
 Create Stars
************************/

for (let i = 0; i < STAR_COUNT; i++) {

    const star = document.createElement("span");

    star.className = "star";
    star.dataset.id = i;
    star.textContent = "⭐";

    const x = rand() * 100;
    const y = rand() * 55;

    star.style.left = x + "%";
    star.style.top = y + "%";

    star.style.fontSize = (8 + rand() * 18) + "px";
    star.style.opacity = 0.4 + rand() * 0.6;

    scene.appendChild(star);

    stars.push(star);

}

/***********************
 Coordinates
************************/

function starCenter(star) {

    const sceneRect = scene.getBoundingClientRect();
    const rect = star.getBoundingClientRect();

    return {

        x: rect.left - sceneRect.left + rect.width / 2,
        y: rect.top - sceneRect.top + rect.height / 2

    };

}

/***********************
 Drawing
************************/

function redrawConnections() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "white";

    connections.forEach(([a, b]) => {

        const p1 = starCenter(stars[a]);
        const p2 = starCenter(stars[b]);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

    });

}

/***********************
 Duplicate Check
************************/

function hasConnection(a, b) {

    return connections.some(([x, y]) =>

        (x === a && y === b) ||
        (x === b && y === a)

    );

}

/***********************
 Star Clicking
************************/

stars.forEach(star => {

    star.addEventListener("click", () => {

        const id = Number(star.dataset.id);

        if (firstStar === null) {

            firstStar = id;
            star.classList.add("selected");
            return;

        }

        if (firstStar === id) {

            star.classList.remove("selected");
            firstStar = null;
            return;

        }

        if (!hasConnection(firstStar, id)) {

            connections.push([firstStar, id]);
            redrawConnections();

        }

        stars[firstStar].classList.remove("selected");
        firstStar = null;

    });

});

/***********************
 Init
************************/

resizeCanvas();