'use strict';

const gutil      = require('gulp-util');
const prettyTime = require('pretty-hrtime');
const chalk      = require('chalk');

let failed       = false;

// Format orchestrator errors
function formatError(e) {
    if (!e.err) {
        return e.message;
    }

    // PluginError
    if (typeof e.err.showStack === 'boolean') {
        return e.err.toString();
    }

    // Normal error
    if (e.err.stack) {
        return e.err.stack;
    }

    // Unknown (string, number, etc.)
    return new Error(String(e.err)).stack;
}

module.exports = function (gulpInst) {

    // Total hack due to poor error management in orchestrator
    gulpInst.on('err', function() {
        failed = true;
    });

    gulpInst.on('task_start', function(e) {
        // TODO: batch these
        // so when 5 tasks start at once it only logs one time with all 5
        gutil.log('Starting', '\'' + chalk.cyan(e.task) + '\'...');
    });

    gulpInst.on('task_stop', function(e) {
        let time = prettyTime(e.hrDuration);
        gutil.log(
            'Finished', '\'' + chalk.cyan(e.task) + '\'',
            'after', chalk.magenta(time)
        );
    });

    gulpInst.on('task_err', function(e) {
        let msg = formatError(e);
        let time = prettyTime(e.hrDuration);
        gutil.log(
            '\'' + chalk.cyan(e.task) + '\'',
            chalk.red('errored after'),
            chalk.magenta(time)
        );
        gutil.log(msg);
    });

    gulpInst.on('task_not_found', function(err) {
        gutil.log(
            chalk.red('Task \'' + err.task + '\' is not in your gulpfile')
        );
        gutil.log('Please check the documentation for proper gulpfile formatting');
        process.exit(1);
    });
};