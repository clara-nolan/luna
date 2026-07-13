import { playhtml, html } from "https://unpkg.com/playhtml@latest";


playhtml.register("sky", {
    defaultData: {
        connections: []
    },

    view: () => html`
        <div class="moon" can-grow></div>
        <canvas id="constellations"></canvas>
        <div class="water"></div>
    `,



    onMount: ({ getData, setData, requestUpdate }) => {

        const scene = document.getElementById("sky");
        const canvas = document.getElementById("constellations");
        const ctx = canvas.getContext("2d");

        const STAR_COUNT = 60;

        const stars = [];
        let firstStar = null;


        /***********************
         Random generator
        ************************/

        function mulberry32(seed) {

            return function () {

                let t = seed += 0x6D2B79F5;

                t = Math.imul(
                    t ^ t >>> 15,
                    t | 1
                );

                t ^= t +
                    Math.imul(
                        t ^ t >>> 7,
                        t | 61
                    );

                return (
                    (t ^ t >>> 14) >>> 0
                ) / 4294967296;

            };

        }


        const rand = mulberry32(42);



        /***********************
         Canvas
        ************************/

        function resizeCanvas() {

            canvas.width = scene.clientWidth;
            canvas.height = scene.clientHeight;

            redraw();

        }


        window.addEventListener(
            "resize",
            resizeCanvas
        );



        /***********************
         Stars
        ************************/

        for (let i = 0; i < STAR_COUNT; i++) {

            const star =
                document.createElement("span");


            star.className = "star";

            star.dataset.id = i;

            star.textContent = "⭐";


            star.style.left =
                rand() * 100 + "%";


            star.style.top =
                rand() * 55 + "%";


            star.style.fontSize =
                (8 + rand() * 18) + "px";


            star.style.opacity =
                0.4 + rand() * 0.6;


            scene.appendChild(star);

            stars.push(star);

        }



        /***********************
         Coordinates
        ************************/

        function starCenter(star) {

            const sceneRect =
                scene.getBoundingClientRect();


            const rect =
                star.getBoundingClientRect();


            return {

                x:
                    rect.left -
                    sceneRect.left +
                    rect.width / 2,


                y:
                    rect.top -
                    sceneRect.top +
                    rect.height / 2

            };

        }



        /***********************
         Draw lines
        ************************/

        function redraw() {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            ctx.lineWidth = 2;

            ctx.shadowBlur = 12;


            const connections =
                getData().connections;


            connections.forEach(line => {

                const a =
                    starCenter(
                        stars[line.from]
                    );


                const b =
                    starCenter(
                        stars[line.to]
                    );


                ctx.beginPath();


                ctx.strokeStyle =
                    line.color;


                ctx.shadowColor =
                    line.color;


                ctx.moveTo(
                    a.x,
                    a.y
                );


                ctx.lineTo(
                    b.x,
                    b.y
                );


                ctx.stroke();

            });

        }



        /***********************
         Click stars
        ************************/

        stars.forEach(star => {


            star.addEventListener(
                "click",
                () => {


                    const id =
                        Number(
                            star.dataset.id
                        );


                    if (firstStar === null) {

                        firstStar = id;

                        star.classList.add(
                            "selected"
                        );

                        return;

                    }



                    if (firstStar === id) {

                        star.classList.remove(
                            "selected"
                        );

                        firstStar = null;

                        return;

                    }



                    const exists =
                        getData()
                        .connections
                        .some(line =>
                            (
                                line.from === firstStar &&
                                line.to === id
                            )
                            ||
                            (
                                line.from === id &&
                                line.to === firstStar
                            )
                        );



                    if (exists) {

                        setData(draft => {

                            const index =
                                draft.connections
                                .findIndex(line =>
                                    (
                                        line.from === firstStar &&
                                        line.to === id
                                    )
                                    ||
                                    (
                                        line.from === id &&
                                        line.to === firstStar
                                    )
                                );


                            draft.connections.splice(
                                index,
                                1
                            );

                        });


                    } else {


                        const picker =
                            document.getElementById(
                                "color-picker"
                            );


                        setData(draft => {

                            draft.connections.push({

                                from:firstStar,

                                to:id,

                                color:
                                    picker.myAwareness ??
                                    picker.myDefaultAwareness ??
                                    "#7dd3fc"

                            });

                        });

                    }



                    stars[firstStar]
                    .classList.remove(
                        "selected"
                    );


                    firstStar = null;


                    requestUpdate();

                }
            );


        });



        /***********************
         Clear button
        ************************/

        document
        .getElementById("clearSky")
        .addEventListener(
            "click",
            () => {

                setData(draft => {

                    draft.connections.splice(
                        0,
                        draft.connections.length
                    );

                });

            }
        );



        /***********************
         Render updates
        ************************/

        const interval =
            setInterval(
                redraw,
                50
            );


        resizeCanvas();



        return () => {

            clearInterval(interval);

            window.removeEventListener(
                "resize",
                resizeCanvas
            );

        };

    }

});