/*global output:true*/
function el(id) {
    return document.getElementById(id);
}
/**
 *
 *  TODO: adjust Deload calculations -
 *  60-70% of Overload Volume (sets / reps)
 *  80-90% of Overload Intensity (weight)
 *  eg. after 5x8 @ 70%
 *  5x5 @ 60%
 *  3x8 @ 60%
 *  ie. reduce #reps more than weight
 */

function perc(max, p) {
    var weight =  max * p /100;
    var weightWithoutBar = weight - 45;
    var halfWeightWithoutBar = Math.round(weightWithoutBar / 2);
  //number of plates per side
    var num45s = Math.floor(halfWeightWithoutBar / 45);
    var remainder = halfWeightWithoutBar - num45s * 45;

    var num35s = Math.floor(remainder / 35);
    remainder = remainder - num35s * 35;

    var num25s = Math.floor(remainder / 25);
    remainder = remainder - num25s * 25;

    var num10s = Math.floor(remainder / 10);
    remainder = remainder - num10s * 10;

    var num5s = Math.floor(remainder / 5);
    remainder = remainder - num5s * 5;

    return [num45s, num35s, num25s, num10s, num5s];

}

function getPlateWeight(plates) {

    return plates[0] * 45 +
    plates[1] * 35 +
    plates[2] * 25 +
    plates[3] * 10 +
    plates[4] * 5;
}

function formatPlates(plates) {
    var output = '';
    if (plates[0]) {
        output += ' 45x' + plates[0];
    }
    if (plates[1]) {
        output += ' 35x' + plates[1];
    }

    if (plates[2]) {
        output += ' 25x' + plates[2];
    }
    if (plates[3]) {
        output += ' 10x' + plates[3];
    }
    if (plates[4]) {
        output += ' 5x' + plates[4];
    }
/*  if (plates[5]) {
    output = " 2.5x" + plates[5];
  } */
    return output;
}

function echo(html) {
    el('output').innerHTML += html + '<br>';
}

function getWork(setsDone, max, percent, len) {
    var workJ = Math.floor(setsDone * work(kg(getPlateWeight(perc(max, percent))), len));
    return workJ + 'kJ ' + Math.floor(workJ / 4.186)  + 'C';
}

function addSet(id, max, perc, len) {
    var setsDone = localStorage.getItem(id);
    if (!setsDone) {
        setsDone = 0;
    }
    setsDone++;
    localStorage.setItem(id, setsDone);
    el(id).innerText = '[' + setsDone + ']';
    el(id + '__work').innerText = getWork(setsDone, max, perc, len);
}

function removeSet(id, max, perc, len) {
    var setsDone = localStorage.getItem(id);
    if (!setsDone) {
        setsDone = 0;
    } else {
        if (setsDone > 0) {
            setsDone--;
        }
    }
    localStorage.setItem(id, setsDone);
    el(id).innerText = '[' + setsDone + ']';
    el(id + '__work').innerText = getWork(setsDone, max, perc, len);
}

function formatExercise(exercise, max, percent, reps, setId, len) {
    var setsDone = localStorage.getItem(setId);
    if (!setsDone) {
        setsDone = 0;
    }
    var workDone = getWork(setsDone, max, percent, len);

    return '<div class=\'exercise\'>' + exercise.toUpperCase()  +
      ' (' + formatPlates(perc(max, percent)) + ' )'  + ' Rep:'+ reps +
      ' <span id=\'' + setId + '\'>Sets:' + setsDone + '</span> ' +
      '<button class=\'addSetBtn\' onclick=\'addSet("' + setId + '",' + max + ',' + percent + ',' + len + ')\' >+</button>' +
      ' <button onclick=\'removeSet("' + setId +'",' + max + ',' + percent + ',' + len +  ')\' >-</button>' +
      '</div>' +
      '<div id="' + setId + '__work" class="work">' + workDone
       + '</div>';
}

var program = {

    hypertrophy: [
        {
            percent: 60,
            reps: 10
        },
        {
            percent: 65,
            reps: 8
        },
        {
            percent: 70,
            reps: 6
        },
        {
            percent: 60,
            reps: 3
        },
    ],
    strength: [
        {
            percent: 75,
            reps: 6
        },
        {
            percent: 80,
            reps: 5
        },
        {
            percent: 85,
            reps: 4
        },
        {
            percent: 60,
            reps: 3
        },
    ],
    peaking: [
        {
            percent: 90,
            reps: 4
        },
        {
            percent: 95,
            reps: 3
        },
        {
            percent: 100,
            reps: 2
        },
        {
            percent: 105,
            reps: 1
        },
        {
            percent: 60,
            reps: 3
        },
    ]

};

var workouts = [
   ['squat', 'benchpress'],
   ['barbellrow', 'ohpress'],
   ['deadlift', 'chinup'],
];

function formatPhase(phase, max, len) {

    echo('----------------------');
    echo('      ' + phase.toUpperCase());
    echo('----------------------');
    echo('');

    program[phase].forEach(function (levels, week) {

        echo('----- WEEK ' + (week + 1) + ' - ' + levels.percent + '% ---');
        echo('');
        workouts.forEach(function (workout, day) {
            echo(' -- DAY ' + (day + 1) + ' --');
            echo('');
            workout.forEach(function (exercise) {
                echo(formatExercise(exercise, max[exercise], levels.percent, levels.reps,
                                  phase + '--wk-' + week + '--day-' + day + '--' + exercise, len[exercise]));
            });
            echo('');

        });

    });

}

function calc() {
    var output = el('output');
    var chinup = el('chinup');
    var squat = el('squat');
    var benchpress = el('benchpress');
    var barbellrow = el('barbellrow');
    var deadlift = el('deadlift');
    var ohpress = el('ohpress');
    //lengths
    var chinup_len = el('chinup-len');
    var squat_len = el('squat-len');
    var benchpress_len = el('benchpress-len');
    var barbellrow_len = el('barbellrow-len');
    var deadlift_len = el('deadlift-len');
    var ohpress_len = el('ohpress-len');
    var max = {
        squat: squat.value,
        chinup: chinup.value,
        benchpress: benchpress.value,
        barbellrow: barbellrow.value,
        ohpress: ohpress.value,
        deadlift: deadlift.value,
    };
    var len = {
        squat: squat_len.value,
        chinup: chinup_len.value,
        benchpress: benchpress_len.value,
        barbellrow: barbellrow_len.value,
        ohpress: ohpress_len.value,
        deadlift: deadlift_len.value,
    };

    formatPhase('hypertrophy', max, len);
    formatPhase('strength', max, len);
    formatPhase('peaking', max, len);

    return false;
}

//FORCE / WORK
var g = 9.8;//m/s/s

function kg(pounds) {
    return pounds / 2.20462;
}

function force(m, a) {
    return m * a;
}

function weight(mass) {
    return force(mass, g);
}

function work(mass, height) {
    return mass * g * height;
}

function power(work, time) {
    return work / time;
}
