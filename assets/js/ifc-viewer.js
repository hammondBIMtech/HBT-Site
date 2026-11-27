import {
    Viewer
} from "https://cdn.flinker.app/ifc-viewer/v4.0.3/ifc-viewer.es.js";


// --------------------------------------------------
// LNG TANK
// --------------------------------------------------

async function loadLngTank() {

    const container =
        document.getElementById("lng-tank");

    const viewer =
        new Viewer(container);

    await viewer.ready;

    const url =
        "https://models.hammondbimtech.com/lng-tank/HBT-001-GRADED-SLAB.ifc";

    try {

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Could not load IFC: ${response.status}`
            );

        }

        const buffer =
            await response.arrayBuffer();

        const bytes =
            new Uint8Array(buffer);

        await viewer.add(
            "HBT-001-GRADED-SLAB.ifc",
            bytes
        );

        console.log("LNG Tank loaded");

    }

    catch (error) {

        console.error(
            "LNG Tank loading error:",
            error
        );

    }
}


// --------------------------------------------------
// AUTOMATICALLY RUN THE CORRECT PROJECT
// --------------------------------------------------

if (
    document.getElementById("lng-tank")
) {

    loadLngTank();

}


// Load RC House
async function loadHouse() {

    const container =
        document.getElementById("RC-house");

    const viewer =
        new Viewer(container);

    await viewer.ready;

    const url =
        "https://models.hammondbimtech.com/house/HOUSE.ifc";

    try {

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Could not load IFC: ${response.status}`
            );

        }

        const buffer =
            await response.arrayBuffer();

        const bytes =
            new Uint8Array(buffer);

        await viewer.add(
            "HBT-001-GRADED-SLAB.ifc",
            bytes
        );

        console.log("RC House Loaded");

    }

    catch (error) {

        console.error(
            "RC House loading error:",
            error
        );

    }
}


// --------------------------------------------------
// AUTOMATICALLY RUN THE CORRECT PROJECT
// --------------------------------------------------

if (
    document.getElementById("RC-house")
) {

    loadHouse();

}