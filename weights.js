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

function clearOutput() {
    el('output').innerHTML = '';
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
function formatExercise(exercise, week) {
  //get max,percent, reps, sets, setId, len

    //adjust max by desired increase
    var max = settings.max[exercise] * (100 + settings.incr[exercise]) / 100;

    var levels = getLevels(exercise, week);
    var len = settings.len[exercise];
    var percent = levels.percent;
    var sets = levels.sets;
    var reps = levels.reps;
    var setId = 'week--' + week + '--' + exercise;

  //percent, reps, sets, setId, len
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

    return '<div class=\'exercise\'>' + exercise.toUpperCase()  + ' ' + percent + '%' + (levels.deload ? ':deload': '') +
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

var phases = {
    hyper: {
        start: {
            percent: 60,
            reps: 10,
            sets: 6
        },
        end: {
            percent: 70,
            reps: 6,
            sets: 6
        }
    },
    strength: {
        start: {
            percent: 75,
            reps: 6,
            sets: 5
        },
        end: {
            percent: 85,
            reps: 4,
            sets: 5
        }
    },
    peak: {
        start: {
            percent: 90,
            reps: 4,
            sets: 4
        },
        end: {
            percent: 100,
            reps: 2,
            sets: 4
        }
    }
};

function getPhaseAndWeek(exercise, week) {

    var hyperWeeks = settings.hyper[exercise];
    var strengthWeeks = settings.strength[exercise];
    var peakWeeks = settings.peak[exercise];

    var totalWeeks = hyperWeeks + strengthWeeks + peakWeeks;

  //determine which phase we are in
    if (week < hyperWeeks ) {
        return {
            phase:'hyper',
            week: week
        };
    } else if (week < hyperWeeks + strengthWeeks) {
        return {
            phase: 'strength',
            week: week - hyperWeeks
        };
    } else if (week < hyperWeeks + strengthWeeks + peakWeeks) {
        return {
            phase: 'peak',
            week: week - (hyperWeeks + strengthWeeks)
        };
    } else {
    //if weeks > total of phases, recurse
        return getLevels(exercise, week - totalWeeks);
    }
}

function getNumWeeksInPhase(exercise, phase) {
    if (phase === 'hyper') {
        return settings.hyper[exercise];
    } else if (phase === 'strength') {
        return settings.strength[exercise];
    } else if (phase === 'peak') {
        return settings.peak[exercise];
    }
    throw new Error('unknown phase:', phase);
}

function interpolate(start, end, setting, completion) {
    var result = start[setting] + (end[setting] - start[setting]) * completion;

    return Math.round(result);
}

function getLevels(exercise, week) {
    //console.log('getLevels', exercise, week);

    var hyperWeeks = settings.hyper[exercise];
    var strengthWeeks = settings.strength[exercise];
    var peakWeeks = settings.peak[exercise];

    var p = getPhaseAndWeek(exercise, week);
    var phase = p.phase;
    var start = phases[phase].start;
    var end = phases[phase].end;
    var weeksInPhase = getNumWeeksInPhase(exercise, phase);

    var completion = (p.week) / (weeksInPhase - 2); // exclude deload week

    //calculate levels..
    var percent = interpolate(start, end, 'percent', completion);
    var sets = interpolate(start, end, 'sets', completion);
    var reps = interpolate(start, end, 'reps', completion);

    var levels = {
        percent: percent,
        sets: sets,
        reps: reps
    };

    //if last week, deload levels
    if (p.week + 1 === weeksInPhase) {
        levels = deload(levels);
        levels.deload = true;
    }
    return levels;
}

/*var workouts = [
   ['squat', 'benchpress', 'chinup'],
   ['barbellrow', 'ohpress', 'deadlift']
];
*/
var days = [
   ['squat', 'benchpress', 'chinup'],
   ['barbellrow', 'ohpress', 'deadlift']
];

function formatWeek(week) {

    var id = 'week-' + week;

    echo('<h3 id="' + id + '"><a href="#' + id +'"> WEEK ' + (week + 1) + '</a></h3>');

    days.forEach(function (workout, day) {
        var dayId = 'week-' + week + '--day-' + day;
        echo('<h4 id="' + dayId + '"><a href="#' + dayId + '"> DAY ' + (day + 1) + '</a></h4>');
        workout.forEach(function (exercise) {
            echo(formatExercise(exercise, week));
        });
        echo('');
    });
}

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

var settings = {};

function calc() {
    clearOutput();
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
    //hypertrophy phase
    var chinup_hyper = el('chinup-hyper-len');
    var squat_hyper = el('squat-hyper-len');
    var benchpress_hyper = el('benchpress-hyper-len');
    var barbellrow_hyper = el('barbellrow-hyper-len');
    var deadlift_hyper = el('deadlift-hyper-len');
    var ohpress_hyper = el('ohpress-hyper-len');
    //strength phase
    var chinup_strength = el('chinup-strength-len');
    var squat_strength = el('squat-strength-len');
    var benchpress_strength = el('benchpress-strength-len');
    var barbellrow_strength = el('barbellrow-strength-len');
    var deadlift_strength = el('deadlift-strength-len');
    var ohpress_strength = el('ohpress-strength-len');
    //peaking phase
    var chinup_peak = el('chinup-peak-len');
    var squat_peak = el('squat-peak-len');
    var benchpress_peak = el('benchpress-peak-len');
    var barbellrow_peak = el('barbellrow-peak-len');
    var deadlift_peak = el('deadlift-peak-len');
    var ohpress_peak = el('ohpress-peak-len');

    settings = {
        max:  {
            squat: squat.value,
            chinup: chinup.value,
            benchpress: benchpress.value,
            barbellrow: barbellrow.value,
            ohpress: ohpress.value,
            deadlift: deadlift.value,
        },
        incr:  {
            squat: num(squat_incr.value),
            chinup: num(chinup_incr.value),
            benchpress: num(benchpress_incr.value),
            barbellrow: num(barbellrow_incr.value),
            ohpress: num(ohpress_incr.value),
            deadlift: num(deadlift_incr.value),
        },
        hyper:  {
            squat: num(squat_hyper.value),
            chinup: num(chinup_hyper.value),
            benchpress: num(benchpress_hyper.value),
            barbellrow: num(barbellrow_hyper.value),
            ohpress: num(ohpress_hyper.value),
            deadlift: num(deadlift_hyper.value),
        },
        strength:  {
            squat: num(squat_strength.value),
            chinup: num(chinup_strength.value),
            benchpress: num(benchpress_strength.value),
            barbellrow: num(barbellrow_strength.value),
            ohpress: num(ohpress_strength.value),
            deadlift: num(deadlift_strength.value),
        },
        peak:  {
            squat: num(squat_peak.value),
            chinup: num(chinup_peak.value),
            benchpress: num(benchpress_peak.value),
            barbellrow: num(barbellrow_peak.value),
            ohpress: num(ohpress_peak.value),
            deadlift: num(deadlift_peak.value),
        },

        len:  {
            squat: squat_len.value,
            chinup: chinup_len.value,
            benchpress: benchpress_len.value,
            barbellrow: barbellrow_len.value,
            ohpress: ohpress_len.value,
            deadlift: deadlift_len.value,
        }

    };

    var activeWeek = localStorage.getItem('activeWeek');

    if (activeWeek) {
        activeWeek = num(activeWeek);
    } else {
        activeWeek = 1;
        localStorage.setItem('activeWeek', activeWeek);
    }

    formatWeek(activeWeek - 1);

    document.getElementById('activeWeek').value = activeWeek;

    return false;
}

function toggleSettings(show) {

    if (show) {
        document.getElementById('settings').className = 'visible';
    } else {
        document.getElementById('settings').className = '';
    }

}

function showWeek() {
    var week = document.getElementById('activeWeek').value;
    localStorage.setItem('activeWeek', week);
    calc();
}
function showPrevWeek() {
    var activeWeek = num(localStorage.getItem('activeWeek')) - 1;
    if (activeWeek) {
        document.getElementById('activeWeek').value = activeWeek;
        localStorage.setItem('activeWeek', activeWeek);
        calc();
    }
}

function showNextWeek() {
    var activeWeek = num(localStorage.getItem('activeWeek')) + 1;
    document.getElementById('activeWeek').value = activeWeek;
    if (activeWeek) {
        localStorage.setItem('activeWeek', activeWeek);
        calc();
    }
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
