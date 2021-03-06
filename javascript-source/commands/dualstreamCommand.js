(function() {
    var otherChannels = ($.inidb.exists('dualStreamCommand', 'otherChannels') ? $.inidb.get('dualStreamCommand', 'otherChannels') : null),
        timerToggle = ($.inidb.exists('dualStreamCommand', 'timerToggle') ? $.inidb.get('dualStreamCommand', 'timerToggle') : false),
        timerInterval = (parseInt($.inidb.exists('dualStreamCommand', 'timerInterval')) ? parseInt($.inidb.get('dualStreamCommand', 'timerInterval')) : 5),
        initIntervalStarted = false;

    $.bind('command', function(event) {
        var sender = event.getSender(),
            command = event.getCommand(),
            args = event.getArgs(),
            argsString = event.getArguments().trim(),
            channel = argsString,
            action = args[0],
            subAction = args[1];

        /**
         * @commandpath multi - Displays the current multi-link information of the usage
         */
        if (command.equalsIgnoreCase('multi')) {
            if (!action) {
                if (otherChannels != null) {
                    $.say($.lang.get('dualstreamcommand.link') + $.username.resolve($.channelName) + otherChannels);
                    return;
                } else {
                    if ($.isModv3(sender, event.getTags())) {
                        $.say($.whisperPrefix(sender) + $.lang.get('dualstreamcommand.usage'));
                        return;
                    }
                }
            }

            /**
             * @commandpath multi set [channels] - Adds a space-delimited list of channels to the multi-link (local channel already added)
             */
            if (action.equalsIgnoreCase('set')) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.whisperPrefix(sender) + $.modMsg);
                    return;
                } else if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('dualstreamcommand.set.usage'));
                    return;
                }
                channel = channel.replace(action + ' ', '/');
                channel = channel.replace(' ', '/');
                otherChannels = channel;
                $.inidb.set('dualStreamCommand', 'otherChannels', otherChannels);
                $.say($.lang.get('dualstreamcommand.link.set', $.username.resolve($.channelName) + otherChannels));
                $.logEvent('dualstreamCommand.js', 48, sender + ' set the multi link to "' + $.lang.get('dualstreamcommand.link') + $.username.resolve($.channelName) + otherChannels + '"');
                return;
            }

            /**
             * @commandpath multi clear - Clears the multi-links and disables the timer
             */
            if (action.equalsIgnoreCase('clear')) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.whisperPrefix(sender) + $.modMsg);
                    return;
                }
                otherChannels = null;
                timerToggle = false;
                $.inidb.del('dualStreamCommand', 'otherChannels');
                $.inidb.set('dualStreamCommand', 'timerToggle', timerToggle);
                $.say($.whisperPrefix(sender) + $.lang.get('dualstreamcommand.clear'));
                $.logEvent('dualstreamCommand.js', 64, sender + ' cleared the multi link');
                return;
            }

            /**
             * @commandpath multi timer [on / off] - Enable/Disable the multi-links timer
             */
            if (action.equalsIgnoreCase('timer')) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.whisperPrefix(sender) + $.modMsg);
                    return;
                } else if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('dualstreamcommand.timer.usage'));
                    return;
                }

                if (subAction.equalsIgnoreCase('on')) {
                    timerToggle = true;
                    $.inidb.set('dualStreamCommand', 'timerToggle', timerToggle);
                    $.say($.whisperPrefix(sender) + $.lang.get('dualstreamcommand.timer.enabled'));
                    $.logEvent('dualstreamCommand.js', 85, sender + ' enabled the multi timer');
                    return;
                } else if (subAction.equalsIgnoreCase('off')) {
                    timerToggle = false;
                    $.inidb.set('dualStreamCommand', 'timerToggle', timerToggle);
                    $.say($.whisperPrefix(sender) + $.lang.get('dualstreamcommand.timer.disabled'));
                    $.logEvent('dualstreamCommand.js', 91, sender + ' disabled the multi timer');
                    return;
                } else {
                    $.say($.whisperPrefix(sender) + $.lang.get('dualstreamcommand.timer.usage'));
                    return;
                }
            }

            /**
             * @commandpath multi timerinterval [time in minutes] - Set the interval for the multi-links timer
             */
            if (action.equalsIgnoreCase('timerinterval')) {
                if (!$.isModv3(sender, event.getTags())) {
                    $.say($.whisperPrefix(sender) + $.modMsg);
                    return;
                } else if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('dualstreamcommand.timerinterval.usage'));
                    return;
                } else if (parseInt(subAction) < 5) {
                    $.say($.whisperPrefix(sender) + $.lang.get('dualstreamcommand.timerinterval.err'));
                    return;
                }
                timerInterval = parseInt(subAction);
                $.inidb.set('dualStreamCommand', 'timerInterval', timerInterval);
                $.say($.whisperPrefix(sender) + $.lang.get('dualstreamcommand.timerinterval.set'));
                $.logEvent('dualstreamCommand.js', 116, sender + ' changed the multi timer interval to ' + timerInterval + ' seconds');
                return;
            }
        }
    });

    $.bind('initReady', function() {
        if ($.bot.isModuleEnabled('./commands/dualstreamCommand.js')) {
            $.registerChatCommand('./commands/dualstreamCommand.js', 'multi', 7);

            if (!initIntervalStarted) {
                initIntervalStarted = true;
                setInterval(function() {
                    if (otherChannels != null) {
                        if (timerToggle && $.isOnline($.channelName)) {
                            $.say($.lang.get('dualstreamcommand.link') + $.username.resolve($.channelName) + otherChannels);
                            $.logEvent('dualstreamCommand.js', 132, 'Ran multi timer at ' + $.systemTime());
                            return;
                        }
                    }
                }, timerInterval * 60 * 1000);
            }
        }
    });
})();
