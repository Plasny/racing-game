export let id;

export async function join() {
    const qr = document.getElementById("joincode");

    id = await (await fetch("/join", {
        headers: {
            "Accept": "text/plain"
        }
    })).text();

    qr.outerHTML = await (await fetch(`/join?id=${id}`, {
        headers: {
            "Accept": "text/svg+xml"
        }
    })).text();

    document.querySelector("#joinbox svg").id = "joincode";
}

export function hideJoinUI() {
    const el = document.getElementById("joinbox");
    el.style.display = "none";
}

export async function showJoinUI() {
    const el = document.getElementById("joinbox");
    await join();
    el.style.display = "block";
}

