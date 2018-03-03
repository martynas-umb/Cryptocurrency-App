//Variables
    var copy = document.getElementById('copy');
    var input = document.getElementById('inp');
    var bar1 = new ldBar("#myItem1");
//Add input placeholder
    var stored = JSON.parse(localStorage.getItem('content'));
    $("#inp").attr("placeholder", stored.adress);


// Coppy input value and show copied content
    copy.addEventListener('click', function () {
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
    $('#inp').on('input propertychange change', function () {
        console.log('Textarea Change');
        clearTimeout(timeoutId);
        var timeoutId = setTimeout(function () {
            // Runs 0.1 second (1000 ms) after the last change
            saveToDB();
        }, 100);

    });

    function saveToDB() {
        var wallet = {adress: `${input.value}`};
        localStorage.setItem("content", JSON.stringify(wallet));
    }

// On save click, add input value to localstorage (wallet);
    $('#save').click(function () {
        window.location.reload();
        //Future
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
    var worker = `https://api.nanopool.org/v1/eth/workers/${stored.adress}`;
//Worker - Current hashrate
    var wCurrentHs = `https://api.nanopool.org/v1/eth/hashrate/${stored.adress}`;
//Worker - 6 Hours average hasrate
    var wSixHoursHs = `https://api.nanopool.org/v1/eth/avghashratelimited/${stored.adress}/6`;
//Worker - Last Reported Hasrate
    var wLastHs = `https://api.nanopool.org/v1/eth/reportedhashrate/${stored.adress}`;
//Account balance
    var balance = `https://api.nanopool.org/v1/eth/balance/${stored.adress}`;
//Hasrate Chart
    var hashChart = `https://api.nanopool.org/v1/eth/hashratechart/${stored.adress}`;
//Minimum payout
    var minPayout = `https://api.nanopool.org/v1/eth/usersettings/${stored.adress}`;

//ETH PRICE URL
    var ethPrice = `https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=3`;


// GET JSON DATA
    $('document').ready(function () {
        //Create localstorage object on load
        var wallet = {adress: `0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5`};
        localStorage.setItem("content", JSON.stringify(wallet));
        ///
        var input = document.getElementById('inp');
        var req1 = $.getJSON(wCurrentHs, function (value) {
            $('#currentHs').html(value.data + ' Mh/s');
        });
        var req2 = $.getJSON(wSixHoursHs, function (value) {
            $('#sixHr').html(value.data.toFixed(2) + ' Mh/s');
            var sixHoursHs = value.data.toFixed(2);
            var getHasrate = `https://api.nanopool.org/v1/eth/approximated_earnings/${sixHoursHs}`;
            var req7 = $.getJSON(getHasrate, function (val) {
                const {day, week, month} = val.data;
                $('#coinDay').html(day.coins.toFixed(3));
                $('#coinWeek').html(week.coins.toFixed(3));
                $('#coinMonth').html(month.coins.toFixed(3));
                $('#euroDay').html(day.euros.toFixed(2) + ' €');
                $('#euroWeek').html(week.euros.toFixed(2) + ' €');
                $('#euroMonth').html(month.euros.toFixed(2) + ' €');
                $('#usdDay').html(day.dollars.toFixed(2) + ' $');
                $('#usdWeek').html(week.dollars.toFixed(2) + ' $');
                $('#usdMonth').html(month.dollars.toFixed(2) + ' $');
            });

        });

        var req3 = $.getJSON(wLastHs, function (value) {
            $('#lastRep').html(value.data.toFixed(2) + ' Mh/s');
        });

        var req4 = $.getJSON(balance, function (value) {
            // Get min payout
            var req8 = $.getJSON(minPayout, function (val) {

                var progress = value.data * 100 / val.data.payout;
                var result = progress.toFixed(0);
                //Add hover effect with data function
                bar1.set(result);
                $(function () {
                    $("#open-event").tooltip({
                        show: null,
                        position: {
                            my: "left top",
                            at: "left bottom"
                        },
                        open: function (event, ui) {
                            ui.tooltip.animate({top: ui.tooltip.position().top + 10}, "fast");
                        }
                    });
                });
            });
            $('#open-event').attr('title', 'Curent balance ' + value.data.toFixed(8));
        });

        // Get data and draw chart

        var req6 = $.getJSON(worker, function (value) {
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
                            'rgba(255, 83, 63, 0.8)',
                            'rgba(255, 255, 63, 0.8)',


                        ],
                    }],

                    // These labels appear in the legend and in the tooltips when hovering different arcs
                    labels: []
                },
                options: {
                    legend: {
                        display: false,
                        labels: {
                            padding: 2
                        }
                    }
                }
            });
            //Dynamicly add content from json to chart
            $(value.data).each(function (i) {
                function addData(chart, label, hashrate) {
                    chart.data.labels.push(label);
                    chart.data.datasets.forEach((dataset) => {
                        dataset.data.push(hashrate);
                    });
                    chart.update();
                }

                var chartLabel = value.data[i].id;
                var chartHashrate = value.data[i].hashrate;
                addData(myDoughnutChart, chartLabel, chartHashrate);
            });


        });
        var req7 = $.getJSON(ethPrice, function (value) {
            function financial(x) {
                return Number.parseFloat(x).toFixed(2);
            }

            var priceEur = value[1].price_eur;
            var priceUSD = value[1].price_usd;
            var priceBTC = value[1].price_btc;
            $('#priceEur').html(financial(priceEur) + " €");
            $('#priceUSD').html(financial(priceUSD) + " $");
            $('#priceBtc').html(priceBTC + " BTC");
        });
        //ON RESIZE CHANGE CHART SIZE ATTRIBUTES
        $(window).on('resize', function () {
            var win = $(this); //this = window
            // if (win.height() >= 820) { /* ... */ }
            if (win.width() <= 515) {
                $('#myChart').attr('height', '90')
            }
        });
    });

