'use strict';

var _ = require('lodash');
var Q = require('q');
var Page = require('../../../../base/Page');
var deserialize = require('../../../../base/deserialize');
var values = require('../../../../base/values');

var IpAccessControlListPage;
var IpAccessControlListList;
var IpAccessControlListInstance;
var IpAccessControlListContext;

/* jshint ignore:start */
/**
 * @constructor Twilio.Trunking.V1.TrunkContext.IpAccessControlListPage
 * @augments Page
 * @description Initialize the IpAccessControlListPage
 *
 * @param {Twilio.Trunking.V1} version - Version of the resource
 * @param {object} response - Response from the API
 * @param {object} solution - Path solution
 *
 * @returns IpAccessControlListPage
 */
/* jshint ignore:end */
function IpAccessControlListPage(version, response, solution) {
  // Path Solution
  this._solution = solution;

  Page.prototype.constructor.call(this, version, response, this._solution);
}

_.extend(IpAccessControlListPage.prototype, Page.prototype);
IpAccessControlListPage.prototype.constructor = IpAccessControlListPage;

/* jshint ignore:start */
/**
 * Build an instance of IpAccessControlListInstance
 *
 * @function getInstance
 * @memberof Twilio.Trunking.V1.TrunkContext.IpAccessControlListPage
 * @instance
 *
 * @param {object} payload - Payload response from the API
 *
 * @returns IpAccessControlListInstance
 */
/* jshint ignore:end */
IpAccessControlListPage.prototype.getInstance = function getInstance(payload) {
  return new IpAccessControlListInstance(
    this._version,
    payload,
    this._solution.trunkSid
  );
};


/* jshint ignore:start */
/**
 * @constructor Twilio.Trunking.V1.TrunkContext.IpAccessControlListList
 * @description Initialize the IpAccessControlListList
 *
 * @param {Twilio.Trunking.V1} version - Version of the resource
 * @param {string} trunkSid - The trunk_sid
 */
/* jshint ignore:end */
function IpAccessControlListList(version, trunkSid) {
  /* jshint ignore:start */
  /**
   * @function ipAccessControlLists
   * @memberof Twilio.Trunking.V1.TrunkContext
   * @instance
   *
   * @param {string} sid - sid of instance
   *
   * @returns {Twilio.Trunking.V1.TrunkContext.IpAccessControlListContext}
   */
  /* jshint ignore:end */
  function IpAccessControlListListInstance(sid) {
    return IpAccessControlListListInstance.get(sid);
  }

  IpAccessControlListListInstance._version = version;
  // Path Solution
  IpAccessControlListListInstance._solution = {
    trunkSid: trunkSid
  };
  IpAccessControlListListInstance._uri = _.template(
    '/Trunks/<%= trunkSid %>/IpAccessControlLists' // jshint ignore:line
  )(IpAccessControlListListInstance._solution);
  /* jshint ignore:start */
  /**
   * create a IpAccessControlListInstance
   *
   * @function create
   * @memberof Twilio.Trunking.V1.TrunkContext.IpAccessControlListList
   * @instance
   *
   * @param {object} opts - ...
   * @param {string} opts.ipAccessControlListSid - The ip_access_control_list_sid
   * @param {function} [callback] - Callback to handle processed record
   *
   * @returns {Promise} Resolves to processed IpAccessControlListInstance
   */
  /* jshint ignore:end */
  IpAccessControlListListInstance.create = function create(opts, callback) {
    if (_.isUndefined(opts)) {
      throw new Error('Required parameter "opts" missing.');
    }
    if (_.isUndefined(opts.ipAccessControlListSid)) {
      throw new Error('Required parameter "opts.ipAccessControlListSid" missing.');
    }

    var deferred = Q.defer();
    var data = values.of({
      'IpAccessControlListSid': opts.ipAccessControlListSid
    });

    var promise = this._version.create({
      uri: this._uri,
      method: 'POST',
      data: data
    });

    promise = promise.then(function(payload) {
      deferred.resolve(new IpAccessControlListInstance(
        this._version,
        payload,
        this._solution.trunkSid,
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
   * Streams IpAccessControlListInstance records from the API.
   *
   * This operation lazily loads records as efficiently as possible until the limit
   * is reached.
   *
   * The results are passed into the callback function, so this operation is memory efficient.
   *
   * If a function is passed as the first argument, it will be used as the callback function.
   *
   * @function each
   * @memberof Twilio.Trunking.V1.TrunkContext.IpAccessControlListList
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
  IpAccessControlListListInstance.each = function each(opts, callback) {
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
   * @description Lists IpAccessControlListInstance records from the API as a list.
   *
   * If a function is passed as the first argument, it will be used as the callback function.
   *
   * @function list
   * @memberof Twilio.Trunking.V1.TrunkContext.IpAccessControlListList
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
  IpAccessControlListListInstance.list = function list(opts, callback) {
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
   * Retrieve a single page of IpAccessControlListInstance records from the API.
   * Request is executed immediately
   *
   * If a function is passed as the first argument, it will be used as the callback function.
   *
   * @function page
   * @memberof Twilio.Trunking.V1.TrunkContext.IpAccessControlListList
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
  IpAccessControlListListInstance.page = function page(opts, callback) {
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
      deferred.resolve(new IpAccessControlListPage(
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
   * Constructs a ip_access_control_list
   *
   * @function get
   * @memberof Twilio.Trunking.V1.TrunkContext.IpAccessControlListList
   * @instance
   *
   * @param {string} sid - The sid
   *
   * @returns {Twilio.Trunking.V1.TrunkContext.IpAccessControlListContext}
   */
  /* jshint ignore:end */
  IpAccessControlListListInstance.get = function get(sid) {
    return new IpAccessControlListContext(
      this._version,
      this._solution.trunkSid,
      sid
    );
  };

  return IpAccessControlListListInstance;
}


/* jshint ignore:start */
/**
 * @constructor Twilio.Trunking.V1.TrunkContext.IpAccessControlListInstance
 * @description Initialize the IpAccessControlListContext
 *
 * @property {string} accountSid - The account_sid
 * @property {string} sid - The sid
 * @property {string} trunkSid - The trunk_sid
 * @property {string} friendlyName - The friendly_name
 * @property {Date} dateCreated - The date_created
 * @property {Date} dateUpdated - The date_updated
 * @property {string} url - The url
 *
 * @param {Twilio.Trunking.V1} version - Version of the resource
 * @param {object} payload - The instance payload
 * @param {sid} trunkSid - The trunk_sid
 * @param {sid} sid - The sid
 */
/* jshint ignore:end */
function IpAccessControlListInstance(version, payload, trunkSid, sid) {
  this._version = version;

  // Marshaled Properties
  this.accountSid = payload.account_sid; // jshint ignore:line
  this.sid = payload.sid; // jshint ignore:line
  this.trunkSid = payload.trunk_sid; // jshint ignore:line
  this.friendlyName = payload.friendly_name; // jshint ignore:line
  this.dateCreated = deserialize.iso8601DateTime(payload.date_created); // jshint ignore:line
  this.dateUpdated = deserialize.iso8601DateTime(payload.date_updated); // jshint ignore:line
  this.url = payload.url; // jshint ignore:line

  // Context
  this._context = undefined;
  this._solution = {
    trunkSid: trunkSid,
    sid: sid || this.sid,
  };
}

Object.defineProperty(IpAccessControlListInstance.prototype,
  '_proxy', {
  get: function() {
    if (!this._context) {
      this._context = new IpAccessControlListContext(
        this._version,
        this._solution.trunkSid,
        this._solution.sid
      );
    }

    return this._context;
  },
});

/* jshint ignore:start */
/**
 * fetch a IpAccessControlListInstance
 *
 * @function fetch
 * @memberof Twilio.Trunking.V1.TrunkContext.IpAccessControlListInstance
 * @instance
 *
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed IpAccessControlListInstance
 */
/* jshint ignore:end */
IpAccessControlListInstance.prototype.fetch = function fetch(callback) {
  return this._proxy.fetch(callback);
};

/* jshint ignore:start */
/**
 * remove a IpAccessControlListInstance
 *
 * @function remove
 * @memberof Twilio.Trunking.V1.TrunkContext.IpAccessControlListInstance
 * @instance
 *
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed IpAccessControlListInstance
 */
/* jshint ignore:end */
IpAccessControlListInstance.prototype.remove = function remove(callback) {
  return this._proxy.remove(callback);
};


/* jshint ignore:start */
/**
 * @constructor Twilio.Trunking.V1.TrunkContext.IpAccessControlListContext
 * @description Initialize the IpAccessControlListContext
 *
 * @param {Twilio.Trunking.V1} version - Version of the resource
 * @param {sid} trunkSid - The trunk_sid
 * @param {sid} sid - The sid
 */
/* jshint ignore:end */
function IpAccessControlListContext(version, trunkSid, sid) {
  this._version = version;

  // Path Solution
  this._solution = {
    trunkSid: trunkSid,
    sid: sid,
  };
  this._uri = _.template(
    '/Trunks/<%= trunkSid %>/IpAccessControlLists/<%= sid %>' // jshint ignore:line
  )(this._solution);
}

/* jshint ignore:start */
/**
 * fetch a IpAccessControlListInstance
 *
 * @function fetch
 * @memberof Twilio.Trunking.V1.TrunkContext.IpAccessControlListContext
 * @instance
 *
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed IpAccessControlListInstance
 */
/* jshint ignore:end */
IpAccessControlListContext.prototype.fetch = function fetch(callback) {
  var deferred = Q.defer();
  var promise = this._version.fetch({
    uri: this._uri,
    method: 'GET'
  });

  promise = promise.then(function(payload) {
    deferred.resolve(new IpAccessControlListInstance(
      this._version,
      payload,
      this._solution.trunkSid,
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
 * remove a IpAccessControlListInstance
 *
 * @function remove
 * @memberof Twilio.Trunking.V1.TrunkContext.IpAccessControlListContext
 * @instance
 *
 * @param {function} [callback] - Callback to handle processed record
 *
 * @returns {Promise} Resolves to processed IpAccessControlListInstance
 */
/* jshint ignore:end */
IpAccessControlListContext.prototype.remove = function remove(callback) {
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
  IpAccessControlListPage: IpAccessControlListPage,
  IpAccessControlListList: IpAccessControlListList,
  IpAccessControlListInstance: IpAccessControlListInstance,
  IpAccessControlListContext: IpAccessControlListContext
};
