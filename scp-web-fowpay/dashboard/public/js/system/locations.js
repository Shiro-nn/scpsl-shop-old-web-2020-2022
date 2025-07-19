mapboxgl.accessToken = '';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/fydne/cl5kczg0e000f14jsb05f14qe',
    center: [37.624, 55.716],
    zoom: 4
});
map.on('load', () => {
    {
        const els = document.getElementsByClassName('mapboxgl-ctrl-attrib');
        for (let i = 0; i < els.length; i++) els[i].outerHTML = '';
    }
    {
        const els = document.getElementsByClassName('mapboxgl-ctrl-logo');
        for (let i = 0; i < els.length; i++) els[i].outerHTML = '';
    }
    map.addControl(new mapboxgl.FullscreenControl());
    {
        const els = document.getElementsByClassName('mapboxgl-ctrl-top-right');
        if(els.length > 0){
            const els2 = els[0].getElementsByClassName('mapboxgl-ctrl-group');
            if(els2.length > 0){
                const el = document.createElement('button');
                els2[0].appendChild(el);
                const el2 = document.createElement('span');
                el2.className = 'fa-solid fa-sync';
                el.appendChild(el2);
                el.onclick = () => socket.emit('web.getips');
            }
        }
    }
});
let locCountsElements = [];
socket.on('web.getips', async(data) => {
    data = data.filter(x => x != null && x != undefined);
    try{
        for (let _i = 0; _i < locCountsElements.length; _i++) locCountsElements[_i].remove();
        locCountsElements = [];
    }catch{}
    const postdata = [];
    console.log(data)
    data.forEach(loc => {
        if(!postdata.some(x => CheckDistance(x.loc, loc))) postdata.push({loc, count: 1});
        else postdata.find(x => CheckDistance(x.loc, loc)).count += 1;
    });
    for (let i = 0; i < postdata.length; i++) {
        const _d = postdata[i]
        const loc = _d.loc.split(',');
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = `<span>${_d.count}</span>`;

        const _mark = new mapboxgl.Marker(el);
        _mark
        .setLngLat([parseFloat(loc[1]), parseFloat(loc[0])])
        .addTo(map);
        locCountsElements.push(_mark);
    }
    function CheckDistance(loc1, loc2){
        if(loc1 == loc2) return true;
        const _la1 = loc1.split(',');
        const _la2 = loc2.split(',');
        return calcCrow(parseFloat(_la1[0]), parseFloat(_la1[1]), parseFloat(_la2[0]), parseFloat(_la2[1])) < 50;
    }
});
socket.on('connect', () => socket.emit('web.getips'));
if(socket.connected) socket.emit('web.getips');
function calcCrow(lat1, lon1, lat2, lon2)
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value)
{
    return Value * Math.PI / 180;
}
