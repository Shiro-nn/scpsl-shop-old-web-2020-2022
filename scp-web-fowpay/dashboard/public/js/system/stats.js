$(document).ready(function () {
    document.querySelectorAll(".click_me").forEach((element) => element.click());
    setInterval(() => document.querySelectorAll(".canvasjs-chart-credit").forEach((element) => element.outerHTML = ''), 100);
});
function system_load(data, id) {
    var charts = [];
    var toolTip = {
        shared: true
    },
    legend = {
        cursor: "pointer",
        itemclick: function (e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }
    };

    let data_ = JSON.parse(data);

    let cpu_data = [];
    {
        let _cpus = 0;
        for (let i = 0; i < data_.length; i++) {
            if(data_[i].cpus.length > _cpus) _cpus = data_[i].cpus.length;
        }
        for (let n = 0; n < _cpus; n++) {
            let color = "#64b5f6";
            if (n == 1) color = "#58aff5";
            else if (n == 2) color = "#4ea9f2";
            else if (n == 3) color = "#47a3ed";
            else if (n == 4) color = "#41a2f0";
            else if (n == 5) color = "#399ded";
            else if (n == 6) color = "#329cf0";
            else if (n == 7) color = "#2b99f0";
            else if (n == 8) color = "#2694eb";
            else if (n == 9) color = "#1e90eb";
            else if (n == 10) color = "#188eed";
            else if (n == 11) color = "#138aeb";
            else if (n == 12) color = "#0c88ed";
            let cpu_data2 = [];
            cpu_data.push({
                type: "splineArea", showInLegend: "true", name: `${n}`, yValueFormatString: "#0.#%", color, xValueType: "dateTime",
                xValueFormatString: "DD.MM.YY HH:mm", legendMarkerType: "square", dataPoints: cpu_data2
            });
            for (let i = 0; i < data_.length; i++) {
                if (data_[i].cpus[n] != undefined) cpu_data2.push({ x: data_[i].date, y: parseInt(data_[i].cpus[n].load.replace('%', '')) / 100 });
            }
        }
    }
    var cpuChartOptions = {
        animationEnabled: true,
        theme: "dark2",
        title: {
            text: "Использование CPU"
        },
        toolTip: toolTip,
        axisY: {
            valueFormatString: "#0.#%",
        },
        legend: legend,
        data: cpu_data
    };
    let mem_data = [];
    {
        for (let i = 0; i < data_.length; i++) {
            mem_data.push({ x: data_[i].date, y: parseInt(data_[i].memory.replace('%', '')) / 100 });
        }
    }
    var memoryChartOptions = {
        animationEnabled: true,
        theme: "dark2",
        title: {
            text: "Использование ОЗУ"
        },
        axisY: {
            valueFormatString: "#0.#%",
        },
        toolTip: toolTip,
        legend: legend,
        data: [{
            type: "splineArea",
            showInLegend: "true",
            name: "Используется",
            color: "#d32f2f",
            xValueType: "dateTime",
            xValueFormatString: "DD.MM.YY HH:mm",
            yValueFormatString: "#%",
            legendMarkerType: "square",
            dataPoints: mem_data
        }]
    }
    let net_i_data = [];
    let net_o_data = [];
    {
        for (let i = 0; i < data_.length; i++) {
            const net = data_[i].network;
            if(net == null || net == undefined) continue;
            const date = data_[i].date;
            net_i_data.push({ x: date, y: net.in });
            net_o_data.push({ x: date, y: net.out });
        }
    }
    var networkChartOptions = {
        animationEnabled: true,
        theme: "dark2",
        title:{
            text: "Network Traffic"
        },
        axisY: {
            suffix: " MB/s"
        },
        toolTip: toolTip,
        legend: legend,
        data: [{
            type: "splineArea",
            showInLegend: "true",
            name: "Outbound",
            color: "#81c784",
            xValueType: "dateTime",
            xValueFormatString: "DD MMM YY HH:mm",
            yValueFormatString: "#0.## MB/s",
            legendMarkerType: "square",
            dataPoints: net_o_data
        },{
            type: "splineArea",
            showInLegend: "true",
            name: "Inbound",
            color: "#388e3c",
            xValueType: "dateTime",
            xValueFormatString: "DD MMM YY HH:mm",
            yValueFormatString: "#0.## MB/s",
            legendMarkerType: "square",
            dataPoints: net_i_data
        }]
    }
    let disk_data = [];
    {
        for (let n = 0; n < 3; n++) {
            let color = "#ffb74d";
            if (n == 1) color = "#f57c00";
            let disk_data2 = [];
            let _name = `${n}`;
            if (data_[0].disks[n] != undefined)  _name = data_[0].disks[n].name;
            disk_data.push({
                type: "splineArea", showInLegend: "true", name: _name, yValueFormatString: "#0.#%", color, xValueType: "dateTime",
                xValueFormatString: "DD.MM.YY HH:mm", legendMarkerType: "square", dataPoints: disk_data2
            });
            for (let i = 0; i < data_.length; i++) {
                if (data_[i].disks[n] != undefined) disk_data2.push({ x: data_[i].date, y: parseInt(data_[i].disks[n].load.replace('%', '')) / 100 });
            }
        }
    }
    var diskChartOptions = {
        animationEnabled: true,
        theme: "dark2",
        title: {
            text: "Использование диска"
        },
        axisY: {
            valueFormatString: "#0.#%",
        },
        toolTip: toolTip,
        legend: legend,
        data: disk_data
    }
    charts.push(new CanvasJS.Chart(id + "1", cpuChartOptions));
    charts.push(new CanvasJS.Chart(id + "2", memoryChartOptions));
    charts.push(new CanvasJS.Chart(id + "3", networkChartOptions));
    charts.push(new CanvasJS.Chart(id + "4", diskChartOptions));

    for (var i = 0; i < charts.length; i++) {
        charts[i].options.axisX = {
            labelAngle: 0,
            crosshair: {
                enabled: true,
                snapToDataPoint: true,
                valueFormatString: "HH:mm"
            }
        }
    }

    new syncCharts(charts, true, true, true);

    for (var i = 0; i < charts.length; i++) {
        charts[i].render();
        const _new = charts[i].container;
        setTimeout(() => {
            {
                const __new = document.createElement("div");
                __new.className = 't9';
                __new.style.left = '0';
                __new.style.top = '0';
                _new.getElementsByClassName('canvasjs-chart-container')[0].appendChild(__new);
            }
            {
                const __new = document.createElement("div");
                __new.className = 't9';
                __new.style.left = '0';
                __new.style.top = '260px';
                _new.getElementsByClassName('canvasjs-chart-container')[0].appendChild(__new);
            }
            {
                const __new = document.createElement("div");
                __new.className = 't9';
                __new.style.right = '0';
                __new.style.top = '260px';
                _new.getElementsByClassName('canvasjs-chart-container')[0].appendChild(__new);
            }
        }, 10);
    }

}
class syncCharts {
    constructor(charts, syncToolTip, syncCrosshair, syncAxisXRange) {

        if (!this.onToolTipUpdated) {
            this.onToolTipUpdated = function (e) {
                for (var j = 0; j < charts.length; j++) {
                    if (charts[j] != e.chart)
                        charts[j].toolTip.showAtX(e.entries[0].xValue);
                }
            };
        }

        if (!this.onToolTipHidden) {
            this.onToolTipHidden = function (e) {
                for (var j = 0; j < charts.length; j++) {
                    if (charts[j] != e.chart)
                        charts[j].toolTip.hide();
                }
            };
        }

        if (!this.onCrosshairUpdated) {
            this.onCrosshairUpdated = function (e) {
                for (var j = 0; j < charts.length; j++) {
                    if (charts[j] != e.chart)
                        charts[j].axisX[0].crosshair.showAt(e.value);
                }
            };
        }

        if (!this.onCrosshairHidden) {
            this.onCrosshairHidden = function (e) {
                for (var j = 0; j < charts.length; j++) {
                    if (charts[j] != e.chart)
                        charts[j].axisX[0].crosshair.hide();
                }
            };
        }

        if (!this.onRangeChanged) {
            this.onRangeChanged = function (e) {
                for (var j = 0; j < charts.length; j++) {
                    if (e.trigger === "reset") {
                        charts[j].options.axisX.viewportMinimum = charts[j].options.axisX.viewportMaximum = null;
                        charts[j].options.axisY.viewportMinimum = charts[j].options.axisY.viewportMaximum = null;
                        charts[j].render();
                    } else if (charts[j] !== e.chart) {
                        charts[j].options.axisX.viewportMinimum = e.axisX[0].viewportMinimum;
                        charts[j].options.axisX.viewportMaximum = e.axisX[0].viewportMaximum;
                        charts[j].render();
                    }
                }
            };
        }

        for (var i = 0; i < charts.length; i++) {

            if (syncToolTip) {
                if (!charts[i].options.toolTip)
                    charts[i].options.toolTip = {};

                charts[i].options.toolTip.updated = this.onToolTipUpdated;
                charts[i].options.toolTip.hidden = this.onToolTipHidden;
            }

            if (syncCrosshair) {
                if (!charts[i].options.axisX)
                    charts[i].options.axisX = { crosshair: { enabled: true } };

                charts[i].options.axisX.crosshair.updated = this.onCrosshairUpdated;
                charts[i].options.axisX.crosshair.hidden = this.onCrosshairHidden;
            }

            if (syncAxisXRange) {
                charts[i].options.zoomEnabled = true;
                charts[i].options.rangeChanged = this.onRangeChanged;
            }
        }
    }
}