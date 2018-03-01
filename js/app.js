//Variables
var copy = document.getElementById('copy');
var input = document.getElementById('inp');
var bar1 = new ldBar("#myItem1");
//Add placeholder from localstorage (wallet)
var stored = JSON.parse(localStorage.getItem('content'));
$("#inp").attr("placeholder", stored[0].adress);


// Coppy input value and show copied content
copy.addEventListener('click',function () {
    inp.select();
    document.execCommand("Copy");
    $('#firstinput').after('<div class="alert alert-success alert-dismissible show col-sm-12" role="alert" id="alr1">\n' +
        '            <strong>Copy success !</strong><span id="coppyValue"></span>\n' +
        '            <button type="button" class="close"  data-dismiss="alert" aria-label="Close">\n' +
        '                <span aria-hidden="true">&times;</span>\n' +
        '            </button>\n' +
        '        </div>');
    $('#coppyValue').html(` Content: ${inp.value}`);
});
//Save input value on type
$('#inp').on('input propertychange change', function() {
    console.log('Textarea Change');
    clearTimeout(timeoutId);
    var timeoutId = setTimeout(function() {
        // Runs 1 second (1000 ms) after the last change
        saveToDB();
    }, 100);

});
function saveToDB()
{
    var content = [];
    var wallet = { adress: `${inp.value}`};
    content.push(wallet);
    localStorage.setItem("content", JSON.stringify(content));
    var stored = JSON.parse(localStorage.getItem('content'));
}
// On save click, add input value to localstorage (wallet);
$('#save').click(function () {
    window.location.reload();
    // var content = [];
    // var wallet = { adress: `${inp.value}`};
    // content.push(wallet);
    // localStorage.setItem("content", JSON.stringify(content));
    // var stored = JSON.parse(localStorage.getItem('content'));
    $('#firstinput').after('<div class="alert alert-success alert-dismissible show col-sm-12" role="alert" id="alr1">\n' +
        '            <strong>Save success !</strong>\n' +
        '            <button type="button" class="close"  data-dismiss="alert" aria-label="Close">\n' +
        '                <span aria-hidden="true">&times;</span>\n' +
        '            </button>\n' +
        '        </div>');
    $('#coppyValue').html(` Content: ${inp.value}`);
});

// POOL URLS
//worker
var worker = `https://api.nanopool.org/v1/etc/workers/${stored[0].adress}`;
//Worker - Current hashrate
var wCurrentHs = `https://api.nanopool.org/v1/etc/hashrate/${stored[0].adress}`;
//Worker - 6 Hours average hasrate
var wSixHoursHs = `https://api.nanopool.org/v1/etc/avghashratelimited/${stored[0].adress}/6`;
//Worker - Last Reported Hasrate
var wLastHs = `https://api.nanopool.org/v1/etc/reportedhashrate/${stored[0].adress}`;
//Account balance
var balance = `https://api.nanopool.org/v1/etc/balance/${stored[0].adress}`;
//Hasrate Chart
var hashChart = `https://api.nanopool.org/v1/etc/hashratechart/${stored[0].adress}`;

//Change pool urls
/*$('#eth').click(function () {
    worker = `https://api.nanopool.org/v1/eth/workers/${stored[0].adress}`;
//Worker - Current hashrate
    wCurrentHs = `https://api.nanopool.org/v1/eth/hashrate/${stored[0].adress}`;
//Worker - 6 Hours average hasrate
    wSixHoursHs = `https://api.nanopool.org/v1/eth/avghashratelimited/${stored[0].adress}/6`;
//Worker - Last Reported Hasrate
    wLastHs = `https://api.nanopool.org/v1/eth/reportedhashrate/${stored[0].adress}`;
//Account balance
    balance = `https://api.nanopool.org/v1/eth/balance/${stored[0].adress}`;
});
*/

// GET JSON DATA
    //Add data to view


$('document').ready(function () {

    var req1 = $.getJSON(wCurrentHs, function(value) {
        $('#currentHs').html(value.data+' Mh/s');
    });
    var req2 = $.getJSON(wSixHoursHs, function(value) {
        $('#sixHr').html(value.data.toFixed(2)+' Mh/s');
        var sixHoursHs = value.data.toFixed(2);
        var getHasrate = `https://api.nanopool.org/v1/etc/approximated_earnings/${sixHoursHs}`;
        var req7 = $.getJSON(getHasrate,function (val) {
            //const {day, week, month} = val.data;
            $('#coinDay').html(val.data.day.coins.toFixed(3));
            $('#coinWeek').html(val.data.week.coins.toFixed(3));
            $('#coinMonth').html(val.data.month.coins.toFixed(3));
            $('#euroDay').html(val.data.day.euros.toFixed(2)+' €');
            $('#euroWeek').html(val.data.week.euros.toFixed(2)+' €');
            $('#euroMonth').html(val.data.month.euros.toFixed(2)+' €');
            $('#usdDay').html(val.data.day.dollars.toFixed(2)+' $');
            $('#usdWeek').html(val.data.week.dollars.toFixed(2)+' $');
            $('#usdMonth').html(val.data.month.dollars.toFixed(2)+' $');
        });

    });

    var req3 = $.getJSON(wLastHs, function(value) {
        $('#lastRep').html(value.data.toFixed(2)+' Mh/s');
    });

    var req4 = $.getJSON(balance, function(value) {
        var progress = value.data*100/0.5;
        var result = progress.toFixed(0);
        //Add hover effect with data function
        bar1.set(result);
        $( function() {
            $( "#open-event" ).tooltip({
                show: null,
                position: {
                    my: "left top",
                    at: "left bottom"
                },
                open: function( event, ui ) {
                    ui.tooltip.animate({ top: ui.tooltip.position().top + 10 }, "fast" );
                }
            });
        } );
        $('#open-event').attr('title','Curent balance ' + value.data.toFixed(8));
    });

            // Get data and draw chart

        var req6 = $.getJSON(worker, function(value) {
            //Create Chart
            var ctx = $("#myChart");
            var myDoughnutChart = new Chart(ctx, {
                type: 'doughnut',
                radius: 1,
                data: {
                    datasets: [{
                        data: [],
                        radius: 1,
                        backgroundColor: [
                            'rgba(63, 191, 63, 0.8)',
                            'rgba(25, 128, 255, 0.8)',

                        ],
                    }],

                    // These labels appear in the legend and in the tooltips when hovering different arcs
                    labels: [
                    ]
                },
                options: {}
            });
            //Dynamicly add content from json to chart
            $(value.data).each(function (i) {
                function addData(chart, label,hashrate) {
                    chart.data.labels.push(label);
                    chart.data.datasets.forEach((dataset) => {
                        dataset.data.push(hashrate);
                    });
                    chart.update();
                }
                var chartLabel = value.data[i].id;
                var chartHashrate = value.data[i].hashrate;
                addData(myDoughnutChart,chartLabel,chartHashrate);
            });


        });
        //ON RESIZE CHANGE CHART SIZE ATTRIBUTES
    $(window).on('resize', function(){
        var win = $(this); //this = window
        // if (win.height() >= 820) { /* ... */ }
        if (win.width() <= 515) {$('#myChart').attr('height', '90')}
    });
    });







