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
    var repsDone = setsDone.reduce(function (prev, set) {
        return prev + set;
    }, 0);
    var workPerRep = work(kg(getPlateWeight(perc(max, percent))), len);
    var workJ = Math.floor(repsDone * workPerRep);
    return workJ + 'kJ ' + Math.floor(workJ / 4.186)  + 'C';
}

function addSet(id, max, perc, len, targetReps, repsId) {
    var setsDoneJson = localStorage.getItem(id);
    if (!setsDoneJson || setsDoneJson === 'undefined') {
        setsDoneJson = '[]';
    }

    var setsDone = JSON.parse(setsDoneJson);
    if (typeof setsDone === 'string') {
        setsDone = parseInt(setsDone, 10);
    }
    if (typeof setsDone === 'number') {
        setsDone = (new Array(setsDone)).map(function() { return targetReps; });
    }
    var reps = el(repsId).value;
    setsDone.push(reps);
    var setsDoneStr = JSON.stringify(setsDone);
    localStorage.setItem(id, setsDoneStr);
    el(id).innerText = 'Sets: ' + setsDone.toString();
    el(id + '__work').innerText = getWork(setsDone, max, perc, len);
}

function removeSet(id, max, perc, len, targetReps) {
    var setsDoneJson = localStorage.getItem(id);
    if (!setsDoneJson) {
        setsDoneJson = '[]';
    }
    var setsDone = JSON.parse(setsDoneJson);
    if (typeof setsDone === 'string') {
        setsDone = parseInt(setsDone, 10);
    }
    if (typeof setsDone === 'number') {
        setsDone = (new Array(setsDone)).map(function() { return targetReps; });
    }

    if (setsDone.length > 0) {
        setsDone.pop();
    }

    var setsDoneStr = JSON.stringify(setsDone);
    localStorage.setItem(id, setsDoneStr);
    el(id).innerText = 'Sets: ' + setsDone.toString();
    el(id + '__work').innerText = getWork(setsDone, max, perc, len);
}

function setReps(srcId, targetId) {
    el(targetId).value = el(srcId).value;
}

function formatExercise(exercise, max, percent, reps, sets, setId, len) {
    var setsDoneJson = localStorage.getItem(setId) || '[]';
    if (setsDoneJson === 'undefined') setsDoneJson = '[]';
    //setsDone is a json array
    //convert older format -- number of sets done
    //to newer one of -- array of reps done in each set
    var setsDone = JSON.parse(setsDoneJson);
    if (typeof setsDone === 'string') {
        setsDone = parseInt(setsDone, 10);
    }
    if (typeof setsDone === 'number') {
        setsDone = (new Array(setsDone)).map(function() { return reps; });
    }
    var workDone = getWork(setsDone, max, percent, len);
    var currentRepSliderId = setId + '__set-' + setsDone.length + '__reps__slider';
    var currentRepsTextId = setId + '__set-' + setsDone.length + '__reps__text';

    return '<div class=\'exercise\'>' + exercise.toUpperCase()  +
      ' (' + formatPlates(perc(max, percent)) + ' )'  + ' (' + sets + 'x' + reps + ') ' +
      ' <span id=\'' + setId + '\'>Sets: ' + setsDone.toString() + '</span> ' + '<br/>' +
      ' <input type="range" min="0" max="12" step="1" name="' + currentRepSliderId  + '" id="' + currentRepSliderId + '" value="0" ' +
      'oninput=\'setReps("' + currentRepSliderId + '","' + currentRepsTextId + '")\' />' +
      ' <input type="number" min="0" max="12" step="1" id="' + currentRepsTextId + '" value="0" ' +
      'onchange=\'setReps("' + currentRepsTextId + '","' + currentRepSliderId + '")\' />' +
    '<button class=\'addSetBtn\' onclick=\'addSet("' + setId + '",' + max + ',' + percent + ',' + len + ',' + reps +  ',"' + currentRepsTextId + '")\' >+</button>' +
      ' <button onclick=\'removeSet("' + setId +'",' + max + ',' + percent + ',' + len + ',' + reps + ')\' >-</button>' +
      '</div>' +
      '<div id="' + setId + '__work" class="work">' + workDone
       + '</div>';
}

function deload(overloadWeek) {
    return {
        percent: overloadWeek.percent * 0.85,
        reps: Math.round(overloadWeek.reps * 0.70),
        sets: Math.round(overloadWeek.sets * 0.60)
    };
}

var program = {

    hypertrophy: [
        {
            percent: 60,
            reps: 10,
            sets: 6
        },
        {
            percent: 65,
            reps: 8,
            sets: 6
        },
        {
            percent: 70,
            reps: 6,
            sets: 6
        },
        deload({
            percent: 70,
            reps: 6,
            sets: 6
        }),
    ],
    strength: [
        {
            percent: 75,
            reps: 6,
            sets: 6
        },
        {
            percent: 80,
            reps: 5,
            sets: 6
        },
        {
            percent: 85,
            reps: 4,
            sets: 6
        },
        deload({
            percent: 85,
            reps: 4,
            sets: 6
        })
    ],
    peaking: [
        {
            percent: 90,
            reps: 4,
            sets: 6
        },
        {
            percent: 95,
            reps: 3,
            sets: 6
        },
        {
            percent: 100,
            reps: 2,
            sets: 6
        },
        deload({
            percent: 100,
            reps: 2,
            sets: 6
        })
    ]

};

var workouts = [
   ['squat', 'benchpress', 'chinup'],
   ['barbellrow', 'ohpress', 'deadlift']
];

function formatPhase(phase, max, len, incr) {

    echo('      <h2>' + phase.toUpperCase() + ' PHASE </h2>');

    program[phase].forEach(function (levels, week) {

        var id = phase + '__week-' + week;
        echo('<h3 id="' + id + '"><a href="#' + id +'"> WEEK ' + (week + 1) + ' - ' + levels.percent + '% </a></h3>');
        workouts.forEach(function (workout, day) {
            var dayId = phase + '--wk-' + week + '--day-' + day;
            echo('<h4 id="' + dayId + '"><a href="#' + dayId + '"> WORKOUT ' + (day + 1) + '</a></h4>');
            workout.forEach(function (exercise) {
                var targetMax = max[exercise] * (100 + incr[exercise]) / 100;
                echo(formatExercise(exercise, targetMax , levels.percent, levels.reps, levels.sets,
                                  phase + '--wk-' + week + '--day-' + day + '--' + exercise, len[exercise]));
            });
            echo('');

        });

    });

}
function num(n) {
    return parseInt(n, 10);
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
    //increase
    var chinup_incr = el('chinup-incr');
    var squat_incr = el('squat-incr');
    var benchpress_incr = el('benchpress-incr');
    var barbellrow_incr = el('barbellrow-incr');
    var deadlift_incr = el('deadlift-incr');
    var ohpress_incr = el('ohpress-incr');
    var max = {
        squat: squat.value,
        chinup: chinup.value,
        benchpress: benchpress.value,
        barbellrow: barbellrow.value,
        ohpress: ohpress.value,
        deadlift: deadlift.value,
    };
    var incr = {
        squat: num(squat_incr.value),
        chinup: num(chinup_incr.value),
        benchpress: num(benchpress_incr.value),
        barbellrow: num(barbellrow_incr.value),
        ohpress: num(ohpress_incr.value),
        deadlift: num(deadlift_incr.value),
    };
    var len = {
        squat: squat_len.value,
        chinup: chinup_len.value,
        benchpress: benchpress_len.value,
        barbellrow: barbellrow_len.value,
        ohpress: ohpress_len.value,
        deadlift: deadlift_len.value,
    };

    formatPhase('hypertrophy', max, len, incr);
    formatPhase('strength', max, len, incr);
    formatPhase('peaking', max, len, incr);

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
