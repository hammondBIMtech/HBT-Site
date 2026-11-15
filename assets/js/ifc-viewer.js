import { Viewer } from
    "https://cdn.flinker.app/ifc-viewer/v4.0.3/ifc-viewer.es.js";


console.log("A — IFC viewer JS loaded");


const viewerContainer =
    document.getElementById("ifc-viewer-section");


console.log(
    "B — viewer container:",
    viewerContainer
);


if (!viewerContainer) {

    console.error(
        "Viewer container not found."
    );

    throw new Error(
        "Could not find #ifc-viewer-section"
    );
}


console.log(
    "C — creating Flinker viewer"
);


const viewer =
    new Viewer(viewerContainer);


console.log(
    "D — viewer created"
);


await viewer.ready;


console.log(
    "E — Flinker viewer ready"
);


const url =
    "https://models.hammondbimtech.com/rc-frame-5-story/RC%20FRAME%205%20STORY.ifc";


try {

    console.log(
        "F — fetching IFC"
    );


    const response =
        await fetch(url);


    console.log(
        "G — response:",
        response.status,
        response.statusText
    );


    if (!response.ok) {

        throw new Error(
            `Could not load IFC: ${response.status}`
        );

    }


    const buffer =
        await response.arrayBuffer();


    console.log(
        "H — IFC bytes:",
        buffer.byteLength
    );


    const bytes =
        new Uint8Array(buffer);


    console.log(
        "I — adding IFC to viewer"
    );


    await viewer.add(
        "RC FRAME 5 STORY.ifc",
        bytes
    );


    console.log(
        "J — IFC successfully loaded"
    );

}

catch (error) {

    console.error(
        "IFC loading error:",
        error
    );

}