const makeRecord = app => {
  const record = (name, options = {}) => {
    let only;
    let groups;

    app.locals.recording = true;

    if (!name) throw new Error('Must provide a recording name.');
    app.log(['serve', 'record'], name);

    if (options.only && typeof options.only === 'string') {
      // if only is truthy, assume it is a regex pattern
      const regex = new RegExp(options.only);
      only = {
        test: regex.test.bind(regex)
      };
      app.log(['serve', 'record', 'only'], regex);
    }

    // array of strings
    if (options.groups) {
      groups = options.groups
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
          const group = {
            name: groupName,
            directory: configGroup.directory === true ? groupName : configGroup.directory,
            test: regex.test.bind(regex)
          };
          // eslint-disable-next-line consistent-return
          return group;
        })
        .filter(Boolean);
    }

    const enhancedOptions = Object.assign({}, options, {
      only,
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
