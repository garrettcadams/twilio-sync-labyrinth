'use strict';

var _ = require('lodash');
var Q = require('q');
var Page = require('../../../../../../base/Page');
var deserialize = require('../../../../../../base/deserialize');
var values = require('../../../../../../base/values');

var CredentialPage;
var CredentialList;
var CredentialInstance;
var CredentialContext;

/* jshint ignore:start */
/**
 * @constructor Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialPage
 * @augments Page
 * @description Initialize the CredentialPage
 *
 * @param {Twilio.Api.V2010} version - Version of the resource
 * @param {object} response - Response from the API
 * @param {object} solution - Path solution
 *
 * @returns CredentialPage
 */
/* jshint ignore:end */
function CredentialPage(version, response, solution) {
  // Path Solution
  this._solution = solution;

  Page.prototype.constructor.call(this, version, response, this._solution);
}

_.extend(CredentialPage.prototype, Page.prototype);
CredentialPage.prototype.constructor = CredentialPage;

/* jshint ignore:start */
/**
 * Build an instance of CredentialInstance
 *
 * @function getInstance
 * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialPage
 * @instance
 *
 * @param {object} payload - Payload response from the API
 *
 * @returns CredentialInstance
 */
/* jshint ignore:end */
CredentialPage.prototype.getInstance = function getInstance(payload) {
  return new CredentialInstance(
    this._version,
    payload,
    this._solution.accountSid,
    this._solution.credentialListSid
  );
};


/* jshint ignore:start */
/**
 * @constructor Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialList
 * @description Initialize the CredentialList
 *
 * @param {Twilio.Api.V2010} version - Version of the resource
 * @param {string} accountSid - The account_sid
 * @param {string} credentialListSid - The credential_list_sid
 */
/* jshint ignore:end */
function CredentialList(version, accountSid, credentialListSid) {
  /* jshint ignore:start */
  /**
   * @function credentials
   * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext
   * @instance
   *
   * @param {string} sid - sid of instance
   *
   * @returns {Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialContext}
   */
  /* jshint ignore:end */
  function CredentialListInstance(sid) {
    return CredentialListInstance.get(sid);
  }

  CredentialListInstance._version = version;
  // Path Solution
  CredentialListInstance._solution = {
    accountSid: accountSid,
    credentialListSid: credentialListSid
  };
  CredentialListInstance._uri = _.template(
    '/Accounts/<%= accountSid %>/SIP/CredentialLists/<%= credentialListSid %>/Credentials.json' // jshint ignore:line
  )(CredentialListInstance._solution);
  /* jshint ignore:start */
  /**
   * Streams CredentialInstance records from the API.
   *
   * This operation lazily loads records as efficiently as possible until the limit
   * is reached.
   *
   * The results are passed into the callback function, so this operation is memory efficient.
   *
   * If a function is passed as the first argument, it will be used as the callback function.
   *
   * @function each
   * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialList
   * @instance
   *
   * @param {object|function} opts - ...
   * @param {number} [opts.limit] -
   *         Upper limit for the number of records to return.
   *         each() guarantees never to return more than limit.
   *         Default is no limit
   * @param {number} [opts.pageSize=50] -
   *         Number of records to fetch per request,
   *         when not set will use the default value of 50 records.
   *         If no pageSize is defined but a limit is defined,
   *         each() will attempt to read the limit with the most efficient
   *         page size, i.e. min(limit, 1000)
   * @param {Function} [opts.callback] -
   *         Function to process each record. If this and a positional
   * callback are passed, this one will be used
   * @param {Function} [opts.done] -
   *          Function to be called upon completion of streaming
   * @param {Function} [callback] - Function to process each record
   */
  /* jshint ignore:end */
  CredentialListInstance.each = function each(opts, callback) {
    opts = opts || {};
    if (_.isFunction(opts)) {
      opts = { callback: opts };
    } else if (_.isFunction(callback) && !_.isFunction(opts.callback)) {
      opts.callback = callback;
    }

    if (_.isUndefined(opts.callback)) {
      throw new Error('Callback function must be provided');
    }

    var done = false;
    var currentPage = 1;
    var limits = this._version.readLimits({
      limit: opts.limit,
      pageSize: opts.pageSize
    });

    function onComplete(error) {
      done = true;
      if (_.isFunction(opts.done)) {
        opts.done(error);
      }
    }

    function fetchNextPage(fn) {
      var promise = fn();
      if (_.isUndefined(promise)) {
        onComplete();
        return;
      }

      promise.then(function(page) {
        _.each(page.instances, function(instance) {
          if (done) {
            return false;
          }

          opts.callback(instance, onComplete);
        });

        if ((limits.pageLimit && limits.pageLimit <= currentPage)) {
          onComplete();
        } else if (!done) {
          currentPage++;
          fetchNextPage(_.bind(page.nextPage, page));
        }
      });

      promise.catch(onComplete);
    }

    fetchNextPage(_.bind(this.page, this, opts));
  };

  /* jshint ignore:start */
  /**
   * @description Lists CredentialInstance records from the API as a list.
   *
   * If a function is passed as the first argument, it will be used as the callback function.
   *
   * @function list
   * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialList
   * @instance
   *
   * @param {object|function} opts - ...
   * @param {number} [opts.limit] -
   *         Upper limit for the number of records to return.
   *         list() guarantees never to return more than limit.
   *         Default is no limit
   * @param {number} [opts.pageSize] -
   *         Number of records to fetch per request,
   *         when not set will use the default value of 50 records.
   *         If no page_size is defined but a limit is defined,
   *         list() will attempt to read the limit with the most
   *         efficient page size, i.e. min(limit, 1000)
   * @param {function} [callback] - Callback to handle list of records
   *
   * @returns {Promise} Resolves to a list of records
   */
  /* jshint ignore:end */
  CredentialListInstance.list = function list(opts, callback) {
    if (_.isFunction(opts)) {
      callback = opts;
      opts = {};
    }
    opts = opts || {};
    var deferred = Q.defer();
    var allResources = [];
    opts.callback = function(resource, done) {
      allResources.push(resource);

      if (!_.isUndefined(opts.limit) && allResources.length === opts.limit) {
        done();
      }
    };

    opts.done = function(error) {
      if (_.isUndefined(error)) {
        deferred.resolve(allResources);
      } else {
        deferred.reject(error);
      }
    };

    if (_.isFunction(callback)) {
      deferred.promise.nodeify(callback);
    }

    this.each(opts);
    return deferred.promise;
  };

  /* jshint ignore:start */
  /**
   * Retrieve a single page of CredentialInstance records from the API.
   * Request is executed immediately
   *
   * If a function is passed as the first argument, it will be used as the callback function.
   *
   * @function page
   * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialList
   * @instance
   *
   * @param {object|function} opts - ...
   * @param {string} [opts.pageToken] - PageToken provided by the API
   * @param {number} [opts.pageNumber] -
   *          Page Number, this value is simply for client state
   * @param {number} [opts.pageSize] - Number of records to return, defaults to 50
   * @param {function} [callback] - Callback to handle list of records
   *
   * @returns {Promise} Resolves to a list of records
   */
  /* jshint ignore:end */
  CredentialListInstance.page = function page(opts, callback) {
    opts = opts || {};

    var deferred = Q.defer();
    var data = values.of({
      'PageToken': opts.pageToken,
      'Page': opts.pageNumber,
      'PageSize': opts.pageSize
    });

    var promise = this._version.page({
      uri: this._uri,
      method: 'GET',
      params: data
    });

    promise = promise.then(function(payload) {
      deferred.resolve(new CredentialPage(
        this._version,
        payload,
        this._solution
      ));
    }.bind(this));

    promise.catch(function(error) {
      deferred.reject(error);
    });

    if (_.isFunction(callback)) {
      deferred.promise.nodeify(callback);
    }

    return deferred.promise;
  };

  /* jshint ignore:start */
  /**
   * create a CredentialInstance
   *
   * @function create
   * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialList
   * @instance
   *
   * @param {object} opts - ...
   * @param {string} opts.username - The username
   * @param {string} opts.password - The password
   * @param {function} [callback] - Callback to handle processed record
   *
   * @returns {Promise} Resolves to processed CredentialInstance
   */
  /* jshint ignore:end */
  CredentialListInstance.create = function create(opts, callback) {
    if (_.isUndefined(opts)) {
      throw new Error('Required parameter "opts" missing.');
    }
    if (_.isUndefined(opts.username)) {
      throw new Error('Required parameter "opts.username" missing.');
    }
    if (_.isUndefined(opts.password)) {
      throw new Error('Required parameter "opts.password" missing.');
    }

    var deferred = Q.defer();
    var data = values.of({
      'Username': opts.username,
      'Password': opts.password
    });

    var promise = this._version.create({
      uri: this._uri,
      method: 'POST',
      data: data
    });

    promise = promise.then(function(payload) {
      deferred.resolve(new CredentialInstance(
        this._version,
        payload,
        this._solution.accountSid,
        this._solution.credentialListSid,
        this._solution.sid
      ));
    }.bind(this));

    promise.catch(function(error) {
      deferred.reject(error);
    });

    if (_.isFunction(callback)) {
      deferred.promise.nodeify(callback);
    }

    return deferred.promise;
  };

  /* jshint ignore:start */
  /**
   * Constructs a credential
   *
   * @function get
   * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialList
   * @instance
   *
   * @param {string} sid - The sid
   *
   * @returns {Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialContext}
   */
  /* jshint ignore:end */
  CredentialListInstance.get = function get(sid) {
    return new CredentialContext(
      this._version,
      this._solution.accountSid,
      this._solution.credentialListSid,
      sid
    );
  };

  return CredentialListInstance;
}


/* jshint ignore:start */
/**
 * @constructor Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialInstance
 * @description Initialize the CredentialContext
 *
 * @property {string} sid - The sid
 * @property {string} accountSid - The account_sid
 * @property {string} credentialListSid - The credential_list_sid
 * @property {string} username - The username
 * @property {Date} dateCreated - The date_created
 * @property {Date} dateUpdated - The date_updated
 * @property {string} uri - The uri
 *
 * @param {Twilio.Api.V2010} version - Version of the resource
 * @param {object} payload - The instance payload
 * @param {sid} accountSid - The account_sid
 * @param {sid} credentialListSid - The credential_list_sid
 * @param {sid} sid - The sid
 */
/* jshint ignore:end */
function CredentialInstance(version, payload, accountSid, credentialListSid,
                             sid) {
  this._version = version;

  // Marshaled Properties
  this.sid = payload.sid; // jshint ignore:line
  this.accountSid = payload.account_sid; // jshint ignore:line
  this.credentialListSid = payload.credential_list_sid; // jshint ignore:line
  this.username = payload.username; // jshint ignore:line
  this.dateCreated = deserialize.rfc2822DateTime(payload.date_created); // jshint ignore:line
  this.dateUpdated = deserialize.rfc2822DateTime(payload.date_updated); // jshint ignore:line
  this.uri = payload.uri; // jshint ignore:line

  // Context
  this._context = undefined;
  this._solution = {
    accountSid: accountSid,
    credentialListSid: credentialListSid,
    sid: sid || this.sid,
  };
}

Object.defineProperty(CredentialInstance.prototype,
  '_proxy', {
  get: function() {
    if (!this._context) {
      this._context = new CredentialContext(
        this._version,
        this._solution.accountSid,
        this._solution.credentialListSid,
        this._solution.sid
      );
    }

    return this._context;
  },
});

/* jshint ignore:start */
/**
 * fetch a CredentialInstance
 *
 * @function fetch
 * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialInstance
 * @instance
 *
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed CredentialInstance
 */
/* jshint ignore:end */
CredentialInstance.prototype.fetch = function fetch(callback) {
  return this._proxy.fetch(callback);
};

/* jshint ignore:start */
/**
 * update a CredentialInstance
 *
 * @function update
 * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialInstance
 * @instance
 *
 * @param {object} opts - ...
 * @param {string} opts.username - The username
 * @param {string} opts.password - The password
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed CredentialInstance
 */
/* jshint ignore:end */
CredentialInstance.prototype.update = function update(opts, callback) {
  return this._proxy.update(opts, callback);
};

/* jshint ignore:start */
/**
 * remove a CredentialInstance
 *
 * @function remove
 * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialInstance
 * @instance
 *
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed CredentialInstance
 */
/* jshint ignore:end */
CredentialInstance.prototype.remove = function remove(callback) {
  return this._proxy.remove(callback);
};


/* jshint ignore:start */
/**
 * @constructor Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialContext
 * @description Initialize the CredentialContext
 *
 * @param {Twilio.Api.V2010} version - Version of the resource
 * @param {sid} accountSid - The account_sid
 * @param {sid} credentialListSid - The credential_list_sid
 * @param {sid} sid - The sid
 */
/* jshint ignore:end */
function CredentialContext(version, accountSid, credentialListSid, sid) {
  this._version = version;

  // Path Solution
  this._solution = {
    accountSid: accountSid,
    credentialListSid: credentialListSid,
    sid: sid,
  };
  this._uri = _.template(
    '/Accounts/<%= accountSid %>/SIP/CredentialLists/<%= credentialListSid %>/Credentials/<%= sid %>.json' // jshint ignore:line
  )(this._solution);
}

/* jshint ignore:start */
/**
 * fetch a CredentialInstance
 *
 * @function fetch
 * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialContext
 * @instance
 *
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed CredentialInstance
 */
/* jshint ignore:end */
CredentialContext.prototype.fetch = function fetch(callback) {
  var deferred = Q.defer();
  var promise = this._version.fetch({
    uri: this._uri,
    method: 'GET'
  });

  promise = promise.then(function(payload) {
    deferred.resolve(new CredentialInstance(
      this._version,
      payload,
      this._solution.accountSid,
      this._solution.credentialListSid,
      this._solution.sid
    ));
  }.bind(this));

  promise.catch(function(error) {
    deferred.reject(error);
  });

  if (_.isFunction(callback)) {
    deferred.promise.nodeify(callback);
  }

  return deferred.promise;
};

/* jshint ignore:start */
/**
 * update a CredentialInstance
 *
 * @function update
 * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialContext
 * @instance
 *
 * @param {object} opts - ...
 * @param {string} opts.username - The username
 * @param {string} opts.password - The password
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed CredentialInstance
 */
/* jshint ignore:end */
CredentialContext.prototype.update = function update(opts, callback) {
  if (_.isUndefined(opts)) {
    throw new Error('Required parameter "opts" missing.');
  }
  if (_.isUndefined(opts.username)) {
    throw new Error('Required parameter "opts.username" missing.');
  }
  if (_.isUndefined(opts.password)) {
    throw new Error('Required parameter "opts.password" missing.');
  }

  var deferred = Q.defer();
  var data = values.of({
    'Username': opts.username,
    'Password': opts.password
  });

  var promise = this._version.update({
    uri: this._uri,
    method: 'POST',
    data: data
  });

  promise = promise.then(function(payload) {
    deferred.resolve(new CredentialInstance(
      this._version,
      payload,
      this._solution.accountSid,
      this._solution.credentialListSid,
      this._solution.sid
    ));
  }.bind(this));

  promise.catch(function(error) {
    deferred.reject(error);
  });

  if (_.isFunction(callback)) {
    deferred.promise.nodeify(callback);
  }

  return deferred.promise;
};

/* jshint ignore:start */
/**
 * remove a CredentialInstance
 *
 * @function remove
 * @memberof Twilio.Api.V2010.AccountContext.SipContext.CredentialListContext.CredentialContext
 * @instance
 *
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed CredentialInstance
 */
/* jshint ignore:end */
CredentialContext.prototype.remove = function remove(callback) {
  var deferred = Q.defer();
  var promise = this._version.remove({
    uri: this._uri,
    method: 'DELETE'
  });

  promise = promise.then(function(payload) {
    deferred.resolve(payload);
  }.bind(this));

  promise.catch(function(error) {
    deferred.reject(error);
  });

  if (_.isFunction(callback)) {
    deferred.promise.nodeify(callback);
  }

  return deferred.promise;
};

module.exports = {
  CredentialPage: CredentialPage,
  CredentialList: CredentialList,
  CredentialInstance: CredentialInstance,
  CredentialContext: CredentialContext
};
