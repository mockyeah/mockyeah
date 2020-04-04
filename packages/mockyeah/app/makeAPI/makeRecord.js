const makeRecord = app => {
  const record = (name, options = {}) => {
    app.locals.recording = true;

    if (!name) throw new Error('Must provide a recording name.');

    app.emit('record', {
      name,
      options
    });

    app.log(['serve', 'record'], name);

    const only =
      options.only &&
      (Array.isArray(options.only) ? options.only : [options.only]).map(o => {
        app.log(['serve', 'record', 'only'], o);

        return {
          test: str => str.includes(o)
        };
      });

    const onlyRegex =
      options.onlyRegex &&
      (Array.isArray(options.onlyRegex) ? options.onlyRegex : [options.onlyRegex]).map(o => {
        app.log(['serve', 'record', 'only'], 'regex', o);

        // if onlyRegex is truthy, assume it is a regex pattern
        const regex = new RegExp(o);

        return {
          test: regex.test.bind(regex)
        };
      });

    let groups = options.groups || options.group; // support alias

    if (groups) {
      groups = Array.isArray(groups) ? groups : groups.split(',').map(v => v.trim());

      groups = groups
        .map(groupName => {
          // map like `{"myGroup": "/some.*/regex/"}`
          let configGroup = app.config.groups[groupName];

          // TODO: Log that group was not found.
          // eslint-disable-next-line array-callback-return
          if (!configGroup) return;

          if (typeof configGroup === 'string') {
            configGroup = {
              pattern: configGroup
              // by default, no `directory`
            };
          }

          const regex = new RegExp(configGroup.pattern);

          // eslint-disable-next-line consistent-return
          return {
            name: groupName,
            directory: configGroup.directory === true ? groupName : configGroup.directory,
            test: regex.test.bind(regex)
          };
        })
        .filter(Boolean);
    }

    const enhancedOptions = Object.assign({}, options, {
      only: [...(only || []), ...(onlyRegex || [])],
      groups
    });

    app.locals.recordMeta = {
      name,
      options: enhancedOptions,
      set: []
    };

    // Store whether we're proxying so we can reset it later.
    app.locals.proxyingBeforeRecording = app.locals.proxying;

    // We must proxy in order to record.
    app.proxy();
  };

  return record;
};

module.exports = makeRecord;
