const tpsElement = document.getElementById('tps.area');
const config = {
    type: 'line',
    data: {},
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false
            },
        },
        hover: {
            mode: 'index',
            intersec: false
        },
        scales: {
            y: {
                min: 0,
                ticks: {
                    stepSize: 50
                }
            }
        }
    },
};
const chart = new Chart(tpsElement, config);

const __data1 = {
    labels: ['01.01', '02.01', '03.01', '04.01'],
    datasets: [
        {
            label: 'NoRules #2',
            data: [1, 5, 4, 2],
            borderColor: '#FFA200'
        },
        {
            label: 'Medium RP',
            data: [5, 4, 4, 0],
            borderColor: '#8c3dfd'
        }
    ]
};
let __data;

let rendered = false;
window.addEventListener('scroll', async() => {
    if(rendered) return;
    if(!elementInView(tpsElement, 1.25)) return;
    rendered = true;
    while(!__data){
        await new Promise(res => setTimeout(() => res(), 500));
    }
    chart.config.data = __data;
    chart.update();
    window.removeEventListener('scroll', this);

    function elementInView(el, dividend = 1) {
        const elementTop = el.getBoundingClientRect().top;
        return (elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend);
    };
});

socket.on('get.tps', (tps) => {
    const _now = Date.now();
    const _start = _now - (1000 * 60 * 60); // one hour
    const labels = [];
    const datasets = [];
    for (let i = 0; i < tps.length; i++) {
        const _tps = tps[i];
        _tps.ticks = _tps.ticks.filter(x => x.date > _start);
        datasets.push({
            label: _tps.name,
            _server: _tps.server,
            borderColor: GetColor(i),
            data: [],
        });
        for (let z = 0; z < _tps.ticks.length; z++) {
            const ticks = _tps.ticks[z];
            ticks.date = Math.round(ticks.date / 10000); // 10 seconds
        }
    }
    for (let i = Math.round(_start / 10000); i < Math.round(_now / 10000); i++) {
        labels.push(ParseDateToString(i));
        for (let z = 0; z < datasets.length; z++) {
            const dataset = datasets[z];
            let _ticks = 0;
            try{
                const _serverData = tps.find(x => x.server == dataset._server);
                if(_serverData){
                    const ticksFromServer = _serverData.ticks.find(x => x.date == i);
                    if(!isNaN(ticksFromServer.tps)){
                        _ticks = ticksFromServer.tps;
                    }
                }
            }catch{}
            dataset.data.push(_ticks);
        }
    }
    __data = {labels, datasets};

    function ParseDateToString(num) {
        const date = new Date(num * 10000);
        return `${dateTimePad(date.getHours(), 2)}:${dateTimePad(date.getMinutes(), 2)}:${dateTimePad(date.getSeconds(), 2)}`;
    }
    function dateTimePad(value, digits){
        let number = value;
        while (number.toString().length < digits) {
            number = '0' + number;
        }
        return number;
    }

    function GetColor(i) {
        switch (i) {
            case 0: return '#d445ff'
            case 1: return '#ff2323';
            case 2: return '#0047ff';
            case 3: return '#5486f3';
            default: return '#ff0';
        }
    }
});
socket.emit('get.tps');